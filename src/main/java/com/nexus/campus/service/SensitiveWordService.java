package com.nexus.campus.service;

import com.nexus.campus.dto.PostAuditResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;

/**
 * High-performance sensitive-word detection and replacement service built on a
 * <b>Deterministic Finite Automaton (DFA)</b> / trie architecture.
 *
 * <p>Two separate trie structures are maintained internally:</p>
 * <ul>
 *   <li><b>Regular sensitive words</b> — profanity, insults, etc. Matches are
 *       replaced with {@code [数据擦除]} and the result status is {@code PASS}.</li>
 *   <li><b>Critical / political keywords</b> — triggers a {@code PENDING_AUDIT}
 *       verdict so the content is routed to the admin moderation queue.</li>
 * </ul>
 *
 * <p>Every call to {@link #checkText(String)} runs in <b>O(n)</b> time where
 * {@code n = text.length()}</b>, bounded by the maximum keyword length as a
 * constant factor.</p>
 */
@Service
public class SensitiveWordService {

    private static final Logger log = LoggerFactory.getLogger(SensitiveWordService.class);

    /** Replacement string for every matched keyword. */
    private static final String REPLACEMENT = "[数据擦除]";

    // ── Trie roots ──────────────────────────────────
    private final TrieNode regularRoot = new TrieNode(WordTier.REGULAR);
    private final TrieNode criticalRoot = new TrieNode(WordTier.CRITICAL);

    // ── Config injection ───────────────────────────

    @Value("${campus.security.sensitive-words:}")
    private List<String> configuredSensitiveWords;

    @Value("${campus.security.critical-words:}")
    private List<String> configuredCriticalWords;

    // ── Lifecycle ──────────────────────────────────

    @PostConstruct
    public void init() {
        loadWords(configuredSensitiveWords, regularRoot);
        loadWords(configuredCriticalWords, criticalRoot);
        loadWords(systemCriticalKeywords(), criticalRoot);

        log.info("[NEXUS-DFA] Regular word trie  → {} entries", regularRoot.size());
        log.info("[NEXUS-DFA] Critical word trie → {} entries", criticalRoot.size());
    }

    // ── Public API ─────────────────────────────────

    /**
     * Scan {@code text} for registered sensitive / critical keywords in
     * <b>O(n)</b> time.
     *
     * <p>The scan proceeds left-to-right. At each character position the
     * algorithm walks both tries simultaneously, recording the <em>longest</em>
     * match at that position.  When a match is found the segment is replaced
     * with {@code [数据擦除]} and scanning resumes after the matched span.</p>
     *
     * @param text  the input to scan (may be {@code null} or empty)
     * @return never {@code null}; callers inspect {@link PostAuditResult#getStatus()}
     *         to decide whether to publish, queue for review, or block.
     */
    public PostAuditResult checkText(String text) {
        if (text == null || text.isEmpty()) {
            return PostAuditResult.pass(text);
        }

        String lowerText = text.toLowerCase();
        StringBuilder result = new StringBuilder(text.length());
        List<String> matchedKeywords = new ArrayList<>();
        boolean hasRegular = false;
        boolean hasCritical = false;

        int i = 0;
        while (i < text.length()) {
            // ── Simultaneous longest-match search ─────
            MatchResult regMatch   = findLongestMatch(lowerText, i, regularRoot);
            MatchResult critMatch  = findLongestMatch(lowerText, i, criticalRoot);

            MatchResult best = pickBest(regMatch, critMatch);

            if (best != null) {
                result.append(REPLACEMENT);
                i = best.start + best.length;

                if (!matchedKeywords.contains(best.keyword)) {
                    matchedKeywords.add(best.keyword);
                }

                if (best.tier == WordTier.CRITICAL) {
                    hasCritical = true;
                } else {
                    hasRegular = true;
                }
            } else {
                result.append(text.charAt(i));
                i++;
            }
        }

        String filteredContent = result.toString();

        if (hasCritical) {
            log.warn("[NEXUS-DFA] CRITICAL keywords detected: {} — content routed to audit queue.",
                    matchedKeywords);
            return PostAuditResult.pendingAudit(filteredContent, matchedKeywords.size(), matchedKeywords);
        }
        if (hasRegular) {
            log.debug("[NEXUS-DFA] Regular sensitive words detected: {} — content filtered.",
                    matchedKeywords);
            return PostAuditResult.sensitiveOnly(filteredContent, matchedKeywords.size(), matchedKeywords);
        }
        return PostAuditResult.pass(filteredContent);
    }

    // ── Trie helpers ───────────────────────────────

    /**
     * Starting at position {@code start}, walk {@code root} to find the
     * <strong>longest</strong> keyword that matches the suffix of {@code text}.
     *
     * @return a {@link MatchResult} or {@code null} if no match begins at
     *         {@code start}.
     */
    private MatchResult findLongestMatch(String text, int start, TrieNode root) {
        TrieNode node = root;
        MatchResult best = null;

        for (int j = start; j < text.length(); j++) {
            char c = text.charAt(j);
            node = node.children.get(c);
            if (node == null) break;
            if (node.isEnd) {
                best = new MatchResult(start, j - start + 1, node.keyword, node.tier);
            }
        }
        return best;
    }

    /**
     * Pick the "better" of two matches.  The critical-tier takes priority over
     * the regular tier when they are the same length; otherwise the longer
     * match wins.
     */
    private MatchResult pickBest(MatchResult a, MatchResult b) {
        if (a == null) return b;
        if (b == null) return a;
        // Same length → critical wins
        if (a.length == b.length) {
            return (a.tier == WordTier.CRITICAL) ? a : b;
        }
        return (a.length > b.length) ? a : b;
    }

    // ── Word-list loading ──────────────────────────

    private void loadWords(List<String> words, TrieNode root) {
        if (words == null) return;
        for (String raw : words) {
            String word = raw.trim().toLowerCase();
            if (word.isEmpty() || word.length() < 2) continue;
            addWord(word, root);
        }
    }

    private void addWord(String word, TrieNode root) {
        TrieNode node = root;
        for (int i = 0; i < word.length(); i++) {
            char c = word.charAt(i);
            node = node.children.computeIfAbsent(c, k -> new TrieNode(root.tier));
        }
        node.isEnd = true;
        node.keyword = word;
        root.incrementSize();
    }

    // ── System-level critical keywords ─────────────
    //
    // Kept in code, not in application.yml, to reduce the chance of accidental
    // config leaks.  Swap in a secure external source for production.

    private static List<String> systemCriticalKeywords() {
        return Arrays.asList(
                "暴力分裂",
                "颠覆国家",
                "邪教组织",
                "恐怖主义",
                "极端宗教"
        );
    }

    // ══════════════════════════════════════════════════
    //  Inner types
    // ══════════════════════════════════════════════════

    private enum WordTier { REGULAR, CRITICAL }

    private static class MatchResult {
        final int start;
        final int length;
        final String keyword;
        final WordTier tier;

        MatchResult(int start, int length, String keyword, WordTier tier) {
            this.start = start;
            this.length = length;
            this.keyword = keyword;
            this.tier = tier;
        }
    }

    private static class TrieNode {
        final WordTier tier;
        final Map<Character, TrieNode> children = new HashMap<>();
        boolean isEnd = false;
        String keyword = null;
        private int subtreeSize = 0;   // approx count of words below this node

        TrieNode(WordTier tier) { this.tier = tier; }

        void incrementSize() { subtreeSize++; }
        int size() { return subtreeSize; }
    }
}

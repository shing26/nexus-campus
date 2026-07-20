package com.nexus.campus.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.*;

@Component
public class DfaFilter {

    private final TrieNode root = new TrieNode();

    @Value("#{'${campus.security.sensitive-words:}'.split(',')}")
    private List<String> sensitiveWords;

    @PostConstruct
    public void init() {
        if (sensitiveWords != null) {
            for (String word : sensitiveWords) {
                if (word != null && !word.trim().isEmpty()) {
                    addWord(word.trim().toLowerCase());
                }
            }
        }
    }

    public void addWord(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node = node.children.computeIfAbsent(c, k -> new TrieNode());
        }
        node.isEnd = true;
    }

    public boolean containsSensitiveWord(String text) {
        if (text == null || text.isEmpty()) return false;
        String lowerText = text.toLowerCase();

        for (int i = 0; i < lowerText.length(); i++) {
            TrieNode node = root;
            for (int j = i; j < lowerText.length(); j++) {
                char c = lowerText.charAt(j);
                node = node.children.get(c);
                if (node == null) break;
                if (node.isEnd) return true;
            }
        }
        return false;
    }

    public String filter(String text) {
        if (text == null || text.isEmpty()) return text;
        StringBuilder result = new StringBuilder();
        String lowerText = text.toLowerCase();

        for (int i = 0; i < lowerText.length(); i++) {
            TrieNode node = root;
            int matchEnd = -1;
            for (int j = i; j < lowerText.length(); j++) {
                char c = lowerText.charAt(j);
                node = node.children.get(c);
                if (node == null) break;
                if (node.isEnd) matchEnd = j;
            }
            if (matchEnd >= 0) {
                result.append("*".repeat(matchEnd - i + 1));
                i = matchEnd;
            } else {
                result.append(text.charAt(i));
            }
        }
        return result.toString();
    }

    private static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isEnd = false;
    }
}

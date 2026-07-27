package com.nexus.campus.agent;

import com.nexus.campus.entity.VibeComment;
import com.nexus.campus.mapper.VibeCommentMapper;
import com.nexus.campus.entity.VibePost;
import com.nexus.campus.mapper.VibePostMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class AiReviewService {

    private static final Pattern CODE_BLOCK_PATTERN = Pattern.compile(
            "```[a-zA-Z]*\\n([\\s\\S]*?)```", Pattern.MULTILINE);

    private static final Pattern SCORE_PATTERN = Pattern.compile(
            "(?i)(?:overall\\s*score|score)[:\\s]*(\\d+(?:\\.\\d+)?)");

    private static final Pattern SEVERITY_PATTERN = Pattern.compile(
            "(?i)(?:severity|risk\\s*level)[:\\s]*(critical|high|medium|low)");

    @Autowired
    private LlmClient llmClient;

    @Autowired
    private VibePostMapper vibePostMapper;

    @Autowired
    private AiReviewLogMapper aiReviewLogMapper;

    @Autowired
    private VibeCommentMapper vibeCommentMapper;

    /**
     * Extracts fenced code blocks (``` ... ```) from content.
     */
    public List<String> detectCodeBlocks(String content) {
        List<String> blocks = new ArrayList<>();
        if (content == null || content.isBlank()) {
            return blocks;
        }
        Matcher matcher = CODE_BLOCK_PATTERN.matcher(content);
        while (matcher.find()) {
            blocks.add(matcher.group(1).trim());
        }
        return blocks;
    }

    /**
     * Builds the fixed system prompt for code review.
     */
    public String buildSystemPrompt() {
        return "You are an expert AI code reviewer. Analyze the provided code and give:\n"
                + "1. Overall score (0-10)\n"
                + "2. Code quality observations\n"
                + "3. Security concerns\n"
                + "4. Optimization suggestions\n\n"
                + "Format your response in Markdown with clear sections.\n"
                + "Include a line like: **Overall Score**: 7 at the top of your response.\n"
                + "Include a line like: **Severity**: low/medium/high/critical based on the worst finding.";
    }

    /**
     * Full review pipeline: calls LLM, logs result, posts AI comment.
     */
    public void reviewPost(Long postId, String content) {
        List<String> codeBlocks = detectCodeBlocks(content);
        if (codeBlocks.isEmpty()) {
            log.info("No code blocks found in post {}, skipping AI review", postId);
            return;
        }

        // Build user prompt from code blocks
        StringBuilder userContent = new StringBuilder("Review the following code:\n\n");
        for (int i = 0; i < codeBlocks.size(); i++) {
            userContent.append("--- Code Block ").append(i + 1).append(" ---\n");
            userContent.append(codeBlocks.get(i)).append("\n\n");
        }

        String llmResponse = llmClient.chatCompletion(buildSystemPrompt(), userContent.toString());
        if (llmResponse == null) {
            log.warn("LLM returned null for post {}; AI review skipped", postId);
            saveReviewLog(postId, null, null, 0);
            return;
        }

        // Parse the response
        ReviewResult result = parseReviewResponse(llmResponse);

        // Save review log
        saveReviewLog(postId, llmResponse, result.severity, result.isApproved ? 1 : 0);

        // Post AI comment on the post
        createReviewComment(postId, result);
        // Update vibe_post with ai_review_score and mark as reviewed
        try {
            VibePost post = new VibePost();
            post.setId(postId);
            post.setAiReviewed(1);
            post.setAiReviewScore(result.score);
            vibePostMapper.updateById(post);
            log.info("AI review score {} written back to vibe_post {}", result.score, postId);
        } catch (Exception e) {
            log.warn("Failed to update ai_review_score for post {}: {}", postId, e.getMessage());
        }
    }

    /**
     * Parses the LLM Markdown response into a structured result.
     */
    public ReviewResult parseReviewResponse(String llmResponse) {
        ReviewResult result = new ReviewResult();

        if (llmResponse == null || llmResponse.isBlank()) {
            result.score = 0;
            result.quality = "";
            result.security = "";
            result.suggestions = "";
            result.severity = "unknown";
            result.isApproved = false;
            return result;
        }

        // Extract score
        Matcher scoreMatcher = SCORE_PATTERN.matcher(llmResponse);
        if (scoreMatcher.find()) {
            try {
                result.score = Integer.parseInt(scoreMatcher.group(1));
            } catch (NumberFormatException e) {
                result.score = (int) Math.round(Double.parseDouble(scoreMatcher.group(1)));
            }
        }
        result.score = Math.max(0, Math.min(10, result.score));

        // Extract severity
        Matcher severityMatcher = SEVERITY_PATTERN.matcher(llmResponse);
        if (severityMatcher.find()) {
            result.severity = severityMatcher.group(1).toLowerCase();
        } else {
            result.severity = "unknown";
        }

        // Extract sections by markdown headers
        result.quality = extractSection(llmResponse, "Code Quality", "Security");
        result.security = extractSection(llmResponse, "Security", "Optimization");
        result.suggestions = extractSection(llmResponse, "Optimization", null);

        // Approve if score >= 5 and severity is not critical
        result.isApproved = result.score >= 5 && !"critical".equals(result.severity);

        return result;
    }

    /**
     * Creates a comment on the post as the AiAgent system user (id=999).
     */
    public void createReviewComment(Long postId, ReviewResult result) {
        try {
            VibeComment comment = new VibeComment();
            comment.setPostId(postId);
            comment.setUserId(999L); // AiAgent system account
            comment.setParentId(0L);
            comment.setTargetId(0L);
            comment.setContent(formatReviewComment(result));
            comment.setStatus(1);
            vibeCommentMapper.insert(comment);
            log.info("AI review comment posted for post {}", postId);
        } catch (Exception e) {
            log.warn("Failed to post AI review comment for post {}: {}", postId, e.getMessage());
        }
    }

    // ---- private helpers ----

    private void saveReviewLog(Long postId, String resultJson, String severity, int isApproved) {
        try {
            AiReviewLog logEntry = new AiReviewLog();
            logEntry.setPostId(postId);
            logEntry.setReviewer("code-review-agent");
            logEntry.setResultJson(resultJson);
            logEntry.setSeverity(severity);
            logEntry.setIsApproved(isApproved);
            aiReviewLogMapper.insert(logEntry);
        } catch (Exception e) {
            log.warn("Failed to save AI review log for post {}: {}", postId, e.getMessage());
        }
    }

    private String extractSection(String markdown, String header, String nextHeader) {
        if (markdown == null) return "";
        // Look for "## header" or "**header**" patterns
        Pattern sectionPattern;
        if (nextHeader != null) {
            sectionPattern = Pattern.compile(
                    "(?i)(?:##\\s*\\*?" + Pattern.quote(header) + "\\*?\\s*|\\*\\*" + Pattern.quote(header) + "\\*\\*)[:\\s]*([\\s\\S]*?)(?=\\n\\s*(?:##\\s*\\*?" + Pattern.quote(nextHeader) + "|\\*\\*" + Pattern.quote(nextHeader) + "|$))",
                    Pattern.MULTILINE);
        } else {
            sectionPattern = Pattern.compile(
                    "(?i)(?:##\\s*\\*?" + Pattern.quote(header) + "\\*?\\s*|\\*\\*" + Pattern.quote(header) + "\\*\\*)[:\\s]*([\\s\\S]*?)(?=\\n\\s*(?:##|\\*\\*[A-Z]|$))",
                    Pattern.MULTILINE);
        }
        Matcher matcher = sectionPattern.matcher(markdown);
        return matcher.find() ? matcher.group(1).trim() : "";
    }

    private String formatReviewComment(ReviewResult result) {
        StringBuilder sb = new StringBuilder();
        sb.append("## AI Code Review\n\n");
        sb.append("**Overall Score**: ").append(result.score).append("/10\n\n");
        sb.append("**Severity**: ").append(result.severity).append("\n\n");
        sb.append("**Verdict**: ").append(result.isApproved ? "Approved" : "Needs Attention").append("\n\n");

        if (!result.quality.isBlank()) {
            sb.append("### Code Quality\n").append(result.quality).append("\n\n");
        }
        if (!result.security.isBlank()) {
            sb.append("### Security\n").append(result.security).append("\n\n");
        }
        if (!result.suggestions.isBlank()) {
            sb.append("### Suggestions\n").append(result.suggestions).append("\n");
        }
        return sb.toString();
    }

    // ---- inner class ----

    public static class ReviewResult {
        private int score;
        private String quality;
        private String security;
        private String suggestions;
        private String severity;
        private boolean isApproved;

        public int getScore() { return score; }
        public String getQuality() { return quality; }
        public String getSecurity() { return security; }
        public String getSuggestions() { return suggestions; }
        public String getSeverity() { return severity; }
        public boolean isApproved() { return isApproved; }
    }
}

package com.nexus.campus.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for DFA filter hot-reload ({@link DfaFilter#reloadTrieTree()}).
 *
 * <p>Verifies that:
 * <ol>
 *   <li>Initial state with empty config has no matching words</li>
 *   <li>After adding a new word to config and calling reload, the word is detected</li>
 *   <li>Reloading from an empty config clears previously loaded words</li>
 * </ol>
 */
class DfaFilterReloadTest {

    private DfaFilter dfaFilter;

    @BeforeEach
    void setUp() {
        dfaFilter = new DfaFilter();
        // Start with empty sensitive words
        ReflectionTestUtils.setField(dfaFilter, "sensitiveWords", Collections.emptyList());
        dfaFilter.init();
    }

    @Test
    @DisplayName("Initial state: no sensitive words configured, nothing should match")
    void noSensitiveWordsInitially() {
        assertFalse(dfaFilter.containsSensitiveWord("badword"));
        assertFalse(dfaFilter.containsSensitiveWord("fuck"));
        assertEquals("hello world", dfaFilter.filter("hello world"));
    }

    @Test
    @DisplayName("Add words to config and reload — new words take effect")
    void reloadWithNewWords() {
        // Given: initially no words
        assertFalse(dfaFilter.containsSensitiveWord("shit"));

        // When: update config and reload
        ReflectionTestUtils.setField(dfaFilter, "sensitiveWords",
                Arrays.asList("fuck", "shit"));
        dfaFilter.reloadTrieTree();

        // Then: new words should be detected
        assertTrue(dfaFilter.containsSensitiveWord("fuck"),
                "Should detect 'fuck' after reload");
        assertTrue(dfaFilter.containsSensitiveWord("shit"),
                "Should detect 'shit' after reload");
    }

    @Test
    @DisplayName("reloadTrieTree() with empty config should clear all loaded words")
    void reloadWithEmptyConfigClears() {
        // Given: load some words
        ReflectionTestUtils.setField(dfaFilter, "sensitiveWords",
                Arrays.asList("fuck", "damn"));
        dfaFilter.reloadTrieTree();
        assertTrue(dfaFilter.containsSensitiveWord("fuck"));

        // When: reload with empty config
        ReflectionTestUtils.setField(dfaFilter, "sensitiveWords", Collections.emptyList());
        dfaFilter.reloadTrieTree();

        // Then: previously loaded words should no longer match
        assertFalse(dfaFilter.containsSensitiveWord("fuck"),
                "Should NOT detect 'fuck' after clearing");
        assertFalse(dfaFilter.containsSensitiveWord("damn"),
                "Should NOT detect 'damn' after clearing");
    }

    @Test
    @DisplayName("filter() should replace detected words after reload")
    void filterAfterReload() {
        ReflectionTestUtils.setField(dfaFilter, "sensitiveWords",
                Arrays.asList("fuck", "shit"));
        dfaFilter.reloadTrieTree();

        String filtered = dfaFilter.filter("this is fucking shit");
        assertEquals("this is ****ing ****", filtered);
    }

    @Test
    @DisplayName("Words are matched case-insensitively after reload")
    void caseInsensitiveMatchAfterReload() {
        ReflectionTestUtils.setField(dfaFilter, "sensitiveWords",
                List.of("badword"));
        dfaFilter.reloadTrieTree();

        assertTrue(dfaFilter.containsSensitiveWord("BadWord"));
        assertTrue(dfaFilter.containsSensitiveWord("BADWORD"));
        assertTrue(dfaFilter.containsSensitiveWord("badword"));
    }

    @Test
    @DisplayName("addWord() added words are not affected by reloadTrieTree()")
    void addWordBeforeReload() {
        // Given: add word manually
        dfaFilter.addWord("custom");
        assertTrue(dfaFilter.containsSensitiveWord("custom"));

        // When: reload from config (empty)
        dfaFilter.reloadTrieTree();

        // Then: manually added word should be gone (reload creates a fresh trie)
        assertFalse(dfaFilter.containsSensitiveWord("custom"),
                "Manual additions should be lost after reload");
    }
}
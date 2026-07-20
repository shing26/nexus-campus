package com.nexus.campus.service;

import com.nexus.campus.dto.PostAuditResult;
import com.nexus.campus.dto.PostAuditResult.AuditStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for {@link SensitiveWordService}.
 *
 * <p>Verifies the DFA-based trie correctly classifies normal text,
 * regular sensitive words, and critical political keywords.</p>
 */
class SensitiveWordServiceTest {

    private SensitiveWordService service;

    @BeforeEach
    void setUp() {
        service = new SensitiveWordService(new com.nexus.campus.util.DfaFilter());

        // Inject @Value fields programmatically
        List<String> sensitiveWords = Arrays.asList("fuck", "shit", "damn");
        List<String> criticalWords = Collections.emptyList(); // systemCriticalKeywords() provides the hardcoded ones

        ReflectionTestUtils.setField(service, "configuredSensitiveWords", sensitiveWords);
        ReflectionTestUtils.setField(service, "configuredCriticalWords", criticalWords);

        // Manually trigger @PostConstruct lifecycle
        service.init();
    }

    @Test
    @DisplayName("Normal text without any sensitive words 鈫?PASS with unchanged content")
    void normalTextShouldPass() {
        PostAuditResult result = service.checkText("Hello, this is a normal message.");

        assertEquals(AuditStatus.PASS, result.getStatus());
        assertEquals("Hello, this is a normal message.", result.getFilteredContent());
        assertFalse(result.isContainsSensitive());
        assertFalse(result.isContainsCritical());
        assertEquals(0, result.getSensitiveWordCount());
    }

    @Test
    @DisplayName("Regular sensitive word 'fuck' 鈫?content filtered with [鏁版嵁鎿﹂櫎] but status PASS")
    void regularSensitiveWordShouldBeFiltered() {
        PostAuditResult result = service.checkText("This is fucking shit.");

        assertEquals(AuditStatus.PASS, result.getStatus());
        assertTrue(result.isContainsSensitive());
        assertFalse(result.isContainsCritical());
        assertTrue(result.getFilteredContent().contains("[鏁版嵁鎿﹂櫎]"));
        assertTrue(result.getSensitiveWordCount() > 0);
    }

    @Test
    @DisplayName("Critical political keyword '鏆村姏鍒嗚' 鈫?status PENDING_AUDIT and content filtered")
    void criticalWordShouldTriggerPendingAudit() {
        PostAuditResult result = service.checkText("鏆村姏鍒嗚");

        assertEquals(AuditStatus.PENDING_AUDIT, result.getStatus());
        assertTrue(result.isContainsCritical());
        assertTrue(result.isContainsSensitive());
        assertEquals("[鏁版嵁鎿﹂櫎]", result.getFilteredContent());
    }

    @Test
    @DisplayName("Null and empty input should return PASS gracefully")
    void nullOrEmptyInputShouldReturnPass() {
        PostAuditResult nullResult = service.checkText(null);
        assertEquals(AuditStatus.PASS, nullResult.getStatus());

        PostAuditResult emptyResult = service.checkText("");
        assertEquals(AuditStatus.PASS, emptyResult.getStatus());
    }

    @Test
    @DisplayName("Multiple critical words -> still PENDING_AUDIT")
    void multipleCriticalWords() {
        // Need to set critical words as the Chinese chars get corrupted during encoding
        java.util.List<String> testCritical = java.util.Arrays.asList("evilword1","evilword2");
        org.springframework.test.util.ReflectionTestUtils.setField(service,"configuredCriticalWords",testCritical);
        service.init();
        PostAuditResult result = service.checkText("evilword1 and evilword2");
        assertEquals(AuditStatus.PENDING_AUDIT, result.getStatus());
        assertTrue(result.isContainsCritical());
    }
}
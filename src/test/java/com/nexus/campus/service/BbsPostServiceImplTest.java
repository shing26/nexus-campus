package com.nexus.campus.service;

import com.nexus.campus.dto.PostAuditResult;
import com.nexus.campus.dto.PostCreateRequest;
import com.nexus.campus.entity.BbsPost;
import com.nexus.campus.entity.SysUser;
import com.nexus.campus.mapper.BbsPostMapper;
import com.nexus.campus.mapper.SysUserMapper;
import com.nexus.campus.service.impl.BbsPostServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for {@link BbsPostServiceImpl}.
 *
 * <p>Verifies that post creation correctly integrates with the DFA
 * sensitive-word service and assigns the proper audit status.</p>
 */
@SpringBootTest
@Transactional
class BbsPostServiceImplTest {

    @Autowired
    private BbsPostService bbsPostService;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private BbsPostMapper bbsPostMapper;

    private Long testUserId;

    @BeforeEach
    void setUp() {
        // Fetch the seed testuser (id = 2) from data.sql
        SysUser user = sysUserMapper.selectById(2L);
        assertNotNull(user, "Seed user testuser (id=2) must exist");
        testUserId = user.getId();
    }

    @Test
    @DisplayName("Create post with clean content → status = 1 (Active)")
    void createPostWithCleanContent_shouldBeActive() {
        PostCreateRequest request = new PostCreateRequest();
        request.setTitle("A clean post title");
        request.setContent("This is a perfectly normal post body with no issues.");
        request.setCategoryId(1);
        request.setTags(null);

        BbsPost post = bbsPostService.createPost(request, testUserId);

        assertNotNull(post.getId());
        assertEquals(1, post.getStatus()); // Active
        assertEquals("A clean post title", post.getTitle());
        assertEquals("This is a perfectly normal post body with no issues.", post.getContent());
    }

    @Test
    @DisplayName("Create post with regular sensitive word → status = 1 (Active) but content filtered")
    void createPostWithSensitiveWord_shouldBeFiltered() {
        PostCreateRequest request = new PostCreateRequest();
        request.setTitle("Safe title");
        request.setContent("This post contains the word shit which should be filtered.");
        request.setCategoryId(1);
        request.setTags(null);

        BbsPost post = bbsPostService.createPost(request, testUserId);

        assertNotNull(post.getId());
        assertEquals(1, post.getStatus(), "Regular sensitive words should still result in Active status");
        assertTrue(post.getContent().contains("[数据擦除]"));
        assertFalse(post.getContent().contains("shit"));
    }

    @Test
    @DisplayName("Create post with critical keyword → status = 2 (Pending Audit)")
    void createPostWithCriticalWord_shouldBePendingAudit() {
        PostCreateRequest request = new PostCreateRequest();
        request.setTitle("Questionable title");
        request.setContent("This post discusses 暴力分裂 which is a critical keyword.");
        request.setCategoryId(1);
        request.setTags(null);

        BbsPost post = bbsPostService.createPost(request, testUserId);

        assertNotNull(post.getId());
        assertEquals(2, post.getStatus(), "Critical words should set status to Pending Audit (2)");
        assertTrue(post.getContent().contains("[数据擦除]"));
    }

    @Test
    @DisplayName("Create post with critical keyword in title → status = 2 (Pending Audit)")
    void createPostWithCriticalWordInTitle_shouldBePendingAudit() {
        PostCreateRequest request = new PostCreateRequest();
        request.setTitle("关于颠覆国家的讨论");
        request.setContent("Normal body content.");
        request.setCategoryId(1);
        request.setTags(null);

        BbsPost post = bbsPostService.createPost(request, testUserId);

        assertNotNull(post.getId());
        assertEquals(2, post.getStatus(), "Critical word in title should set status to Pending Audit");
        assertTrue(post.getTitle().contains("[数据擦除]"));
    }
}

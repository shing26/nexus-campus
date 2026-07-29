package com.nexus.campus.service;

import com.nexus.campus.dto.PostAuditResult;
import com.nexus.campus.dto.PostCreateRequest;
import com.nexus.campus.entity.VibePost;
import com.nexus.campus.entity.SysUser;
import com.nexus.campus.mapper.VibePostMapper;
import com.nexus.campus.mapper.SysUserMapper;
import com.nexus.campus.service.impl.VibePostServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class VibePostServiceImplTest {

    @Autowired
    private VibePostService VibePostService;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private VibePostMapper VibePostMapper;

    private Long testUserId;

    @BeforeEach
    void setUp() {
        SysUser user = sysUserMapper.selectById(2L);
        assertNotNull(user, "Seed user testuser (id=2) must exist");
        testUserId = user.getId();
    }

    @Test
    @DisplayName("Create post with clean content -> status = 1 (Active)")
    void createPostWithCleanContent_shouldBeActive() {
        PostCreateRequest request = new PostCreateRequest();
        request.setTitle("A clean post title");
        request.setContent("This is a perfectly normal post body with no issues.");
        request.setCategoryId(2);
        request.setTags(null);

        VibePost post = VibePostService.createPost(request, testUserId);

        assertNotNull(post.getId());
        assertEquals(1, post.getStatus());
        assertEquals("A clean post title", post.getTitle());
        assertEquals("This is a perfectly normal post body with no issues.", post.getContent());
    }

    @Test
    @DisplayName("Create post with regular sensitive word -> status = 1 (Active) but content filtered")
    void createPostWithSensitiveWord_shouldBeFiltered() {
        PostCreateRequest request = new PostCreateRequest();
        request.setTitle("Safe title");
        request.setContent("This post contains the word shit which should be filtered.");
        request.setCategoryId(2);
        request.setTags(null);

        VibePost post = VibePostService.createPost(request, testUserId);

        assertNotNull(post.getId());
        assertEquals(1, post.getStatus(), "Regular sensitive words should still result in Active status");
        assertFalse(post.getContent().contains("shit"));
    }
}

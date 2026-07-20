package com.nexus.campus.service;

import com.nexus.campus.dto.CommentCreateRequest;
import com.nexus.campus.entity.BbsComment;
import com.nexus.campus.entity.BbsPost;
import com.nexus.campus.entity.SysMessage;
import com.nexus.campus.entity.SysUser;
import com.nexus.campus.mapper.*;
import com.nexus.campus.service.impl.BbsCommentServiceImpl;
import com.nexus.campus.util.DfaFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private BbsCommentMapper bbsCommentMapper;

    @Mock
    private BbsPostMapper bbsPostMapper;

    @Mock
    private SysUserMapper sysUserMapper;

    @Mock
    private SysMessageMapper sysMessageMapper;

    @Mock
    private DfaFilter dfaFilter;

    @InjectMocks
    private BbsCommentServiceImpl commentService;

    private final Long postId = 42L;
    private final Long userId = 100L;
    private final Long authorUserId = 200L;

    private BbsPost post;
    private SysUser user;

    @BeforeEach
    void setUp() {
        post = new BbsPost();
        post.setId(postId);
        post.setUserId(authorUserId);
        post.setTitle("Test Post");
        post.setCommentCount(5);

        user = new SysUser();
        user.setId(userId);
        user.setCorePower(50);
    }

    // ──────────────────────────────────────────────
    // createComment()
    // ──────────────────────────────────────────────

    @Test
    @DisplayName("createComment() with clean content should save comment with status 1 and notify post author")
    void createCommentCleanContent() {
        CommentCreateRequest request = new CommentCreateRequest();
        request.setPostId(postId);
        request.setContent("Great post!");
        request.setParentId(0L);
        request.setTargetId(0L);

        when(dfaFilter.containsSensitiveWord("Great post!")).thenReturn(false);
        when(bbsPostMapper.selectById(postId)).thenReturn(post);
        when(sysUserMapper.selectById(userId)).thenReturn(user);

        BbsComment result = commentService.createComment(request, userId);

        assertNotNull(result);
        assertEquals(1, result.getStatus());

        ArgumentCaptor<BbsComment> commentCaptor = ArgumentCaptor.forClass(BbsComment.class);
        verify(bbsCommentMapper).insert(commentCaptor.capture());
        BbsComment saved = commentCaptor.getValue();
        assertEquals(postId, saved.getPostId());
        assertEquals(userId, saved.getUserId());
        assertEquals(0L, saved.getParentId());
        assertEquals("Great post!", saved.getContent());

        // Post comment count should be incremented
        ArgumentCaptor<BbsPost> postCaptor = ArgumentCaptor.forClass(BbsPost.class);
        verify(bbsPostMapper, times(1)).updateById(postCaptor.capture());
        assertEquals(6, postCaptor.getValue().getCommentCount());

        // Notification should be sent to post author
        verify(sysMessageMapper).insert(any(SysMessage.class));

        // User core power should be awarded
        assertEquals(52, user.getCorePower());
        verify(sysUserMapper).updateById(user);
    }

    @Test
    @DisplayName("createComment() should not send notification when user comments on own post")
    void createCommentSelfPost() {
        post.setUserId(userId); // same user
        CommentCreateRequest request = new CommentCreateRequest();
        request.setPostId(postId);
        request.setContent("My own post comment");
        request.setParentId(0L);
        request.setTargetId(0L);

        when(dfaFilter.containsSensitiveWord("My own post comment")).thenReturn(false);
        when(bbsPostMapper.selectById(postId)).thenReturn(post);
        when(sysUserMapper.selectById(userId)).thenReturn(user);

        commentService.createComment(request, userId);

        // No notification for self-comment
        verify(sysMessageMapper, never()).insert(any(SysMessage.class));

        // Core power still awarded
        assertEquals(52, user.getCorePower());
    }

    @Test
    @DisplayName("createComment() with sensitive word should set status to 2 (PENDING_AUDIT)")
    void createCommentWithSensitiveWord() {
        CommentCreateRequest request = new CommentCreateRequest();
        request.setPostId(postId);
        request.setContent("This is a shit comment");
        request.setParentId(0L);
        request.setTargetId(0L);

        when(dfaFilter.containsSensitiveWord("This is a shit comment")).thenReturn(true);
        when(bbsPostMapper.selectById(postId)).thenReturn(post);
        when(sysUserMapper.selectById(userId)).thenReturn(user);

        BbsComment result = commentService.createComment(request, userId);

        assertEquals(2, result.getStatus()); // PENDING_AUDIT

        ArgumentCaptor<BbsComment> captor = ArgumentCaptor.forClass(BbsComment.class);
        verify(bbsCommentMapper).insert((BbsComment) captor.capture());
        assertEquals(2, captor.getValue().getStatus());
    }

    @Test
    @DisplayName("createComment() should handle null parentId/targetId gracefully")
    void createCommentWithNullParentAndTarget() {
        CommentCreateRequest request = new CommentCreateRequest();
        request.setPostId(postId);
        request.setContent("Comment with null IDs");
        // parentId and targetId are null

        when(dfaFilter.containsSensitiveWord("Comment with null IDs")).thenReturn(false);
        when(bbsPostMapper.selectById(postId)).thenReturn(post);
        when(sysUserMapper.selectById(userId)).thenReturn(user);

        commentService.createComment(request, userId);

        ArgumentCaptor<BbsComment> captor = ArgumentCaptor.forClass(BbsComment.class);
        verify(bbsCommentMapper).insert((BbsComment) captor.capture());
        BbsComment saved = captor.getValue();
        assertEquals(0L, saved.getParentId());
        assertEquals(0L, saved.getTargetId());
    }

    // ──────────────────────────────────────────────
    // getCommentsByPostId()
    // ──────────────────────────────────────────────

    @Test
    @DisplayName("getCommentsByPostId() should return comments in ascending order")
    void getCommentsByPostId() {
        BbsComment c1 = new BbsComment(); c1.setId(1L); c1.setPostId(postId); c1.setContent("First");
        BbsComment c2 = new BbsComment(); c2.setId(2L); c2.setPostId(postId); c2.setContent("Second");
        List<BbsComment> comments = Arrays.asList(c1, c2);

        when(bbsCommentMapper.selectCommentsByPostId(postId)).thenReturn(comments);

        List<BbsComment> result = commentService.getCommentsByPostId(postId);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("First", result.get(0).getContent());
        assertEquals("Second", result.get(1).getContent());
    }

    @Test
    @DisplayName("getCommentsByPostId() should return empty list when no comments exist")
    void getCommentsByPostIdEmpty() {
        when(bbsCommentMapper.selectCommentsByPostId(postId)).thenReturn(List.of());

        List<BbsComment> result = commentService.getCommentsByPostId(postId);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // ──────────────────────────────────────────────
    // countCommentsByPostId() / deleteComment()
    // ──────────────────────────────────────────────

    @Test
    @DisplayName("countCommentsByPostId() should return the count from mapper")
    void countCommentsByPostId() {
        when(bbsCommentMapper.countCommentsByPostId(postId)).thenReturn(8);

        int count = commentService.countCommentsByPostId(postId);

        assertEquals(8, count);
    }

    @Test
    @DisplayName("deleteComment() should return true when deletion succeeds")
    void deleteCommentSuccess() {
        when(bbsCommentMapper.deleteById(1L)).thenReturn(1);

        boolean result = commentService.deleteComment(1L);

        assertTrue(result);
    }

    @Test
    @DisplayName("deleteComment() should return false when comment does not exist")
    void deleteCommentNotFound() {
        when(bbsCommentMapper.deleteById(999L)).thenReturn(0);

        boolean result = commentService.deleteComment(999L);

        assertFalse(result);
    }
}

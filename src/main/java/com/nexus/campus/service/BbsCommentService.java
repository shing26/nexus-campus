package com.nexus.campus.service;

import com.nexus.campus.dto.CommentCreateRequest;
import com.nexus.campus.entity.BbsComment;

import java.util.List;

public interface BbsCommentService {

    BbsComment createComment(CommentCreateRequest request, Long userId);

    List<BbsComment> getCommentsByPostId(Long postId);

    int countCommentsByPostId(Long postId);

    boolean deleteComment(Long commentId);
}

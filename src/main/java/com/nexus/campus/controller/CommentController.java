package com.nexus.campus.controller;

import com.nexus.campus.dto.ApiResponse;
import com.nexus.campus.dto.CommentCreateRequest;
import com.nexus.campus.entity.BbsComment;
import com.nexus.campus.service.BbsCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    @Autowired
    private BbsCommentService bbsCommentService;

    @PostMapping
    public ApiResponse<BbsComment> createComment(
            @Valid @RequestBody CommentCreateRequest request,
            @RequestAttribute("currentUserId") Long userId) {
        BbsComment comment = bbsCommentService.createComment(request, userId);
        return ApiResponse.success("Comment transmitted.", comment);
    }

    @GetMapping("/post/{postId}")
    public ApiResponse<List<BbsComment>> getComments(@PathVariable Long postId) {
        return ApiResponse.success(bbsCommentService.getCommentsByPostId(postId));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteComment(@PathVariable Long id) {
        bbsCommentService.deleteComment(id);
        return ApiResponse.successMessage("Comment deleted.");
    }
}

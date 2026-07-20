package com.nexus.campus.controller;

import com.nexus.campus.dto.ApiResponse;
import com.nexus.campus.dto.PageResult;
import com.nexus.campus.dto.PostCreateRequest;
import com.nexus.campus.dto.PostPageVo;
import com.nexus.campus.entity.BbsPost;
import com.nexus.campus.service.BbsPostService;
import com.nexus.campus.service.LikeCounterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    @Autowired
    private BbsPostService bbsPostService;

    @Autowired
    private LikeCounterService likeCounterService;
 
    @PostMapping("/{id}/pin")
    public ApiResponse<Void> pinPost(@PathVariable Long id) {
        boolean success = bbsPostService.pinPost(id);
        if (!success) {
            return ApiResponse.notFound("Post not found or cannot be pinned.");
        }
        return ApiResponse.successMessage("Post pinned.");
    }
 
    @PostMapping("/{id}/unpin")
    public ApiResponse<Void> unpinPost(@PathVariable Long id) {
        boolean success = bbsPostService.unpinPost(id);
        if (!success) {
            return ApiResponse.notFound("Post not found.");
        }
        return ApiResponse.successMessage("Post unpinned.");
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> createPost(
            @Valid @RequestBody PostCreateRequest request,
            @RequestAttribute("currentUserId") Long userId) {
        BbsPost post = bbsPostService.createPost(request, userId);
        Map<String, Object> data = new HashMap<>();
        data.put("postId", post.getId().toString());
        data.put("status", post.getStatus());
        if (post.getStatus() == 2) {
            data.put("auditNotice", "Sensitive pattern detected. Shifting to Firewall Queue.");
        }
        return ApiResponse.success("Data injection protocol acknowledged.", data);
    }

    @GetMapping
    public ApiResponse<PageResult<PostPageVo>> getPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "false") boolean hot) {
        if (hot) {
            List<PostPageVo> hotPosts = bbsPostService.getHotPosts(size);
            return ApiResponse.success(PageResult.of(page, size, hotPosts.size(), hotPosts));
        }
        PageResult<PostPageVo> result;
        if (keyword != null && !keyword.isEmpty()) {
            result = bbsPostService.searchPosts(keyword, page, size);
        } else if (categoryId != null) {
            result = bbsPostService.getPostsByCategory(categoryId, page, size);
        } else {
            result = bbsPostService.getActivePosts(page, size);
        }
        return ApiResponse.success(result);
    }

    @GetMapping("/hot")
    public ApiResponse<List<PostPageVo>> getHotPosts(
            @RequestParam(defaultValue = "10") int limit) {
        List<PostPageVo> posts = bbsPostService.getHotPosts(limit);
        return ApiResponse.success(posts);
    }

    @GetMapping("/{id}")
    public ApiResponse<PostPageVo> getPostDetail(@PathVariable Long id) {
        bbsPostService.incrementView(id);
        PostPageVo post = bbsPostService.getPostDetail(id);
        if (post == null) {
            return ApiResponse.notFound("Post not found.");
        }
        return ApiResponse.success(post);
    }

    @PostMapping("/{id}/like")
    public ApiResponse<Map<String, Object>> likePost(
            @PathVariable Long id,
            @RequestAttribute("currentUserId") Long userId) {
        long currentLikes = likeCounterService.likePost(id, userId);
        Map<String, Object> data = new HashMap<>();
        data.put("postId", id.toString());
        data.put("currentLikes", currentLikes);
        return ApiResponse.success("Energy increment synchronized.", data);
    }
}

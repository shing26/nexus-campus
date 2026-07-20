package com.nexus.campus.controller;

import com.nexus.campus.dto.ApiResponse;
import com.nexus.campus.dto.PostPageVo;
import com.nexus.campus.entity.BbsPost;
import com.nexus.campus.entity.BbsComment;
import com.nexus.campus.entity.SysUser;
import com.nexus.campus.service.BbsPostService;
import com.nexus.campus.mapper.BbsPostMapper;
import com.nexus.campus.mapper.BbsCommentMapper;
import com.nexus.campus.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    @Autowired
    private BbsPostService bbsPostService;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private BbsPostMapper bbsPostMapper;

    @Autowired
    private BbsCommentMapper bbsCommentMapper;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats(@RequestAttribute("currentRole") String role) {
        if (!"ADMIN".equals(role)) {
            return ApiResponse.forbidden("Access denied. Admin privileges required.");
        }
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", sysUserMapper.selectCount(null));
        stats.put("totalPosts", bbsPostMapper.selectCount(null));
        stats.put("totalComments", bbsCommentMapper.selectCount(null));
        stats.put("pendingAudit", bbsPostMapper.selectPendingAuditPosts().size());
        return ApiResponse.success(stats);
    }

    @GetMapping("/audit/posts")
    public ApiResponse<List<PostPageVo>> getPendingAuditPosts(@RequestAttribute("currentRole") String role) {
        if (!"ADMIN".equals(role)) {
            return ApiResponse.forbidden("Access denied. Admin privileges required.");
        }
        return ApiResponse.success(bbsPostService.getPendingAuditPosts());
    }

    @PostMapping("/audit/posts/{id}/approve")
    public ApiResponse<Void> approvePost(@PathVariable Long id, @RequestAttribute("currentRole") String role) {
        if (!"ADMIN".equals(role)) {
            return ApiResponse.forbidden("Access denied.");
        }
        bbsPostService.approvePost(id);
        return ApiResponse.successMessage("Post approved and published.");
    }

    @PostMapping("/audit/posts/{id}/reject")
    public ApiResponse<Void> rejectPost(@PathVariable Long id, @RequestAttribute("currentRole") String role) {
        if (!"ADMIN".equals(role)) {
            return ApiResponse.forbidden("Access denied.");
        }
        bbsPostService.rejectPost(id);
        return ApiResponse.successMessage("Post rejected.");
    }
}

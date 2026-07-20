package com.nexus.campus.controller;

import com.nexus.campus.dto.ApiResponse;
import com.nexus.campus.entity.BbsTag;
import com.nexus.campus.service.BbsTagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
public class TagController {

    @Autowired
    private BbsTagService bbsTagService;

    @GetMapping
    public ApiResponse<List<BbsTag>> getTags() {
        return ApiResponse.success(bbsTagService.getActiveTags());
    }

    @GetMapping("/post")
    public ApiResponse<List<BbsTag>> getTagsByPostId(@RequestParam Long postId) {
        return ApiResponse.success(bbsTagService.getTagsByPostId(postId));
    }
}

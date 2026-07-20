package com.nexus.campus.controller;

import com.nexus.campus.dto.ApiResponse;
import com.nexus.campus.entity.BbsCategory;
import com.nexus.campus.service.BbsCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    @Autowired
    private BbsCategoryService bbsCategoryService;

    @GetMapping
    public ApiResponse<List<BbsCategory>> getCategories() {
        return ApiResponse.success(bbsCategoryService.getActiveCategories());
    }
}

package com.nexus.campus.service;

import com.nexus.campus.entity.BbsCategory;

import java.util.List;

public interface BbsCategoryService {

    List<BbsCategory> getActiveCategories();

    BbsCategory getCategoryById(Integer id);
}

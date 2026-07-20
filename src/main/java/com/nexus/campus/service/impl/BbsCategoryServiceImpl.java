package com.nexus.campus.service.impl;

import com.nexus.campus.entity.BbsCategory;
import com.nexus.campus.mapper.BbsCategoryMapper;
import com.nexus.campus.service.BbsCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BbsCategoryServiceImpl implements BbsCategoryService {

    @Autowired
    private BbsCategoryMapper bbsCategoryMapper;

    @Override
    @Cacheable(value = "categories", key = "'active'")
    public List<BbsCategory> getActiveCategories() {
        return bbsCategoryMapper.selectActiveCategories();
    }

    @Override
    public BbsCategory getCategoryById(Integer id) {
        return bbsCategoryMapper.selectById(id);
    }
}

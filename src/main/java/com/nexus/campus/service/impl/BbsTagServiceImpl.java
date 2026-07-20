package com.nexus.campus.service.impl;

import com.nexus.campus.entity.BbsTag;
import com.nexus.campus.mapper.BbsTagMapper;
import com.nexus.campus.service.BbsTagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BbsTagServiceImpl implements BbsTagService {

    @Autowired
    private BbsTagMapper bbsTagMapper;

    @Override
    @Cacheable(value = "tags", key = "'active'")
    public List<BbsTag> getActiveTags() {
        return bbsTagMapper.selectActiveTags();
    }

    @Override
    public List<BbsTag> getTagsByPostId(Long postId) {
        return bbsTagMapper.selectTagsByPostId(postId);
    }
}

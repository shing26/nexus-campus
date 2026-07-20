package com.nexus.campus.service;

import com.nexus.campus.entity.BbsTag;

import java.util.List;

public interface BbsTagService {

    List<BbsTag> getActiveTags();

    List<BbsTag> getTagsByPostId(Long postId);
}

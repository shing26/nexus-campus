package com.nexus.campus.service;

import com.nexus.campus.dto.PostCreateRequest;
import com.nexus.campus.dto.PostPageVo;
import com.nexus.campus.dto.PageResult;
import com.nexus.campus.entity.BbsPost;

import java.util.List;

public interface BbsPostService {

    BbsPost createPost(PostCreateRequest request, Long userId);

    List<PostPageVo> getPendingAuditPosts();

    boolean approvePost(Long postId);

    boolean rejectPost(Long postId);

    PageResult<PostPageVo> getActivePosts(int page, int size);

    PageResult<PostPageVo> getPostsByCategory(Integer categoryId, int page, int size);

    PageResult<PostPageVo> searchPosts(String keyword, int page, int size);

    List<PostPageVo> getHotPosts(int limit);

    PostPageVo getPostDetail(Long id);

    BbsPost likePost(Long postId);

    boolean incrementView(Long postId);

    PageResult<PostPageVo> getPostsByUserId(Long userId, int page, int size);

    boolean pinPost(Long postId);

    boolean unpinPost(Long postId);
}

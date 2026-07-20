package com.nexus.campus.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexus.campus.dto.PostAuditResult;
import com.nexus.campus.dto.PostCreateRequest;
import com.nexus.campus.dto.PostPageVo;
import com.nexus.campus.dto.PageResult;
import com.nexus.campus.entity.*;
import com.nexus.campus.mapper.*;
import com.nexus.campus.service.BbsPostService;
import com.nexus.campus.service.PostSearchService;
import com.nexus.campus.service.PostRankingService;
import com.nexus.campus.service.SensitiveWordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BbsPostServiceImpl implements BbsPostService {

    @Autowired
    private PostSearchService postSearchService;

    @Autowired
    private PostRankingService postRankingService;

    @Autowired
    private BbsPostMapper bbsPostMapper;

    @Autowired
    private BbsPostTagMapper bbsPostTagMapper;

    @Autowired
    private BbsTagMapper bbsTagMapper;

    @Autowired
    private BbsCategoryMapper bbsCategoryMapper;

    @Autowired
    private BbsCommentMapper bbsCommentMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SensitiveWordService sensitiveWordService;

    @Override
    @Transactional
    @CacheEvict(value = "posts", allEntries = true)
    public BbsPost createPost(PostCreateRequest request, Long userId) {
        BbsPost post = new BbsPost();
        post.setUserId(userId);
        post.setCategoryId(request.getCategoryId());
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());


        post.setViewCount(0);
        post.setLikeCount(0);
        post.setCommentCount(0);

        // ── DFA audit (SensitiveWordService) ──────────────
        PostAuditResult titleAudit   = sensitiveWordService.checkText(request.getTitle());
        PostAuditResult contentAudit = sensitiveWordService.checkText(request.getContent());
        boolean anyCritical  = titleAudit.isContainsCritical() || contentAudit.isContainsCritical();
        boolean anySensitive = titleAudit.isContainsSensitive() || contentAudit.isContainsSensitive();
        post.setStatus(anyCritical ? 2 : 1);
        if (anySensitive) {
            post.setTitle(titleAudit.getFilteredContent());
            post.setContent(contentAudit.getFilteredContent());
        }
        // Generate summary from the (now-filtered) content
        String filteredPlain = post.getContent().replaceAll("<[^>]*>", "");
        post.setSummary(filteredPlain.length() > 200 ? filteredPlain.substring(0, 200) + "..." : filteredPlain);

        bbsPostMapper.insert(post);

        // Link tags
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            bbsPostTagMapper.insertBatch(post.getId(), request.getTags());
        }

        // Fetch user for author name and core power award
        SysUser user = sysUserMapper.selectById(userId);

        // Index in Elasticsearch
        post.setAuthorName(user != null ? user.getNickname() : "");
        BbsCategory category = bbsCategoryMapper.selectById(post.getCategoryId());
        post.setCategoryName(category != null ? category.getName() : "");
        postSearchService.indexPost(post);

        // Award core power for posting
        if (user != null) {
            int reward = post.getStatus() == 1 ? 10 : 3;
            user.setCorePower(user.getCorePower() + reward);
            sysUserMapper.updateById(user);
        }

        return post;
    }

    @Override
    public PageResult<PostPageVo> getActivePosts(int page, int size) {
        Page<BbsPost> mpPage = bbsPostMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<BbsPost>()
                        .eq(BbsPost::getStatus, 1)
                        .orderByDesc(BbsPost::getCreateTime)
        );
        List<PostPageVo> vos = convertToPageVos(mpPage.getRecords());
        return PageResult.of(page, size, mpPage.getTotal(), vos);
    }

    @Override
    @Deprecated
    public PageResult<PostPageVo> getPostsByCategory(Integer categoryId, int page, int size) {
        Page<BbsPost> mpPage = bbsPostMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<BbsPost>()
                        .eq(BbsPost::getStatus, 1)
                        .eq(BbsPost::getCategoryId, categoryId)
                        .orderByDesc(BbsPost::getCreateTime)
        );
        List<PostPageVo> vos = convertToPageVos(mpPage.getRecords());
        return PageResult.of(page, size, mpPage.getTotal(), vos);
    }

    @Override
    @Deprecated
    public PageResult<PostPageVo> searchPosts(String keyword, int page, int size) {
        // Try ES first
        if (keyword != null && !keyword.isBlank()) {
            PageResult<PostPageVo> esResult = postSearchService.searchPosts(keyword, page, size);
            if (esResult != null) {
                return esResult;
            }
        }
        // Fallback to MySQL LIKE query with pagination
        Page<BbsPost> mpPage = bbsPostMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<BbsPost>()
                        .eq(BbsPost::getStatus, 1)
                        .and(w -> w.like(BbsPost::getTitle, keyword)
                                .or()
                                .like(BbsPost::getContent, keyword))
                        .orderByDesc(BbsPost::getCreateTime)
        );
        List<PostPageVo> vos = convertToPageVos(mpPage.getRecords());
        return PageResult.of(page, size, mpPage.getTotal(), vos);
    }

    @Override
    public List<PostPageVo> getHotPosts(int limit) {
        return postRankingService.getHotPosts(limit);
    }

    @Override
    public PostPageVo getPostDetail(Long id) {
        BbsPost post = bbsPostMapper.selectPostWithDetails(id);
        if (post == null) return null;
        return convertToPageVo(post);
    }

    @Override
    @Deprecated
    public BbsPost likePost(Long postId) {
        bbsPostMapper.incrementLikeCount(postId);
        BbsPost post = bbsPostMapper.selectById(postId);
        // Notify ranking service
        if (post != null) {
            postRankingService.onLike(postId, post.getLikeCount());
        }
        return post;
    }

    @Override
    public boolean incrementView(Long postId) {
        return bbsPostMapper.incrementViewCount(postId) > 0;
    }

    @Override
    @Transactional
    public boolean pinPost(Long postId) {
        BbsPost post = bbsPostMapper.selectById(postId);
        if (post == null || post.getStatus() != 1) return false;
        int rows = bbsPostMapper.pinPost(postId);
        if (rows > 0) {
            log.info("Post {} pinned", postId);
        }
        return rows > 0;
    }

    @Override
    @Transactional
    public boolean unpinPost(Long postId) {
        BbsPost post = bbsPostMapper.selectById(postId);
        if (post == null) return false;
        int rows = bbsPostMapper.unpinPost(postId);
        if (rows > 0) {
            log.info("Post {} unpinned", postId);
        }
        return rows > 0;
    }

    @Override
    public PageResult<PostPageVo> getPostsByUserId(Long userId, int page, int size) {
        Page<BbsPost> mpPage = bbsPostMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<BbsPost>()
                        .eq(BbsPost::getUserId, userId)
                        .orderByDesc(BbsPost::getCreateTime)
        );
        List<PostPageVo> vos = convertToPageVos(mpPage.getRecords());
        return PageResult.of(page, size, mpPage.getTotal(), vos);
    }

    @Override
    public List<PostPageVo> getPendingAuditPosts() {
        List<BbsPost> posts = bbsPostMapper.selectPendingAuditPosts();
        return convertToPageVos(posts);
    }

    @Override
    @Transactional
    @CacheEvict(value = "posts", allEntries = true)
    public boolean approvePost(Long postId) {
        BbsPost post = bbsPostMapper.selectById(postId);
        if (post == null) return false;
        post.setStatus(1);
        boolean updated = bbsPostMapper.updateById(post) > 0;
        if (updated) {
            // Re-index with approved status
            BbsPost fullPost = bbsPostMapper.selectPostWithDetails(postId);
            if (fullPost != null) {
                postSearchService.indexPost(fullPost);
            }
        }
        return updated;
    }

    @Override
    @Transactional
    public boolean rejectPost(Long postId) {
        BbsPost post = bbsPostMapper.selectById(postId);
        if (post == null) return false;
        post.setStatus(3); // 3 = Rejected
        return bbsPostMapper.updateById(post) > 0;
    }

    @Cacheable(value = "posts", key = "'active'")
    public List<PostPageVo> getActivePostsLegacy() {
        List<BbsPost> posts = bbsPostMapper.selectActivePosts();
        return convertToPageVos(posts);
    }

    private List<PostPageVo> convertToPageVos(List<BbsPost> posts) {
        return posts.stream().map(this::convertToPageVo).collect(Collectors.toList());
    }

    private PostPageVo convertToPageVo(BbsPost post) {
        PostPageVo vo = new PostPageVo();
        BeanUtils.copyProperties(post, vo);

        // Attach tags
        List<BbsTag> tags = bbsTagMapper.selectTagsByPostId(post.getId());
        if (tags != null) {
            vo.setTags(tags.stream().map(BbsTag::getName).toArray(String[]::new));
        }
        return vo;
    }
}

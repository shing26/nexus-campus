package com.nexus.campus.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.nexus.campus.dto.PostAuditResult;
import com.nexus.campus.dto.PostCreateRequest;
import com.nexus.campus.dto.PostPageVo;
import com.nexus.campus.dto.PageResult;
import com.nexus.campus.entity.*;
import com.nexus.campus.mapper.*;
import com.nexus.campus.agent.AiReviewLog;
import com.nexus.campus.agent.AiReviewLogMapper;
import com.nexus.campus.service.VibePostService;
import com.nexus.campus.agent.AiReviewEvent;
import com.nexus.campus.agent.AiSafetyCheckEvent;
import com.nexus.campus.service.PostSearchService;
import com.nexus.campus.service.PostRankingService;
import com.nexus.campus.service.SensitiveWordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class VibePostServiceImpl implements VibePostService {

    @Autowired
    private PostSearchService postSearchService;

    @Autowired
    private PostRankingService postRankingService;

    @Autowired
    private VibePostMapper vibePostMapper;

    @Autowired
    private VibePostTagMapper vibePostTagMapper;

    @Autowired
    private VibeTagMapper vibeTagMapper;

    @Autowired
    private ChannelMapper channelMapper;

    @Autowired
    private VibeCommentMapper vibeCommentMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SensitiveWordService sensitiveWordService;

    @Autowired
    private AiReviewLogMapper aiReviewLogMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

   @Value("${campus.ai.review.enabled:true}")
   private boolean aiReviewEnabled;

   @Override
   @Transactional
   @CacheEvict(value = "posts", allEntries = true)
    public VibePost createPost(PostCreateRequest request, Long userId) {
        VibePost post = new VibePost();
        post.setUserId(userId);
        post.setCategoryId(request.getCategoryId());
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        post.setViewCount(0);
        post.setLikeCount(0);
        post.setCommentCount(0);

        // 钬犫€斺€� DFA audit (SensitiveWordService) 钬犫€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€斺€
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

        // Announcement channel: admin-only guard
        Channel channel = channelMapper.selectById(request.getCategoryId());
        if (channel != null && "announcements".equals(channel.getSlug())) {
            SysUser user = sysUserMapper.selectById(userId);
            if (user == null || !"ADMIN".equals(user.getRole())) {
                throw new IllegalArgumentException("只有管理员才能在公告频道发帖");
            }
        }

        vibePostMapper.insert(post);

        // Link tags
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            vibePostTagMapper.insertBatch(post.getId(), request.getTags());
        }

        // Fetch user for author name and core power award
        SysUser user = sysUserMapper.selectById(userId);

        // Index in Elasticsearch
        post.setAuthorName(user != null ? user.getNickname() : "");
        Channel category = channelMapper.selectById(post.getCategoryId());
        post.setCategoryName(category != null ? category.getName() : "");
        postSearchService.indexPost(post);

        // Award core power for posting
        if (user != null) {
            int reward = post.getStatus() == 1 ? 10 : 3;
            user.setCorePower(user.getCorePower() + reward);
            sysUserMapper.updateById(user);
        }

        // Publish AI review event if enabled
        if (aiReviewEnabled) {
            eventPublisher.publishEvent(new AiReviewEvent(this, post.getId(), post.getContent()));
        }

        // Publish AI safety check event if enabled (only for posts that passed DFA)
        if (aiReviewEnabled && post.getStatus() == 1) {
            eventPublisher.publishEvent(new AiSafetyCheckEvent(this, post.getId(), post.getContent(), userId));
        }

        return post;
    }

    @Override
    public PageResult<PostPageVo> getActivePosts(int page, int size) {
        Page<VibePost> mpPage = vibePostMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<VibePost>()
                        .eq(VibePost::getStatus, 1)
                        .orderByDesc(VibePost::getCreateTime)
        );
        List<PostPageVo> vos = convertToPageVos(mpPage.getRecords());
        return PageResult.of(page, size, mpPage.getTotal(), vos);
    }

    @Override
    @Deprecated
    public PageResult<PostPageVo> getPostsByCategory(Integer categoryId, int page, int size) {
        Page<VibePost> mpPage = vibePostMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<VibePost>()
                        .eq(VibePost::getStatus, 1)
                        .eq(VibePost::getCategoryId, categoryId)
                        .orderByDesc(VibePost::getCreateTime)
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
        Page<VibePost> mpPage = vibePostMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<VibePost>()
                        .eq(VibePost::getStatus, 1)
                        .and(w -> w.like(VibePost::getTitle, keyword)
                                .or()
                                .like(VibePost::getContent, keyword))
                        .orderByDesc(VibePost::getCreateTime)
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
        VibePost post = vibePostMapper.selectPostWithDetails(id);
        if (post == null) return null;
        return convertToPageVo(post);
    }

    @Override
    @Deprecated
    public VibePost likePost(Long postId) {
        vibePostMapper.incrementLikeCount(postId);
        VibePost post = vibePostMapper.selectById(postId);
        // Notify ranking service
        if (post != null) {
            postRankingService.onLike(postId, post.getLikeCount());
        }
        return post;
    }

    @Override
    public boolean incrementView(Long postId) {
        return vibePostMapper.incrementViewCount(postId) > 0;
    }

    @Override
    @Transactional
    public boolean pinPost(Long postId) {
        VibePost post = vibePostMapper.selectById(postId);
        if (post == null || post.getStatus() != 1) return false;
        int rows = vibePostMapper.pinPost(postId);
        if (rows > 0) {
            log.info("Post {} pinned", postId);
        }
        return rows > 0;
    }

    @Override
    @Transactional
    public boolean unpinPost(Long postId) {
        VibePost post = vibePostMapper.selectById(postId);
        if (post == null) return false;
        int rows = vibePostMapper.unpinPost(postId);
        if (rows > 0) {
            log.info("Post {} unpinned", postId);
        }
        return rows > 0;
    }

    @Override
    public PageResult<PostPageVo> getPostsByUserId(Long userId, int page, int size) {
        Page<VibePost> mpPage = vibePostMapper.selectPage(
                new Page<>(page, size),
                new LambdaQueryWrapper<VibePost>()
                        .eq(VibePost::getUserId, userId)
                        .orderByDesc(VibePost::getCreateTime)
        );
        List<PostPageVo> vos = convertToPageVos(mpPage.getRecords());
        return PageResult.of(page, size, mpPage.getTotal(), vos);
    }

    @Override
    public List<PostPageVo> getPendingAuditPosts() {
        List<VibePost> posts = vibePostMapper.selectPendingAuditPosts();
        return posts.stream().map(post -> {
            PostPageVo vo = convertToPageVo(post);
            // Attach latest safety check result
            AiReviewLog safetyLog = aiReviewLogMapper.selectLatestSafetyLogByPostId(post.getId());
            if (safetyLog != null) {
                String classification = classifySafetyResult(safetyLog.getResultJson());
                vo.setSafetyClassification(classification);
                vo.setSafetySeverity(safetyLog.getSeverity());
                vo.setSafetyIsApproved(safetyLog.getIsApproved());
            }
            return vo;
        }).collect(Collectors.toList());
    }

    /**
     * Normalise the raw LLM response from the safety check into a display label.
     * The resultJson contains the raw LLM response string.
     */
    private String classifySafetyResult(String resultJson) {
        if (resultJson == null || resultJson.isBlank()) return null;
        String lower = resultJson.trim().toLowerCase();
        if (lower.contains("prompt injection")) return "Prompt injection";
        if (lower.contains("harmful")) return "Harmful content";
        if (lower.contains("spam")) return "Spam";
        if (lower.contains("safe")) return "Safe";
        return null;
    }

    @Override
    @Transactional
    @CacheEvict(value = "posts", allEntries = true)
    public boolean approvePost(Long postId) {
        VibePost post = vibePostMapper.selectById(postId);
        if (post == null) return false;
        post.setStatus(1);
        boolean updated = vibePostMapper.updateById(post) > 0;
        if (updated) {
            // Re-index with approved status
            VibePost fullPost = vibePostMapper.selectPostWithDetails(postId);
            if (fullPost != null) {
                postSearchService.indexPost(fullPost);
            }
        }
        return updated;
    }

    @Override
    @Transactional
    public boolean rejectPost(Long postId) {
        VibePost post = vibePostMapper.selectById(postId);
        if (post == null) return false;
        post.setStatus(3); // 3 = Rejected
        return vibePostMapper.updateById(post) > 0;
    }

    @Cacheable(value = "posts", key = "'active'")
    public List<PostPageVo> getActivePostsLegacy() {
        List<VibePost> posts = vibePostMapper.selectActivePosts();
        return convertToPageVos(posts);
    }

    private List<PostPageVo> convertToPageVos(List<VibePost> posts) {
        return posts.stream().map(this::convertToPageVo).collect(Collectors.toList());
    }

    private PostPageVo convertToPageVo(VibePost post) {
        PostPageVo vo = new PostPageVo();
        BeanUtils.copyProperties(post, vo);

        // Attach tags
        List<VibeTag> tags = vibeTagMapper.selectTagsByPostId(post.getId());
        if (tags != null) {
            vo.setTags(tags.stream().map(VibeTag::getName).toArray(String[]::new));
        }
        return vo;
    }
}

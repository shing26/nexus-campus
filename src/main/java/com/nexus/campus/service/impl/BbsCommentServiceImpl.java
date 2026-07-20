package com.nexus.campus.service.impl;

import com.nexus.campus.dto.CommentCreateRequest;
import com.nexus.campus.entity.BbsComment;
import com.nexus.campus.entity.BbsPost;
import com.nexus.campus.entity.SysMessage;
import com.nexus.campus.entity.SysUser;
import com.nexus.campus.mapper.*;
import com.nexus.campus.service.BbsCommentService;
import com.nexus.campus.util.DfaFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BbsCommentServiceImpl implements BbsCommentService {

    @Autowired
    private BbsCommentMapper bbsCommentMapper;

    @Autowired
    private BbsPostMapper bbsPostMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysMessageMapper sysMessageMapper;

    @Autowired
    private DfaFilter dfaFilter;

    @Override
    @Transactional
    public BbsComment createComment(CommentCreateRequest request, Long userId) {
        BbsComment comment = new BbsComment();
        comment.setPostId(request.getPostId());
        comment.setUserId(userId);
        comment.setParentId(request.getParentId() != null ? request.getParentId() : 0L);
        comment.setTargetId(request.getTargetId() != null ? request.getTargetId() : 0L);
        comment.setContent(request.getContent());

        // DFA check
        if (dfaFilter.containsSensitiveWord(request.getContent())) {
            comment.setStatus(2);
        } else {
            comment.setStatus(1);
        }

        bbsCommentMapper.insert(comment);

        // Update post comment count
        BbsPost post = bbsPostMapper.selectById(request.getPostId());
        if (post != null) {
            post.setCommentCount(post.getCommentCount() + 1);
            bbsPostMapper.updateById(post);

            // Send notification to post author (if not self-comment)
            if (!post.getUserId().equals(userId)) {
                SysMessage msg = new SysMessage();
                msg.setFromUserId(userId);
                msg.setToUserId(post.getUserId());
                msg.setContent("replied to your post: \"" + post.getTitle() + "\"");
                msg.setType(1);
                msg.setIsRead(0);
                sysMessageMapper.insert(msg);
            }
        }

        // Award core power
        SysUser user = sysUserMapper.selectById(userId);
        if (user != null) {
            user.setCorePower(user.getCorePower() + 2);
            sysUserMapper.updateById(user);
        }

        return comment;
    }

    @Override
    public List<BbsComment> getCommentsByPostId(Long postId) {
        return bbsCommentMapper.selectCommentsByPostId(postId);
    }

    @Override
    public int countCommentsByPostId(Long postId) {
        return bbsCommentMapper.countCommentsByPostId(postId);
    }

    @Override
    public boolean deleteComment(Long commentId) {
        return bbsCommentMapper.deleteById(commentId) > 0;
    }
}

package com.nexus.campus.controller;

import com.nexus.campus.dto.ApiResponse;
import com.nexus.campus.dto.PostPageVo;
import com.nexus.campus.dto.StatsResponse;
import com.nexus.campus.dto.UserPublicVo;
import com.nexus.campus.entity.BbsPost;
import com.nexus.campus.entity.SysUser;
import com.nexus.campus.mapper.BbsCommentMapper;
import com.nexus.campus.mapper.BbsPostMapper;
import com.nexus.campus.mapper.SysUserMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/stats")
public class StatsController {

    @Autowired
    private BbsPostMapper bbsPostMapper;

    @Autowired
    private BbsCommentMapper bbsCommentMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @GetMapping("/overview")
    public ApiResponse<StatsResponse> getOverview() {
        StatsResponse stats = new StatsResponse();
        stats.setTotalUsers(sysUserMapper.selectCount(null));
        stats.setTotalPosts(bbsPostMapper.selectCount(null));
        stats.setTotalComments(bbsCommentMapper.countTotalComments());
        stats.setTodayPosts(bbsPostMapper.countTodayPosts());
        return ApiResponse.success(stats);
    }

    @GetMapping("/hot-posts")
    public ApiResponse<List<PostPageVo>> getHotPosts(
            @RequestParam(defaultValue = "10") int limit) {
        List<BbsPost> posts = bbsPostMapper.selectTopLikedPosts(limit);
        List<PostPageVo> vos = posts.stream().map(this::convertToVo).collect(Collectors.toList());
        return ApiResponse.success(vos);
    }

    @GetMapping("/active-users")
    public ApiResponse<List<UserPublicVo>> getActiveUsers(
            @RequestParam(defaultValue = "10") int limit) {
        List<SysUser> users = sysUserMapper.selectRecentActiveUsers(limit);
        List<UserPublicVo> vos = users.stream().map(this::convertToUserVo).collect(Collectors.toList());
        return ApiResponse.success(vos);
    }

    private PostPageVo convertToVo(BbsPost post) {
        PostPageVo vo = new PostPageVo();
        BeanUtils.copyProperties(post, vo);
        return vo;
    }

    private UserPublicVo convertToUserVo(SysUser user) {
        UserPublicVo vo = new UserPublicVo();
        BeanUtils.copyProperties(user, vo);
        return vo;
    }
}

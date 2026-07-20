package com.nexus.campus.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexus.campus.entity.BbsComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BbsCommentMapper extends BaseMapper<BbsComment> {

    @Select("SELECT c.*, u.nickname as authorName, u.avatar as authorAvatar " +
            "FROM bbs_comment c " +
            "LEFT JOIN sys_user u ON c.user_id = u.id " +
            "WHERE c.post_id = #{postId} AND c.status = 1 " +
            "ORDER BY c.create_time ASC")
    List<BbsComment> selectCommentsByPostId(@Param("postId") Long postId);

    @Select("SELECT c.*, u.nickname as authorName " +
            "FROM bbs_comment c " +
            "LEFT JOIN sys_user u ON c.user_id = u.id " +
            "WHERE c.parent_id = #{parentId} AND c.status = 1 " +
            "ORDER BY c.create_time ASC")
    List<BbsComment> selectRepliesByParentId(@Param("parentId") Long parentId);

    @Select("SELECT COUNT(*) FROM bbs_comment WHERE post_id = #{postId} AND status = 1")
    int countCommentsByPostId(@Param("postId") Long postId);

    @Select("SELECT COUNT(*) FROM bbs_comment WHERE status = 1")
    long countTotalComments();
}

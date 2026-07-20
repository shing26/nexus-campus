package com.nexus.campus.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexus.campus.entity.BbsPost;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface BbsPostMapper extends BaseMapper<BbsPost> {

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.status = 1 " +
            "ORDER BY p.is_pinned DESC, p.create_time DESC")
    List<BbsPost> selectActivePosts();

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.status = 1 AND p.category_id = #{categoryId} " +
            "ORDER BY p.create_time DESC")
    List<BbsPost> selectPostsByCategory(@Param("categoryId") Integer categoryId);

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.id = #{id}")
    BbsPost selectPostWithDetails(@Param("id") Long id);

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.status = 1 AND (p.title LIKE CONCAT('%', #{keyword}, '%') OR p.content LIKE CONCAT('%', #{keyword}, '%')) " +
            "ORDER BY p.create_time DESC")
    List<BbsPost> searchPosts(@Param("keyword") String keyword);

    @Select("SELECT COUNT(*) FROM bbs_post WHERE status = 1 AND create_time >= CURDATE()")
    int countTodayPosts();

    @Update("UPDATE bbs_post SET view_count = view_count + 1 WHERE id = #{id}")
    int incrementViewCount(@Param("id") Long id);

    @Update("UPDATE bbs_post SET like_count = like_count + 1 WHERE id = #{id}")
    int incrementLikeCount(@Param("id") Long id);

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.user_id = #{userId} " +
            "ORDER BY p.create_time DESC")
    List<BbsPost> selectPostsByUserId(@Param("userId") Long userId);

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.status != 1 " +
            "ORDER BY p.create_time DESC")
    List<BbsPost> selectPendingAuditPosts();

    @Update("UPDATE bbs_post SET like_count = #{count} WHERE id = #{id}")
    int updateLikeCount(@Param("id") Long id, @Param("count") Integer count);

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.status = 1 " +
            "ORDER BY p.like_count DESC, p.create_time DESC " +
            "LIMIT #{limit}")
    List<BbsPost> selectTopLikedPosts(@Param("limit") int limit);

    @Select({"<script>",
            "SELECT p.*, u.nickname as authorName, c.name as categoryName ",
            "FROM bbs_post p ",
            "LEFT JOIN sys_user u ON p.user_id = u.id ",
            "LEFT JOIN bbs_category c ON p.category_id = c.id ",
            "WHERE p.id IN ",
            "<foreach item='id' collection='ids' open='(' separator=',' close=')'>#{id}</foreach> ",
            "</script>"})
    List<BbsPost> selectByIdsOrdered(@Param("ids") List<Long> ids);

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.status = 1 AND p.category_id = #{categoryId} " +
            "ORDER BY p.create_time DESC")
    List<BbsPost> selectActivePostsByCategory(@Param("categoryId") Integer categoryId);

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.status = 1 " +
            "ORDER BY p.is_pinned DESC, p.create_time DESC")
    List<BbsPost> selectActivePostsOrdered();

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.status = 1 AND p.is_pinned = 1 " +
            "ORDER BY p.create_time DESC")
    List<BbsPost> selectPinnedPosts();

    @Select("SELECT p.*, u.nickname as authorName, c.name as categoryName " +
            "FROM bbs_post p " +
            "LEFT JOIN sys_user u ON p.user_id = u.id " +
            "LEFT JOIN bbs_category c ON p.category_id = c.id " +
            "WHERE p.status = 1 " +
            "ORDER BY p.is_pinned DESC, p.create_time DESC")
    List<BbsPost> selectActivePostsPinnedFirst();

    @Update("UPDATE bbs_post SET is_pinned = 1 WHERE id = #{id}")
    int pinPost(@Param("id") Long id);

    @Update("UPDATE bbs_post SET is_pinned = 0 WHERE id = #{id}")
    int unpinPost(@Param("id") Long id);
}

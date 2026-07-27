package com.nexus.campus.agent;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AiReviewLogMapper extends BaseMapper<AiReviewLog> {
    
    /**
     * Fetch the latest safety-check review log for a given post.
     * Only returns logs from the safety-check-agent reviewer.
     */
    @Select("SELECT * FROM ai_review_log " +
            "WHERE post_id = #{postId} AND reviewer = 'safety-check-agent' " +
            "ORDER BY created_at DESC LIMIT 1")
    AiReviewLog selectLatestSafetyLogByPostId(@Param("postId") Long postId);
}

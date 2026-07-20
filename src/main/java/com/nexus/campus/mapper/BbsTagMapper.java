package com.nexus.campus.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexus.campus.entity.BbsTag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BbsTagMapper extends BaseMapper<BbsTag> {

    @Select("SELECT t.* FROM bbs_tag t " +
            "INNER JOIN bbs_post_tag pt ON t.id = pt.tag_id " +
            "WHERE pt.post_id = #{postId}")
    List<BbsTag> selectTagsByPostId(@Param("postId") Long postId);

    @Select("SELECT * FROM bbs_tag WHERE status = 1")
    List<BbsTag> selectActiveTags();
}

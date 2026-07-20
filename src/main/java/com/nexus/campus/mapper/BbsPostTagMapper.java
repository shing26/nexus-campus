package com.nexus.campus.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexus.campus.entity.BbsPostTag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BbsPostTagMapper extends BaseMapper<BbsPostTag> {

    int insertBatch(@Param("postId") Long postId, @Param("tagIds") List<Integer> tagIds);
}

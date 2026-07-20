package com.nexus.campus.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nexus.campus.entity.BbsCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BbsCategoryMapper extends BaseMapper<BbsCategory> {

    @Select("SELECT * FROM bbs_category WHERE status = 1 ORDER BY sort_order ASC")
    List<BbsCategory> selectActiveCategories();
}

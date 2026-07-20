package com.nexus.campus.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("bbs_post")
public class BbsPost implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;

    private Integer categoryId;

    private String title;

    private String content;

    private String summary;

    private Integer viewCount;

    private Integer likeCount;

    private Integer commentCount;

    private Integer status;

    /**
     * 0 = normal, 1 = pinned
     */
    private Integer isPinned;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(exist = false)
    private String authorName;

    @TableField(exist = false)
    private String categoryName;
}

package com.nexus.campus.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class PostPageVo implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private Long userId;
    private String authorName;
    private String authorAvatar;
    private Integer categoryId;
    private String categoryName;
    private String title;
    private String summary;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private Integer status;
    private LocalDateTime createTime;
    private String[] tags;
}

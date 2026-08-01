package com.nexus.campus.dto;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PostUpdateRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    private String title;
    private Integer categoryId;
    private String content;
    private String postType;
    private String promptMetadata;
    private String changeNote;
    private List<Integer> tags;
}

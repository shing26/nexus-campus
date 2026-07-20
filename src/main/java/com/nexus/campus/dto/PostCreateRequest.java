package com.nexus.campus.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;

@Data
public class PostCreateRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Category is required")
    private Integer categoryId;

    @NotBlank(message = "Content is required")
    private String content;

    private List<Integer> tags;
}

package com.nexus.campus.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class UserPublicVo implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String nickname;
    private String avatar;
    private Integer level;
    private Integer corePower;
}

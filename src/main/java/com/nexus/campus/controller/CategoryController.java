package com.nexus.campus.controller;

import com.nexus.campus.dto.ApiResponse;
import com.nexus.campus.entity.Channel;
import com.nexus.campus.service.ChannelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/channels")
public class CategoryController {

    @Autowired
    private ChannelService channelService;

    @GetMapping
    public ApiResponse<List<Channel>> getAllChannels() {
        return ApiResponse.success(channelService.getAllActiveChannels());
    }
}

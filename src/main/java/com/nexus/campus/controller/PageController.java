package com.nexus.campus.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping({"/", "/index"})
    public String index() {
        return "common/index";
    }

    @GetMapping("/login")
    public String login() {
        return "common/login";
    }

    @GetMapping("/register")
    public String register() {
        return "common/register";
    }

    @GetMapping("/post/create")
    public String createPost() {
        return "post/create";
    }

    @GetMapping("/post/detail")
    public String postDetail() {
        return "post/detail";
    }

    @GetMapping("/user/profile")
    public String profile() {
        return "user/profile";
    }

    @GetMapping("/admin/audit")
    public String adminAudit() {
        return "admin/audit";
    }

    @GetMapping("/user/messages")
    public String userMessages() {
        return "user/messages";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "admin/dashboard";
    }

    @GetMapping("/error")
    public String errorPage() {
        return "common/error";
    }
}

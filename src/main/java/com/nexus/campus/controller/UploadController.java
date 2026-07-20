package com.nexus.campus.controller;

import com.nexus.campus.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/upload")
public class UploadController {

    private static final Logger log = LoggerFactory.getLogger(UploadController.class);
    private static final Set<String> ALLOWED_TYPES = new HashSet<>(Arrays.asList("image/jpeg", "image/png", "image/gif", "image/webp"));
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Value("${campus.upload.dir:src/main/resources/static/uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    void init() {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath();
        try {
            Files.createDirectories(uploadPath);
            log.info("[NEXUS-UPLOAD] Upload directory initialized at {}", uploadPath);
        } catch (IOException e) {
            log.error("[NEXUS-UPLOAD] Failed to create upload directory", e);
        }
    }

    @PostMapping("/image")
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ApiResponse.error(400, "File is empty.");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            return ApiResponse.error(400, "Only JPG, PNG, GIF, and WebP images are allowed.");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            return ApiResponse.error(400, "File size exceeds 5MB limit.");
        }

        // Generate unique filename
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;

        try {
            Path targetPath = uploadPath.resolve(filename);
            file.transferTo(targetPath.toFile());
            log.info("[NEXUS-UPLOAD] File saved: {}", targetPath);
            String url = "/uploads/" + filename;
            return ApiResponse.success("Image uploaded.", url);
        } catch (IOException e) {
            log.error("[NEXUS-UPLOAD] Upload failed", e);
            return ApiResponse.error(500, "File upload failed: " + e.getMessage());
        }
    }
}

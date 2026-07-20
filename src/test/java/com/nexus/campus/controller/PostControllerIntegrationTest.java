package com.nexus.campus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.campus.dto.PostCreateRequest;
import com.nexus.campus.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;

import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Full integration tests for {@link PostController}.
 *
 * <p>Tests post listing, detail retrieval, creation (with JWT auth),
 * and liking. Uses the seed data from data.sql.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
class PostControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwtUtil;

    private String authToken;
    private static final String POSTS_URL = "/api/v1/posts";

    @BeforeEach
    void setUp() {
        // Generate a valid JWT for the seed user (id=2, "testuser", "USER")
        authToken = jwtUtil.generateToken(2L, "testuser", "USER");
    }

    @Test
    @DisplayName("GET /api/v1/posts should return list of active posts")
    void getPosts_shouldReturnPostList() throws Exception {
        mockMvc.perform(get(POSTS_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.list", is(not(empty()))))
                .andExpect(jsonPath("$.data.list[0].title", notNullValue()))
                .andExpect(jsonPath("$.data.page", is(1)))
                .andExpect(jsonPath("$.data.size", is(10)));
    }

    @Test
    @DisplayName("GET /api/v1/posts with categoryId should filter by category")
    void getPostsByCategory_shouldReturnFilteredList() throws Exception {
        mockMvc.perform(get(POSTS_URL)
                        .param("categoryId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.list", is(not(empty()))));
    }

    @Test
    @DisplayName("GET /api/v1/posts/{id} should return post detail")
    void getPostDetail_shouldReturnPost() throws Exception {
        long existingPostId = 17921094810291L;

        mockMvc.perform(get(POSTS_URL + "/" + existingPostId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.id", is(notNullValue())))
                .andExpect(jsonPath("$.data.title", notNullValue()))
                .andExpect(jsonPath("$.data.authorName", is("Test User")))
                .andExpect(jsonPath("$.data.categoryName", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/posts/{id} should return 404 for nonexistent post")
    void getPostDetail_nonexistent_shouldReturn404() throws Exception {
        mockMvc.perform(get(POSTS_URL + "/999999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(404)));
    }

    @Test
    @DisplayName("POST /api/v1/posts with valid JWT should create a post")
    void createPost_withValidToken_shouldSucceed() throws Exception {
        PostCreateRequest request = new PostCreateRequest();
        request.setTitle("Integration Test Post");
        request.setContent("This is a post created during integration testing with clean content.");
        request.setCategoryId(1);
        request.setTags(null);

        mockMvc.perform(post(POSTS_URL)
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.postId", notNullValue()))
                .andExpect(jsonPath("$.data.status", is(1)));
    }

    @Test
    @DisplayName("POST /api/v1/posts without JWT should return 401")
    void createPost_withoutToken_shouldReturn401() throws Exception {
        PostCreateRequest request = new PostCreateRequest();
        request.setTitle("Unauthorized Post");
        request.setContent("This should not be created.");
        request.setCategoryId(1);
        request.setTags(null);

        mockMvc.perform(post(POSTS_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is(401)))
                .andExpect(jsonPath("$.message", containsString("Authentication required")));
    }

    @Test
    @DisplayName("POST /api/v1/posts/{id}/like with valid JWT should increment likes")
    void likePost_withValidToken_shouldSucceed() throws Exception {
        long existingPostId = 17921094810293L;

        mockMvc.perform(post(POSTS_URL + "/" + existingPostId + "/like")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.postId", is(Long.toString(existingPostId))))
                .andExpect(jsonPath("$.data.currentLikes", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/posts/{id}/like without JWT should return 401")
    void likePost_withoutToken_shouldReturn401() throws Exception {
        long existingPostId = 17921094810293L;

        mockMvc.perform(post(POSTS_URL + "/" + existingPostId + "/like"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is(401)))
                .andExpect(jsonPath("$.message", containsString("Authentication required")));
    }
}

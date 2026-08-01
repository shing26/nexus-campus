package com.nexus.campus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.campus.dto.CommentCreateRequest;
import com.nexus.campus.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CommentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwtUtil;

    private String authToken;

    @BeforeEach
    void setUp() {
        authToken = jwtUtil.generateToken(2L, "shing", "USER");
    }

    @Test
    @DisplayName("GET /api/v1/comments/post/{postId} should return comments with author names")
    void getComments_shouldReturnListWithAuthors() throws Exception {
        mockMvc.perform(get("/api/v1/comments/post/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", is(not(empty()))))
                .andExpect(jsonPath("$.data[0].authorName", notNullValue()))
                .andExpect(jsonPath("$.data[0].content", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/comments should create a comment and appear in the list")
    void createComment_withValidToken_shouldSucceed() throws Exception {
        CommentCreateRequest request = new CommentCreateRequest();
        request.setPostId(1L);
        request.setContent("Integration comment from automated delivery test.");

        mockMvc.perform(post("/api/v1/comments")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.content", containsString("automated delivery test")));

        mockMvc.perform(get("/api/v1/comments/post/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.content == 'Integration comment from automated delivery test.')]")
                        .exists());
    }

    @Test
    @DisplayName("POST /api/v1/comments without JWT should return 401")
    void createComment_withoutToken_shouldReturn401() throws Exception {
        CommentCreateRequest request = new CommentCreateRequest();
        request.setPostId(1L);
        request.setContent("This comment must not be created.");

        mockMvc.perform(post("/api/v1/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is(401)));
    }
}

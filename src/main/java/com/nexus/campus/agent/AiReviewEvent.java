package com.nexus.campus.agent;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AiReviewEvent extends ApplicationEvent {

    private final Long postId;
    private final String content;

    public AiReviewEvent(Object source, Long postId, String content) {
        super(source);
        this.postId = postId;
        this.content = content;
    }
}

package com.nexus.campus.agent;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published after a VibePost passes the synchronous DFA filter,
 * triggering an async LLM semantic safety check.
 */
@Getter
public class AiSafetyCheckEvent extends ApplicationEvent {

    private final Long postId;
    private final String content;
    private final Long authorId;

    public AiSafetyCheckEvent(Object source, Long postId, String content, Long authorId) {
        super(source);
        this.postId = postId;
        this.content = content;
        this.authorId = authorId;
    }
}

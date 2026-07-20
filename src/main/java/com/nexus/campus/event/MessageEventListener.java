 package com.nexus.campus.event;
 
 import com.nexus.campus.entity.SysMessage;
 import com.nexus.campus.mapper.SysMessageMapper;
 import lombok.extern.slf4j.Slf4j;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.context.event.EventListener;
 import org.springframework.data.redis.core.RedisTemplate;
 import org.springframework.scheduling.annotation.Async;
 import org.springframework.stereotype.Component;
 
 @Slf4j
 @Component
 public class MessageEventListener {
 
     @Autowired
     private SysMessageMapper sysMessageMapper;
 
     @Autowired(required = false)
     private RedisTemplate<String, Object> redisTemplate;
 
     @Async
     @EventListener
     public void handleMessageEvent(MessageEvent event) {
         // 1. 写 sys_message 表
         SysMessage msg = new SysMessage();
         msg.setFromUserId(event.getSenderId());
         msg.setToUserId(event.getReceiverId());
         msg.setContent(event.getContent());
         // map msgType to Integer type; default to type 2 (comment/system) if not "like"
         msg.setType("like".equals(event.getMsgType()) ? 1 : 2);
         msg.setIsRead(0);
         sysMessageMapper.insert(msg);
 
         // 2. Redis 未读数 +1
         if (redisTemplate != null) {
             try {
                 redisTemplate.opsForHash().increment(
                     "msg:unread:" + event.getReceiverId(),
                     event.getMsgType(), 1);
             } catch (Exception e) {
                 log.warn("Redis unavailable, skipping unread count increment for user {}", event.getReceiverId(), e);
             }
         }
     }
 }

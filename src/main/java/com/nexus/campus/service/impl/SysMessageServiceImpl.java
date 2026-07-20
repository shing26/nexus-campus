package com.nexus.campus.service.impl;

import com.nexus.campus.entity.SysMessage;
import com.nexus.campus.event.MessageEvent;
import com.nexus.campus.mapper.SysMessageMapper;
import com.nexus.campus.service.SysMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SysMessageServiceImpl implements SysMessageService {

    @Autowired
    private SysMessageMapper sysMessageMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public SysMessage sendMessage(Long fromUserId, Long toUserId, String content, Integer type) {
        // 发布异步 MessageEvent，由 MessageEventListener 处理 DB 写入和 Redis 未读数
        String msgType;
        if (type != null && type == 1) {
            msgType = "like";
        } else {
            msgType = "comment";
        }
        eventPublisher.publishEvent(new MessageEvent(this, fromUserId, toUserId, msgType, content, null));

        // 返回空 SysMessage 对象以保持方法签名兼容
        SysMessage msg = new SysMessage();
        msg.setFromUserId(fromUserId);
        msg.setToUserId(toUserId);
        msg.setContent(content);
        msg.setType(type);
        msg.setIsRead(0);
        return msg;
    }

    @Override
    public List<SysMessage> getMessagesByUserId(Long userId) {
        return sysMessageMapper.selectMessagesByUserId(userId);
    }

    @Override
    public int countUnreadMessages(Long userId) {
        return sysMessageMapper.countUnreadMessages(userId);
    }

    @Override
    public boolean markAsRead(Long messageId) {
        SysMessage msg = sysMessageMapper.selectById(messageId);
        if (msg == null) return false;
        msg.setIsRead(1);
        return sysMessageMapper.updateById(msg) > 0;
    }

    @Override
    @Transactional
    public boolean markAllAsRead(Long userId) {
        return sysMessageMapper.markAllAsRead(userId) > 0;
    }
}
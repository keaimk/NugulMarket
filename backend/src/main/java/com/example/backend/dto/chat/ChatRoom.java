package com.example.backend.dto.chat;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ChatRoom {
    private int roomId;
    private int productId;
    private String writer;
    private String productName;
    private String nickname;
    private String buyer;
    private LocalDateTime leaveAt;
    // dto용
    private List<ChatMessage> messages;
}

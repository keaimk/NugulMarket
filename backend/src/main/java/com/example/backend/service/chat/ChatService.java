package com.example.backend.service.chat;

import com.example.backend.dto.chat.ChatMessage;
import com.example.backend.dto.chat.ChatRoom;
import com.example.backend.mapper.chat.ChatMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {

    private final ChatMapper mapper;


    public boolean creatChatRoom(ChatRoom chatRoom) {
        int cnt = mapper.createChatRoom(chatRoom);

        return cnt == 1;
    }

    public ChatRoom chatRoomView(String roomId) {
        return mapper.chatRoomViewById(roomId);
    }


    public List<ChatRoom> chatRoomList(String memberId, String type) {
        //db 수정해야함
        return mapper.chatRoomListByMemberId(memberId, type);
    }

    public boolean deleteChatRoom(String roomId) {

        int cnt = mapper.deleteChatRoomByRoomId(roomId);
        return cnt == 1;
    }

    public String findNickname(String writer) {

        return mapper.findNickNameByWriter(writer);
    }

    public void insertMessage(ChatMessage chatMessage) {

        mapper.insertMessage(chatMessage);
    }


    public Integer findChatRoomId(ChatRoom chatRoom) {

        return mapper.findChatRoomId(chatRoom);
    }

    public List<ChatMessage> chatMessageView(String roomId) {

        return mapper.chatMessageByRoomId(roomId);
    }


    // 메시지 로딩
    public List<ChatMessage> getMessageById(String roomId, Integer page) {
        Integer offset = (page - 1) * 8;
        
        return mapper.chatMessagePageByRoomId(roomId, offset);


    }
}

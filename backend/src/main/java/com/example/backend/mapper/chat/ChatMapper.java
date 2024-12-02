package com.example.backend.mapper.chat;

import com.example.backend.dto.chat.ChatMessage;
import com.example.backend.dto.chat.ChatRoom;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ChatMapper {


    @Insert("""
            INSERT INTO chatroom (productName, writer, nickname)
            VALUES (
                #{productName},
                #{writer},
                (SELECT  distinct (nickname) FROM member WHERE member_id = #{writer})
            )
            """)
    @Options(useGeneratedKeys = true, keyProperty = "roomId")
    int createChatRoom(ChatRoom chatInfo);


    @Select("""
                        select * 
                        from chatroom
                        where roomId =#{roomId}
            
            """)
    ChatRoom chatRoomViewById(String roomId);


    @Select("""
                select *
                from chatroom
                order by roomId desc
            """)
    List<ChatRoom> allChatRoomList();

    @Delete("""
                        delete from chatroom
            where roomId =#{roomId}
            """)
    int deleteChatRoomByRoomId(String roomId);

    // 닉네임만 가져옴
    @Select("""
                  select   distinct (m.nickname)
                                  from chatroom c join member m
                                  where m.member_id=#{writer};
            """)
    String findNickNameByWriter(String writer);

    @Insert("""
                        Insert into chat_message
                        (sender,roomId,content)
            values (#{sender},#{roomId},#{content})
            """)
    int insertMessage(ChatMessage chatMessage);
}

package com.example.backend.controller.board;

import com.example.backend.dto.board.Board;
import com.example.backend.dto.comment.Comment;
import com.example.backend.service.board.BoardService;
import com.example.backend.service.comment.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardController {
    final BoardService service;
    final CommentService commentService;

    @GetMapping("/boardsAndComments/{memberId}")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getBoardsAndComments(@PathVariable String memberId,
                                                    @RequestParam(value = "boardPages", defaultValue = "1") Integer boardPages,
                                                    @RequestParam(value = "commentPages", defaultValue = "1") Integer commentPages) {

        int itemsPerPage = 6;

        List<Board> boards = service.selectByMemberId(memberId, boardPages); // 작성자의 게시물 가져오기
        List<Comment> comments = commentService.getCommentsByMemberId(memberId, commentPages); // 사용자가 작성한 댓글

        int totalBoards = service.getBoardCountByMemberId(memberId);
        int totalComments = commentService.getCommentCountByMemberId(memberId);

        int totalBoardPages = (int) Math.ceil((double) totalBoards / itemsPerPage); // 게시물 총 페이지 수
        int totalCommentPages = (int) Math.ceil((double) totalComments / itemsPerPage); // 댓글 총 페이지 수
        return Map.of(
                "boards", boards,
                "comments", comments,
                "totalBoardCount", totalBoards,
                "totalCommentCount", totalComments,
                "totalBoardPages", totalBoardPages,
                "totalCommentPages", totalCommentPages
        );
    }

    @PutMapping("boardUpdate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> boardUpdate(
            Board board,
            @RequestParam(value = "removeFiles[]", required = false) List<String> removeFiles,
            @RequestParam(value = "uploadFiles[]", required = false) MultipartFile[] uploadFiles,
            Authentication authentication) {
        if (service.hasAccess(board.getBoardId(), authentication)) {
            if (service.validate(board)) {
                if (service.update(board, removeFiles, uploadFiles)) {
                    return ResponseEntity.ok().body(Map.of("message",
                            Map.of("type", "success",
                                    "text", STR."\{board.getBoardId()}번 게시물이 수정되었습니다.")));
                } else {
                    return ResponseEntity.ok()
                            .body(Map.of("message", Map.of("type", "error",
                                    "text", STR."\{board.getBoardId()}번 게시물이 수정되지 않았습니다.")));
                }
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", Map.of("type", "warning",
                                "text", "제목이나 본문이 비어있을 수 없습니다.")));
            }
        } else {
            return ResponseEntity.status(403)
                    .body(Map.of("message", Map.of("type", "error"
                            , "text", "수정 권한이 없습니다.")));
        }
    }

    @DeleteMapping("boardDelete/{boardId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> delete(
            @PathVariable int boardId,
            Authentication authentication) {
        if (service.hasAccess(boardId, authentication)) {
            if (service.remove(boardId)) {
                return ResponseEntity.ok()
                        .body(Map.of("message", Map.of("type", "success"
                                , "text", STR."\{boardId}번 게시글이 삭제되었습니다.")));
            } else {
                return ResponseEntity.internalServerError()
                        .body(Map.of("message", Map.of("type", "error"
                                , "text", "게시글 삭제 중 문제가 발생하였습니다.")));
            }
        } else {
            return ResponseEntity.status(403)
                    .body(Map.of("message", Map.of("type", "error"
                            , "text", "삭제 권한이 없습니다.")));
        }
    }

    @GetMapping("boardView/{boardId}")
    @PreAuthorize("isAuthenticated()")
    public Board boardView(@PathVariable int boardId) {
        return service.get(boardId);
    }

    @PostMapping("boardAdd")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> boardAdd(Board board,
                                                        @RequestParam(value = "files[]", required = false) MultipartFile[] files,
                                                        Authentication authentication) {
        if (service.validate(board)) {
            if (service.boardAdd(board, files, authentication)) {
                System.out.println("files = " + files);
                return ResponseEntity.ok()
                        .body(Map.of("message", Map.of("type", "success",
                                        "text", STR."\{board.getBoardId()}번 게시물이 등록되었습니다"),
                                "data", board));
            } else {
                return ResponseEntity.internalServerError()
                        .body(Map.of("message", Map.of("type", "warning",
                                "text", "게시물 등록이 실패하였습니다.")));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", Map.of("type", "warning",
                    "text", "제목이나 본문이 비어있을 수 없습니다.")));
        }
    }

    @GetMapping("list")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> list(
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "searchType", defaultValue = "all") String searchType,
            @RequestParam(value = "searchKeyword", defaultValue = "") String searchKeyword,
            @RequestParam(value = "category", defaultValue = "all") String category) {

        return service.list(page, searchType, searchKeyword, category);
    }
}

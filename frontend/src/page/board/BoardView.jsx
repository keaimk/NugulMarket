import { Box, Flex, Image, Spinner, Stack, Text } from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button.jsx";
import { toaster } from "../../components/ui/toaster.jsx";
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog.jsx";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";
import { CommentContainer } from "../../components/comment/CommentContainer.jsx";
import { BoardCategoryContainer } from "../../components/category/BoardCategoryContainer.jsx";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styled from "@emotion/styled";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useTheme } from "../../components/context/ThemeProvider.jsx";

export function BoardView() {
  const [boardView, setBoardView] = useState(null);
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageSizes, setImageSizes] = useState([]); // 이미지 크기 상태 배열 추가
  const navigate = useNavigate();
  const { hasAccess } = useContext(AuthenticationContext);
  const location = useLocation(); // URL에서 쿼리 파라미터를 읽기 위해 사용
  const { fontColor, buttonColor } = useTheme();

  const StyledQuill = styled(ReactQuill)`
    .ql-container {
      border: none !important;
    }

    .ql-editor {
      border: none !important;
    }
  `;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, []);

  // URL에서 category 쿼리 파라미터를 읽어서 selectedCategory를 설정
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("category") || "all"; // 기본값은 "all"
    setSelectedCategory(categoryFromUrl);
  }, [location]);

  // 게시글 데이터를 불러오기
  useEffect(() => {
    axios.get(`/api/board/boardView/${boardId}`).then((res) => {
      setBoard(res.data);
      setSelectedCategory(res.data.category || "all");
    });
  }, [boardId]);

  // 게시글이 로딩 중일 때 Spinner 표시
  if (!board) {
    return <Spinner />;
  }

  // 게시글 삭제 핸들러
  const handleDeleteClick = () => {
    axios
      .delete(`/api/board/boardDelete/${board.boardId}`)
      .then((res) => res.data)
      .then((data) => {
        toaster.create({
          type: data.message.type,
          description: data.message.text,
        });
        navigate("/board/list");
      })
      .catch((e) => {
        const data = e.response.data;
        toaster.create({
          type: data.message.type,
          description: data.message.text,
        });
      });
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (categoryValue) => {
    setSelectedCategory(categoryValue);
    if (categoryValue === "all") {
      navigate(`/board/list`); // "전체" 카테고리로 이동
    } else {
      navigate(`/board/list?category=${categoryValue}`); // 선택된 카테고리로 이동
    }
  };

  // 이미지 로딩 후 크기 설정
  const handleImageLoad = (index, e) => {
    const newImageSizes = [...imageSizes];
    newImageSizes[index] = {
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    };
    setImageSizes(newImageSizes);
  };

  return (
    <Box mb={10}>
      {/* 카테고리 선택 */}
      <Box mb={5}>
        <BoardCategoryContainer
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </Box>

      <Box p={5} border="1px solid #e2e8f0" borderRadius="lg">
        {/* 제목, 작성자, 날짜 */}
        <Box mb={5} borderBottom="1px solid #e2e8f0" pb={5}>
          <Flex justify="space-between" align="center">
            {/* 제목 */}
            <Box>
              <Text fontSize="2xl" fontWeight="bold" mb={2}>
                {board.title}
              </Text>
              <Text fontSize="lg" color="gray.500">
                {board.writer} | {board.createdAt}
              </Text>
            </Box>

            {/* 삭제/수정 버튼 */}
            {hasAccess(board.memberId) && (
              <Flex align="center" mt={10} mr={1}>
                <Box
                  onClick={() => navigate(`/board/boardEdit/${board.boardId}`)}
                  cursor="pointer"
                  ml={2}
                >
                  <Image
                    src="/image/InquiryEdit.png"
                    width="30px"
                    height="30px"
                  />
                </Box>
                <DialogRoot>
                  <DialogTrigger asChild>
                    <Box ml={2} cursor="pointer">
                      <Image
                        src="/image/InquiryDelete.png"
                        width="30px"
                        height="30px"
                      />
                    </Box>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>삭제 확인</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                      {board && (
                        <p>{board.boardId}번 게시글을 삭제하시겠습니까?</p>
                      )}
                    </DialogBody>
                    <DialogFooter>
                      <DialogActionTrigger>
                        <Button variant="outline">취소</Button>
                      </DialogActionTrigger>
                      <Button
                        color={fontColor}
                        fontWeight="bold"
                        bg={buttonColor}
                        _hover={{ bg: `${buttonColor}AA` }}
                        onClick={handleDeleteClick}
                      >
                        삭제
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </DialogRoot>
              </Flex>
            )}
          </Flex>
        </Box>

        {/* 본문 */}
        <Stack gap={5}>
          <StyledQuill
            value={board.content || ""}
            readOnly
            modules={{ toolbar: false }}
            style={{
              width: "100%",
              height: "160px",
              maxHeight: "auto",
              marginBottom: "40px",
              fontSize: "16px",
            }}
          />

          {/* 이미지 슬라이드 */}
          {board.fileList && (
            <Box m={0}>
              <Swiper
                spaceBetween={30}
                slidesPerView={1}
                navigation={true}
                pagination={{ clickable: true }}
                loop={true}
                modules={[Pagination, Navigation]}
              >
                {board.fileList.map((file, index) => (
                  <SwiperSlide key={file.name}>
                    <Box
                      display="flex"
                      justifyContent="center" // 가로 가운데 정렬
                      alignItems="center" // 세로 가운데 정렬
                      position="relative" // 이미지가 제대로 중앙에 배치되도록 위치 설정
                    >
                      <Image
                        src={file.src}
                        alt={file.name}
                        onLoad={(e) => handleImageLoad(index, e)} // 이미지 로드 시 크기 계산
                        width="200px" // 원하는 이미지 크기 설정
                        height="150px" // 원하는 이미지 크기 설정
                        objectFit="cover"
                      />
                    </Box>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
          )}
        </Stack>

        {/* 댓글 컴포넌트 */}
        <hr style={{ margin: "20px 0" }} />
        <CommentContainer boardId={board.boardId} />
      </Box>
    </Box>
  );
}

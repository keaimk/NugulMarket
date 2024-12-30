import {
  Badge,
  Box,
  Flex,
  Input,
  Table,
  TableColumnHeader,
  TableHeader,
  TableRow,
  Text,
} from "@chakra-ui/react";
import { FaCommentDots } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../../components/ui/button.jsx";

// 관리자 페이지에서 모든 문의 목록을 조회, 검색, 페이징 처리하며 특정 문의 상세 페이지로 이동할 수 있는 기능 제공
export function AdminInquiryList() {
  const [inquiryList, setInquiryList] = useState([]);
  const [search, setSearch] = useState({
    type: "all",
    keyword: "",
    category: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // 컴포넌트가 처음 렌더링될 때 API에서 문의 목록 데이터를 가져옴
  useEffect(() => {
    axios
      .get("/api/inquiry/list")
      .then((res) => {
        console.log("문의 목록 데이터:", res.data);
        setInquiryList(res.data);
      })
      .catch((error) => {
        console.error("문의 목록 요청 중 오류 발생:", error);
      });
  }, []);

  // 테이블 행을 클릭하면 해당 문의의 상세 페이지로 이동함
  function handleRowClick(inquiryId) {
    navigate(`/admin/inquiries/${inquiryId}`);
  }

  // 검색 유형 및 키워드에 따라 문의 목록을 필터링함
  const filteredInquiries = inquiryList.filter((inquiry) => {
    const inquiryTitle = inquiry.title;
    const inquiryCategory = inquiry.category;

    if (!inquiryTitle) {
      console.error("문의 데이터에 'title'이 누락되었습니다:", inquiry);
      return false;
    }

    const searchTerm = search.keyword.toLowerCase();
    const isCategoryMatch = search.category
      ? inquiryCategory === search.category
      : true;

    switch (search.type) {
      case "all":
        return (
          (inquiryTitle.toLowerCase().includes(searchTerm) ||
            inquiry.memberId.toLowerCase().includes(searchTerm)) &&
          isCategoryMatch
        );
      case "category":
        return (
          inquiryCategory.toLowerCase().includes(searchTerm) && isCategoryMatch
        );
      case "title":
        return (
          inquiryTitle.toLowerCase().includes(searchTerm) && isCategoryMatch
        );
      case "member":
        return (
          inquiry.memberId.toLowerCase().includes(searchTerm) && isCategoryMatch
        );
      default:
        return false;
    }
  });

  // 필터링된 문의 목록을 현재 페이지와 페이지당 아이템 수에 따라 페이지네이션함
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 사용자가 페이지를 변경할 때 현재 페이지를 업데이트함
  function handlePageChange(newPage) {
    setCurrentPage(newPage);
  }

  // 검색 유형이 변경될 때 검색 상태를 업데이트하고 첫 페이지로 이동함
  function handleSearchTypeChange(e) {
    setSearch({ ...search, type: e.target.value });
    setCurrentPage(1);
  }

  // 검색 키워드가 변경될 때 검색 상태를 업데이트하고 첫 페이지로 이동함
  function handleSearchKeywordChange(e) {
    setSearch({ ...search, keyword: e.target.value });
    setCurrentPage(1);
  }

  const headerStyle = {
    padding: "10px",
    height: "50px",
    textAlign: "center",
    backgroundColor: "#f4f4f4",
    fontWeight: "bold",
  };

  const cellStyle = {
    padding: "10px",
    height: "50px",
    textAlign: "center",
  };

  return (
    <Box mt="60px">
      <Text fontSize="2xl" fontWeight="bold" mb={5} m={2}>
        문의 내역
      </Text>
      <Box mb={3}>
        <Flex justify="center" align="center" gap={4}>
          <select value={search.type} onChange={handleSearchTypeChange}>
            <option value="all">전체</option>
            <option value="category">문의 유형</option>
            <option value="title">문의 제목</option>
            <option value="member">작성자</option>
          </select>
          <Input
            placeholder="검색"
            value={search.keyword}
            onChange={handleSearchKeywordChange}
            width="100%"
            maxWidth="800px"
          />
        </Flex>
      </Box>
      <Text mb={4} m={2}>
        총 {filteredInquiries.length}개
      </Text>
      <Box>
        <Table.Root interactive>
          <TableHeader>
            <TableRow>
              <TableColumnHeader style={headerStyle}>번호</TableColumnHeader>
              <TableColumnHeader style={headerStyle}>
                문의 유형
              </TableColumnHeader>
              <TableColumnHeader style={{ ...headerStyle, width: "300px" }}>
                문의 제목
              </TableColumnHeader>
              <TableColumnHeader style={{ ...headerStyle, width: "300px" }}>
                작성자
              </TableColumnHeader>
              <TableColumnHeader style={{ ...headerStyle, width: "250px" }}>
                작성 일자
              </TableColumnHeader>
              <TableColumnHeader style={headerStyle}>상태</TableColumnHeader>
            </TableRow>
          </TableHeader>
          <Table.Body>
            {paginatedInquiries.map((inquiry) => (
              <Table.Row
                key={inquiry.inquiryId}
                onClick={() => handleRowClick(inquiry.inquiryId)}
                style={{ cursor: "pointer" }}
              >
                <Table.Cell style={cellStyle}>{inquiry.inquiryId}</Table.Cell>
                <Table.Cell style={cellStyle}>{inquiry.category}</Table.Cell>
                <Table.Cell style={cellStyle}>{inquiry.title}</Table.Cell>
                <Table.Cell style={cellStyle}>{inquiry.memberId}</Table.Cell>
                <Table.Cell style={cellStyle}>
                  {new Date(inquiry.inserted).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell style={cellStyle}>
                  {inquiry.hasAnswer ? (
                    <Badge variant={"subtle"} colorPalette={"green"}>
                      <FaCommentDots /> 답변 완료
                    </Badge>
                  ) : (
                    <Badge variant={"subtle"} colorPalette={"red"}>
                      <FaCommentDots /> 답변 대기
                    </Badge>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
      <Flex justify="center" mt={4} gap={2}>
        {Array.from({ length: totalPages }, (_, index) => (
          <Button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            style={{
              padding: "5px 10px",
              backgroundColor:
                currentPage === index + 1 ? "#D2D2D2" : "#E4E4E4",
              color: currentPage === index + 1 ? "white" : "black",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            {index + 1}
          </Button>
        ))}
      </Flex>
    </Box>
  );
}

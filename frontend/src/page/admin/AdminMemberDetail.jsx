import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Flex,
  Spinner,
  Stack,
  Table,
  TableColumnHeader,
  TableHeader,
  TableRow,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { categories } from "../../components/category/CategoryContainer.jsx";

export function AdminMemberDetail() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [soldList, setSoldList] = useState([]);
  const [purchasedList, setPurchasedList] = useState([]);
  const [currentPageSold, setCurrentPageSold] = useState(1);
  const [currentPagePurchased, setCurrentPagePurchased] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  // 카테고리 값을 한글로 변환하는 함수
  function getCategoryLabel(value) {
    const category = categories.find((cat) => cat.value === value);
    return category ? category.label : "전체"; // "전체"를 기본값으로 반환
  }

  // 데이터 로드 및 상태 설정
  useEffect(() => {
    const fetchSoldProducts = axios.get("/api/myPage/sold", {
      params: { id: memberId },
    });
    const fetchPurchasedProducts = axios.get("/api/myPage/purchased", {
      params: { id: memberId },
    });

    // 회원의 판매, 구매, 결제 내역 데이터를 가져와서 상태 업데이트
    Promise.all([fetchSoldProducts, fetchPurchasedProducts])
      .then(([soldRes, purchasedRes]) => {
        console.log("판매 내역 데이터:", soldRes.data);
        console.log("구매 내역 데이터:", purchasedRes.data);

        setSoldList(soldRes.data);
        setPurchasedList(purchasedRes.data);

        setLoading(false);
      })
      .catch((error) => {
        console.error("데이터를 가져오는 중 오류 발생:", error);
        setSoldList([]);
        setPurchasedList([]);
        setLoading(false);
      });
  }, [memberId]);

  // 로딩 중일 때 표시
  if (loading) {
    return <Spinner />;
  }

  // 판매 내역 페이지네이션 로직
  const indexOfLastSold = currentPageSold * itemsPerPage;
  const indexOfFirstSold = indexOfLastSold - itemsPerPage;
  const currentSoldList = soldList.slice(indexOfFirstSold, indexOfLastSold);
  const totalSoldPages = Math.ceil(soldList.length / itemsPerPage);

  // 구매 내역 페이지네이션 로직
  const indexOfLastPurchased = currentPagePurchased * itemsPerPage;
  const indexOfFirstPurchased = indexOfLastPurchased - itemsPerPage;
  const currentPurchasedList = purchasedList.slice(
    indexOfFirstPurchased,
    indexOfLastPurchased,
  );
  const totalPurchasedPages = Math.ceil(purchasedList.length / itemsPerPage);

  // 페이지 변경 시 현재 페이지를 업데이트
  function handlePageChange(tab, newPage) {
    if (tab === "sold") {
      setCurrentPageSold(newPage);
    } else if (tab === "purchased") {
      setCurrentPagePurchased(newPage);
    }
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
    <Box p={4} pt={20}>
      <Stack spacing={8}>
        <Tabs.Root defaultValue="SoldProducts">
          <Tabs.List
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>{memberId} 님의</span>
            <Tabs.Trigger value="SoldProducts">판매 내역</Tabs.Trigger>
            <Tabs.Trigger value="PurchasedProducts">구매 내역</Tabs.Trigger>
          </Tabs.List>

          {/* 판매 내역 탭 */}
          <Tabs.Content value="SoldProducts">
            <Box mt={-4}>
              <Table.Root interactive>
                <TableHeader>
                  <TableRow>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "200px" }}
                    >
                      ID
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "200px" }}
                    >
                      구매자
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "200px" }}
                    >
                      카테고리
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "300px" }}
                    >
                      상품명
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "200px" }}
                    >
                      가격
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "250px" }}
                    >
                      판매 일자
                    </TableColumnHeader>
                  </TableRow>
                </TableHeader>
                <Table.Body>
                  {currentSoldList.length > 0 ? (
                    currentSoldList.map((product) => (
                      <Table.Row
                        key={product.productId}
                        onClick={() => {
                          console.log("Product clicked", product.productId);
                          navigate(`/product/view/${product.productId}`);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <Table.Cell style={cellStyle}>
                          {product.productId}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {product.buyerId ? product.buyerId : "미정"}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {getCategoryLabel(product.category)}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {product.productName}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {product.price ? `${product.price}원` : "나눔"}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {product.purchasedAt &&
                          !isNaN(new Date(product.purchasedAt))
                            ? new Date(product.purchasedAt).toLocaleDateString()
                            : "판매중"}{" "}
                          {/* 판매일자가 없으면 판매중으로 표시 */}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell
                        colSpan={7}
                        style={{ textAlign: "center", padding: "22px" }}
                      >
                        판매 내역이 없습니다.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
            <Flex justify="center" mt={4} gap={2}>
              {[...Array(totalSoldPages).keys()].map((page) => (
                <Button
                  key={page + 1}
                  onClick={() => handlePageChange("sold", page + 1)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor:
                      currentPageSold === page + 1 ? "#D2D2D2" : "#E4E4E4",
                    color: currentPageSold === page + 1 ? "white" : "black",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  {page + 1}
                </Button>
              ))}
            </Flex>
          </Tabs.Content>

          {/* 구매 내역 탭 */}
          <Tabs.Content value="PurchasedProducts">
            <Box mt={-4}>
              <Table.Root interactive>
                <TableHeader>
                  <TableRow>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "200px" }}
                    >
                      ID
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "250px" }}
                    >
                      판매자
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "150px" }}
                    >
                      카테고리
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "300px" }}
                    >
                      상품명
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "200px" }}
                    >
                      가격
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "200px" }}
                    >
                      거래 방법
                    </TableColumnHeader>
                    <TableColumnHeader
                      style={{ ...headerStyle, width: "250px" }}
                    >
                      구매 일자
                    </TableColumnHeader>
                  </TableRow>
                </TableHeader>
                <Table.Body>
                  {currentPurchasedList.length > 0 ? (
                    currentPurchasedList.map((product) => (
                      <Table.Row
                        key={product.productId}
                        onClick={() => {
                          console.log("Product clicked", product.productId);
                          navigate(`/product/view/${product.productId}`);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <Table.Cell style={cellStyle}>
                          {product.productId
                            ? `${product.productId}`
                            : "상품 정보 없음"}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {product.writer ? product.writer : "탈퇴한 회원"}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {getCategoryLabel(product.category)}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {product.productName}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {product.price ? `${product.price}원` : "무료 나눔"}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {product.paymentMethod === "KakaoPay" && (
                            <img
                              src="/image/Kakaopay.png"
                              alt="Kakaopay Icon"
                              width="60px"
                              height="auto"
                              style={{ marginLeft: "65px" }}
                            />
                          )}
                          {product.paymentMethod === null && (
                            <Text>만나서 거래</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell style={cellStyle}>
                          {product.purchasedAt
                            ? new Date(product.purchasedAt).toLocaleDateString()
                            : ""}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell
                        colSpan={7}
                        style={{ textAlign: "center", padding: "22px" }}
                      >
                        구매 내역이 없습니다.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
            <Flex justify="center" mt={4} gap={2}>
              {[...Array(totalPurchasedPages).keys()].map((page) => (
                <Button
                  key={page + 1}
                  onClick={() => handlePageChange("purchased", page + 1)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor:
                      currentPagePurchased === page + 1 ? "#D2D2D2" : "#E4E4E4",
                    color:
                      currentPagePurchased === page + 1 ? "white" : "black",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  {page + 1}
                </Button>
              ))}
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </Stack>
    </Box>
  );
}

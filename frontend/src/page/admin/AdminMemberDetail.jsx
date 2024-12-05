import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Spinner, Stack, Tabs, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { ProductHorizontalItem } from "../../components/product/ProductHorizontalItem.jsx";

export function AdminMemberDetail() {
  const { memberId } = useParams();
  const [soldList, setSoldList] = useState([]);
  const [purchasedList, setPurchasedList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const SoldProducts = axios.get("/api/myPage/sold", {
      params: { id: memberId },
    });
    const PurchasedProducts = axios.get("/api/myPage/purchased", {
      params: { id: memberId },
    });

    Promise.all([SoldProducts, PurchasedProducts])
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

  if (loading) {
    return <Spinner />;
  }

  return (
    <Box p={4} pt={20}>
      {" "}
      {/* 상단 패딩을 조정하여 네브바와의 간격을 띄우기 */}
      <Stack spacing={8}>
        {" "}
        {/* 각 섹션 사이에 충분한 간격을 줌 */}
        <Box>
          <Tabs.Root defaultValue="SoldProducts">
            <Tabs.List
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>{memberId} 님의</span>
              <Tabs.Trigger value="SoldProducts">판매 내역</Tabs.Trigger>
              <Tabs.Trigger value="PurchasedProducts">구매 내역</Tabs.Trigger>
              <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Indicator />
            <Tabs.Content value="SoldProducts">
              <Box>
                {soldList.length > 0 ? (
                  soldList.map((product) => (
                    <ProductHorizontalItem
                      key={product.productId}
                      product={product}
                    />
                  ))
                ) : (
                  <Text>판매 내역이 없습니다.</Text>
                )}
              </Box>
            </Tabs.Content>
            <Tabs.Content value="PurchasedProducts">
              <Box>
                {purchasedList.length > 0 ? (
                  purchasedList.map((product) => (
                    <ProductHorizontalItem
                      key={product.productId}
                      product={product}
                    />
                  ))
                ) : (
                  <Text>구매 내역이 없습니다.</Text>
                )}
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Stack>
    </Box>
  );
}

import { Box, Heading, Spinner, Text } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ProductHorizontalItem } from "../../components/product/ProductHorizontalItem.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Scrollbar } from "swiper/modules";
import { AuthenticationContext } from "../../components/context/AuthenticationProvider.jsx";

export function Wishlist() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useContext(AuthenticationContext);

  useEffect(() => {
    if (productList.length > 0) return;

    setLoading(true);

    axios
      .get("/api/myPage/like", { params: { id } })
      .then((res) => {
        setProductList(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("관심 상품 정보를 가져오는 데 실패했습니다.", error);
        setProductList([]);
        setLoading(false);
      });
  }, [id]);

  const handleRemove = (productId) => {
    setProductList((prevList) =>
      prevList.filter((item) => item.productId !== productId),
    );
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>
        관심 목록
      </Heading>
      <Box height="70vh" overflow="hidden">
        <Swiper
          direction={"vertical"}
          slidesPerView={"auto"} // 각 상품의 높이에 맞춰 자동으로 크기를 조정
          freeMode={true} // 슬라이드를 자유롭게 이동
          scrollbar={{ draggable: true }}
          mousewheel={true}
          modules={[FreeMode, Scrollbar, Mousewheel]}
          style={{ height: "100%", width: "100%" }}
        >
          {productList.length > 0 ? (
            productList.map((product) => (
              <SwiperSlide
                key={product.productId}
                style={{
                  height: "auto",
                  width: "100%",
                  justifyContent: "left",
                }}
              >
                <ProductHorizontalItem
                  product={product}
                  onRemove={handleRemove}
                  pageType={"wish"}
                />
              </SwiperSlide>
            ))
          ) : (
            <Text>조회된 결과가 없습니다.</Text>
          )}
        </Swiper>
      </Box>
    </Box>
  );
}

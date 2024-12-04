package com.example.backend.mapper.mypage;

import com.example.backend.dto.product.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface MyPageMapper {

    @Select("""
            SELECT p.product_id, p.product_name, p.price, p.category, p.pay, p.status, p.created_at, p.location_name
            FROM product_like l LEFT JOIN product p ON l.product_id = p.product_id
            WHERE l.member_id = #{name} 
            """)
    List<Product> getLikes(String name);

    @Select("""
            SELECT *
            FROM product
            WHERE writer = #{name}
            """)
    List<Product> getsoltProducts(String name);
}
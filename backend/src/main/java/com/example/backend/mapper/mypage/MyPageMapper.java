package com.example.backend.mapper.mypage;

import com.example.backend.dto.product.Product;
import com.example.backend.dto.review.Review;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface MyPageMapper {

    @Select("""
            SELECT p.product_id, p.product_name, p.price, p.category, p.pay, p.status, p.created_at, p.location_name, pf.name AS main_image_name
            FROM product_like l
            LEFT JOIN product p ON l.product_id = p.product_id
            LEFT JOIN product_file pf ON p.product_id = pf.product_id AND pf.is_main = TRUE
            WHERE l.member_id = #{name} 
            """)
    List<Product> getLikes(String name);

    @Select("""
            SELECT
                p.product_id,
                p.category,
                p.product_name,
                p.location_name,
                p.pay,
                p.price,
                p.status,
                p.created_at,
                p.writer,
                pr.date AS purchased_at,
                pr.payment_method,
                m.nickname AS buyer_nickname,
                m.member_id AS buyer_id,
                pf.name AS main_image_name
            FROM 
                product p
            LEFT JOIN 
                purchased_record pr ON p.product_id = pr.product_id
            LEFT JOIN 
                member m ON m.member_id = pr.buyer_id 
            LEFT JOIN product_file pf ON p.product_id = pf.product_id AND pf.is_main = TRUE
            WHERE 
                writer = #{name}
            ORDER BY
                CASE WHEN p.status = 'For sale' THEN 0 ELSE 1 END,
                pr.date DESC
            """)
    List<Product> getSoldProducts(String name);

    @Select("""
            SELECT DISTINCT p.product_id, pr.expense_id, pr.date, pr.product_name, p.writer, pr.price, p.category, p.pay, p.status,
                p.created_at, pr.location_name, pr.date AS purchased_at, m.nickname, pr.review_status , pf.name AS main_image_name, pr.payment_method
            FROM purchased_record pr
            LEFT JOIN product p ON pr.product_id = p.product_id
            LEFT JOIN member m ON pr.seller_id = m.member_id
            LEFT JOIN review r ON pr.product_id = r.product_id 
            LEFT JOIN product_file pf ON p.product_id = pf.product_id AND pf.is_main = TRUE
            WHERE pr.buyer_id = #{name}
            ORDER BY
                pr.date DESC
            """)
    List<Product> getPurchasedProducts(String name);

    @Select("""
            SELECT COUNT(*)
            FROM member 
            WHERE member_id = #{sellerId}""")
    boolean checkSellerExists(String sellerId);

    @Update("""
            UPDATE purchased_record
            SET review_status = 'completed'
            WHERE expense_id=#{expenseId}
            """)
    int updatePurchasedReviewStatus(Integer expenseId);

    @Insert("""
            INSERT INTO review
            (product_id, product_name, buyer_id, buyer_name, review_text, rating, seller_id, price, review_status)
            VALUES (#{productId}, #{productName}, #{buyerId}, #{buyerName}, #{reviewText}, #{rating}, #{sellerId}, #{price}, #{reviewStatus})
            """)
    @Options(keyProperty = "reviewId", useGeneratedKeys = true)
    int insertReview(Review review);

    @Select("""
            <script>
            SELECT r.review_id, r.product_id, r.product_name, r.buyer_id, r.buyer_name, r.price, r.seller_id, r.review_text, r.rating, r.created_at, m.nickname as seller_name
             FROM review r
             LEFT JOIN member m ON r.seller_id = m.member_id
                <where>
                    <if test="role == 'buyer'">
                        AND buyer_id = #{memberId}
                    </if>
                    <if test="role == 'seller'">
                        AND seller_id = #{memberId}
                    </if>
                        AND review_status = 'completed'
                </where>
            ORDER BY r.created_at DESC
            </script>
            """)
    List<Review> getReviews(String memberId, String role);

    @Select("""
            SELECT AVG(rating) AS average_rating
            FROM review
            WHERE seller_id = #{id};
            """)
    Double getRating(String id);

    @Select("""
            SELECT profile_image
            FROM member
            WHERE member_id = #{id}
            """)
    String getProfileImage(String memberId);

    @Update("""
            UPDATE member
            SET profile_image = #{profileImage}
            WHERE member_id = #{memberId}
            """)
    int updateProfileImage(String memberId, String profileImage);

    @Select("""
            SELECT profile_image
            FROM member
            WHERE member_id = #{memberId}
            """)
    String selectProfileImage(String memberId);

    @Update("""
             UPDATE member
            SET profile_image = NULL
            WHERE member_id = #{memberId}
            """)
    int deleteProfileImage(String memberId);

    @Select("""
            SELECT DATE_FORMAT(date, '%Y-%m') AS month,
            SUM(CASE WHEN buyer_id = #{memberId} THEN price ELSE 0 END) AS total_purchases
            FROM purchased_record
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            """)
    List<Map<String, Object>> getMonthlyPurchases(String memberId);

    @Select("""
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                   SUM(CASE WHEN writer = #{memberId} THEN price ELSE 0 END) AS total_sales
            FROM product
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            """)
    List<Map<String, Object>> getMonthlySales(String memberId);
}
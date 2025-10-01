package boot.sagu.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Alias("member")
public class MemberDto {
    private int memberId;
    private String loginId;
    @Size(min = 10, max=100, message = "비밀번호는 최소 10자 이상이어야 합니다.")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).*$", message = "비밀번호는 대문자, 특수문자, 숫자를 포함해야 합니다.")
    private String password;
    private String nickname;
    private String email;
    private String phoneNumber;
    private String profileImageUrl;
    private String tier;
    private String status;
    private String role;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
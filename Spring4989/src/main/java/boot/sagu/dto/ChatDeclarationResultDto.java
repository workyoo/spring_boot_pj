package boot.sagu.dto;

public class ChatDeclarationResultDto {
    private Integer declarationId;
    private Integer resultMemberId;
    private String resultContent;
    
    // 기본 생성자
    public ChatDeclarationResultDto() {}
    
    // 전체 생성자
    public ChatDeclarationResultDto(Integer declarationId, Integer resultMemberId, String resultContent) {
        this.declarationId = declarationId;
        this.resultMemberId = resultMemberId;
        this.resultContent = resultContent;
    }
    
    // Getter와 Setter
    public Integer getDeclarationId() {
        return declarationId;
    }
    
    public void setDeclarationId(Integer declarationId) {
        this.declarationId = declarationId;
    }
    
    public Integer getResultMemberId() {
        return resultMemberId;
    }
    
    public void setResultMemberId(Integer resultMemberId) {
        this.resultMemberId = resultMemberId;
    }
    
    public String getResultContent() {
        return resultContent;
    }
    
    public void setResultContent(String resultContent) {
        this.resultContent = resultContent;
    }
    
    @Override
    public String toString() {
        return "ChatDeclarationResultDto{" +
                "declarationId=" + declarationId +
                ", resultMemberId=" + resultMemberId +
                ", resultContent='" + resultContent + '\'' +
                '}';
    }
}

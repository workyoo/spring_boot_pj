package boot.sagu.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.PhotoDto;

@Mapper
public interface PhotoMapperInter {

	public void insertPhoto(@Param("list") List<PhotoDto> list);
	List<PhotoDto> getPhotosByPostId(Long postId);                 // 조회
    int deletePhotosByIds(@Param("list") List<Long> ids);          // 여러 장 삭제
    int ensureOneMainPhoto(Long postId);                           // 대표 보정
    int clearMainFlags(Long postId);                               // 대표 플래그 초기화 (선택)
    int setMainPhoto(@Param("photoId") Long photoId);              // 대표 지정 (선택)

    // (선택) 물리 파일 삭제용: 삭제 전에 URL 뽑기
    //List<String> findPhotoUrlsByIds(@Param("list") List<Long> ids);
	
}

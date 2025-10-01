package boot.sagu.service;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import boot.sagu.config.JwtUtil;
import boot.sagu.dto.CarDto;
import boot.sagu.dto.FavoritesDto;
import boot.sagu.dto.ItemDto;
import boot.sagu.dto.MemberRegionDto;
import boot.sagu.dto.PhotoDto;
import boot.sagu.dto.PostsDto;
import boot.sagu.dto.RealEstateDto;
import boot.sagu.dto.RegionDto;
import boot.sagu.dto.ReportsDto;
import boot.sagu.mapper.CarMapperInter;
import boot.sagu.mapper.CategoryMapperInter;
import boot.sagu.mapper.EstateMapperInter;
import boot.sagu.mapper.ItemMapperInter;
import boot.sagu.mapper.PhotoMapperInter;
import boot.sagu.mapper.PostsMapperInter;
import jakarta.servlet.http.HttpSession;

@Service
public class PostsService implements PostsServiceInter {

	@Autowired
	private PostsMapperInter postMapper;

	@Autowired
	private PhotoMapperInter photoMapper;

	@Autowired
	private CarMapperInter carMapper;

	@Autowired
	private EstateMapperInter estateMapper;

	@Autowired
	private ItemMapperInter itemMapper;

	@Autowired
	private CategoryMapperInter categoryMapper;

	@Override
	public void insertPost(PostsDto pdto) {
		// TODO Auto-generated method stub
		postMapper.insertPost(pdto);

	}

	@Override
	public List<PostsDto> getAllPostData() {
		// TODO Auto-generated method stub
		return postMapper.getAllPostData();
	}

	@Override
	public void insertPhoto(PhotoDto photoDto) {
		// TODO Auto-generated method stub
		photoMapper.insertPhoto(null);
	}

	@Override
	@Transactional
	public void insertPostWithPhoto(PostsDto pdto, List<MultipartFile> uploadFiles, HttpSession session, CarDto cdto,
			RealEstateDto rdto, ItemDto idto) {
		// TODO Auto-generated method stub

		System.out.println("=== 디버깅 정보 ===");
		System.out.println("전송받은 tradeType: [" + pdto.getTradeType() + "]");
		System.out.println("전송받은 postType: [" + pdto.getPostType() + "]");
		System.out.println("전송받은 title: [" + pdto.getTitle() + "]");
		System.out.println("전송받은 price: [" + pdto.getPrice() + "]");
		System.out.println("전송받은 content: [" + pdto.getContent() + "]");
		System.out.println("tradeType 길이: " + (pdto.getTradeType() != null ? pdto.getTradeType().length() : "null"));
		System.out.println("==================");

		// 값 검증 및 정리
		if (pdto.getTradeType() != null) {
			String cleanTradeType = pdto.getTradeType().trim().toUpperCase();
			if (cleanTradeType.equals("SALE") || cleanTradeType.equals("AUCTION") || cleanTradeType.equals("SHARE")) {
				pdto.setTradeType(cleanTradeType);
				System.out.println("검증된 tradeType: " + cleanTradeType);
			} else {
				System.out.println("잘못된 tradeType 값: " + pdto.getTradeType());
				throw new IllegalArgumentException("Invalid trade_type: " + pdto.getTradeType());
			}
		}

		postMapper.insertPost(pdto);
		System.out.println("생성된 postId = " + pdto.getPostId());
		System.out.println("▶▶ tradeType = " + pdto.getTradeType());

		String path = session.getServletContext().getRealPath("/save");

		List<PhotoDto> photoList = new ArrayList<>();

		if (uploadFiles != null && !uploadFiles.isEmpty()) {
			for (int i = 0; i < uploadFiles.size(); i++) {
				MultipartFile file = uploadFiles.get(i);

				String fileName = file.getOriginalFilename();

				String saveName = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()) + fileName;

				try {
					file.transferTo(new File(path + "\\" + saveName));
				} catch (IllegalStateException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

				PhotoDto photo = new PhotoDto();
				photo.setPostId(pdto.getPostId());
				photo.setPhotoUrl(saveName);
				photo.setIsMain(i == 0 ? 1 : 0); // 첫 번째 사진을 메인으로 설정
				photoList.add(photo);

			}
			photoMapper.insertPhoto(photoList);
		}

		if ("CARS".equals(pdto.getPostType()) && cdto != null) {
			cdto.setPostId(pdto.getPostId());
			carMapper.insertCar(cdto);
			System.out.println("자동차정보");
		}

		if ("REAL_ESTATES".equals(pdto.getPostType()) && rdto != null) {
			rdto.setPostId(pdto.getPostId());
			estateMapper.insertEstate(rdto);
			System.out.println("부동산정보");
		}

		if ("ITEMS".equals(pdto.getPostType()) && idto != null) {
			idto.setPostId(pdto.getPostId());
			itemMapper.insertItem(idto);
			System.out.println("중고물품");
		}
	}

	@Override
	public List<Map<String, Object>> getPostListWithNick() {
		// TODO Auto-generated method stub
		return postMapper.getPostListWithNick();
	}

	@Override
	public Map<String, Object> getPostData(Long postId) {
		// TODO Auto-generated method stub
		return postMapper.getPostData(postId);
	}

	@Override
	public void increaseViewCount(Long postId) {
		// TODO Auto-generated method stub
		postMapper.increaseViewCount(postId);
	}

	@Override
	public int countFavorite(Long postId) {
		// TODO Auto-generated method stub
		return postMapper.countFavorite(postId);
	}

	@Override
	public boolean isFavorited(Long postId, Long memberId) {
		// TODO Auto-generated method stub
		return postMapper.existsFavorite(postId, memberId) > 0;
	}

	@Override
	public boolean toggleFavorite(Long postId, Long memberId) {
		// TODO Auto-generated method stub
		boolean exists = isFavorited(postId, memberId);
		if (exists) {
			postMapper.deleteFavorite(postId, memberId);
			return false; // 해제됨
		} else {
			postMapper.insertFavorite(postId, memberId);
			return true; // 좋아요됨
		}
	}

	
	//수정시작
	//부동산타입 아닌경우 처리
	private void normalizeTradeType(PostsDto p) {
		if (p == null || p.getTradeType() == null)
			return;
		String t = p.getTradeType().trim().toUpperCase();
		if (!List.of("SALE", "AUCTION", "SHARE").contains(t)) {
			throw new IllegalArgumentException("Invalid tradeType: " + p.getTradeType());
		}
		p.setTradeType(t);
	}
	
	//사진 저장처리
	private void saveAndInsertPhotos(Long postId, List<MultipartFile> uploads, HttpSession session) {
		if (uploads == null || uploads.isEmpty()) {
			photoMapper.ensureOneMainPhoto(postId);
			return;
		}

		String base = session.getServletContext().getRealPath("/save");
		List<PhotoDto> batch = new ArrayList<>();

		for (int i = 0; i < uploads.size(); i++) {
			MultipartFile f = uploads.get(i);
			if (f.isEmpty())
				continue;

			String original = Optional.ofNullable(f.getOriginalFilename()).orElse("file");
			String saveName = new java.text.SimpleDateFormat("yyyyMMddHHmmss").format(new java.util.Date()) + "_"
					+ original;
			try {
				f.transferTo(new java.io.File(base, saveName));
			} catch (java.io.IOException e) {
				throw new RuntimeException("파일 저장 실패: " + original, e);
			}

			PhotoDto p = new PhotoDto();
			p.setPostId(postId);
			p.setPhotoUrl(saveName);
			p.setIsMain(i == 0 ? 1 : 0); // 첫 장 대표
			batch.add(p);
		}

		if (!batch.isEmpty()) {
			photoMapper.insertPhoto(batch); // XML 배치 insert
		}
		photoMapper.ensureOneMainPhoto(postId);
	}

	//사진수정
	private void updatePhotos(Long postId, List<Long> deletePhotoIds, List<MultipartFile> uploads, HttpSession session,
			Long mainPhotoId) {
		// 1) 삭제
		if (deletePhotoIds != null && !deletePhotoIds.isEmpty()) {
			// (선택) 물리 파일 삭제하려면 먼저 URL select 후 파일 삭제
			photoMapper.deletePhotosByIds(deletePhotoIds);
		}
		// 2) 추가
		saveAndInsertPhotos(postId, uploads, session);

		// 3) 대표 처리
		if (mainPhotoId != null) {
			photoMapper.clearMainFlags(postId);
			photoMapper.setMainPhoto(mainPhotoId);
		} else {
			photoMapper.ensureOneMainPhoto(postId);
		}
	}

	//수정처리
	@Override
	public void updatePostAll(PostsDto post, CarDto car, RealEstateDto realEstate, ItemDto item,
			List<MultipartFile> uploads, List<Long> deletePhotoIds, Long mainPhotoId, HttpSession session,
			Long actorId) {
		// 0) 권한 체크
		Long ownerId = postMapper.findPostOwnerId(post.getPostId());
		if (ownerId == null || !ownerId.equals(actorId)) {
			throw new AccessDeniedException("작성자만 수정 가능");
		}

		// 1) 값 정리 (옵션: 부동산이면 tradeType 무시 등)
		normalizeTradeType(post);

		// 2) posts 공통 업데이트 (동적 SET)
		postMapper.updatePost(post);

		// 3) postType별 서브 업데이트
		switch (String.valueOf(post.getPostType())) {
		case "CARS" -> {
			if (car != null) {
				car.setPostId(post.getPostId());
				postMapper.updateCar(car);
			}
		}
		case "REAL_ESTATES" -> {
			if (realEstate != null) {
				realEstate.setPostId(post.getPostId());
				postMapper.updateRealEstate(realEstate);
			}
		}
		case "ITEMS" -> {
			if (item != null) {
				item.setPostId(post.getPostId());
				postMapper.updateItem(item);
			}
		}
		}

		// 4) 사진: 삭제 → 추가 → 대표 처리(직접 지정 or 자동 보정)
		updatePhotos(post.getPostId(), deletePhotoIds, uploads, session, mainPhotoId);

		// 5) (선택) 경매 종료시간 자동 보정
		if ("AUCTION".equals(post.getTradeType()) && post.getAuctionEndTime() == null) {
			postMapper.updateAuctionEndTimeToNowPlus24H(post.getPostId());
		}

	}

	@Override
	@Transactional
	public void deletePost(Long postId,PostsDto post,Long actorId) {
		// TODO Auto-generated method stub
		Long ownerId = postMapper.findPostOwnerId(post.getPostId());
		if (ownerId == null || !ownerId.equals(actorId)) {
			throw new AccessDeniedException("작성자만 삭제 가능");
		}
		postMapper.deletePost(postId);
	}
	
	// 어드민 권한으로 게시글 삭제 (memberId=1인 경우 모든 게시글 삭제 가능)
	@Transactional
	public void deletePostByAdmin(Long postId, Long adminId) {
		// 어드민 권한 확인 (memberId=1)
		if (adminId == null || adminId != 1) {
			throw new AccessDeniedException("관리자 권한이 필요합니다");
		}
		postMapper.deletePostByAdmin(postId, adminId);
	}


	// 신고
	@Override
	public int insertReport(ReportsDto dto) {
		// TODO Auto-generated method stub
		return postMapper.insertReport(dto);
	}
	
	//검색
	public List<PostsDto> searchAll(Map<String, Object> searchParams) {
		
		
		
        // 파라미터 추출 및 정리
        String keyword = (String) searchParams.get("keyword");
        String postType = (String) searchParams.get("postType");
        String status = (String) searchParams.get("status");
        String tradeType = (String) searchParams.get("tradeType");
        Integer minPrice = (Integer) searchParams.get("minPrice");
        Integer maxPrice = (Integer) searchParams.get("maxPrice");
        Integer minYear = (Integer) searchParams.get("minYear");
        Integer maxYear = (Integer) searchParams.get("maxYear");
        Integer minArea = (Integer) searchParams.get("minArea");
        Integer maxArea = (Integer) searchParams.get("maxArea");
        String categoryId = (String) searchParams.get("categoryId");
        String sortBy = (String) searchParams.get("sortBy");
        String sortOrder = (String) searchParams.get("sortOrder");
        Integer page = (Integer) searchParams.get("page");
        Integer size = (Integer) searchParams.get("size");
        Long memberId = (Long)searchParams.get("memberId");
        
        // 기본값 설정
        String kw = keyword == null ? "" : keyword.trim();
        String pt = (postType == null || postType.isBlank()) ? "ALL" : postType.trim().toUpperCase();
        String st = (status == null || status.isBlank()) ? "ALL" : status.trim().toUpperCase();
        String tt = (tradeType == null || tradeType.isBlank()) ? "ALL" : tradeType.trim().toUpperCase();
        String cat = (categoryId == null || categoryId.isBlank()) ? "ALL" : categoryId.trim();
        String sb = (sortBy == null || sortBy.isBlank()) ? "" : sortBy.trim();
        String so = (sortOrder == null || sortOrder.isBlank()) ? "" : sortOrder.trim();
        
        int p = Math.max(1, page != null ? page : 1);
        int s = Math.max(1, size != null ? size : 12);
        int offset =  Math.max(0,(p - 1) * s);
        
        // 디버깅용 로그
        System.out.println("=== PostsService.searchAll 디버깅 ===");
        System.out.println("page 파라미터: " + page);
        System.out.println("size 파라미터: " + size);
        System.out.println("계산된 페이지: " + p);
        System.out.println("계산된 크기: " + s);
        System.out.println("계산된 offset: " + offset);
        
        return postMapper.searchAll(kw, pt, st, tt, minPrice, maxPrice, minYear, maxYear, 
        		minArea, maxArea, cat, sb, so, s, offset,memberId);
    }

    public int countSearchAll(Map<String, Object> searchParams) {
        // 파라미터 추출 및 정리
        String keyword = (String) searchParams.get("keyword");
        String postType = (String) searchParams.get("postType");
        String status = (String) searchParams.get("status");
        String tradeType = (String) searchParams.get("tradeType");
        Integer minPrice = (Integer) searchParams.get("minPrice");
        Integer maxPrice = (Integer) searchParams.get("maxPrice");
        Integer minYear = (Integer) searchParams.get("minYear");
        Integer maxYear = (Integer) searchParams.get("maxYear");
        Integer minArea = (Integer) searchParams.get("minArea");
        Integer maxArea = (Integer) searchParams.get("maxArea");
        String categoryId = (String) searchParams.get("categoryId");
        Long memberId = (Long)searchParams.get("memberId");
        
        // 기본값 설정
        String kw = keyword == null ? "" : keyword.trim();
        String pt = (postType == null || postType.isBlank()) ? "ALL" : postType.trim().toUpperCase();
        String st = (status == null || status.isBlank()) ? "ALL" : status.trim().toUpperCase();
        String tt = (tradeType == null || tradeType.isBlank()) ? "ALL" : tradeType.trim().toUpperCase();
        String cat = (categoryId == null || categoryId.isBlank()) ? "ALL" : categoryId.trim();
        
        return postMapper.countSearchAll(kw, pt, st, tt, minPrice, maxPrice, minYear, maxYear, 
        		minArea, maxArea, cat,memberId);
    }
	
	// 게시물 소유자 조회
	public Long findPostOwnerId(Long postId)
	{
		return postMapper.findPostOwnerId(postId);
	}
	
	// 지역별 게시물 목록 조회
	public List<Map<String, Object>> getPostListByRegion(Map<String, Object> regionParams) {
		return postMapper.getPostListByRegion(regionParams);
	}
	
	// 지역 조회
	public RegionDto getOneRegion(Long regionId) {
		return postMapper.getOneRegion(regionId);
	}
	
	// 채팅방 참여자 조회 (판매완료 시 거래자 선택용)
	public List<Map<String, Object>> getChatParticipants(Long postId) {
		return postMapper.getChatParticipants(postId);
	}

	// 판매 상태 변경 메서드 (거래자 선택 포함)
	@Transactional
	public boolean updatePostStatus(Long postId, String status, Long buyerId, Long memberId) {
		try {
			// 1. 권한 확인 - 작성자 본인인지 확인
			Long ownerId = postMapper.findPostOwnerId(postId);
			if (ownerId == null || !ownerId.equals(memberId)) {
				System.err.println("권한 없음: postId=" + postId + ", 요청자=" + memberId + ", 소유자=" + ownerId);
				return false;
			}
			
			// 2. 상태 값 검증
			if (status == null || status.trim().isEmpty()) {
				System.err.println("상태 값이 비어있음: " + status);
				return false;
			}
			
			// 3. 상태 변경 실행
			int result;
			if ("SOLD".equals(status.trim()) && buyerId != null) {
				// 판매완료 시 거래자 ID도 함께 업데이트
				result = postMapper.updatePostStatusWithBuyer(postId, status.trim(), buyerId);
			} else {
				// 일반 상태 변경
				result = postMapper.updatePostStatus(postId, status.trim());
			}
			
			if (result > 0) {
				System.out.println("상태 변경 성공: postId=" + postId + ", status=" + status + ", buyerId=" + buyerId + ", memberId=" + memberId);
				return true;
			} else {
				System.err.println("상태 변경 실패: postId=" + postId + ", status=" + status);
				return false;
			}
			
		} catch (Exception e) {
			System.err.println("상태 변경 중 예외 발생: " + e.getMessage());
			e.printStackTrace();
			return false;
		}
	}
	
	// 구매내역 조회
	public List<Map<String, Object>> getPurchaseHistory(Long memberId) {
		try {
			// System.out.println("🔍 PostsService.getPurchaseHistory 호출됨 - memberId: " + memberId);
			
			List<Map<String, Object>> result = postMapper.getPurchaseHistory(memberId);
			// System.out.println("🛒 Mapper에서 반환된 결과: " + (result != null ? result.size() + "개" : "null"));
			
			if (result != null && !result.isEmpty()) {
				// System.out.println("📋 첫 번째 결과 샘플: " + result.get(0));
			}
			
			return result;
		} catch (Exception e) {
			// System.err.println("❌ 구매내역 조회 중 오류 발생: " + e.getMessage());
			e.printStackTrace();
			return new ArrayList<>();
		}
	}

	// 신고 목록 조회
	@Override
	public List<Map<String, Object>> getAllReports() {
		return postMapper.getAllReports();
	}
	
	// 신고 상태 업데이트
	@Override
	public int updateReportStatus(Long reportId, String status) {
		return postMapper.updateReportStatus(reportId, status);
	}
	
	
	
	
	// 후기 조회 메서드
	public List<Map<String, Object>> getReviewsForUser(Long memberId) {
		try {
			System.out.println("🔍 PostsService.getReviewsForUser 호출됨 - memberId: " + memberId);
			
			List<Map<String, Object>> result = postMapper.getReviewsForUser(memberId);
			System.out.println("📝 Mapper에서 반환된 결과: " + (result != null ? result.size() + "개" : "null"));
			
			if (result != null && !result.isEmpty()) {
				System.out.println("📋 첫 번째 결과 샘플: " + result.get(0));
			}
			
			return result;
		} catch (Exception e) {
			System.err.println("❌ 후기 조회 중 오류 발생: " + e.getMessage());
			e.printStackTrace();
			return new ArrayList<>();
		}
	}
	
	// 총 게시물 수 조회
	public int getTotalPostsCount() {
		try {
			System.out.println("🔍 PostsService.getTotalPostsCount 호출됨");
			int result = postMapper.getTotalPostsCount();
			System.out.println("📝 총 게시물 수: " + result);
			return result;
		} catch (Exception e) {
			System.err.println("❌ 총 게시물 수 조회 중 오류 발생: " + e.getMessage());
			e.printStackTrace();
			return 0;
		}
	}
	
}

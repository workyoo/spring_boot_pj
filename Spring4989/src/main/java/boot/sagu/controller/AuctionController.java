package boot.sagu.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import boot.sagu.config.JwtUtil;
import boot.sagu.dto.AuctionDto;
import boot.sagu.dto.FavoritesDto;
import boot.sagu.dto.MemberDto;
import boot.sagu.dto.PostsDto;
import boot.sagu.service.AuctionService;
import boot.sagu.service.EscrowService;
import boot.sagu.service.PortOneService;
import boot.sagu.service.PostsService;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5176", "http://localhost:5177"})
public class AuctionController {
	
	
	@Autowired
	private PortOneService portOneService;
	
	@Autowired
	private AuctionService auctionService;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	// 클래스 필드에 추가
	@Autowired
	private EscrowService escrowService;
	
	@Autowired
	private PostsService postsService;
	
	// 경매 방별 현재 접속 사용자 관리 (postId -> Set<sessionId>)
	private final Map<String, Set<String>> auctionRoomUsers = new ConcurrentHashMap<>();

	@GetMapping("/auction")
	public List<PostsDto> getAuctionList(
		@RequestParam(value = "sort", defaultValue = "time") String sortType
	) {
	   return auctionService.getAuctionPosts(sortType);
	}

	@GetMapping("/auction/detail/{postId}")
	public PostsDto getAuctionDetail(@PathVariable("postId") long postId) {
	   // 조회수 증가
	   auctionService.incrementViewCount(postId);
	   return auctionService.getAuctionDetail(postId);
	}

	@GetMapping("/auction/highest-bid/{postId}")
	public AuctionDto getHighestBid(@PathVariable("postId") long postId) {
	   return auctionService.getHighestBid(postId);
	}
	
	// 입찰 기록 조회 (최근 5개)
	@GetMapping("/auction/bid-history/{postId}")
	public List<Map<String, Object>> getBidHistory(@PathVariable("postId") long postId) {
	   return auctionService.getBidHistory(postId);
	}
	
	@GetMapping("/auction/member/{memberId}")
	public MemberDto getMemberNickname(@PathVariable("memberId") long memberId) {
	   return auctionService.getMemberNickname(memberId);
	}
	
	// 찜 상태 확인
	@GetMapping("/auction/favorite/check")
	public Map<String, Object> checkFavoriteStatus(@RequestParam("post_id") Long postId,
	         @RequestHeader("Authorization") String authorization) {
	   Map<String, Object> response = new HashMap<>();
	   try {
	       String token = authorization.substring(7);
	       long memberId = jwtUtil.extractMemberId(token);
	       boolean isFavorite = postsService.isFavorited(postId, memberId);
	       response.put("isFavorite", isFavorite);
	       response.put("success", true);
	   } catch (Exception e) {
	       response.put("success", false);
	       response.put("message", "찜 상태 확인 실패: " + e.getMessage());
	   }
	   return response;
	}
	
	// 찜 추가/삭제 토글
	@PostMapping("/auction/favorite/toggle")
	public Map<String, Object> toggleFavorite(@RequestParam("post_id") Long postId,
	         @RequestHeader("Authorization") String authorization) {
	   Map<String, Object> response = new HashMap<>();
	   try {
	       String token = authorization.substring(7);
	       long memberId = jwtUtil.extractMemberId(token);
	       boolean isFavorite = postsService.toggleFavorite(postId, memberId);
	       int favoriteCount = postsService.countFavorite(postId);
	       
	       response.put("success", true);
	       response.put("isFavorite", isFavorite);
	       response.put("favoriteCount", favoriteCount);
	       response.put("action", isFavorite ? "added" : "removed");
	       response.put("message", isFavorite ? "찜에 추가되었습니다." : "찜이 삭제되었습니다.");
	   } catch (Exception e) {
	       response.put("success", false);
	       response.put("message", "찜 처리 실패: " + e.getMessage());
	   }
	   return response;
	}

	// 찜 개수 조회
	@GetMapping("/auction/favorite/count")
	public Map<String, Object> getFavoriteCount(@RequestParam("post_id") Long postId) {
		Map<String, Object> response = new HashMap<>();
	   try {
	       int favoriteCount = postsService.countFavorite(postId);
	       response.put("success", true);
	       response.put("favoriteCount", favoriteCount);
	   } catch (Exception e) {
	       response.put("success", false);
	       response.put("message", "찜 개수 조회 실패: " + e.getMessage());
	   }
	   return response;
		}
	


	//수동 경매 종료 API
	 @PostMapping("/auction/end/{postId}")
	    public ResponseEntity<?> endAuction(@PathVariable("postId") long postId,
	                                        @RequestHeader(value = "Authorization", required = false) String bearer) {
	        try {
	            // (선택) bearer로 작성자 검증 넣고 싶으면 여기에서
	            auctionService.endAuction(postId);  // ★ 종료 단일 로직 (입찰 없으면 유찰처리 + 보증금 환불)
	            return ResponseEntity.ok("경매 종료 처리 완료");
	        } catch (Exception e) {
	            return ResponseEntity.badRequest().body("경매 종료 실패: " + e.getMessage());
	        }
	    }
	
	// 방 입장/퇴장은 WebSocket으로 처리됨 (REST API 제거)
	@GetMapping("/auction/photos/{postId}")
	public List<Map<String, Object>> getAuctionPhotos(@PathVariable("postId") long postId) {
		
		return auctionService.getAuctionPhotos(postId);
	}
	
	// 경매 이미지 파일 직접 제공
    @GetMapping("/auction/image/{filename}")
	public ResponseEntity<Resource> getImage(@PathVariable("filename") String filename) {
		try {
			// 파일 경로에서 이미지 파일 읽기 (절대 경로 사용)
			String currentDir = System.getProperty("user.dir");
			Path filePath = Paths.get(currentDir, "src", "main", "webapp", "save", filename);
			
			// 파일이 존재하는지 확인
			if (!Files.exists(filePath)) {
				System.err.println("파일을 찾을 수 없습니다: " + filePath);
				return ResponseEntity.notFound().build();
			}
			
			Resource resource = new FileSystemResource(filePath.toFile());
			
			// 파일 확장자에 따른 Content-Type 설정
			String contentType = getContentType(filename);
			
			return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(contentType))
				.body(resource);
				
		} catch (Exception e) {
			System.err.println("이미지 로드 중 오류: " + e.getMessage());
			return ResponseEntity.internalServerError().build();
		}
	}
    
 // 파일 확장자에 따른 Content-Type 반환
 	private String getContentType(String filename) {
 		if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
 			return "image/jpeg";
 		} else if (filename.toLowerCase().endsWith(".png")) {
 			return "image/png";
 		} else if (filename.toLowerCase().endsWith(".gif")) {
 			return "image/gif";
 		} else {
 			return "application/octet-stream";
 		}
 	}

	// 경매 삭제 (비밀번호 확인 포함)
	@DeleteMapping("/auction/delete/{postId}")
	public ResponseEntity<?> deleteAuction(
		@PathVariable("postId") long postId,
		@RequestBody Map<String, String> request,
		@RequestHeader("Authorization") String token
	) {
		try {
			// JWT 토큰에서 사용자 정보 추출
			String loginId = jwtUtil.extractUsername(token.replace("Bearer ", ""));
			String password = request.get("password");
			
			// 경매 삭제 (비밀번호 확인 포함)
			auctionService.deleteAuction(postId, loginId, password);
			
			return ResponseEntity.ok().body(Map.of("message", "경매가 삭제되었습니다."));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}
	
	// 현재 방 인원수 조회
	@GetMapping("/auction/room/count/{postId}")
	public Map<String, Object> getRoomUserCount(@PathVariable("postId") String postId) {
		System.out.println("🔍 방 인원수 조회 요청 - postId: " + postId);
		Map<String, Object> response = new HashMap<>();
		try {
			Set<String> users = auctionRoomUsers.getOrDefault(postId, new HashSet<>());
			int userCount = users.size();
			System.out.println("🔍 방 인원수: " + userCount + "명");
			System.out.println("🔍 방 사용자 목록: " + users);
			response.put("success", true);
			response.put("user_count", userCount);
		} catch (Exception e) {
			System.err.println("❌ 방 인원수 조회 실패: " + e.getMessage());
			response.put("success", false);
			response.put("user_count", 0);
			response.put("message", "방 인원수 조회 실패: " + e.getMessage());
		}
		System.out.println("🔍 응답: " + response);
		return response;
	}
	
	// 방 입장 (세션 ID로 사용자 추가)
	@PostMapping("/auction/room/join/{postId}")
	public Map<String, Object> joinRoom(@PathVariable("postId") String postId, @RequestBody Map<String, String> request) {
		System.out.println("🚪 방 입장 요청 - postId: " + postId + ", request: " + request);
		Map<String, Object> response = new HashMap<>();
		try {
			String sessionId = request.get("sessionId");
			if (sessionId == null || sessionId.trim().isEmpty()) {
				sessionId = request.get("session_id"); // api.jsx 인터셉터 변환 대응
			}
			if (sessionId == null || sessionId.trim().isEmpty()) {
				System.out.println("❌ 세션 ID가 없음");
				System.out.println("❌ 요청 데이터: " + request);
				response.put("success", false);
				response.put("message", "세션 ID가 필요합니다.");
				return response;
			}
			
			// 방에 사용자 추가 (Set이므로 중복 자동 제거)
			Set<String> users = auctionRoomUsers.computeIfAbsent(postId, k -> ConcurrentHashMap.newKeySet());
			boolean wasAdded = users.add(sessionId);
			
			int userCount = users.size();
			System.out.println("🚪 방 입장 성공 - sessionId: " + sessionId + ", userCount: " + userCount + ", wasAdded: " + wasAdded);
			System.out.println("🚪 방 사용자 목록: " + users);
			response.put("success", true);
			response.put("user_count", userCount);
			response.put("isNewUser", wasAdded); // 새로운 사용자인지 여부
			response.put("message", wasAdded ? "방에 입장했습니다." : "이미 방에 접속 중입니다.");
		} catch (Exception e) {
			System.err.println("❌ 방 입장 실패: " + e.getMessage());
			response.put("success", false);
			response.put("message", "방 입장 실패: " + e.getMessage());
		}
		System.out.println("🚪 응답: " + response);
		return response;
	}
	
			// 방 퇴장 (세션 ID로 사용자 제거) - POST 방식
	@PostMapping("/auction/room/leave/{postId}")
	public Map<String, Object> leaveRoom(@PathVariable("postId") String postId, @RequestBody Map<String, String> request) {
		Map<String, Object> response = new HashMap<>();
		try {
			String sessionId = request.get("sessionId");
			if (sessionId == null || sessionId.trim().isEmpty()) {
				sessionId = request.get("session_id"); // api.jsx 인터셉터 변환 대응
			}
			if (sessionId == null || sessionId.trim().isEmpty()) {
				response.put("success", false);
				response.put("message", "세션 ID가 필요합니다.");
				return response;
			}
			
			// 방에서 사용자 제거
			Set<String> users = auctionRoomUsers.get(postId);
			if (users != null) {
				users.remove(sessionId);
				if (users.isEmpty()) {
					auctionRoomUsers.remove(postId); // 빈 방은 제거
				}
			}
			
			int userCount = users != null ? users.size() : 0;
			response.put("success", true);
			response.put("user_count", userCount);
			response.put("message", "방에서 퇴장했습니다.");
		} catch (Exception e) {
			response.put("success", false);
			response.put("message", "방 퇴장 실패: " + e.getMessage());
		}
		return response;
	}
	
	// 방 퇴장 (GET 방식) - sendBeacon용
	@GetMapping("/auction/room/leave/{postId}/{sessionId}")
	public Map<String, Object> leaveRoomGet(@PathVariable("postId") String postId, @PathVariable("sessionId") String sessionId) {
		Map<String, Object> response = new HashMap<>();
		try {
			// 방에서 사용자 제거
			Set<String> users = auctionRoomUsers.get(postId);
			if (users != null) {
				users.remove(sessionId);
				if (users.isEmpty()) {
					auctionRoomUsers.remove(postId); // 빈 방은 제거
				}
			}
			
			int userCount = users != null ? users.size() : 0;
			response.put("success", true);
			response.put("user_count", userCount);
			response.put("message", "방에서 퇴장했습니다.");
		} catch (Exception e) {
			response.put("success", false);
			response.put("message", "방 퇴장 실패: " + e.getMessage());
		}
		return response;
	}
	
	// 특정 세션이 방에 있는지 확인
	@GetMapping("/auction/room/check/{postId}/{sessionId}")
	public Map<String, Object> checkUserInRoom(@PathVariable("postId") String postId, @PathVariable("sessionId") String sessionId) {
		Map<String, Object> response = new HashMap<>();
		try {
			Set<String> users = auctionRoomUsers.getOrDefault(postId, new HashSet<>());
			boolean isInRoom = users.contains(sessionId);
			
			response.put("success", true);
			response.put("isInRoom", isInRoom);
			response.put("user_count", users.size());
		} catch (Exception e) {
			response.put("success", false);
			response.put("isInRoom", false);
			response.put("user_count", 0);
			response.put("message", "확인 실패: " + e.getMessage());
		}
		return response;
	}


	// 입찰 시도 (교체본)
	@PostMapping("/auction/{postId}/bids")
	public ResponseEntity<?> placeBid(
	    @PathVariable("postId") long postId,
	    @RequestBody Map<String, Object> body,
	    @RequestHeader(value = "Authorization", required = false) String token
	) {
	    // 1) 바디 검증
	    if (body == null) {
	        return ResponseEntity.badRequest().body(Map.of(
	            "status","ERROR","message","입찰 데이터가 없습니다."
	        ));
	    }
	    
	    // Map에서 데이터 추출 (api.jsx 인터셉터 변환 대응)
	    Object bidAmountObj = body.get("bidAmount") != null ? body.get("bidAmount") : body.get("bid_amount");
	    if (bidAmountObj == null) {
	        return ResponseEntity.badRequest().body(Map.of(
	            "status","ERROR","message","입찰 금액이 필요합니다."
	        ));
	    }
	    
	    BigDecimal bidAmount;
	    try {
	        bidAmount = new BigDecimal(bidAmountObj.toString());
	    } catch (NumberFormatException e) {
	        return ResponseEntity.badRequest().body(Map.of(
	            "status","ERROR","message","입찰 금액이 유효하지 않습니다."
	        ));
	    }
	    
	    if (bidAmount.signum() <= 0) {
	        return ResponseEntity.badRequest().body(Map.of(
	            "status","ERROR","message","입찰 금액이 유효하지 않습니다."
	        ));
	    }
	    
	    // AuctionDto 객체 생성
	    AuctionDto auctionDto = new AuctionDto();
	    auctionDto.setPostId(postId);
	    auctionDto.setBidAmount(bidAmount);

	    // 2) 토큰 필수 + memberId는 토큰에서만
	    if (token == null || !token.startsWith("Bearer ")) {
	        return ResponseEntity.status(401).body(Map.of(
	            "status","ERROR","message","로그인이 필요합니다."
	        ));
	    }
	    long memberId;
	    try {
	        String jwt = token.substring(7);
	        // 프로젝트 내 다른 API처럼 memberId를 직접 추출해 일원화
	        memberId = jwtUtil.extractMemberId(jwt);
	        // 만약 extractMemberId가 없다면:
	        // String loginId = jwtUtil.extractUsername(jwt);
	        // memberId = memberService.findIdByLoginId(loginId); // 실제 매핑으로 대체
	    } catch (Exception e) {
	        return ResponseEntity.status(401).body(Map.of(
	            "status","ERROR","message","유효하지 않은 토큰입니다."
	        ));
	    }
	    auctionDto.setBidderId(memberId); // 클라에서 온 bidderId는 무시

	    // 3) 서버에서 입찰 시각 세팅
	    auctionDto.setBidTime(new java.sql.Timestamp(System.currentTimeMillis()));

	    // 4) 비즈니스 로직
	    try {
	        String res = auctionService.placeBidWithGuarantee(auctionDto);

	        if (res != null && res.startsWith("[NEED_GUARANTEE]")) {
	            int startPrice = auctionService.getStartPrice(postId);
	            int guaranteeAmount = Math.max(1, (int)Math.round(startPrice * 0.1));
	            String merchantUid = "guarantee_" + postId + "_" + memberId;

	            portOneService.ensurePreparedForAuction(merchantUid, guaranteeAmount, "경매 보증금");

	            return ResponseEntity.status(402).body(Map.of(
	                "status","NEED_GUARANTEE",
	                "guaranteeAmount", guaranteeAmount,
	                "merchantUid", merchantUid,
	                "message","보증금 결제가 필요합니다. 결제를 진행해주세요."
	            ));
	        }

	        return ResponseEntity.ok(Map.of(
	            "status","OK",
	            "message", (res == null || res.isBlank()) ? "입찰이 완료되었습니다." : res
	        ));
	    } catch (IllegalArgumentException iae) {
	        return ResponseEntity.badRequest().body(Map.of("status","ERROR","message", iae.getMessage()));
	    } catch (Exception e) {
	        return ResponseEntity.badRequest().body(Map.of(
	            "status","ERROR",
	            "message","입찰 처리 중 오류: " + e.getClass().getSimpleName() + " - " + (e.getMessage()==null?"":e.getMessage())
	        ));
	    }
	}


    //낙찰 거래 최종처리(정상완료 환불 or 노쇼 몰수)
    @PostMapping("/auction/{postId}/winner/{winnerId}/finalize")
    public ResponseEntity<?> finalizeWinner(
            @PathVariable("postId") long postId,
            @PathVariable("winnerId") long winnerId,
            @RequestParam("action") String action // "REFUND" or "FORFEIT"
    ) {
        auctionService.finalizeWinnerGuarantee(postId, winnerId, action);
        return ResponseEntity.ok(Map.of("status", "OK"));
    }
    
 // 컨트롤러: /api/auctions/portone/confirm
    @PostMapping(value = "/api/auctions/portone/confirm", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> confirmPayment(
            @RequestBody Map<String, Object> body,                 // ← Map으로 받아 camel/snake 모두 대응
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            // 1) JWT 필수 + 여기서 memberId를 신뢰
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("status","ERROR","message","로그인이 필요합니다."));
            }
            String jwt = authorization.substring(7);
            Integer mid = jwtUtil.extractMemberId(jwt);            // JwtUtil의 extractMemberId(Integer 반환)
            if (mid == null || mid <= 0) {
                return ResponseEntity.status(401).body(Map.of("status","ERROR","message","유효하지 않은 토큰입니다."));
            }
            long memberId = mid.longValue();

            // 2) camel/snake 모두 허용
            Long postId      = toLong(body.get("postId"), body.get("post_id"));
            String impUid     = toStr(body.get("impUid"), body.get("imp_uid"));
            String merchantUid= toStr(body.get("merchantUid"), body.get("merchant_uid"));

            if (postId == null || merchantUid == null) {
                return ResponseEntity.badRequest().body(Map.of("status","ERROR","message","postId 또는 merchantUid가 없습니다."));
            }

            // 3) 멱등성: 이미 저장된 imp_uid면 OK
            if (impUid != null && auctionService.existsGuaranteeByImpUid(impUid) > 0) {
                return ResponseEntity.ok(Map.of("status","OK","message","already confirmed"));
            }

            // 4) 서버 검증 + DB 저장 (금액/merchant_uid 검증 포함)
            auctionService.handlePortOneWebhook(postId, memberId, impUid, merchantUid);

            return ResponseEntity.ok(Map.of("status","OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status","ERROR",
                "message","결제 검증 실패: " + (e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage())
            ));
        }
    }

    // 작은 유틸(컨트롤러 클래스 안에 private static으로 추가)
    private static Long toLong(Object... vals) {
        for (Object v : vals) {
            if (v == null) continue;
            if (v instanceof Number) return ((Number) v).longValue();
            try { return Long.parseLong(String.valueOf(v)); } catch (Exception ignored) {}
        }
        return null;
    }
    private static String toStr(Object... vals) {
        for (Object v : vals) if (v != null) return String.valueOf(v);
        return null;
    }

    
    //webhook처리
    @PostMapping(
      value = "/api/auctions/portone/webhook",
      consumes = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE }
    )
    public ResponseEntity<String> portoneWebhook(@RequestBody(required = false) Map<String, Object> body) {
      try {
        String impUid      = body == null ? null : String.valueOf(body.get("imp_uid"));
        String merchantUid = body == null ? null : String.valueOf(body.get("merchant_uid"));
        String status      = body == null ? null : String.valueOf(body.get("status"));	
        String customData  = body == null ? null : String.valueOf(body.get("custom_data"));

        // merchant_uid: guarantee_{postId}_{memberId} or escrow_{postId}_{memberId}
        Long postId = null, memberId = null;
        if (merchantUid != null && merchantUid.matches("^(guarantee|escrow)_\\d+_\\d+$")) {
          String[] t = merchantUid.split("_");
          postId = Long.valueOf(t[1]);
          memberId = Long.valueOf(t[2]);
        }
        
     // 컨트롤러 portoneWebhook(...) 내부 — merchantUid 파싱 직후 분기
        if (merchantUid != null && merchantUid.startsWith("escrow_")) {
            // postId/memberId 파싱 동일
            if (postId == null || memberId == null) {
                Matcher m = Pattern.compile("^escrow_(\\d+)_(\\d+)(?:_\\d+)?$").matcher(merchantUid);
                if (m.matches()) {
                    postId = postId == null ? Long.parseLong(m.group(1)) : postId;
                    memberId = memberId == null ? Long.parseLong(m.group(2)) : memberId;
                }
            }
            escrowService.handleEscrowPaid(postId, memberId, impUid, merchantUid); // 구현 아래
            return ResponseEntity.ok("ok");
        }
        // custom_data 보조(JSON 문자열일 수 있음)
        if ((postId == null || memberId == null) && customData != null && !customData.isBlank()) {
          try {
            Map<?,?> cd = new ObjectMapper().readValue(customData, Map.class);
            if (postId == null && cd.get("postId") != null)   postId   = Long.valueOf(String.valueOf(cd.get("postId")));
            if (memberId == null && cd.get("memberId") != null) memberId = Long.valueOf(String.valueOf(cd.get("memberId")));
          } catch (Exception ignore) {}
        }

        // 서비스 호출은 널 안전하게 처리 (내부에서 검증/로그)
        auctionService.handlePortOneWebhook(postId, memberId, impUid, merchantUid);

        // 재시도 방지: 빨리 200
        return ResponseEntity.ok("ok");
      } catch (Exception e) {
        // 어떤 예외가 나도 200으로 응답해 포트원 재시도 루프 방지(내부 로그로 추적)
        return ResponseEntity.ok("ok");
      }
    }
    
    

    // ==================================마이페이지 판매 내역 관련 API==================================
    
    // 내 게시글 타입별 개수 조회
    @GetMapping("/auction/my-posts-counts/{memberId}")
    public ResponseEntity<Map<String, Object>> getMyPostsCounts(@PathVariable("memberId") int memberId) {
        try {
            Map<String, Object> counts = auctionService.getMyPostsCounts(memberId);
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "게시글 개수 조회 실패: " + e.getMessage()
            ));
        }
    }
    
    // 내 게시글 목록 조회 (페이징 포함)
    @GetMapping("/auction/my-posts/{memberId}")
    public ResponseEntity<Map<String, Object>> getMyPosts(
            @PathVariable("memberId") int memberId,
            @RequestParam(value = "type", required = false, defaultValue = "all") String type,
            @RequestParam(value = "status", required = false, defaultValue = "all") String status,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size
    ) {
        try {
            int offset = (page - 1) * size;
            
            Map<String, Object> params = new HashMap<>();
            params.put("memberId", memberId);
            params.put("type", type);
            params.put("status", status);
            params.put("offset", offset);
            params.put("limit", size);
            
            List<PostsDto> posts = auctionService.getMyPosts(params);
            int totalCount = auctionService.getMyPostsTotalCount(params);
            int totalPages = (int) Math.ceil((double) totalCount / size);
            
            // 상태별 카운트 조회
            Map<String, Object> statusCounts = auctionService.getMyPostsStatusCounts(params);
            
            Map<String, Object> response = new HashMap<>();
            response.put("posts", posts);
            response.put("totalCount", totalCount);
            response.put("totalPages", totalPages);
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("statusCounts", statusCounts);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "게시글 조회 실패: " + e.getMessage()
            ));
        }
    }


    // ==================================마이페이지 입찰 내역 관련 API==================================
    
    // 내 입찰 기록 개수 조회
    @GetMapping("/auction/my-bids-counts/{memberId}")
    public ResponseEntity<Map<String, Object>> getMyBidsCounts(@PathVariable("memberId") int memberId) {
        try {
            Map<String, Object> counts = auctionService.getMyBidsStatusCounts(memberId);
            int totalCount = auctionService.getMyBidsTotalCount(memberId);
            counts.put("total", totalCount);
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "입찰 기록 개수 조회 실패: " + e.getMessage()
            ));
        }
    }
    
    // 내 입찰 기록 목록 조회 (페이징 포함)
    @GetMapping("/auction/my-bids/{memberId}")
    public ResponseEntity<Map<String, Object>> getMyBids(
            @PathVariable("memberId") int memberId,
            @RequestParam(value = "status", required = false, defaultValue = "all") String status,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size
    ) {
        try {
            int offset = (page - 1) * size;
            
            List<Map<String, Object>> bids = auctionService.getMyBids(memberId, status, offset, size);
            int totalCount = auctionService.getMyBidsTotalCount(memberId);
            int totalPages = (int) Math.ceil((double) totalCount / size);
            
            // 상태별 카운트 조회
            Map<String, Object> statusCounts = auctionService.getMyBidsStatusCounts(memberId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("bids", bids);
            response.put("totalCount", totalCount);
            response.put("totalPages", totalPages);
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("statusCounts", statusCounts);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "입찰 기록 조회 실패: " + e.getMessage()
            ));
        }
    }

	// ==================================마이페이지 찜한 상품 관련 API==================================
    
    // 내 찜한 상품 개수 조회
    @GetMapping("/auction/my-favorites-counts/{memberId}")
    public ResponseEntity<Map<String, Object>> getMyFavoritesCounts(@PathVariable("memberId") int memberId) {
        try {
            Map<String, Object> counts = auctionService.getMyFavoritesCounts(memberId);
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "찜한 상품 개수 조회 실패: " + e.getMessage()
            ));
        }
    }
    
    // 내 찜한 상품 목록 조회 (페이징 포함)
    @GetMapping("/auction/my-favorites/{memberId}")
    public ResponseEntity<Map<String, Object>> getMyFavorites(
            @PathVariable("memberId") int memberId,
            @RequestParam(value = "type", required = false, defaultValue = "all") String type,
            @RequestParam(value = "search", required = false, defaultValue = "") String search,
            @RequestParam(value = "sort", required = false, defaultValue = "date") String sort,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "12") int size
    ) {
        try {
            int offset = (page - 1) * size;
            
            Map<String, Object> params = new HashMap<>();
            params.put("memberId", memberId);
            params.put("type", type);
            params.put("search", search);
            params.put("sort", sort);
            params.put("offset", offset);
            params.put("limit", size);
            
            List<Map<String, Object>> favorites = auctionService.getMyFavorites(params);
            int totalCount = auctionService.getMyFavoritesTotalCount(params);
            int totalPages = (int) Math.ceil((double) totalCount / size);
            
            // 타입별 카운트 조회
            Map<String, Object> typeCounts = auctionService.getMyFavoritesTypeCounts(memberId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("favorites", favorites);
            response.put("totalCount", totalCount);
            response.put("totalPages", totalPages);
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("typeCounts", typeCounts);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "찜한 상품 조회 실패: " + e.getMessage()
            ));
        }
    }


	
	
	// 낙찰자 본인 에스크로 주문 조회
	@GetMapping("/api/escrow/order/{postId}/me")
	public ResponseEntity<?> getMyEscrowOrder(
	        @PathVariable("postId") long postId,
	        @RequestHeader("Authorization") String authorization
	) {
	    if (authorization == null || !authorization.startsWith("Bearer ")) {
	        return ResponseEntity.status(401).body(Map.of("status","ERROR","message","로그인이 필요합니다."));
	    }
	    long memberId = jwtUtil.extractMemberId(authorization.substring(7));

	    var o = escrowService.findMyEscrowOrder(postId, memberId); // 아래 2) 참고
	    if (o == null) {
	        return ResponseEntity.ok(Map.of("exists", false));
	    }
	    return ResponseEntity.ok(Map.of(
	        "exists", true,
	        "merchantUid", o.getMerchantUid(),
	        "amount", o.getAmount(),         // 최종가-보증금
	        "status", o.getStatus()          // CREATED | PENDING | PAID ...
	    ));
	}
	
	@PostMapping("/api/escrow/order/{postId}/me")
	public ResponseEntity<?> createEscrowOrderForMe(
	        @PathVariable("postId") long postId,
	        @RequestHeader(value = "Authorization", required = false) String authorization
	) {
	    try {
	        if (authorization == null || !authorization.startsWith("Bearer ")) {
	            return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다."));
	        }
	        String jwt = authorization.substring(7);
	        Integer memberId = jwtUtil.extractMemberId(jwt);
	        if (memberId == null || memberId <= 0) {
	            return ResponseEntity.status(401).body(Map.of("message", "유효하지 않은 토큰입니다."));
	        }

	        // 전표 생성(최종가-보증금 계산, merchantUid 생성, PortOne prepare 등)
	        Map<String, Object> order = escrowService.createOrderForWinner(postId, memberId);

	        // { amount, merchantUid } 형태로 응답
	        return ResponseEntity.ok(order);
	    } catch (IllegalStateException ise) {
	        return ResponseEntity.badRequest().body(Map.of("message", ise.getMessage()));
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body(Map.of("message", "전표 생성 실패: " + e.getMessage()));
	    }
	}
}

import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../lib/api";
import "./goods.css"; // goods.css 스타일 import
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';

export default function SearchBox() {
  const navigate = useNavigate();
  const location = useLocation();

  // URL 파라미터에서 검색어 가져오기
  const urlParams = new URLSearchParams(location.search);
  const initialKeyword = urlParams.get('keyword') || "";
  
  console.log('=== SearchBox 컴포넌트 로드 ===');
  console.log('현재 location.search:', location.search);
  console.log('URL 파라미터:', urlParams.toString());
  console.log('추출된 keyword:', initialKeyword);

  const [q, setQ] = useState(initialKeyword);       // 입력값
  const [qd, setQd] = useState(initialKeyword);     // 디바운스된 값
  const [postType, setPostType] = useState("ALL");  // ALL/CARS/REAL_ESTATES/ITEMS
  const [status, setStatus] = useState("ALL");      // ALL/ON_SALE/RESERVED/SOLD
  const [tradeType, setTradeType] = useState("ALL");// ALL/SALE/AUCTION/SHARE
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(1);
  const size = 12;

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // (유지) 컨텍스트 의존성 — 동작엔 영향 없음. api.js가 토큰/리프레시 처리.
  const { userInfo } = useContext(AuthContext);

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setShowScrollTop(scrollTop > 300);
  };

  // 최상단으로 스크롤하는 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // URL 파라미터 변경 시 검색어 동기화
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const keyword = urlParams.get('keyword') || "";
    setQ(keyword);
    setQd(keyword);
  }, [location.search]);

  // 디바운스: 입력 후 300ms 지나면 qd 업데이트
  useEffect(() => {
    const t = setTimeout(() => setQd(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // 검색 호출
  useEffect(() => {
    if (!qd) { // 비어있으면 초기화
      setRows([]);
      setTotal(0);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const apiUrl = showAdvanced ? "/post/search" : "/post/search-simple";

        // 서버가 keyword 또는 searchTerm 둘 중 하나를 받을 수 있으니 둘 다 전송(한쪽은 무시됨)
        const params = showAdvanced
          ? { keyword: qd, searchTerm: qd, postType, status, tradeType, page, size }
          : { keyword: qd, searchTerm: qd, page, size };

        // 디버깅용 로그
        console.log('=== 검색 요청 정보 ===');
        console.log('API URL:', apiUrl);
        console.log('요청 파라미터:', params);
        console.log('현재 페이지:', page);

        const { data } = await api.get(apiUrl, { params });

        // 디버깅용 로그
        console.log('=== 검색 응답 정보 ===');
        console.log('응답 데이터:', data);
        console.log('총 개수:', data?.totalElements);
        console.log('현재 페이지:', data?.currentPage);
        console.log('페이지 크기:', data?.size);
        console.log('결과 개수:', data?.content?.length);

        // api 응답은 snake->camel 자동 변환됨. 그래도 혹시 대비해 최소한의 fallback 적용.
        const content = data?.content ?? data ?? [];
        const normalized = content.map((post) => {
          return {
            ...post,
            postId: post.postId ?? post.post_id,
            postType: post.postType ?? post.post_type,
            viewCount: post.viewCount ?? post.view_count,
          };
        });

        setRows(normalized);
        setTotal(data?.totalElements ?? data?.total_elements ?? 0);
      } catch (e) {
        console.error("검색 오류:", e);
        setErr(e?.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [qd, postType, status, tradeType, showAdvanced, page]);

  // 페이지네이션 계산
  const lastPage = Math.max(1, Math.ceil(total / size));

  // Enter 시 즉시 검색(디바운스 무시)
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      setQd(q.trim());
      setPage(1);
    }
  };

  // 게시글 클릭 시 상세 페이지로 이동
  const handlePostClick = (post, event) => {
    const el = event.currentTarget;
    if (el) {
      el.style.backgroundColor = "#e3f2fd";
      el.style.transform = "scale(0.98)";
    }

    // ✅ 가능한 키 모두에서 안전하게 ID 추출
    const pid =
      post.postId ??
      post.post_id ??
      post.id ??
      post.postID ??
      post.post_no ??
      post.postNo;

    if (pid === undefined || pid === null) {
      console.error("[SearchBox] postId 없음:", post);
      alert("이 게시글에는 ID가 없어 상세로 이동할 수 없습니다.");
      return;
    }

    setTimeout(() => {
      navigate(`/board/GoodsDetail?postId=${pid}`);
    }, 150);
  };

  // 이미지 URL 생성 함수
  const getImageUrl = (post) => {
    if (post.mainPhotoUrl && post.mainPhotoUrl.trim() !== '') {
      const imageUrl = `http://localhost:4989/postphoto/${post.mainPhotoUrl}`;
      return imageUrl;
    }
    return null;
  };

  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    if (!price) return '가격 미정';
    return new Intl.NumberFormat().format(price) + '원';
  };

  // 상태 배지 클래스 생성 함수
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ON_SALE': return 'on-sale';
      case 'RESERVED': return 'reserved';
      case 'SOLD': return 'sold';
      default: return '';
    }
  };

  // 거래타입 배지 클래스 생성 함수
  const getTradeTypeBadgeClass = (tradeType) => {
    switch (tradeType) {
      case 'SALE': return 'sale';
      case 'AUCTION': return 'auction';
      case 'SHARE': return 'share';
      default: return '';
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "20px auto", padding: "0 20px" }}>
      {/* 검색 바 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: "20px" }}>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          onKeyDown={onKeyDown}
          placeholder="검색어를 입력하세요 (예: 소나타, 전세, 아이폰)"
          style={{ 
            flex: 1, 
            padding: 12, 
            border: "1px solid #ddd", 
            borderRadius: 8,
            fontSize: "16px"
          }}
        />
      </div>

      {/* 상태 표시 */}
      <div style={{ marginBottom: 20 }}>
        {loading && <span>검색 중…</span>}
        {err && <span style={{ color: "crimson" }}>에러: {err}</span>}
        {!loading && !err && qd && (
          <span style={{ fontSize: "16px", fontWeight: "600", color: "#4A90E2" }}>
            총 {total}건 {total === 0 && "검색 결과가 없습니다."}
          </span>
        )}
      </div>

      {/* 결과 리스트 - 카드형식 */}
      {!loading && !err && qd && (
        <>
          {rows.length > 0 ? (
            <div className="goods-grid">
              {rows.map((post, idx) => {
                const key = post.postId ?? post.post_id ?? post.id ?? idx;
                const imageUrl = getImageUrl(post);
                
                return (
                  <div
                    key={key}
                    className="goods-card"
                    onClick={(e) => handlePostClick(post, e)}
                  >
                    <div className="goods-image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={post.title}
                          onError={(e) => {
                            console.error('이미지 로드 실패:', imageUrl);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className="goods-image-placeholder" style={{ display: imageUrl ? 'none' : 'block' }}>
                        <div className="camera-icon">📷</div>
                        <div className="placeholder-text">등록된 사진이 없습니다</div>
                      </div>
                    </div>
                    <div className="goods-info">
                      <h3 className="goods-title-text">
                        [{post.postType === 'CARS' ? '🚗 자동차' : post.postType === 'REAL_ESTATES' ? '🏠 부동산' : '📦 중고물품'}] {post.title}
                      </h3>
                      <div className="goods-price">
                        {formatPrice(post.price)}
                      </div>

                      {/* 타입별 상세 정보 */}
                      {post.postType === "CARS" && post.car && (
                        <div style={{ marginTop: 6, fontSize: "13px", color: "#555" }}>
                          {post.car.brand} {post.car.model} / {post.car.year}년식 · {post.car.mileage?.toLocaleString()}km · {post.car.fuelType}/{post.car.transmission}
                        </div>
                      )}
                      {post.postType === "REAL_ESTATES" && post.estate && (
                        <div style={{ marginTop: 6, fontSize: "13px", color: "#555" }}>
                          {post.estate.propertyType === 'apt' ? '아파트' :
                              post.estate.propertyType === 'studio' ? '오피스텔' :
                              post.estate.propertyType === 'oneroom' ? '원룸' :
                              post.estate.propertyType === 'tworoom' ? '투룸' : post.estate.propertyType} ·
                          {post.estate.area}㎡ · {post.estate.rooms}룸 ·
                          {post.estate.dealType === 'lease' ? '전세' :
                           post.estate.dealType === 'rent' ? '월세' :
                           post.estate.dealType === 'leaseAndrent' ? '전월세' :
                           post.estate.dealType === 'sale' ? '매매' : post.estate.dealType}
                        </div>
                      )}
                      {post.postType === "ITEMS" && post.item && (
                        <div style={{ marginTop: 6, fontSize: "13px", color: "#555" }}>
                          {post.item.categoryId === 1 ? '전자제품' :
                              post.item.categoryId === 2 ? '의류' :
                              post.item.categoryId === 3 ? '가구' :
                              post.item.categoryName || `카테고리 ${post.item.categoryId}`} ·
                          상태: {post.item.conditions === 'best' ? '상' :
                                 post.item.conditions === 'good' ? '중' :
                                 post.item.conditions === 'bad' ? '하' : post.item.conditions}
                        </div>
                      )}

                      <div className="goods-member">판매자: {post.nickname}</div>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                        조회수: {post.viewCount}
                      </div>

                      {/* 상태 및 거래타입 배지 */}
                      <div className="goods-status">
                        <span className={`status-badge ${getStatusBadgeClass(post.status)}`}>
                          {post.status === 'ON_SALE' ? '판매중' :
                           post.status === 'RESERVED' ? '예약' :
                           post.status === 'SOLD' ? '판매완료' : post.status}
                        </span>
                        <span className={`trade-type-badge ${getTradeTypeBadgeClass(post.tradeType)}`}>
                          {post.tradeType === 'SALE' ? '판매' :
                           post.tradeType === 'AUCTION' ? '경매' :
                           post.tradeType === 'SHARE' ? '나눔' : post.tradeType || '미정'}
                        </span>
                      </div>

                      <div className="goods-date">
                        {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="goods-empty">
              <div className="goods-empty-icon">🔍</div>
              <div className="goods-empty-text">검색 결과가 없습니다.</div>
              <div style={{ fontSize: "14px", marginTop: "8px", color: "#888" }}>
                다른 검색어를 입력해보세요.
              </div>
            </div>
          )}
        </>
      )}

      {/* 페이지네이션 */}
      {qd && total > 0 && (
        <div className="goods-pagination">
          <div className="goods-page-info">
            총 {total}개 중 {((page - 1) * size) + 1}-{Math.min(page * size, total)}개 표시
          </div>
          
          {lastPage > 1 ? (
            <>
              <button 
                className="goods-page-btn goods-prev-btn" 
                disabled={page <= 1} 
                onClick={() => setPage((p) => p - 1)}
              >
                이전
              </button>
              <div className="goods-page-numbers">
                {Array.from({ length: lastPage }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    className={`goods-page-number ${page === pageNum ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button 
                className="goods-page-btn goods-next-btn" 
                disabled={page >= lastPage} 
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </button>
            </>
          ) : (
            <div className="goods-page-single">페이지 1 / 1</div>
          )}
        </div>
              )}

        {/* 최상단으로 스크롤하는 화살표 버튼 */}
        {showScrollTop && (
          <button
            className="scroll-to-top-btn"
            onClick={scrollToTop}
            title="최상단으로 이동"
          >
            <KeyboardArrowUpRoundedIcon />
          </button>
        )}
      </div>
    );
  }

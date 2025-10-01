import axios from 'axios';
import React, { useEffect, useState, useContext, useRef, useMemo } from 'react'; // ✅ useMemo 추가
import { useLocation, useNavigate } from 'react-router-dom';
import ReportModal from './ReportModal';
import DetailChat from '../chat/detailChat';
import { AuthContext } from '../context/AuthContext';
import BuyerSelectionModal from '../components/BuyerSelectionModal';
import ReviewModal from '../components/ReviewModal';
import CreditTierDisplay from '../components/CreditTierDisplay';
import './gooddetail.css';
import DetailMap from '../chat/detailMap';

const GoodsDetail = () => {
  const { userInfo } = useContext(AuthContext);

  // 토큰: context 우선, 없으면 로컬 저장소(기존 로직 유지)
  const token = userInfo?.token ?? localStorage.getItem('jwtToken');

  const [open, setOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatRoom, setChatRoom] = useState(null);

  const location = useLocation();
  const navi = useNavigate();

  // ✅ postId를 안전하게 파싱: "undefined"/"null" 문자열 무효화 + 대체 키 지원(post_id, id)
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const postId = useMemo(() => {
    const raw = qs.get('postId') || qs.get('post_id') || qs.get('id');
    if (!raw) return null;
    if (raw === 'undefined' || raw === 'null') return null;
    return raw;
  }, [qs]);

  const [post, setPost] = useState(null);
  const [goods, setGoods] = useState(null);
  const [cars, setCars] = useState(null);
  const [estate, setEstate] = useState(null);
  const [photos, setPhotos] = useState(null);

  const [count, setCount] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [reportType, setReportType] = useState(''); // '', 'POST', 'MEMBER'
  const [targetId, setTargetId] = useState(null);
  const authorId = post?.memberId;

  const [region, setRegion] = useState(null);
  const [regionLoading, setRegionLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showBuyerModal, setShowBuyerModal] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  // 상세 데이터 로딩
  useEffect(() => {
    if (!postId) return; // ✅ postId 없으면 호출 금지

    // 페이지 로드 시 스크롤 맨 위
    window.scrollTo(0, 0);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // ✅ 쿼리파라미터는 params로 전달(문자열 조합 실수 방지)
    const fetchPostData = axios.get('http://localhost:4989/post/detail', { params: { postId }, headers });
    const fetchGoodsData = axios.get('http://localhost:4989/post/itemdetail', { params: { postId }, headers });
    const fetchCarsData = axios.get('http://localhost:4989/post/cardetail', { params: { postId }, headers });
    const fetchEstateData = axios.get('http://localhost:4989/post/estatedetail', { params: { postId }, headers });

    Promise.allSettled([fetchPostData, fetchGoodsData, fetchCarsData, fetchEstateData])
      .then((results) => {
        const [postResult, goodsResult, carsResult, estateResult] = results;

        if (postResult.status === 'fulfilled') {
          const postData = postResult.value.data;
          setPost(postData);

          const photoList = Array.isArray(postData.photos)
            ? postData.photos
            : JSON.parse(postData.photos || '[]');
          setPhotos(photoList);

          // Post 데이터에서 location 필드 확인
          console.log("🔍 Post 데이터 location 필드 확인:", {
            location: postData.location,
            locationType: typeof postData.location,
            hasLocation: 'location' in postData,
            allKeys: Object.keys(postData)
          });

          // Post 데이터에서 location 가져와서 region API 호출
          if (postData.location) {
            console.log("🌍 Region API 호출 시작 - regionId:", postData.location);
            console.log("🌍 Region API 호출 URL:", `http://localhost:4989/post/regiondetail?regionId=${postData.location}`);
            setRegionLoading(true);
            axios.get(`http://localhost:4989/post/regiondetail?regionId=${postData.location}`, { headers })
              .then(response => {
                console.log("✅ Region API 응답 성공:", response);
                console.log("✅ Region 데이터 로드 성공:", response.data);
                console.log("✅ Region 데이터 상세:", {
                  province: response.data.province,
                  city: response.data.city,
                  district: response.data.district,
                  town: response.data.town
                });
                setRegion(response.data);
                setRegionLoading(false);
              })
              .catch(error => {
                console.error("❌ Region API 호출 실패:", error);
                console.error("❌ Region API 응답 데이터:", error.response?.data);
                console.error("❌ Region API 응답 상태:", error.response?.status);
                console.error("❌ Region API 호출 URL:", `http://localhost:4989/post/regiondetail?regionId=${postData.location}`);
                setRegionLoading(false);
              });
          } else {
            console.log("⚠️ Post 데이터에 location이 없습니다. postData:", postData);
          }
        } else {
          console.error('❌ Post 데이터 로드 실패:', postResult.reason);
        }

        if (goodsResult.status === 'fulfilled') setGoods(goodsResult.value.data);
        else console.error('❌ Goods 데이터 로드 실패:', goodsResult.reason);

        if (carsResult.status === 'fulfilled') setCars(carsResult.value.data);
        else console.error('❌ Cars 데이터 로드 실패:', carsResult.reason);

        // Estate 데이터 처리
        if (estateResult.status === 'fulfilled') {
          setEstate(estateResult.value.data);
        } else {
          console.error("❌ Estate 데이터 로드 실패:", estateResult.reason);
        }

        // Region 데이터 처리
        // if (regionResult.status === 'fulfilled') { // 이 부분은 위에서 처리되므로 제거
        //   console.log("✅ Region 데이터 로드 성공:", regionResult.value);
        //   console.log("✅ Region 데이터 내용:", regionResult.value.data);
        //   setRegion(regionResult.value.data);
        // } else {
        //   console.error("❌ Region 데이터 로드 실패:", regionResult.reason);
        //   console.error("❌ Region API 호출 URL:", `http://localhost:4989/post/regiondetail?regionId=${regionId}`);
        // }
      })
      .catch(err => {
        console.error("데이터 로딩 중 에러:", err);
        console.error("에러 상세 정보:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });

        // 에러 발생 시에도 기본 데이터라도 설정
        if (err.response?.data) {
          console.log("에러 응답에서 받은 데이터:", err.response.data);
        }
      });

    // 💡 localStorage 감지 이벤트 리스너는 이제 필요 없습니다.
    // AuthContext가 상태를 관리하므로, context의 변경에 따라 컴포넌트가 재렌더링됩니다.
  }, [postId, userInfo, token]); // 의존성 배열에 userInfo와 token을 추가

  // selectedBuyerId 상태 제거 - post.buyerId를 직접 사용
  // const [selectedBuyerId, setSelectedBuyerId] = useState(null);

  // view count(조회수) — StrictMode 중복 방지
  const incCalledRef = useRef(false);
  useEffect(() => {
    if (!postId) return; // ✅ 가드
    if (incCalledRef.current) return;
    incCalledRef.current = true;

    axios.post('http://localhost:4989/post/viewcount', null, { params: { postId } }).catch(console.error);
  }, [postId]);

  // 좋아요 갯수
  useEffect(() => {
    if (!postId) return; // ✅ 가드
    axios
      .get('http://localhost:4989/post/count', { params: { postId } })
      .then(({ data }) => setCount(Number(data.count) || 0))
      .catch((err) => console.log(err));
  }, [postId]);

  // 내가 좋아요 눌렀는지 (로그인시에만)
  useEffect(() => {
    if (!postId || !userInfo?.memberId) return; // ✅ 가드
    axios
      .get('http://localhost:4989/post/checkfav', { params: { postId } })
      .then(({ data }) => setFavorited(Boolean(data?.favorited)))
      .catch(() => setFavorited(false));
  }, [postId, userInfo]);

  // 후기 존재 여부 확인 (로그인시에만)
  useEffect(() => {
    if (!postId || !userInfo?.memberId || !post || post.status !== 'SOLD') {
      setHasReview(false);
      return;
    }

    const checkReviewExists = async () => {
      try {
        console.log('🔍 후기 존재 여부 확인 시작:', {
          postId,
          reviewerId: userInfo.memberId,
          postStatus: post.status,
          postMemberId: post.memberId,
          postBuyerId: post.buyerId
        });

        // 판매자인 경우
        if (userInfo.memberId === post.memberId && post.buyerId) {
          const response = await axios.get('http://localhost:4989/review/check', {
            params: {
              postId: postId,
              reviewerId: userInfo.memberId,
              reviewOppositeId: post.buyerId
            }
          });
          if (response.data.success) {
            console.log('✅ 판매자 후기 존재 여부:', response.data.exists);
            setHasReview(response.data.exists);
          }
        }
        // 구매자인 경우
        else if (post.buyerId === userInfo.memberId) {
          const response = await axios.get('http://localhost:4989/review/check', {
            params: {
              postId: postId,
              reviewerId: userInfo.memberId,
              reviewOppositeId: post.memberId
            }
          });
          if (response.data.success) {
            console.log('✅ 구매자 후기 존재 여부:', response.data.exists);
            setHasReview(response.data.exists);
          }
        }
      } catch (error) {
        console.error('후기 존재 여부 확인 실패:', error);
        setHasReview(false);
      }
    };

    checkReviewExists();
  }, [postId, userInfo, post]);

  const handleReviewClick = () => {
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    console.log('✅ 후기 작성 완료 - hasReview 상태를 true로 설정');
    setHasReview(true);
    setShowReviewModal(false);

    // 추가로 후기 존재 여부를 다시 한 번 확인
    setTimeout(() => {
      if (postId && userInfo?.memberId && post) {
        const checkReviewAgain = async () => {
          try {
            const reviewerId = userInfo.memberId;
            const reviewOppositeId = userInfo.memberId === post.memberId ? post.buyerId : post.memberId;

            if (reviewOppositeId) {
              const response = await axios.get('http://localhost:4989/review/check', {
                params: {
                  postId: postId,
                  reviewerId: reviewerId,
                  reviewOppositeId: reviewOppositeId
                }
              });
              if (response.data.success) {
                console.log('✅ 후기 작성 후 재확인:', response.data.exists);
                setHasReview(response.data.exists);
              }
            }
          } catch (error) {
            console.error('후기 재확인 실패:', error);
          }
        };
        checkReviewAgain();
      }
    }, 1000);
  };

  const handleReviewModalClose = () => setShowReviewModal(false);

  const canWriteReview = () => {
    // 기본 조건 체크
    if (!userInfo?.memberId || !post) return false;

    const isSeller = userInfo.memberId === post.memberId;
    const isBuyer = post.buyerId === userInfo.memberId;
    const statusCheck = post.status === 'SOLD';
    const noReviewCheck = !hasReview;

    // 후기 작성 가능한 사용자인지 확인
    const canWrite = (isSeller && post.buyerId) || isBuyer;

    console.log('🔍 canWriteReview 체크:', {
      isSeller,
      isBuyer,
      statusCheck,
      noReviewCheck,
      hasReview,
      canWrite,
      userInfoMemberId: userInfo?.memberId,
      postMemberId: post?.memberId,
      postBuyerId: post?.buyerId,
      postStatus: post?.status
    });

    // 모든 조건을 만족해야 후기 작성 가능
    return canWrite && statusCheck && noReviewCheck;
  };

  // 좋아요 토글
  const onToggle = async () => {
    if (!userInfo?.memberId) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!postId) {
      alert('잘못된 게시글 ID입니다.');
      return;
    }
    try {
      const { data } = await axios.post('http://localhost:4989/post/toggle', null, { params: { postId } });
      setFavorited(Boolean(data.favorited));
      setCount(Number(data.count) || 0);
    } catch (e) {
      console.error(e);
      alert('잠시 후 다시 시도해주세요.');
    }
  };

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!postId) return;

    if (!userInfo?.memberId) {
      alert('로그인이 필요합니다.');
      navi('/login', { replace: true, state: { from: location.pathname } });
      return;
    }
    if (userInfo.memberId !== post?.memberId) {
      alert('삭제 권한이 없습니다. 작성자만 삭제할 수 있어요.');
      return;
    }
    if (!window.confirm('정말로 이 게시글을 삭제하시겠어요?')) return;

    setDeleting(true);
    try {
      await axios.delete(`http://localhost:4989/post/${postId}`);
      alert('삭제되었습니다.');
     

      // postType별로 분기
    if (post.postType === "ITEMS") {
        navi("/goods");   // 중고물품 탭
    } else if (post.postType === "CARS") {
        navi("/cars");    // 자동차 탭
    } else if (post.postType === "REAL_ESTATES") {
        navi("/real-estate"); // 부동산 탭
    } else {
        navi("/goods"); // 기본 이동
    }
    } catch (e) {
      if (!e.response) {
        console.log('navigator.onLine =', navigator.onLine, 'message =', e.message, 'code =', e.code);
        alert('네트워크/프록시/CORS 문제로 요청이 차단됐습니다. 콘솔 확인!');
        return;
      }
      const { status } = e.response;
      if (status === 401) {
        navi('/login', { replace: true, state: { from: location.pathname } });
      } else if (status === 403) {
        alert('작성자만 삭제할 수 있어요.');
      } else if (status === 404) {
        alert('이미 삭제되었거나 존재하지 않는 게시글입니다.');
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    } finally {
      setDeleting(false);
    }
  };

  // 채팅 토글 (토큰 헤더에 공통 token 사용하도록 보정)
  const handleChatToggle = async () => {
    if (showChat) {
      setShowChat(false);
      return;
    }

    try {
      const parsedPostId = parseInt(postId, 10);
      const buyerId = userInfo.memberId;
      const sellerId = post.memberId;

      if (buyerId === sellerId) {
        alert('자신이 올린 게시글에는 채팅을 시작할 수 없습니다.');
        return;
      }

      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const enterResponse = await axios.post(
        'http://localhost:4989/room/enter',
        { productId: parsedPostId, buyerId },
        { headers: authHeader }
      );

      let chatRoomId = enterResponse.data;

      if (!chatRoomId) {
        const createResponse = await axios.post(
          'http://localhost:4989/room/create-with-message',
          {
            productId: parsedPostId,
            sellerId,
            buyerId,
            messageContent: '안녕하세요, 채팅 시작합니다.',
          },
          { headers: authHeader }
        );
        chatRoomId = createResponse.data;
      }

      const chatRoomResponse = await axios.get(
        `http://localhost:4989/chat/room`,
        { params: { chatRoomId, memberId: buyerId }, headers: authHeader }
      );

      setChatRoom(chatRoomResponse.data);
      setShowChat(true);
    } catch (e) {
      console.error('채팅방 처리 중 오류:', e.response?.data || e.message);
      alert('채팅방을 불러오는 데 실패했습니다.');
    }
  };

  const handleChangeType = (type) => {
    setReportType(type);
    setTargetId(type === 'POST' ? Number(postId) : type === 'MEMBER' ? Number(authorId) : null);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) return;
    if (!token || token === 'null' || token === 'undefined') {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!targetId) {
      alert('대상 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append('targetType', reportType);
      if (reportType === 'POST') fd.append('targetPostId', targetId);
      if (reportType === 'MEMBER') fd.append('targetMemberId', targetId);
      fd.append('reason', reportReason.trim());
      fd.append('status', 'PENDING');

      await axios.post('http://localhost:4989/post/report', fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('보냈습니다!');
      setReportReason('');
      setReportType('');
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data || '전송 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const getFallbackListPath = () => {
    switch (post?.postType) {
      case 'CARS':
        return '/cars';
      case 'REAL_ESTATES':
        return '/real_estate';
      case 'ITEMS':
      default:
        return '/goods';
    }
  };

  const handleGoBackToList = () => {
    const { from, focusId } = location.state || {};
    if (from) {
      navi(from, { state: { focusId: focusId ?? Number(postId) } });
      return;
    }
    navi(getFallbackListPath(), { state: { focusId: Number(postId) } });
  };

  const handleStatusChange = async (newStatus) => {
    if (!userInfo || !post || Number(userInfo.memberId) !== Number(post.memberId)) {
      alert('권한이 없습니다.');
      return;
    }
    if (newStatus === post.status) return;

    if (newStatus === 'SOLD') {
      setShowBuyerModal(true);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await axios.put(
        'http://localhost:4989/post/updateStatus',
        null,
        { params: { postId, status: newStatus }, headers: { Authorization: `Bearer ${token}` } } // ✅ params로 전달
      );

      if (response.data.success) {
        setPost((prev) => ({ ...prev, status: newStatus }));
        alert('판매 상태가 변경되었습니다.');
      } else {
        alert('상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('판매 상태 변경 실패:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleBuyerSelectionComplete = (buyerId) => {
    setPost((prev) => ({ ...prev, status: 'SOLD', buyerId }));
    setShowBuyerModal(false);
  };

  const nextPhoto = () => {
    if (photos && photos.length > 0) {
      setCurrentPhotoIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
    }
  };

  const prevPhoto = () => {
    if (photos && photos.length > 0) {
      setCurrentPhotoIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
    }
  };

  // ✅ postId 자체가 없으면 API 호출도 하지 말고 안내
  if (!postId) return <div className="loading-container">잘못된 접근입니다. (postId 없음)</div>;
  if (!post) return <div className="loading-container">로딩 중...</div>;

  return (
    <div className="gooddetail-page">
      <div className="gooddetail-container">
        {/* 메인 콘텐츠 영역 - 2단 레이아웃 */}
        <div className="gooddetail-main">
          {/* 왼쪽 이미지 영역 */}
          <div className="gooddetail-gallery">
            <h3 className="gooddetail-gallery-title">사진 목록</h3>
            <div className="gooddetail-slider">
              {photos && photos.length > 0 && photos[currentPhotoIndex]?.photoUrl && photos[currentPhotoIndex].photoUrl !== 'null' ? (
                <>
                  <div className="gooddetail-slider-container">
                    <img
                      src={`http://localhost:4989/postphoto/${photos[currentPhotoIndex].photoUrl}`}
                      alt=""
                      className="gooddetail-slider-photo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />

                    <div className="gooddetail-no-photos" style={{ display: 'none' }}>
                      <p>등록된 사진이 없습니다</p>
                    </div>

                    {photos.length > 1 && (
                      <button className="gooddetail-slider-btn gooddetail-slider-btn-prev" onClick={prevPhoto} aria-label="이전 사진">
                        ‹
                      </button>
                    )}
                    {photos.length > 1 && (
                      <button className="gooddetail-slider-btn gooddetail-slider-btn-next" onClick={nextPhoto} aria-label="다음 사진">
                        ›
                      </button>
                    )}
                  </div>

                  <div className="gooddetail-slider-counter">{currentPhotoIndex + 1} / {photos.length}</div>
                </>
              ) : (
                <div className="gooddetail-no-photos">
                  <p>등록된 사진이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽 상품 정보 영역 */}
          <div className="gooddetail-info-section">
            <div className="gooddetail-header">
              <h1 className="gooddetail-title">{post.title}</h1>
              <div className="gooddetail-price">
                <div className="gooddetail-price-value">
                  {post.price ? new Intl.NumberFormat().format(post.price) + '원' : '가격 미정'}
                </div>
              </div>
            </div>

            <div className="gooddetail-metrics">
              <div className="gooddetail-metrics-left">
                <div className="gooddetail-metric-item">
                  <span className="gooddetail-metric-icon">❤️</span>
                  <span>{count}</span>
                </div>
                <div className="gooddetail-metric-item">
                  <span className="gooddetail-metric-icon">👁️</span>
                  <span>{post.viewCount}</span>
                </div>
                <div className="gooddetail-metric-item">
                  <span className="gooddetail-metric-icon">🕐</span>
                  <span>{post.createdAt ? new Date(post.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : ''}</span>
                </div>
              </div>
              <div className="gooddetail-metrics-right">
                {!userInfo || (Number(userInfo.memberId) !== Number(post.memberId)) ? (
                  <button className="gooddetail-report-btn" onClick={() => {
                    if (!userInfo) {
                      alert('로그인 후 이용 가능합니다.');
                    } else {
                      setOpen(true);
                    }
                  }}>
                    신고/문의
                  </button>
                ) : null}
              </div>
            </div>

            <div className="gooddetail-product-info">
              <div className="gooddetail-info-row">
                <span className="gooddetail-info-label">상품상태</span>
                <span className="gooddetail-info-value">
                  <span className={`gooddetail-status ${post.status === 'ON_SALE' ? 'on-sale' : post.status === 'RESERVED' ? 'reserved' : 'sold'}`}>
                    {post.status === 'ON_SALE' ? '판매중' : post.status === 'RESERVED' ? '예약중' : '판매완료'}
                  </span>
                </span>
              </div>
              <div className="gooddetail-info-row">
                <span className="gooddetail-info-label">배송비</span>
                <span className="gooddetail-info-value">무료배송</span>
              </div>
              <div className="gooddetail-info-row">
                <span className="gooddetail-info-label">상세주소</span>
                <span className="gooddetail-info-value">
                  {regionLoading ? "주소 정보 로딩 중..." : (
                    region ? (
                      `${region.province || ''} ${region.city || ''} ${region.district || ''} ${region.town || ''}`.trim()
                    ) : (
                      '주소 정보 없음'
                    )
                  )}
                </span>
              </div>
            </div>

            <div className="gooddetail-action-buttons">
              <button onClick={onToggle} className="gooddetail-like-btn">
                <span className="like-icon">{favorited ? '❤️' : '🤍'}</span>
                <span>찜 {count}</span>
              </button>

              {userInfo ? (
                <button className="gooddetail-chat-btn" onClick={handleChatToggle}>
                  대화
                </button>
              ) : (
                <button className="gooddetail-chat-btn" onClick={() => alert('로그인 후 이용 가능합니다.')}>
                  대화
                </button>
              )}

              {userInfo && userInfo.memberId === post.memberId && (
                <>
                  <button type="button" className="gooddetail-btn" onClick={() => navi(`/board/update?postId=${postId}`)}>
                    수정
                  </button>
                  <button type="button" className="gooddetail-btn danger" onClick={handleDeletePost} disabled={deleting}>
                    {deleting ? '삭제 중...' : '삭제'}
                  </button>
                </>
              )}

              <button className="gooddetail-btn secondary" onClick={handleGoBackToList}>
                목록
              </button>
            </div>

            <div className="gooddetail-status-section">
              {userInfo && userInfo.memberId === post.memberId && post.status !== 'SOLD' && (
                <div className="gooddetail-status-selector">
                  <label htmlFor="status-select" className="gooddetail-status-label">판매 상태 변경</label>
                  <select
                    id="status-select"
                    className="gooddetail-status-select"
                    value={post.status || 'ON_SALE'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                  >
                    <option value="ON_SALE">판매중</option>
                    <option value="RESERVED">예약중</option>
                    <option value="SOLD">판매완료</option>
                  </select>
                  {isUpdatingStatus && <span className="gooddetail-status-updating">업데이트 중...</span>}
                </div>
              )}

              {userInfo && post.status === 'SOLD' && (
                <div className="gooddetail-status-completed">
                  {canWriteReview() ? (
                    <button className="gooddetail-review-btn" onClick={handleReviewClick}>
                      {userInfo.memberId === post.memberId ? '후기를 남겨주세요' : '판매자에게 후기를 남겨주세요'}
                    </button>
                  ) : hasReview ? (
                    <div style={{
                      padding: '12px 24px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      color: '#28a745',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      ✅ 후기를 작성했습니다
                    </div >

                  ) : <div style={{
                    padding: '12px 24px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    color: '#28a745',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}>
                    ✅ 판매 완료된 제품입니다
                  </div >}
                </div>
              )}
            </div>

            <div className="gooddetail-meta">
              <div className="gooddetail-meta-item">
                <strong>작성자:</strong> {post.nickname}
              </div>
              <div className="gooddetail-meta-item">
                <strong>작성일:</strong> {post.createdAt ? new Date(post.createdAt).toLocaleString('ko-KR') : ''}
              </div>
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <div className="gooddetail-meta-item gooddetail-updated-item">
                  <strong>수정일:</strong> {new Date(post.updatedAt).toLocaleString('ko-KR')}
                </div>
              )}
            </div>
            <div style={{ marginLeft: '-400px' }}>
              <CreditTierDisplay memberId={post.memberId} showDetails={false} />
            </div>
          </div>
        </div>

        {/* 상품 정보와 설명 영역 */}
        <div className="gooddetail-detail-section">
          <div className="gooddetail-content-section">
            <h3 className="gooddetail-content-title">상품설명</h3>
            <div className="gooddetail-content-text">
              {post.content && post.content.trim() ? (
                post.content
              ) : (
                <div style={{ color: '#999', fontStyle: 'italic' }}>상품 설명이 없습니다.</div>
              )}
            </div>
          </div>

          <div className="gooddetail-info-section-detail">
            <h3 className="gooddetail-info-title">상품정보</h3>
            <div className="gooddetail-info-grid">
              <div className="gooddetail-info-item">
                <div className="gooddetail-info-label">판매유형</div>
                <div className="gooddetail-info-value">
                  {post.tradeType === 'SALE' ? '판매' : post.tradeType === 'AUCTION' ? '경매' : '나눔'}
                </div>
              </div>

              {post.postType === 'ITEMS' && goods && (
                <>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">상품상태</div>
                    <div className="gooddetail-info-value">
                      {goods.conditions === 'best' ? '상' : goods.conditions === 'good' ? '중' : '하'}
                    </div>
                  </div>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">분류</div>
                    <div className="gooddetail-info-value">
                      {goods.categoryId === 1 ? '전자제품' : goods.categoryId === 2 ? '의류' : '가구'}
                    </div>
                  </div>
                </>
              )}

              {post.postType === 'CARS' && cars && (
                <>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">브랜드</div>
                    <div className="gooddetail-info-value">{cars.brand === 'kia' ? '기아' : cars.brand === 'hyundai' ? '현대' : cars.brand === 'benz' ? '벤츠' : cars.brand === 'audi' ? '아우디' : 'BMW'}</div>
                    {/* <div className="gooddetail-info-value">{cars.brand}</div> */}
                  </div>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">모델</div>
                    <div className="gooddetail-info-value">{cars.model}</div>
                  </div>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">연식</div>
                    <div className="gooddetail-info-value">{cars.year}년식</div>
                  </div>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">주행거리</div>
                    <div className="gooddetail-info-value">{cars.mileage}km</div>
                  </div>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">연료</div>
                    <div className="gooddetail-info-value">{cars.fuelType === 'gasoline' ? '휘발유' : cars.fuelType === 'diesel' ? '경유' : '전기'}</div>
                    {/* <div className="gooddetail-info-value">{cars.fuelType}</div> */}
                  </div>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">변속기</div>
                    <div className="gooddetail-info-value">{cars.transmission === 'auto' ? '오토' : '수동'}</div>
                    {/* <div className="gooddetail-info-value">{cars.transmission}</div> */}
                  </div>
                </>
              )}

              {post.postType === 'REAL_ESTATES' && estate && (
                <>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">매물종류</div>
                    <div className="gooddetail-info-value">
                      {estate.propertyType === 'apt'
                        ? '아파트'
                        : estate.propertyType === 'studio'
                          ? '오피스텔'
                          : estate.propertyType === 'oneroom'
                            ? '원룸'
                            : '투룸'}
                    </div>
                  </div>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">면적</div>
                    <div className="gooddetail-info-value">{estate.area} ㎡</div>
                  </div>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">방 개수</div>
                    <div className="gooddetail-info-value">{estate.rooms} 개</div>
                  </div>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">층</div>
                    <div className="gooddetail-info-value">{estate.floor} 층</div>
                  </div>
                  <div className="gooddetail-info-item">
                    <div className="gooddetail-info-label">거래유형</div>
                    <div className="gooddetail-info-value">
                      {estate.dealType === 'lease'
                        ? '전세'
                        : estate.dealType === 'rent'
                          ? '월세'
                          : estate.dealType === 'leaseAndrent'
                            ? '전월세'
                            : '매매'}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        {/* 카카오맵 섹션 - 상품정보 밑에 별도로 배치 */}
        {post && post.latitude && post.longitude && (
          <div className="map-section">
            <div className="map-container">
              <h3 className="map-title">희망거래장소</h3>
              <div className="wish-address">{post.detailLocation}</div>
              <DetailMap latitude={post.latitude} longitude={post.longitude} />
            </div>
          </div>
        )}

        {/* 신고 모달 */}
        <ReportModal
          open={open}
          onClose={() => setOpen(false)}
          reason={reportReason}
          onChangeReason={(e) => setReportReason(e.target.value)}
          reportType={reportType}
          onChangeType={handleChangeType}
          onSubmit={handleSubmitReport}
          submitting={submitting}
        />

        {/* 채팅 */}
        {showChat && chatRoom && (
          <DetailChat open={showChat} onClose={handleChatToggle} chatRoom={chatRoom} />
        )}

        {/* 거래자 선택 모달 */}
        <BuyerSelectionModal
          open={showBuyerModal}
          onClose={() => setShowBuyerModal(false)}
          postId={postId}
          token={token}
          onComplete={handleBuyerSelectionComplete}
        />

        {/* 후기 모달 */}
        <ReviewModal
          isOpen={showReviewModal}
          onClose={handleReviewModalClose}
          postId={postId ? parseInt(postId) : null}
          reviewerId={userInfo?.memberId ? parseInt(userInfo.memberId) : null}
          reviewOppositeId={
            userInfo?.memberId === post?.memberId
              ? (post?.buyerId ? parseInt(post.buyerId) : null)
              : (post?.memberId ? parseInt(post.memberId) : null)
          }
          onReviewSubmitted={handleReviewSubmitted}
        />

        {/* 디버깅용 로그 */}
        {showReviewModal && (
          <div style={{ display: 'none' }}>
            {console.log('=== GoodsDetail ReviewModal 데이터 ===')}
            {console.log('postId:', postId, '타입:', typeof postId)}
            {console.log('userInfo?.memberId:', userInfo?.memberId, '타입:', typeof userInfo?.memberId)}
            {console.log('post?.memberId:', post?.memberId, '타입:', typeof post?.memberId)}
            {console.log('post?.buyerId:', post?.buyerId, '타입:', typeof post?.buyerId)}
            {console.log('전달되는 postId:', postId ? parseInt(postId) : null)}
            {console.log('전달되는 reviewerId:', userInfo?.memberId ? parseInt(userInfo.memberId) : null)}
            {console.log('전달되는 reviewOppositeId:',
              userInfo?.memberId === post?.memberId
                ? (post?.buyerId ? parseInt(post.buyerId) : null)
                : (post?.memberId ? parseInt(post.memberId) : null)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoodsDetail;
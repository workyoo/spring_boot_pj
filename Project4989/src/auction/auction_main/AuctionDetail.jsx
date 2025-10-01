// src/auction/auction_main/AuctionDetail.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import { AuthContext } from '../../context/AuthContext';
import CreditTierDisplay from '../../components/CreditTierDisplay';
import './auction.css';
import api from '../../lib/api';
import PortOnePayment from './PortOnePayment';

const AuctionDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const [auctionDetail, setAuctionDetail] = useState(null);
  const [highestBid, setHighestBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [bidAmount, setBidAmount] = useState(0);
  const [bidMessage, setBidMessage] = useState('');
  const [bidMessageType, setBidMessageType] = useState('');
  const [authorNickname, setAuthorNickname] = useState('');
  const [winnerNickname, setWinnerNickname] = useState('');
  const [highestBidderNickname, setHighestBidderNickname] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [sessionId] = useState(() => {
    let storedSessionId = localStorage.getItem('auctionSessionId');
    if (!storedSessionId) {
      storedSessionId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('auctionSessionId', storedSessionId);
    }
    return storedSessionId;
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoLoading, setPhotoLoading] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [bidHistory, setBidHistory] = useState([]);
  const wsClientRef = useRef(null);

  //보증금 결제용
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMerchantUid, setPaymentMerchantUid] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  //escrow 결제용
  const [isProcessingEscrow, setIsProcessingEscrow] = useState(false);
  const [escrowAmount, setEscrowAmount] = useState(0);
  const [escrowMerchantUid, setEscrowMerchantUid] = useState('');

  // API 베이스 URL에서 서버 정보 추출
  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4989';
  const apiUrl = new URL(BASE);
  const SERVER_IP = apiUrl.hostname;
  const SERVER_PORT = apiUrl.port || '4989';

  const normalizeDetail = (d = {}) => ({
    ...d,
    memberId: d.memberId ?? d.memberId ?? d.writerId ?? d.writerId,
    createdAt: d.createdAt ?? d.createdAt ?? d.createDate ?? d.createDate,
    auctionEndTime: d.auctionEndTime ?? d.auctionEndTime ?? d.endTime ?? d.endTime,
    price: d.price ?? d.startPrice ?? d.startPrice ?? 0,
    winnerId: d.winnerId ?? d.winnerId,
    viewCount: d.viewCount ?? d.viewCount ?? 0,
  });

  const normalizeHighestBid = (b) =>
  b
    ? {
        ...b,
        bidderId: Number(
          b.bidderId ?? b.bidderId ?? b.memberId ?? b.memberId ?? 0
        ),
        bidAmount: Number(b.bidAmount ?? b.bidAmount ?? 0),
        bidTime: b.bidTime ?? b.bidTime ?? null,
      }
    : null;

  const getTimeAgo = (bidTime) => {
    const now = new Date();
    const bidDate = new Date(bidTime);
    const diffInMinutes = Math.floor((now - bidDate) / (1000 * 60));
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  useEffect(() => {
    (async () => {
      try {
        const detailRes = await api.get(`/auction/detail/${postId}`);
        setAuctionDetail(normalizeDetail(detailRes.data));
        setLoading(false);
      } catch (err) {
        console.error('경매 상세 정보 조회 실패:', err);
        setLoading(false);
      }

      try {
        const hbRes = await api.get(`/auction/highest-bid/${postId}`);
        setHighestBid(normalizeHighestBid(hbRes.data));
      } catch (err) {
        console.error('최고가 조회 실패:', err);
        setHighestBid(null);
      }

      try {
        console.log('🚪 방 입장 시도 - postId:', postId, 'sessionId:', sessionId);
        const requestBody = { sessionId };
        console.log('🚪 방 입장 요청 바디:', requestBody);
        const joinRes = await api.post(`/auction/room/join/${postId}`, requestBody);
        console.log('🚪 방 입장 응답:', joinRes.data);
        if (joinRes.data?.success) {
          console.log('✅ 방 입장 성공, 인원수 설정:', joinRes.data.userCount);
          setUserCount(joinRes.data.userCount);
        } else {
          console.log('❌ 방 입장 실패 - success가 false');
          console.log('❌ 방 입장 실패 메시지:', joinRes.data?.message);
          console.log('❌ 방 입장 실패 상세:', joinRes.data);
        }
      } catch (err) {
        console.error('❌ 방 입장 실패:', err);
        console.error('❌ 에러 상세:', err.response?.data);
      }

      getAuctionPhotos();
      getBidHistory();
      checkFavoriteStatus();
      getFavoriteCount();
    })();

    const handleBeforeUnload = () => {
      navigator.sendBeacon(`${BASE}/auction/room/leave/${postId}/${sessionId}`);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      api.post(`/auction/room/leave/${postId}`, { sessionId }).catch((err) => {
        console.error('방 퇴장 실패:', err);
      });
    };
  }, [postId, sessionId, userInfo]);

  useEffect(() => {
    if (auctionDetail?.memberId) {
      api
        .get(`/auction/member/${auctionDetail.memberId}`)
        .then((res) => setAuthorNickname(res.data.nickname))
        .catch(() => setAuthorNickname(`ID: ${auctionDetail.memberId}`));
    }
  }, [auctionDetail?.memberId]);

  useEffect(() => {
    if (auctionDetail?.winnerId) {
      api
        .get(`/auction/member/${auctionDetail.winnerId}`)
        .then((res) => setWinnerNickname(res.data.nickname))
        .catch(() => setWinnerNickname(`ID: ${auctionDetail.winnerId}`));
    } else {
      setWinnerNickname('');
    }
  }, [auctionDetail?.winnerId]);

  useEffect(() => {
    if (highestBid?.bidderId) {
      api
        .get(`/auction/member/${highestBid.bidderId}`)
        .then((res) => setHighestBidderNickname(res.data.nickname))
        .catch(() => setHighestBidderNickname(`ID: ${highestBid.bidderId}`));
    } else {
      setHighestBidderNickname('');
    }
  }, [highestBid?.bidderId]);

  useEffect(() => {
    const interval = setInterval(() => setBidHistory((prev) => [...prev]), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 방 인원수 조회 시작 - postId:', postId);
      api
        .get(`/auction/room/count/${postId}`)
        .then((res) => {
          console.log('📊 방 인원수 조회 응답:', res.data);
          if (res.data?.success) {
            console.log('✅ 방 인원수 설정:', res.data.userCount);
            setUserCount(res.data.userCount);
          } else {
            console.log('❌ 방 인원수 조회 실패 - success가 false');
          }
        })
        .catch((err) => {
          console.error('❌ 방 인원수 조회 실패:', err);
          console.error('❌ 에러 상세:', err.response?.data);
        });
    }, 10000);
    return () => clearInterval(interval);
  }, [postId]);

  useEffect(() => {
    if (!auctionDetail?.auctionEndTime) {
      setTimeRemaining('마감시간 미정');
      return;
    }
    const updateTimer = () => {
      const endTime = new Date(auctionDetail.auctionEndTime);
      const now = new Date();
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeRemaining('경매 종료');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) setTimeRemaining(`${days}일 ${hours}시간 ${minutes}분 ${seconds}초`);
      else if (hours > 0) setTimeRemaining(`${hours}시간 ${minutes}분 ${seconds}초`);
      else if (minutes > 0) setTimeRemaining(`${minutes}분 ${seconds}초`);
      else setTimeRemaining(`${seconds}초`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [auctionDetail?.auctionEndTime]);

  useEffect(() => {
    if (!bidMessage) return;
    const t = setTimeout(() => {
      setBidMessage('');
      setBidMessageType('');
    }, 2000);
    return () => clearTimeout(t);
  }, [bidMessage]);

  useEffect(() => {
    console.log('🔌 WebSocket useEffect 실행 - postId:', postId);
    
    // 이미 연결된 클라이언트가 있다면 정리
    if (wsClientRef.current) {
      console.log('🔌 기존 WebSocket 클라이언트 정리');
      wsClientRef.current.deactivate();
    }
    
    const client = new Client({
      brokerURL: `ws://${SERVER_IP}:${SERVER_PORT}/ws`,
      onConnect: () => {
        console.log('🔌 WebSocket 연결됨 - postId:', postId, 'sessionId:', sessionId);
        client.subscribe(`/topic/auction/${postId}`, (message) => {
          console.log('📡 WebSocket 메시지 수신:', message.body);
          const data = JSON.parse(message.body);
          console.log('📡 파싱된 데이터:', data);
          handleSocketMessage(data);
        });

        setTimeout(() => {
          if (client.connected) {
            client.publish({
              destination: `/app/auction/room/join/${postId}`,
              body: JSON.stringify({
                sessionId,
                userId: String(userInfo?.memberId || 'anonymous'),
                userNickname: userInfo?.nickname || `ID: ${userInfo?.memberId || 'anonymous'}`
              })
            });
          }
        }, 1000);
      },
      onDisconnect: () => {
        console.log('❌ WebSocket 연결이 끊어졌습니다.');
      },
      onStompError: (error) => {
        console.error('❌ 경매 소켓 에러:', error);
      }
    });

    wsClientRef.current = client;
    client.activate();
    
    return () => {
      if (client.connected) {
        client.publish({
          destination: `/app/auction/room/leave/${postId}`,
          body: JSON.stringify({ sessionId })
        });
        setTimeout(() => client.deactivate(), 500);
      }
      wsClientRef.current = null;
    };
  }, [postId, sessionId, userInfo]);

  const handleSocketMessage = (data) => {
    switch (data.type) {
      case 'BID_UPDATE': {
        console.log('📡 WebSocket BID_UPDATE 수신:', data);
        console.log('📡 입찰 데이터:', data.bid);
        console.log('📡 입찰자 데이터:', data.bidder);
        
        setHighestBid(data.bid);
        if (data.bidder) {
          setHighestBidderNickname(data.bidder.nickname || `ID: ${data.bidder.memberId || data.bidder.id}`);
        }
        setBidMessage(`${data.bidder?.nickname || '누군가'}님이 입찰했습니다!`);
        setBidMessageType('info');

        const newBidRecord = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          bidderName: data.bidder?.nickname || `ID: ${data.bidder?.memberId || data.bidder?.id}`,
          bidAmount: Number(data.bid?.bidAmount || data.bid?.bid_amount || 0),
          bidTime: new Date().toISOString()
        };
        console.log('📡 새 입찰 기록 생성:', newBidRecord);
        console.log('📡 data.bid 전체:', data.bid);
        console.log('📡 data.bid.bidAmount:', data.bid?.bidAmount);
        console.log('📡 data.bid.bid_amount:', data.bid?.bid_amount);
        
        setBidHistory((prev) => {
          console.log('📡 이전 입찰 기록:', prev);
          console.log('📡 새 입찰 기록:', newBidRecord);
          
          // 중복 방지: 같은 시간대에 같은 입찰자면 추가하지 않음
          const isDuplicate = prev.some(existing => 
            existing.bidderName === newBidRecord.bidderName && 
            Math.abs(new Date(existing.bidTime).getTime() - new Date(newBidRecord.bidTime).getTime()) < 1000
          );
          
          if (isDuplicate) {
            console.log('📡 중복 입찰 기록 감지, 추가하지 않음');
            return prev;
          }
          
          const updated = [newBidRecord, ...prev].slice(0, 5);
          console.log('📡 업데이트된 입찰 기록:', updated);
          return updated;
        });

        if (data.auctionDetail) setAuctionDetail(data.auctionDetail);
        break;
      }
     case 'AUCTION_END': {
        console.log('📡 WebSocket AUCTION_END 수신:', data);
        setTimeRemaining('경매 종료');
        
        // 경매 상태 업데이트
        setAuctionDetail((prev) => ({ 
          ...prev, 
          status: 'SOLD', 
          winnerId: data.winnerId 
        }));
        
        // 낙찰자 정보 설정
        if (data.winner) {
          setWinnerNickname(data.winner.nickname || `ID: ${data.winner.memberId || data.winner.id}`);
        }
        
        setBidMessage('경매가 종료되었습니다!');
        setBidMessageType('success');

        // 낙찰자에게 에스크로 결제 안내
        if (String(data.winnerId) === String(userInfo?.memberId)) {
          setBidMessage('축하합니다! 낙찰자입니다. 아래 "잔금(에스크로) 결제" 버튼으로 결제 진행해주세요.');
          setBidMessageType('info');
        }
        
        // 입찰 기록 새로고침
        setTimeout(async () => {
          try {
            const bidHistoryRes = await api.get(`/auction/bid-history/${postId}`);
            const formattedHistory = bidHistoryRes.data.map((bid, index) => ({
              id: `bid-${index}-${bid.bidTime}-${bid.bidderName}`,
              bidderName: bid.bidderName || `ID: ${bid.bidderId}`,
              bidAmount: bid.bidAmount || bid.bid_amount,
              bidTime: bid.bidTime
            }));
            setBidHistory(formattedHistory);
          } catch (error) {
            console.error('입찰 기록 새로고침 실패:', error);
          }
        }, 1000);
        
        break;
      }

      case 'USER_COUNT_UPDATE': {
        console.log('📡 WebSocket USER_COUNT_UPDATE 수신:', data);
        console.log('📡 userCount 값:', data.userCount);
        setUserCount(data.userCount);
        break;
      }
      default:
        break;
    }
  };

  const formatDate = (d) => {
    if (!d || d === 'null' || d === '') return '-';
    try {
      const safe = typeof d === 'string' && d.includes(' ') ? d.replace(' ', 'T') : d;
      const date = new Date(safe);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString('ko-KR');
    } catch {
      return '-';
    }
  };

  const formatPrice = (price) => {
    console.log('💰 formatPrice 호출 - price:', price, 'type:', typeof price);
    if (!price || price === 0) return '-';
    const formatted = `${price.toLocaleString()} 원`;
    console.log('💰 formatPrice 결과:', formatted);
    return formatted;
  };

  const handleAmountClick = (amount) => {
    const currentBidAmount = bidAmount > 0 ? bidAmount : getCurrentPrice();
    const newAmount = currentBidAmount + amount;
    const currentHighestBid = getCurrentPrice();
    if (newAmount > currentHighestBid) {
      setBidAmount(newAmount);
      setBidMessage('');
    } else {
      setBidMessage(`⚠️ 최소 ${(currentHighestBid + 1).toLocaleString()}원 이상 입력해주세요.`);
      setBidMessageType('warning');
    }
  };

  const handleBidAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = value ? parseInt(value) : 0;
    setBidAmount(numValue);

    const currentHighestBid = getCurrentPrice();
    if (numValue > 0 && numValue <= currentHighestBid) {
      setBidMessage(`⚠️ 현재 최고가(${currentHighestBid.toLocaleString()}원)보다 높은 금액을 입력해주세요.`);
      setBidMessageType('warning');
    } else if (numValue > 0) {
      setBidMessage('');
    }
  };

  const handleBidSubmit = async () => {
    if (!userInfo || !userInfo.memberId) {
      setBidMessage('로그인 후 이용해주세요.');
      setBidMessageType('error');
      return;
    }
    const currentUserId = userInfo.memberId;

    if (auctionDetail && auctionDetail.memberId === currentUserId) {
      setBidMessage('본인 경매에는 참여할 수 없습니다.');
      setBidMessageType('error');
      return;
    }

    if (!bidAmount || bidAmount <= 0) {
      setBidMessage('유효한 입찰 금액을 입력해주세요.');
      setBidMessageType('error');
      return;
    }

    const currentHighestBid = getCurrentPrice();
    if (bidAmount <= currentHighestBid) {
      setBidMessage(`입찰가가 현재 최고가(${currentHighestBid.toLocaleString()}원)보다 낮거나 같습니다.\n더 높은 금액을 입력해주세요.`);
      setBidMessageType('error');
      return;
    }

    if (highestBid && highestBid.bidderId === currentUserId) {
      setBidMessage('연속 입찰은 불가능합니다.\n다른 분이 입찰한 후 시도해주세요.');
      setBidMessageType('error');
      return;
    }

    try {
      const res = await api.post(`/auction/${postId}/bids`, {
        bid_amount: Number(bidAmount) // 바디는 이 키 하나만
      });

      if (res.data?.status === 'NEED_GUARANTEE') {
        const guaranteeAmount = res.data.guaranteeAmount || Math.max(1, Math.round((auctionDetail?.price || 0) * 0.1));
        setPaymentAmount(guaranteeAmount);
        setPaymentMerchantUid(res.data.merchantUid); // 서버가 내려준 merchantUid 그대로 사용
        setShowPaymentModal(true);
        return;
      }

      setBidMessage(res.data?.message || '입찰이 완료되었습니다.');
      setBidMessageType('success');
      setBidAmount(0);

      const [detail, hb] = await Promise.all([
        api.get(`/auction/detail/${postId}`),
        api.get(`/auction/highest-bid/${postId}`)
      ]);
      setAuctionDetail(detail.data);
      setHighestBid(hb.data);
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      const msg = data?.message || data?.error || (error.message || '알 수 없는 오류가 발생했습니다.');

      if (status === 401) {
        setBidMessage(msg || '로그인이 필요하거나 인증이 만료되었습니다.');
        setBidMessageType('error');
      } else if (status === 402 && data?.status === 'NEED_GUARANTEE') {
        const guaranteeAmount = data.guaranteeAmount || Math.max(1, Math.round((auctionDetail?.price || 0) * 0.1));
        setPaymentAmount(guaranteeAmount);
        setPaymentMerchantUid(data.merchantUid);
        setBidMessage('보증금 결제가 필요합니다. 결제를 진행해주세요.');
        setBidMessageType('info');
        setShowPaymentModal(true);
      } else {
        setBidMessage(msg || '입찰에 실패했습니다. 다시 시도해주세요.');
        setBidMessageType('error');
      }
    }
  };

  const handleEndAuction = async () => {
    setBidMessage('경매 종료 처리 중...');
    setBidMessageType('info');

    try {
      const res = await api.post(`/auction/end/${postId}`);
      setBidMessage(res.data);
      setBidMessageType('success');

      // 경매 종료 후 데이터 새로고침
      const [detail, hb] = await Promise.all([
        api.get(`/auction/detail/${postId}`),
        api.get(`/auction/highest-bid/${postId}`)
      ]);
      
      setAuctionDetail(detail.data);
      setHighestBid(hb.data);
      setTimeRemaining('경매 종료');

      // 낙찰자가 있으면 낙찰자 정보 조회
      if (hb.data && hb.data.bidderId) {
        try {
          const w = await api.get(`/auction/member/${hb.data.bidderId}`);
          setWinnerNickname(w.data.nickname || `ID: ${hb.data.bidderId}`);
        } catch {
          setWinnerNickname(`ID: ${hb.data.bidderId}`);
        }
      }

      // 입찰 기록도 새로고침
      try {
        const bidHistoryRes = await api.get(`/auction/bid-history/${postId}`);
        const formattedHistory = bidHistoryRes.data.map((bid, index) => ({
          id: `bid-${index}-${bid.bidTime}-${bid.bidderName}`,
          bidderName: bid.bidderName || `ID: ${bid.bidderId}`,
          bidAmount: bid.bidAmount || bid.bid_amount,
          bidTime: bid.bidTime
        }));
        setBidHistory(formattedHistory);
      } catch (error) {
        console.error('입찰 기록 새로고침 실패:', error);
      }
    } catch (error) {
      if (error.response?.data) setBidMessage(error.response.data);
      else setBidMessage('경매 종료에 실패했습니다.');
      setBidMessageType('error');
    }
  };

  // 잔금(에스크로) 결제 시작
const startEscrowPayment = async () => {
  try {
    // 1) 서버에 에스크로 전표 생성 요청 (잔금 = 최종가 - 보증금)
    const { data } = await api.post(`/api/escrow/order/${postId}/me`);

    const amount = Number(data?.amount ?? 0);
    const mu = data?.merchantUid || data?.merchant_uid;
    if (!mu) throw new Error('merchantUid 누락');

    // 2) 잔금이 0원이면 결제창 열 필요 없이 완료 처리
    if (amount <= 0) {
      // 서버가 내부적으로 처리했다면 굳이 confirm은 없음. 바로 성공 토스트만.
      setBidMessage('보증금으로 전액 충당되어 잔금 결제가 필요 없습니다.');
      setBidMessageType('success');
      return;
    }

    // 3) 잔금 > 0 → 결제 컴포넌트 띄우기
    setEscrowAmount(amount);
    setEscrowMerchantUid(mu);
    setIsProcessingEscrow(true);   // <PortOnePayment mode="ESCROW"...> 렌더 트리거
  } catch (err) {
    console.error('에스크로 전표 생성 실패:', err?.response?.data || err);
    setBidMessage('에스크로 결제를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
    setBidMessageType('error');
  }
};

const handleEscrowComplete = async () => {
  setIsProcessingEscrow(false);
  setBidMessage('에스크로 결제가 완료되었습니다.');
  setBidMessageType('success');
  try {
    const [detail, hb] = await Promise.all([
      api.get(`/auction/detail/${postId}`),
      api.get(`/auction/highest-bid/${postId}`)
    ]);
    setAuctionDetail(detail.data);
    setHighestBid(hb.data);
  } catch (error) {
    console.error('에스크로 완료 후 데이터 갱신 실패:', error);
  }
};

const handleEscrowCancel = () => {
  setIsProcessingEscrow(false);
  setBidMessage('에스크로 결제가 취소되었습니다.');
  setBidMessageType('info');
};


  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ON_SALE': return 'detail-status-badge detail-status-onsale';
      case 'SOLD': return 'detail-status-badge detail-status-sold';
      case 'RESERVED': return 'detail-status-badge detail-status-reserved';
      default: return 'detail-status-badge detail-status-onsale';
    }
  };

  const getCurrentPrice = () => {
    if (highestBid && highestBid.bidAmount) return highestBid.bidAmount;
    return auctionDetail?.price || 0;
  };

  const checkFavoriteStatus = async () => {
    if (!userInfo?.memberId) return;
    try {
      const res = await api.get(`/auction/favorite/check`, { 
        params: { postId } 
      });
      if (res.data?.success) {
        setIsFavorite(res.data.isFavorite);
      }
    } catch (err) {
      console.error('찜 상태 확인 실패:', err);
    }
  };

  const toggleFavorite = async () => {
    if (!userInfo?.memberId) return;
    if (favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      const res = await api.post(`/auction/favorite/toggle`, null, { 
        params: { postId } 
      });
      if (res.data?.success) {
        setIsFavorite(res.data.isFavorite);
        setFavoriteCount(res.data.favoriteCount);
      }
    } catch (err) {
      console.error('찜 토글 실패:', err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const getFavoriteCount = async () => {
    if (!postId) return;
    try {
      const res = await api.get(`/auction/favorite/count`, { 
        params: { postId } 
      });
      if (res.data?.success) {
        setFavoriteCount(res.data.favoriteCount || 0);
      } else {
        setFavoriteCount(0);
      }
    } catch (err) {
      console.error('찜 개수 조회 실패:', err);
      setFavoriteCount(0);
    }
  };

  const getAuctionPhotos = async () => {
    if (!postId) return;
    setPhotoLoading(true);
    try {
      const res = await api.get(`/auction/photos/${postId}`);
      setPhotos(res.data || []);
      setCurrentPhotoIndex(0);
    } catch (err) {
      console.error('경매 사진 조회 실패:', err);
      setPhotos([]);
    } finally {
      setPhotoLoading(false);
    }
  };

  const getBidHistory = async () => {
    if (!postId) return;
    console.log('🔍 입찰 기록 조회 시작 - postId:', postId);
    try {
      const res = await api.get(`/auction/bid-history/${postId}`);
      console.log('🔍 입찰 기록 원본 데이터:', res.data);
      
      // 데이터 정규화
      const normalizedHistory = (res.data || []).map((bid, index) => {
        const normalized = {
          ...bid,
          bidAmount: Number(bid.bidAmount || 0),
          id: bid.id || `${bid.bidTime}-${bid.bidderName}-${index}`
        };
        console.log(`🔍 입찰 기록 ${index + 1}번 정규화:`, normalized);
        return normalized;
      });
      
      console.log('🔍 최종 정규화된 입찰 기록:', normalizedHistory);
      setBidHistory(normalizedHistory);
    } catch (err) {
      console.error('❌ 입찰 기록 조회 실패:', err);
      setBidHistory([]);
    }
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };
  const goToPhoto = (index) => setCurrentPhotoIndex(index);

  const openImageModal = (index) => {
    setModalPhotoIndex(index);
    setImageModalOpen(true);
  };
  const closeImageModal = () => setImageModalOpen(false);
  const prevModalPhoto = () => setModalPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  const nextModalPhoto = () => setModalPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));

  const handleDeleteAuction = () => setShowPasswordModal(true);

  const handleDeleteWithPassword = async () => {
    if (!password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/auction/delete/${postId}`, {
        data: { password },
      });
      if (res.status === 200) {
        alert('경매가 삭제되었습니다.');
        navigate('/auction');
      }
    } catch (err) {
      console.error('경매 삭제 실패:', err);
      if (err.response?.data?.error) alert(err.response.data.error);
      else alert('경매 삭제에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
      setShowPasswordModal(false);
      setPassword('');
    }
  };

  const handlePaymentComplete = async () => {
    setShowPaymentModal(false);
    setIsProcessingPayment(false);

    try {
      await api.post(`/auction/${postId}/bids`, {
        bid_amount: Number(bidAmount) // 결제 후 재시도도 동일 키만
      });

      setBidMessage('보증금 결제가 완료되었고, 입찰이 성공했습니다!');
      setBidMessageType('success');
      setBidAmount(0);

      const [detail, hb] = await Promise.all([
        api.get(`/auction/detail/${postId}`),
        api.get(`/auction/highest-bid/${postId}`),
      ]);
      setAuctionDetail(detail.data);
      setHighestBid(hb.data);
    } catch (error) {
      const data = error.response?.data;
      const msg = data?.message || data?.error || '보증금은 결제되었지만 입찰에 실패했습니다. 다시 시도해주세요.';
      setBidMessage(msg);
      setBidMessageType('error');
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setIsProcessingPayment(false);
    setBidMessage('보증금 결제가 취소되었습니다.');
    setBidMessageType('info');
  };

  const shareToSocial = () => {
    const shareData = {
      title: auctionDetail?.title || '경매 상품',
      text: `현재 ${userCount}명이 입찰 중! 최고가: ${highestBid?.bidAmount || auctionDetail?.price || 0}원`,
      url: `http://localhost:5173/auction/detail/${postId}`
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(shareText)
        .then(() => alert('링크가 클립보드에 복사되었습니다!'))
        .catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('링크가 클립보드에 복사되었습니다!');
        });
    }
  };

  useEffect(() => {
    if (userInfo?.memberId && postId) {
      checkFavoriteStatus();
      getFavoriteCount();
    }
  }, [userInfo?.memberId, postId]); // 의존성 배열에서 userInfo 전체를 제거하고 memberId만 사용

  if (loading) {
    return (
      <div className="loading-container">
        <h3>로딩 중...</h3>
      </div>
    );
  }

  if (!auctionDetail) {
    return (
      <div className="error-container">
        <h3>경매 정보를 찾을 수 없습니다.</h3>
        <button onClick={() => navigate('/auction')}>목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="auction-detail-container">
      <div className="detail-content">
        <div className="product-info-section">
          <div className="product-header">
            <div className="title-heart-container">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 className="product-title">{auctionDetail.title}</h1>
                {userInfo?.memberId === auctionDetail?.memberId && (
                  <button
                    onClick={handleDeleteAuction}
                    className="delete-btn"
                    title="경매 삭제"
                    style={{
                      background: '#ffb3b3',
                      color: '#8b0000',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      marginLeft: '15px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#ff9999';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ffb3b3';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>

              <div className="heart-favorite-container">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={`favorite-heart-btn ${isFavorite ? 'favorited' : ''}`}
                    title={isFavorite ? '찜 해제' : '찜 추가'}
                  >
                    {isFavorite ? '❤️' : '🤍'}
                  </button>
                  <span className="favorite-count-text">찜: {favoriteCount}개</span>

                  <button
                    onClick={shareToSocial}
                    className="share-btn"
                    title="경매 공유하기"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      marginLeft: '10px',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <img
                      src="/공유.png"
                      alt="공유"
                      style={{
                        width: '24px',
                        height: '24px',
                        filter: 'brightness(0.8)',
                        transition: 'filter 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.target.style.filter = 'brightness(1)')}
                      onMouseLeave={(e) => (e.target.style.filter = 'brightness(0.8)')}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="product-meta-section">
              <div className="meta-row">
                <div className="meta-item author-date">
                  <div>
                    <span className="meta-label">작성자</span>
                    <span className="meta-value">
                      {authorNickname || `ID: ${auctionDetail.memberId}`}
                      <CreditTierDisplay memberId={auctionDetail.memberId} showDetails={false} />
                    </span>
                  </div>
                  <div>
                    <span className="meta-label">작성일</span>
                    <span className="meta-value">{formatDate(auctionDetail.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="meta-row">
                <div className="meta-item">
                  <div>
                    <span className="meta-label">카테고리</span>
                    <span className="meta-value">경매</span>
                  </div>
                </div>
                <div className="meta-item">
                  <div>
                    <span className="meta-label">상태</span>
                    <span className={getStatusBadgeClass(auctionDetail.status)}>
                      {auctionDetail.status === 'ON_SALE'
                        ? '경매중'
                        : auctionDetail.status === 'SOLD'
                        ? '낙찰완료'
                        : auctionDetail.status === 'RESERVED'
                        ? '예약중'
                        : auctionDetail.status || '상태미정'}
                    </span>
                  </div>
                </div>
                <div className="meta-item">
                  <div>
                    <span className="meta-label">조회수</span>
                    <span className="meta-value">
                      <span className="eye-icon">👁️</span>
                      {auctionDetail.viewCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="product-description-image-section">
            <div className="product-content">
              <h3 className="content-title">상품 설명</h3>
              <div className="price-amount-small">시작가: {formatPrice(auctionDetail.price)}</div>
              <div className="content-text">
                {auctionDetail.content || '상품 설명이 없습니다.'}
              </div>
            </div>

            <div className="product-image-container">
              {photoLoading ? (
                <div className="image-loading"><span>🔄 사진 로딩 중...</span></div>
              ) : photos.length > 0 ? (
                <div className="photo-slider">
                  <div className="main-photo-container">
                    {photos[currentPhotoIndex]?.photoUrl ? (
                      <img
                        src={`${BASE}/auction/image/${encodeURIComponent(photos[currentPhotoIndex].photoUrl)}`}
                        alt={`상품 이미지 ${currentPhotoIndex + 1}`}
                        className="main-photo clickable"
                        onClick={() => openImageModal(currentPhotoIndex)}
                        title="클릭하여 크게 보기"
                      />
                    ) : (
                      <div className="image-placeholder"><span>📷 이미지를 불러올 수 없습니다</span></div>
                    )}
                    {photos.length > 1 && (
                      <>
                        <button className="photo-nav-btn prev-btn" onClick={prevPhoto} title="이전 사진" />
                        <button className="photo-nav-btn next-btn" onClick={nextPhoto} title="다음 사진" />
                      </>
                    )}
                  </div>

                  {photos.length > 1 && (
                    <div className="photo-thumbnails">
                      {photos.map((photo, index) => (
                        <button
                          key={`photo-${photo.photo_id}-${index}`}
                          className={`thumbnail-btn ${index === currentPhotoIndex ? 'active' : ''}`}
                          onClick={() => goToPhoto(index)}
                          title={`사진 ${index + 1}`}
                        >
                          {photo.photoUrl ? (
                            <img
                              src={`${BASE}/auction/image/${encodeURIComponent(photo.photoUrl)}`}
                              alt=""
                              className="thumbnail-img clickable"
                              onClick={(e) => {
                                e.stopPropagation();
                                openImageModal(index);
                              }}
                              title="클릭하여 크게 보기"
                            />
                          ) : (
                            <div className="thumbnail-placeholder">📷</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="image-placeholder"><span>📷 상품 이미지가 없습니다</span></div>
              )}
            </div>
          </div>

          <button onClick={() => navigate('/auction')} className="back-button-simple">
            ← 목록으로 돌아가기
          </button>
        </div>

        <div className="product-image-section">
          <div className="timer-section-overlay">
            <div className="timer-title">남은 시간 (경매 마감까지)</div>
            <div className="timer-display">{timeRemaining}</div>
          </div>

          <div className="room-user-count-section">
            <div className="user-count-title">
              <span className="user-icon">👥</span>현재 방 인원
            </div>
            <div className="user-count-display">
              <span className="user-count-number">{userCount}</span>
              <span className="user-count-unit">명</span>
            </div>
          </div>

          <div className="current-price-section">
            <div className="price-bid-container">
              <div className="price-info-left">
                <div className={`current-price-label ${!highestBid ? 'starting-price' : timeRemaining === '경매 종료' ? 'final-price' : ''}`}>
                  {!highestBid ? '시작가' : timeRemaining === '경매 종료' ? '낙찰가' : '현재 최고가'}
                </div>
                <div className={`current-price-value ${!highestBid ? 'starting-price-value' : timeRemaining === '경매 종료' ? 'final-price-value' : ''}`}>
                  {formatPrice(getCurrentPrice())}
                </div>
              </div>

              <div className="bid-history-right">
                <div className="bid-history-title">
                  {timeRemaining === '경매 종료' ? '최종 입찰 기록' : '최근 입찰 기록'}
                </div>

                {highestBid && timeRemaining !== '경매 종료' ? (
                  <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#d4a574', marginBottom: '3px' }}>
                      🎉 최고 입찰자: {highestBidderNickname || `ID ${highestBid.bidderId}`} 🎉
                    </div>
                    <div style={{ fontSize: '14px', color: '#8b7355' }}>
                      입찰 시간: {formatDate(highestBid.bidTime)}
                    </div>
                  </div>
                ) : timeRemaining === '경매 종료' && auctionDetail?.winnerId ? (
                  <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#d4a574', marginBottom: '3px' }}>
                      🎉 낙찰자: {winnerNickname || `ID ${auctionDetail.winnerId}`} 🎉
                    </div>
                    <div style={{ fontSize: '14px', color: '#8b7355' }}>
                      경매가 성공적으로 종료되었습니다!
                    </div>
                  </div>
                ) : timeRemaining === '경매 종료' && !auctionDetail?.winnerId ? (
                  <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e74c3c', marginBottom: '3px' }}>
                      유찰
                    </div>
                    <div style={{ fontSize: '14px', color: '#8b7355' }}>
                      입찰자가 없어 경매가 유찰되었습니다.
                    </div>
                  </div>
                ) : null}

                <div className="bid-history-list">
                  {bidHistory.length > 0 ? (
                    bidHistory.map((bid, index) => {
                      console.log(`🎯 입찰 기록 렌더링 ${index + 1}번:`, bid);
                      return (
                        <div key={bid.id || `bid-${index}-${bid.bidTime}-${bid.bidderName}`} className="bid-history-item">
                          <span className="bidder-name">{bid.bidderName}</span>
                          <span className="bid-amount">{formatPrice(bid.bidAmount)}</span>
                          <span className="bid-time">{getTimeAgo(bid.bidTime)}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-bid-history">
                      <span style={{ color: '#6c757d', fontStyle: 'italic' }}>아직 입찰 기록이 없습니다</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bid-amount-buttons">
              {timeRemaining !== '경매 종료' ? (
                <>
                  <button className="amount-btn" onClick={() => handleAmountClick(100)}>+100</button>
                  <button className="amount-btn" onClick={() => handleAmountClick(1000)}>+1,000</button>
                  <button className="amount-btn" onClick={() => handleAmountClick(10000)}>+1만</button>
                  <button className="amount-btn" onClick={() => handleAmountClick(100000)}>+10만</button>
                  <button className="amount-btn" onClick={() => handleAmountClick(1000000)}>+100만</button>
                </>
              ) : (
                <div style={{ color: '#8b7355', fontSize: '14px', fontStyle: 'italic' }}>
                  경매가 종료되었습니다
                </div>
              )}
            </div>

            <div className="bid-input-section">
              {timeRemaining !== '경매 종료' ? (
                <>
                  <input
                    type="text"
                    className="bid-amount-input"
                    value={(bidAmount > 0 ? bidAmount : getCurrentPrice()).toLocaleString()}
                    onChange={handleBidAmountChange}
                    placeholder="입찰 금액"
                  />
                  <button className="bid-button-small" onClick={handleBidSubmit}>
                    <img src="/pan.png" alt="팬" style={{ width: 16, height: 16, marginRight: 6, verticalAlign: 'middle' }} />
                    입찰
                  </button>
                </>
              ) : (
                <div style={{ color: '#8b7355', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>
                  입찰이 마감되었습니다
                </div>
              )}
            </div>

            <div className="toast-message-area">
              {bidMessage && <div className={`bid-message ${bidMessageType}`}>{bidMessage}</div>}
            </div>

            <div style={{ marginTop: 20, textAlign: 'center', minHeight: 56 }}>
              {(() => {
                const condition1 = timeRemaining !== '경매 종료';
                const condition2 = auctionDetail?.status === 'ON_SALE';
                const condition3 = parseInt(userInfo?.memberId) === parseInt(auctionDetail?.memberId);
                return condition1 && condition2 && condition3;
              })() && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEndAuction();
                  }}
                  style={{
                    background: '#f8d7da',
                    color: '#842029',
                    border: '1px solid #f1aeb5',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    zIndex: 9999,
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f5c2c7';
                    e.target.style.borderColor = '#e899a1';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f8d7da';
                    e.target.style.borderColor = '#f1aeb5';
                  }}
                >
                  🔚 경매 종료
                </button>
              )}
            </div>

                        {/* 💳 잔금(에스크로) 결제 버튼 — 🔚 경매 종료 버튼 “바로 아래”에 추가 */}
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              {(auctionDetail?.status === 'SOLD' &&
                String(auctionDetail?.winnerId) === String(userInfo?.memberId)) && (
                <button
                  onClick={startEscrowPayment}
                  style={{
                    background: '#d1e7dd',
                    color: '#0f5132',
                    border: '1px solid #badbcc',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#bcdad0';
                    e.target.style.borderColor = '#a6cec3';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#d1e7dd';
                    e.target.style.borderColor = '#badbcc';
                  }}
                >
                  💳 잔금(에스크로) 결제
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {imageModalOpen && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeImageModal}>✕</button>
            <div className="modal-image-container">
              {photos[modalPhotoIndex]?.photoUrl ? (
                <img
                  src={`${BASE}/auction/image/${encodeURIComponent(photos[modalPhotoIndex].photoUrl)}`}
                  alt={`상품 이미지 ${modalPhotoIndex + 1}`}
                  className="modal-image"
                />
              ) : (
                <div className="modal-image-placeholder"><span>📷 이미지를 불러올 수 없습니다</span></div>
              )}
              {photos.length > 1 && (
                <>
                  <button className="modal-nav-btn modal-prev-btn" onClick={prevModalPhoto} title="이전 사진" />
                  <button className="modal-nav-btn modal-next-btn" onClick={nextModalPhoto} title="다음 사진" />
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="modal-thumbnails">
                {photos.map((photo, index) => (
                  <button
                    key={`modal-photo-${photo.photo_id}-${index}`}
                    className={`modal-thumbnail-btn ${index === modalPhotoIndex ? 'active' : ''}`}
                    onClick={() => setModalPhotoIndex(index)}
                    title={`사진 ${index + 1}`}
                  >
                    <img
                      src={`${BASE}/auction/image/${encodeURIComponent(photo.photoUrl)}`}
                      alt=""
                      className="modal-thumbnail-img"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="modal-image-info">
              {modalPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <h3>비밀번호 확인</h3>
            <p>경매를 삭제하려면 비밀번호를 입력하세요.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="password-input"
            />
            <div className="modal-buttons">
              <button onClick={() => setShowPasswordModal(false)}>취소</button>
              <button onClick={handleDeleteWithPassword} disabled={deleteLoading}>
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-card">
            <div className="payment-modal-header">
              <div className="payment-modal-icon">🏆</div>
              <h2 className="payment-modal-title">보증금 결제</h2>
              <p className="payment-modal-subtitle">
                경매 참여를 위해 시작가의 10% 보증금을 결제해주세요.
              </p>
            </div>
            
            <div className="payment-modal-details">
              <div className="payment-modal-amount">
                <span className="payment-modal-amount-label">보증금</span>
                <span className="payment-modal-amount-value">{paymentAmount.toLocaleString()}원</span>
              </div>
              
              <div className="payment-modal-info">
                <div className="payment-modal-info-item">
                  <span className="payment-modal-info-label">경매 제목</span>
                  <span className="payment-modal-info-value">{auctionDetail?.title}</span>
                </div>
                <div className="payment-modal-info-item">
                  <span className="payment-modal-info-label">시작가</span>
                  <span className="payment-modal-info-value">{auctionDetail?.price?.toLocaleString()}원</span>
                </div>
                <div className="payment-modal-info-item">
                  <span className="payment-modal-info-label">입찰 금액</span>
                  <span className="payment-modal-info-value highlight">{bidAmount.toLocaleString()}원</span>
                </div>
                <div className="payment-modal-info-item">
                  <span className="payment-modal-info-label">결제 수단</span>
                  <span className="payment-modal-info-value">KG이니시스 (카드)</span>
                </div>
              </div>
            </div>
            
            <div className="payment-modal-footer">
              <button
                className="payment-modal-confirm-btn"
                onClick={() => {
                  setIsProcessingPayment(true);
                  setShowPaymentModal(false);
                }}
              >
                <span className="btn-icon">💳</span>
                결제 진행
              </button>
              <button className="payment-modal-cancel-btn" onClick={handlePaymentCancel}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {isProcessingPayment && (
        <PortOnePayment
          postId={parseInt(postId, 10)}
          memberId={userInfo?.memberId}
          amount={paymentAmount}
          merchantUid={paymentMerchantUid}
          onPaymentComplete={handlePaymentComplete}
          onPaymentCancel={handlePaymentCancel}
        />
      )}

            {/* 잔금(에스크로) 결제창 */}
      {isProcessingEscrow && (
        <PortOnePayment
          mode="ESCROW"
          postId={parseInt(postId, 10)}
          memberId={userInfo?.memberId}
          amount={escrowAmount}
          merchantUid={escrowMerchantUid}
          onPaymentComplete={handleEscrowComplete}
          onPaymentCancel={handleEscrowCancel}
        />
      )}

    </div>
  );
};

export default AuctionDetail;

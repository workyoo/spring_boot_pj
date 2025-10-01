
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MainPage.css'
import api from '../lib/api'

const MainPage = () => {
  const navigate = useNavigate()
  const [sortType, setSortType] = useState('time') // 'time' 또는 'bidders'
  const [currentPage, setCurrentPage] = useState(1)
  const [auctionItems, setAuctionItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const itemsPerPage = 8 // 한 페이지당 8개 아이템으로 변경

  // API에서 경매 데이터 가져오기
  const fetchAuctionItems = async (sort = 'time') => {
    try {
      setLoading(true)
      const response = await api.get(`/auction?sort=${sort}`)
      console.log('🔍 경매 데이터 응답:', response.data)

      // 각 경매 상품의 사진 정보 가져오기
      const itemsWithPhotos = await Promise.all(
        response.data.map(async (item) => {
          try {
            console.log(`🔍 ${item.postId}번 상품 사진 정보 가져오기 시작`)
            console.log(`🔍 API 호출 URL: /auction/photos/${item.postId}`)

            const photoResponse = await api.get(`/auction/photos/${item.postId}`)
            console.log(`🔍 ${item.postId}번 상품 사진 응답 상태:`, photoResponse.status)
            console.log(`🔍 ${item.postId}번 상품 사진 응답 데이터:`, photoResponse.data)
            console.log(`🔍 ${item.postId}번 상품 사진 응답 데이터 타입:`, typeof photoResponse.data)
            console.log(`🔍 ${item.postId}번 상품 사진 응답 데이터 길이:`, photoResponse.data?.length)

            if (photoResponse.data && photoResponse.data.length > 0) {
              // isMain이 true인 사진을 우선적으로 선택, 없으면 첫 번째 사진 사용
              const mainPhoto = photoResponse.data.find(photo => photo.isMain === true) || photoResponse.data[0]
              console.log(`🔍 ${item.postId}번 상품 선택된 사진:`, mainPhoto)
              item.image = mainPhoto.photoUrl
              console.log(`✅ ${item.postId}번 상품 이미지 설정:`, item.image, `(isMain: ${mainPhoto.isMain})`)
            } else {
              console.log(`⚠️ ${item.postId}번 상품 사진 없음`)
            }
            return item
          } catch (photoErr) {
            console.error(`❌ 사진 로딩 실패 (postId: ${item.postId}):`, photoErr)
            console.error(`❌ 에러 상세:`, photoErr.response?.data)
            console.error(`❌ 에러 상태:`, photoErr.response?.status)
            return item
          }
        })
      )

      console.log('🔍 최종 경매 아이템들:', itemsWithPhotos)
      setAuctionItems(itemsWithPhotos)
      setError(null)
    } catch (err) {
      console.error('경매 데이터 로딩 실패:', err)
      setError('경매 데이터를 불러오는데 실패했습니다.')
      setAuctionItems([])
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAuctionItems(sortType)
  }, [sortType])



  const handleSortByTime = () => {
    setSortType('time')
    setCurrentPage(1) // 정렬 변경 시 첫 페이지로 이동
  }

  const handleSortByBidders = () => {
    setSortType('bidders')
    setCurrentPage(1) // 정렬 변경 시 첫 페이지로 이동
  }

  // 입찰하기 버튼 클릭 시 상세페이지로 이동
  const handleBidClick = (postId) => {
    navigate(`/auction/detail/${postId}`)
  }

  const handleNextPage = () => {
    const totalPages = Math.ceil(auctionItems.length / itemsPerPage)
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // 현재 페이지의 아이템들 계산
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = auctionItems.slice(startIndex, endIndex)

  const totalPages = Math.ceil(auctionItems.length / itemsPerPage)

  // 로딩 중이거나 에러가 있을 때 표시
  if (loading) {
    return (
      <div className="main-page">
        <div className="container">
          <div className="main-header">
            <h1 className="main-title">인기 경매 상품</h1>
            <p className="main-subtitle">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="main-page">
        <div className="container">
          <div className="main-header">
            <h1 className="main-title">인기 경매 상품</h1>
            <p className="main-subtitle" style={{ color: 'red' }}>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-page">
      <div className="container">
        {/* 헤더 섹션 */}
        <div className="main-header">
          <h1 className="main-title">인기 경매 상품</h1>
          <p className="main-subtitle">지금 가장 인기있는 경매 상품들을 확인해보세요</p>
        </div>

        {/* 정렬 버튼 */}
        <div className="sort-buttons">
          <button
            className={`sort-btn ${sortType === 'time' ? 'active' : ''}`}
            onClick={handleSortByTime}
          >
            종료시간 빠른순
          </button>
          <button
            className={`sort-btn ${sortType === 'bidders' ? 'active' : ''}`}
            onClick={handleSortByBidders}
          >
            입찰자수 많은순
          </button>
        </div>

        {/* 경매 상품 컨테이너 */}
        <div className="auction-container">
          <div className="auction-grid">
            {currentItems.map((item) => (
              <div
                key={item.postId}
                className="auction-card"
                onClick={() => handleBidClick(item.postId)}
                style={{ cursor: 'pointer' }}
              >
                <div className="main-auction-image">
                  {console.log(`🔍 ${item.postId}번 상품 렌더링 - image:`, item.image)}
                  <img
                    src={
                      item.image ?
                        `http://localhost:4989/postphoto/${item.image}` :
                        "https://via.placeholder.com/200x150/3498db/ffffff?text=No+Image"
                    }
                    alt={item.title}
                    onError={(e) => {
                      console.log(`❌ 이미지 로드 실패:`, e.target.src)
                      // 무한 루프 방지: 이미 placeholder 이미지인 경우 더 이상 교체하지 않음
                      if (!e.target.src.includes('placeholder.com')) {
                        e.target.src = "https://via.placeholder.com/200x150/3498db/ffffff?text=No+Image";
                        e.target.onerror = null; // onError 이벤트 제거
                      }
                    }}
                    onLoad={(e) => {
                      console.log(`✅ 이미지 로드 성공:`, e.target.src)
                      // 이미지 로드 성공 시 로딩 상태 표시 제거
                      e.target.style.opacity = '1';
                    }}
                    style={{
                      opacity: 0,
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                  />
                  <div className="main-auction-badge">
                    <span className="bidders-count">{item.bidderCount || 0}명</span>
                  </div>
                </div>
                <div className="auction-info">
                  <h3 className="auction-title">{item.title}</h3>
                  <div className="auction-price">
                    <span className="main-current-price">₩{item.price?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="auction-time">
                    <span className="end-time">
                      종료: {item.auctionEndTime ?
                        new Date(item.auctionEndTime).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '미정'}
                    </span>
                  </div>
                  <button
                    className="main-bid-button"
                    onClick={(e) => {
                      e.stopPropagation() // 이벤트 전파 방지
                      handleBidClick(item.postId)
                    }}
                  >
                    입찰하기
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 버튼 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn prev-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                이전
              </button>
              <span className="page-info">
                {currentPage} / {totalPages} (총 {auctionItems.length}개)
              </span>
              <button
                className="page-btn next-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MainPage
import React, { useState } from 'react';
import axios from 'axios';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, postId, reviewerId, reviewOppositeId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5); // 초기값을 5점으로 설정
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // props 로깅 추가
  console.log('ReviewModal props:', {
    isOpen,
    postId,
    reviewerId,
    reviewOppositeId,
    reviewOppositeIdType: typeof reviewOppositeId
  });

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }
    if (!comment.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    // 필수 데이터 검증
    if (!postId) {
      alert('게시글 정보가 없습니다.');
      return;
    }
    if (!reviewerId) {
      alert('후기 작성자 정보가 없습니다.');
      return;
    }
    if (!reviewOppositeId) {
      alert('후기 대상자 정보가 없습니다.');
      return;
    }

    // 전송할 데이터 로깅
    const requestData = {
      postId: postId,
      reviewerId: reviewerId,
      reviewOppositeId: reviewOppositeId,
      rating: rating,
      comment: comment.trim()
    };
    
    console.log('=== 후기 전송 데이터 상세 로그 ===');
    console.log('postId:', postId, '타입:', typeof postId);
    console.log('reviewerId:', reviewerId, '타입:', typeof reviewerId);
    console.log('reviewOppositeId:', reviewOppositeId, '타입:', typeof reviewOppositeId);
    console.log('rating:', rating, '타입:', typeof rating);
    console.log('comment:', comment.trim(), '타입:', typeof comment);
    console.log('전체 requestData:', requestData);
    console.log('JSON.stringify(requestData):', JSON.stringify(requestData));

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:4989/review/create', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert('후기가 성공적으로 작성되었습니다.');
        onReviewSubmitted();
        onClose();
      } else {
        alert('후기 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('후기 작성 오류:', error);
      console.error('에러 상세 정보:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      if (error.response?.data?.message) {
        alert(`후기 작성 실패: ${error.response.data.message}`);
      } else if (error.response?.status === 500) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('후기 작성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <div className="review-modal-header">
          <h3>후기 작성</h3>
          <button className="review-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="review-modal-content">
          <div className="review-rating-section">
            <label>평점</label>
            <div className="rating-slider-container">
              <div className="rating-labels">
                <span>1점</span>
                <span>10점</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="rating-slider"
              />
              <div className="rating-value">
                {rating}점
              </div>
            </div>
            <div className="rating-text">
              {rating > 0 ? `${rating}점` : '별점을 선택해주세요 (1~10점)'}
            </div>
          </div>
          
          <div className="review-comment-section">
            <label>후기 내용</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="거래에 대한 후기를 작성해주세요..."
              rows="5"
              maxLength="500"
            />
            <div className="comment-length">
              {comment.length}/500
            </div>
          </div>
        </div>
        
        <div className="review-modal-footer">
          <button 
            className="review-submit-btn" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '작성 중...' : '후기 작성'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

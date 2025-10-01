import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Rating,
    Chip,
    Avatar,
    Grid,
    Paper,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ReviewSection = ({ userInfo }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userInfo: authUserInfo } = useContext(AuthContext);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);

            // 현재 로그인한 사용자의 memberId 가져오기
            const currentUserId = authUserInfo?.memberId;
            console.log('🔍 ReviewSection - 현재 사용자 ID:', currentUserId);

            if (!currentUserId) {
                setError('사용자 정보를 가져올 수 없습니다.');
                setLoading(false);
                return;
            }

            // review_opposite_id가 현재 로그인한 사용자인 후기들을 가져오기
            const response = await axios.get(`http://localhost:4989/post/reviews/test?memberId=${currentUserId}`);
            console.log('받은 후기들:', response.data);

            if (response.data.success) {
                setReviews(response.data.reviews);
            } else {
                setError('후기를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('후기 조회 오류:', error);
            if (error.response?.status === 401) {
                setError('인증이 만료되었습니다. 다시 로그인해주세요.');
            } else {
                setError('후기를 불러오는 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRatingColor = (rating) => {
        if (rating >= 8) return 'success';
        if (rating >= 6) return 'warning';
        return 'error';
    };

    const getRatingText = (rating) => {
        if (rating >= 9) return '매우 만족';
        if (rating >= 7) return '만족';
        if (rating >= 5) return '보통';
        if (rating >= 3) return '불만족';
        return '매우 불만족';
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (reviews.length === 0) {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    아직 받은 후기가 없습니다
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    다른 사용자들이 작성한 후기가 여기에 표시됩니다.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                받은 후기 ({reviews.length}개)
            </Typography>

            <Grid container spacing={3}>
                {reviews.map((review) => (
                    <Grid item xs={12} md={6} key={review.review_id}>
                        <Card
                            elevation={2}
                            sx={{
                                height: '100%',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    elevation: 4,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <CardContent>
                                {/* 후기 헤더 */}
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar
                                            src={review.reviewer_profile_image}
                                            alt={review.reviewer_nickname}
                                            sx={{ width: 40, height: 40 }}
                                        >
                                            {review.reviewer_nickname?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {review.reviewer_nickname}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(review.created_at)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Chip
                                        label={getRatingText(review.rating)}
                                        color={getRatingColor(review.rating)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* 평점 */}
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Rating
                                        value={review.rating}
                                        readOnly
                                        max={10}
                                        size="small"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        ({review.rating}/10)
                                    </Typography>
                                </Box>

                                {/* 후기 내용 */}
                                <Typography variant="body1" paragraph>
                                    {review.comment}
                                </Typography>

                                {/* 관련 게시글 정보 */}
                                <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        관련 상품
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {review.post_title}
                                    </Typography>
                                    {review.post_price && (
                                        <Typography variant="body2" color="primary" fontWeight="bold">
                                            ₩{Number(review.post_price).toLocaleString()}
                                        </Typography>
                                    )}
                                </Paper>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ReviewSection;

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Radio,
    RadioGroup,
    FormControlLabel,
    Typography,
    Box,
    CircularProgress,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        margin: '16px',
    }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
    padding: '20px 24px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#495057',
    textAlign: 'center'
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    padding: '16px 24px',
    borderRadius: '8px',
    margin: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: '#f8f9fa',
        borderColor: '#3182f6',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    '&.selected': {
        backgroundColor: '#e3f0fd',
        borderColor: '#3182f6',
        boxShadow: '0 2px 8px rgba(49, 130, 246, 0.2)',
    }
}));

const InfoChip = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#e9ecef',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#6c757d',
    marginRight: '8px'
}));

const BuyerSelectionModal = ({ open, onClose, postId, token, onComplete }) => {
    const [participants, setParticipants] = useState([]);
    const [selectedBuyerId, setSelectedBuyerId] = useState('');
    const [loading, setLoading] = useState(false);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        if (open && postId) {
            fetchParticipants();
        }
    }, [open, postId]);

    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:4989/post/chatParticipants?postId=${postId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setParticipants(response.data.participants || []);
            } else {
                alert('채팅 참여자를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('채팅 참여자 조회 실패:', error);
            alert('채팅 참여자를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!selectedBuyerId) {
            alert('거래할 구매자를 선택해주세요.');
            return;
        }

        setCompleting(true);
        try {
            const response = await axios.put(
                `http://localhost:4989/post/updateStatus?postId=${postId}&status=SOLD&buyerId=${selectedBuyerId}`,
                null,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                alert('판매가 완료되었습니다!');
                console.log('BuyerSelectionModal - onComplete 호출:', {
                    selectedBuyerId,
                    selectedBuyerIdType: typeof selectedBuyerId,
                    postId
                });
                onComplete(selectedBuyerId);
                onClose();
            } else {
                alert('판매 완료 처리에 실패했습니다.');
            }
        } catch (error) {
            console.error('판매 완료 처리 실패:', error);
            alert('판매 완료 처리 중 오류가 발생했습니다.');
        } finally {
            setCompleting(false);
        }
    };

    const formatLastMessageTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return '방금 전';
        if (diffMinutes < 60) return `${diffMinutes}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return date.toLocaleDateString('ko-KR');
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <StyledDialogTitle>
                거래할 구매자를 선택해주세요
            </StyledDialogTitle>

            <DialogContent sx={{ padding: '20px 0' }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            채팅 참여자를 불러오는 중...
                        </Typography>
                    </Box>
                ) : participants.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <ChatIcon sx={{ fontSize: 48, color: '#dee2e6', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                            아직 채팅을 시작한 구매자가 없습니다.
                        </Typography>
                    </Box>
                ) : (
                    <RadioGroup
                        value={selectedBuyerId}
                        onChange={(e) => setSelectedBuyerId(e.target.value)}
                    >
                        {participants.map((participant) => (
                            <FormControlLabel
                                key={participant.memberId}
                                value={participant.memberId.toString()}
                                control={<Radio sx={{ display: 'none' }} />}
                                label={
                                    <StyledListItem
                                        className={selectedBuyerId === participant.memberId.toString() ? 'selected' : ''}
                                        onClick={() => setSelectedBuyerId(participant.memberId.toString())}
                                        sx={{ cursor: 'pointer', width: '100%', margin: 0 }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={participant.profileImage}
                                                sx={{
                                                    bgcolor: '#e3f0fd',
                                                    color: '#3182f6',
                                                    width: 48,
                                                    height: 48
                                                }}
                                            >
                                                {participant.profileImage ? null : <PersonIcon />}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {participant.nickname}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    <InfoChip>
                                                        <ChatIcon sx={{ fontSize: 14 }} />
                                                        {participant.messageCount}개 메시지
                                                    </InfoChip>
                                                    <InfoChip>
                                                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                                                        {formatLastMessageTime(participant.lastMessageTime)}
                                                    </InfoChip>
                                                </Box>
                                            }
                                        />
                                        <Radio
                                            checked={selectedBuyerId === participant.memberId.toString()}
                                            sx={{
                                                color: '#dee2e6',
                                                '&.Mui-checked': {
                                                    color: '#3182f6',
                                                },
                                            }}
                                        />
                                    </StyledListItem>
                                }
                                sx={{ margin: 0, width: '100%' }}
                            />
                        ))}
                    </RadioGroup>
                )}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ padding: '16px 24px', gap: '8px' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderColor: '#dee2e6',
                        color: '#6c757d',
                        '&:hover': {
                            borderColor: '#adb5bd',
                            backgroundColor: '#f8f9fa',
                        }
                    }}
                >
                    취소
                </Button>
                <Button
                    onClick={handleComplete}
                    variant="contained"
                    disabled={!selectedBuyerId || completing || participants.length === 0}
                    sx={{
                        backgroundColor: '#3182f6',
                        '&:hover': {
                            backgroundColor: '#2563eb',
                        },
                        '&:disabled': {
                            backgroundColor: '#e9ecef',
                            color: '#adb5bd',
                        }
                    }}
                >
                    {completing ? (
                        <>
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                            처리중...
                        </>
                    ) : (
                        '판매완료'
                    )}
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default BuyerSelectionModal;

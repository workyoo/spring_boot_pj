import React, { useContext, useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Paper,
    Menu,
    MenuItem,
    ListItemIcon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// CSS 애니메이션을 위한 스타일
const pulseKeyframes = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// 스타일 태그를 head에 추가
if (typeof document !== 'undefined') {
    const styleTag = document.createElement('style');
    styleTag.textContent = pulseKeyframes;
    if (!document.head.querySelector('style[data-pulse-animation]')) {
        styleTag.setAttribute('data-pulse-animation', 'true');
        document.head.appendChild(styleTag);
    }
}

// 기존 ChatMain.jsx에 있던 스타일들을 가져와서 재활용
const StyledDrawer = styled(Drawer)(() => ({
    '& .MuiDrawer-paper': {
        width: 320,
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
        border: 'none',
        background: '#fff'
    }
}));

const NotificationHeader = styled(Box)(() => ({
    padding: '16px 24px',
    borderBottom: '1px solid #f0f2f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff'
}));

const NotificationItem = styled(ListItem)(() => ({
    padding: '16px 24px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
        backgroundColor: '#f8f9fa'
    },
    '&:active': {
        backgroundColor: '#e3f0fd'
    }
}));

// 신고 상세 정보 모달 컴포넌트
const DeclarationDetailModal = ({ open, onClose, notification, onMarkAsRead }) => {
    if (!notification) return null;

    const handleMarkAsRead = () => {
        onMarkAsRead(notification.chatdeclarationresultId);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderBottom: 'none',
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        🚨
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            신고 결과 상세 정보
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 400 }}>
                            신고 처리 결과를 확인하세요
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="large"
                    sx={{
                        color: 'white',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            transform: 'rotate(90deg)',
                            transition: 'all 0.3s ease'
                        }
                    }}
                >
                    <CloseRoundedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: 4 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '800px' }}>
                    <Grid container spacing={3}>
                        {/* 신고 기본 정보 */}
                        <Grid item xs={12}>
                            <Box sx={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                borderRadius: 3,
                                p: 3,
                                border: '1px solid #e9ecef',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                width: '800px'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: '#007bff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2
                                    }}>
                                        <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>ℹ️</span>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#495057' }}>
                                        신고 기본 정보
                                    </Typography>
                                </Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{
                                            background: 'white',
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: '1px solid #e9ecef',
                                            height: '100%'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                color: '#6c757d',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                mb: 1
                                            }}>
                                                신고 ID
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 700,
                                                color: '#212529',
                                                fontFamily: 'monospace'
                                            }}>
                                                #{notification.chatdeclarationresultId}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{
                                            background: 'white',
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: '1px solid #e9ecef',
                                            height: '100%'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                color: '#6c757d',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                mb: 1
                                            }}>
                                                신고 유형
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 600,
                                                color: '#495057'
                                            }}>
                                                {notification.declarationType || '미분류'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{
                                            background: 'white',
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: '1px solid #e9ecef',
                                            height: '100%'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                color: '#6c757d',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                mb: 1
                                            }}>
                                                신고한 사용자
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 600,
                                                color: '#495057'
                                            }}>
                                                {notification.reportedMemberNickname || 'Unknown'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{
                                            background: 'white',
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: '1px solid #e9ecef',
                                            height: '100%'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                color: '#6c757d',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                mb: 1
                                            }}>
                                                신고 시간
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 600,
                                                color: '#495057'
                                            }}>
                                                {new Date(notification.createdAt).toLocaleString('ko-KR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

                        {/* 신고 내용 */}
                        <Grid item xs={12}>
                            <Box sx={{
                                background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                                borderRadius: 3,
                                p: 3,
                                border: '1px solid #ffeaa7',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                width: '600px'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: '#ffc107',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2
                                    }}>
                                        <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>⚠️</span>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#856404' }}>
                                        신고된 내용
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    background: 'white',
                                    p: 3,
                                    borderRadius: 2,
                                    border: '1px solid #ffeaa7',
                                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <Typography variant="body1" sx={{
                                        color: '#495057',
                                        lineHeight: 1.6,
                                        fontSize: '15px'
                                    }}>
                                        {notification.declarationContent || '신고 내용이 없습니다.'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* 조치 결과 */}
                        <Grid item xs={12}>
                            <Box sx={{
                                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                                borderRadius: 3,
                                p: 3,
                                border: '1px solid #c3e6cb',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                width: '600px'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: '#28a745',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2
                                    }}>
                                        <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>✅</span>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#155724' }}>
                                        조치 결과
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    background: 'white',
                                    p: 3,
                                    borderRadius: 2,
                                    border: '1px solid #c3e6cb',
                                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <Typography variant="body1" sx={{
                                        color: '#495057',
                                        lineHeight: 1.6,
                                        fontSize: '15px',
                                        fontWeight: 500
                                    }}>
                                        {notification.resultContent || '조치 결과가 없습니다.'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* 읽음 상태 */}
                        <Grid item xs={12}>
                            <Box sx={{
                                background: notification.isRead === 0
                                    ? 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)'
                                    : 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                                borderRadius: 3,
                                p: 3,
                                border: notification.isRead === 0 ? '1px solid #ffeaa7' : '1px solid #c3e6cb',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                width: '600px'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: notification.isRead === 0 ? '#ffc107' : '#28a745',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2
                                    }}>
                                        <span style={{
                                            color: 'white',
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {notification.isRead === 0 ? '📬' : '📭'}
                                        </span>
                                    </Box>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 600,
                                        color: notification.isRead === 0 ? '#856404' : '#155724'
                                    }}>
                                        읽음 상태
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    background: 'white',
                                    p: 3,
                                    borderRadius: 2,
                                    border: notification.isRead === 0 ? '1px solid #ffeaa7' : '1px solid #c3e6cb',
                                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Chip
                                                label={notification.isRead === 0 ? "읽지 않음" : "읽음"}
                                                color={notification.isRead === 0 ? "warning" : "success"}
                                                size="medium"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    height: '32px'
                                                }}
                                            />
                                            {notification.isRead === 0 && (
                                                <Typography variant="body2" sx={{
                                                    color: '#6c757d',
                                                    fontStyle: 'italic'
                                                }}>
                                                    클릭하여 읽음 처리할 수 있습니다.
                                                </Typography>
                                            )}
                                        </Box>
                                        {notification.isRead === 0 && (
                                            <Box sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                background: '#dc3545',
                                                animation: 'pulse 2s infinite'
                                            }} />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{
                p: 3,
                background: '#f8f9fa',
                borderTop: '1px solid #e9ecef',
                gap: 2
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        borderColor: '#6c757d',
                        color: '#6c757d',
                        '&:hover': {
                            borderColor: '#495057',
                            background: '#e9ecef'
                        }
                    }}
                >
                    닫기
                </Button>
                {notification.isRead === 0 && (
                    <Button
                        onClick={handleMarkAsRead}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0056b3 0%, #004085 100%)',
                                boxShadow: '0 6px 16px rgba(0, 123, 255, 0.4)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                        startIcon={<span style={{ fontSize: '18px' }}>✓</span>}
                    >
                        읽음 처리
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

// 문의 답변 상세 정보 모달 컴포넌트
const ContactReplyDetailModal = ({ open, onClose, notification, onMarkAsRead }) => {
    if (!notification) return null;

    const handleMarkAsRead = () => {
        if (onMarkAsRead) {
            onMarkAsRead(notification.contactId);
        }
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                borderBottom: 'none',
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        💬
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            문의 답변 상세 정보
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 400 }}>
                            문의에 대한 답변을 확인하세요
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="large"
                    sx={{
                        color: 'white',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            transform: 'rotate(90deg)',
                            transition: 'all 0.3s ease'
                        }
                    }}
                >
                    <CloseRoundedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: 4 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '800px' }}>
                    <Grid container spacing={3}>
                        {/* 문의 기본 정보 */}
                        <Grid item xs={12}>
                            <Box sx={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                borderRadius: 3,
                                p: 3,
                                border: '1px solid #e9ecef',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                width: '800px'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: '#007bff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2
                                    }}>
                                        <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>ℹ️</span>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#495057' }}>
                                        문의 기본 정보
                                    </Typography>
                                </Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{
                                            background: 'white',
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: '1px solid #e9ecef',
                                            height: '100%'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                color: '#6c757d',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                mb: 1
                                            }}>
                                                문의 유형
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                color: '#495057',
                                                fontWeight: 600,
                                                fontSize: '15px'
                                            }}>
                                                {notification.contactType || '일반 문의'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{
                                            background: 'white',
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: '1px solid #e9ecef',
                                            height: '100%'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                color: '#6c757d',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                mb: 1
                                            }}>
                                                문의 일시
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                color: '#495057',
                                                fontWeight: 600,
                                                fontSize: '15px'
                                            }}>
                                                {notification.createdAt ? new Date(notification.createdAt).toLocaleString('ko-KR') : '알 수 없음'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>

                        {/* 문의 내용 */}
                        <Grid item xs={12}>
                            <Box sx={{
                                background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                                borderRadius: 3,
                                p: 3,
                                border: '1px solid #ffeaa7',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                width: '600px'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: '#ffc107',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2
                                    }}>
                                        <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>❓</span>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#856404' }}>
                                        문의 내용
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    background: 'white',
                                    p: 3,
                                    borderRadius: 2,
                                    border: '1px solid #ffeaa7',
                                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <Typography variant="body1" sx={{
                                        color: '#495057',
                                        lineHeight: 1.6,
                                        fontSize: '15px'
                                    }}>
                                        {notification.message || '문의 내용이 없습니다.'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* 답변 내용 */}
                        <Grid item xs={12}>
                            <Box sx={{
                                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                                borderRadius: 3,
                                p: 3,
                                border: '1px solid #c3e6cb',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                width: '600px'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: '#28a745',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2,
                                    }}>
                                        <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>💬</span>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#155724' }}>
                                        답변 내용
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    background: 'white',
                                    p: 3,
                                    borderRadius: 2,
                                    border: '1px solid #c3e6cb',
                                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <Typography variant="body1" sx={{
                                        color: '#495057',
                                        lineHeight: 1.6,
                                        fontSize: '15px',
                                        fontWeight: 500
                                    }}>
                                        {notification.adminReply || '답변 내용이 없습니다.'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* 읽음 상태 */}
                        <Grid item xs={12}>
                            <Box sx={{
                                background: notification.isRead === 0
                                    ? 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)'
                                    : 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                                borderRadius: 3,
                                p: 3,
                                border: notification.isRead === 0 ? '1px solid #ffeaa7' : '1px solid #c3e6cb',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: notification.isRead === 0 ? '#ffc107' : '#28a745',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2
                                    }}>
                                        <span style={{
                                            color: 'white',
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {notification.isRead === 0 ? '📬' : '📭'}
                                        </span>
                                    </Box>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 600,
                                        color: notification.isRead === 0 ? '#856404' : '#155724'
                                    }}>
                                        읽음 상태
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    background: 'white',
                                    p: 3,
                                    borderRadius: 2,
                                    border: notification.isRead === 0 ? '1px solid #ffeaa7' : '1px solid #c3e6cb',
                                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                                    width: '550px'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Chip
                                                label={notification.isRead === 0 ? "읽지 않음" : "읽음"}
                                                color={notification.isRead === 0 ? "warning" : "success"}
                                                size="medium"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    height: '32px'
                                                }}
                                            />
                                            {notification.isRead === 0 && (
                                                <Typography variant="body2" sx={{
                                                    color: '#6c757d',
                                                    fontStyle: 'italic'
                                                }}>
                                                    클릭하여 읽음 처리할 수 있습니다.
                                                </Typography>
                                            )}
                                        </Box>
                                        {notification.isRead === 0 && (
                                            <Box sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                background: '#dc3545',
                                                animation: 'pulse 2s infinite'
                                            }} />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{
                p: 3,
                background: '#f8f9fa',
                borderTop: '1px solid #e9ecef',
                gap: 2
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        borderColor: '#6c757d',
                        color: '#6c757d',
                        '&:hover': {
                            borderColor: '#495057',
                            background: '#e9ecef'
                        }
                    }}
                >
                    닫기
                </Button>
                {notification.isRead === 0 && (
                    <Button
                        onClick={handleMarkAsRead}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #20c997 0%, #17a2b8 100%)',
                                boxShadow: '0 6px 16px rgba(40, 167, 69, 0.4)',
                                transform: 'translateY(-1px)'
                            }
                        }}
                        startIcon={<span style={{ fontSize: '18px' }}>✓</span>}
                    >
                        읽음 처리
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

// 컴포넌트 이름을 NotificationMain으로 변경
const NotificationMain = ({ open, onClose, onUnreadCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [declarationDetailOpen, setDeclarationDetailOpen] = useState(false);
    const [selectedDeclaration, setSelectedDeclaration] = useState(null);
    const [contactReplyDetailOpen, setContactReplyDetailOpen] = useState(false);
    const [selectedContactReply, setSelectedContactReply] = useState(null);

    // 우클릭 메뉴 상태
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const { userInfo, token } = useContext(AuthContext);
    const SERVER_IP = 'localhost';
    const SERVER_PORT = '4989';

    // 시간 포맷팅 함수 (채팅에서 가져온 그대로 사용)
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // 안 읽은 알림 개수 계산 함수
    const calculateAndNotifyUnreadCount = (list) => {
        console.log("=== calculateAndNotifyUnreadCount 호출 ===");
        console.log("전체 알림 목록:", list);

        // 타입별로 분류하여 로그 출력
        const chatDeclarations = list.filter(n => n.type === 'CHAT_DECLARATION');
        const contactReplies = list.filter(n => n.type === 'CONTACT_REPLY');

        console.log("채팅 신고 알림:", chatDeclarations);
        console.log("문의 답변 알림:", contactReplies);

        const totalUnreadCount = list.reduce((sum, noti) => {
            const isUnread = noti.isRead === 0;
            console.log(`알림 ${noti.type || 'UNKNOWN'} (ID: ${noti.contactId || noti.chatdeclarationresultId}): isRead=${noti.isRead}, 읽지않음=${isUnread}`);
            return sum + (isUnread ? 1 : 0);
        }, 0);

        console.log("총 읽지 않은 알림 개수:", totalUnreadCount);
        console.log("onUnreadCountChange 함수 존재 여부:", !!onUnreadCountChange);

        if (onUnreadCountChange) {
            console.log("onUnreadCountChange 호출:", totalUnreadCount);
            onUnreadCountChange(totalUnreadCount);
        }
    };

    // 알림 목록을 가져오는 함수 (채팅 신고 + 문의 답변)
    const fetchNotifications = () => {
        console.log("=== fetchNotifications 호출 ===");
        console.log("userInfo:", userInfo);
        console.log("token:", token);

        if (!userInfo || !userInfo.memberId) {
            console.log("userInfo 또는 memberId가 없습니다.");
            setNotifications([]);
            return;
        }

        if (!token) {
            console.error("토큰이 없습니다.");
            setNotifications([]);
            calculateAndNotifyUnreadCount([]);
            return;
        }

        console.log("토큰 검증 통과, API 호출 시작...");

        // 채팅 신고 알림과 문의 답변 알림을 모두 가져오기
        const promises = [
            // 채팅 신고 알림
            axios.get(`http://${SERVER_IP}:${SERVER_PORT}/api/chat-declarations/result-notifications?resultMemberId=${userInfo.memberId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            // 문의 답변 알림 (새로 추가)
            axios.get(`http://${SERVER_IP}:${SERVER_PORT}/api/contact/notifications?memberId=${userInfo.memberId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ];

        Promise.all(promises)
            .then(([chatDeclarationsRes, contactRes]) => {
                console.log("API 호출 성공!");
                let allNotifications = [];

                // 채팅 신고 알림 처리
                if (Array.isArray(chatDeclarationsRes.data)) {
                    const chatNotifications = chatDeclarationsRes.data
                        .filter(n => n && n.createdAt)
                        .map(n => ({ ...n, type: 'CHAT_DECLARATION' }));
                    allNotifications.push(...chatNotifications);
                    console.log("채팅 신고 알림 개수:", chatNotifications.length);
                }

                // 문의 답변 알림 처리
                if (Array.isArray(contactRes.data)) {
                    console.log("원본 문의 답변 데이터:", contactRes.data);
                    const contactNotifications = contactRes.data
                        .filter(n => n && (n.createdAt || n.updatedAt))
                        .map(n => {
                            const mapped = {
                                ...n,
                                type: 'CONTACT_REPLY',
                                createdAt: n.createdAt || n.updatedAt, // createdAt이 없으면 updatedAt 사용
                                isRead: n.isRead !== undefined ? n.isRead : 0 // isRead가 없으면 0으로 설정
                            };
                            console.log(`문의 ${n.contactId} 매핑 결과:`, mapped);
                            return mapped;
                        });
                    allNotifications.push(...contactNotifications);
                    console.log("문의 답변 알림 개수:", contactNotifications.length);
                    console.log("문의 답변 알림 상세:", contactNotifications);
                }

                // 모든 알림을 시간순으로 정렬
                const sortedNotifications = allNotifications.sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.updatedAt || 0);
                    const dateB = new Date(b.createdAt || b.updatedAt || 0);
                    return dateB - dateA;
                });
                console.log("전체 알림 개수:", sortedNotifications.length);

                setNotifications(sortedNotifications);
                calculateAndNotifyUnreadCount(sortedNotifications);
            })
            .catch(error => {
                console.error("알림 목록 가져오기 실패:", error);

                // 401 오류 시 토큰 만료로 간주
                if (error.response && error.response.status === 401) {
                    console.error("토큰이 만료되었거나 유효하지 않습니다.");
                    // 부모 컴포넌트에 토큰 만료 알림
                    if (onUnreadCountChange) {
                        onUnreadCountChange(-1); // -1은 토큰 만료를 의미
                    }
                }

                setNotifications([]);
                calculateAndNotifyUnreadCount([]);
            });
    };

    // 신고 결과 알림 목록 창이 열릴 때마다 목록을 다시 불러오도록 설정
    useEffect(() => {
        console.log("=== useEffect 실행 ===");
        console.log("open:", open);
        console.log("userInfo:", userInfo);
        console.log("token:", token);

        if (open && userInfo && token) {
            console.log("fetchNotifications 호출 조건 충족");
            fetchNotifications();
        } else {
            console.log("fetchNotifications 호출 조건 미충족:");
            console.log("- open:", open);
            console.log("- userInfo:", !!userInfo);
            console.log("- token:", !!token);
        }
    }, [open, userInfo, token]);

    // 우클릭 메뉴가 열려있을 때 다른 곳을 클릭하면 닫히도록 설정
    useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu !== null) {
                handleCloseContextMenu();
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [contextMenu]);

    // 알림 목록 클릭 시 모달 열기
    const handleNotificationClick = (notification) => {
        if (notification.type === 'CONTACT_REPLY') {
            // 문의 답변 알림인 경우
            handleContactReplyDetailOpen(notification);
        } else {
            // 채팅 신고 알림인 경우
            handleDeclarationDetailOpen(notification);
        }
    };



    // 신고 상세 모달 열기
    const handleDeclarationDetailOpen = (notification) => {
        setSelectedDeclaration(notification);
        setDeclarationDetailOpen(true);
    };

    // 신고 상세 모달 닫기
    const handleDeclarationDetailClose = () => {
        setDeclarationDetailOpen(false);
        setSelectedDeclaration(null);
    };

    // 문의 답변 상세 모달 열기
    const handleContactReplyDetailOpen = (notification) => {
        setSelectedContactReply(notification);
        setContactReplyDetailOpen(true);
    };

    // 문의 답변 상세 모달 닫기
    const handleContactReplyDetailClose = () => {
        setContactReplyDetailOpen(false);
        setSelectedContactReply(null);
    };

    // 신고 알림 읽음 처리
    const handleDeclarationMarkAsRead = (chatdeclarationresultId) => {
        const url = `http://${SERVER_IP}:${SERVER_PORT}/api/chat-declarations/result-notifications/${chatdeclarationresultId}/read`;

        axios.put(url, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                // 성공적으로 읽음 처리되면 상태 업데이트
                setNotifications(prevNoti => {
                    const updated = prevNoti.map(noti =>
                        noti.chatdeclarationresultId === chatdeclarationresultId ? { ...noti, isRead: 1 } : noti
                    );

                    // 즉시 읽지 않은 알림 개수 계산 및 헤더 업데이트
                    calculateAndNotifyUnreadCount(updated);

                    return updated;
                });
                // 읽음 처리 후 전체 목록 다시 불러오기
                fetchNotifications();
            })
            .catch(error => {
                console.error("신고 알림 읽음 처리 실패:", error);
            });
    };

    // 문의 답변 알림 읽음 처리
    const handleContactReplyMarkAsRead = (contactId) => {
        console.log("=== handleContactReplyMarkAsRead 호출 ===");
        console.log("contactId:", contactId);
        console.log("token:", token);

        // 문의 답변 알림 읽음 처리 API 호출
        const url = `http://${SERVER_IP}:${SERVER_PORT}/api/contact/${contactId}/read`;
        console.log("API URL:", url);

        axios.put(url, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((response) => {
                console.log("문의 답변 읽음 처리 API 성공:", response.data);

                // 성공적으로 읽음 처리되면 상태 업데이트
                setNotifications(prevNoti => {
                    const updated = prevNoti.map(noti =>
                        noti.contactId === contactId ? { ...noti, isRead: 1 } : noti
                    );
                    console.log("알림 상태 업데이트 후:", updated);

                    // 즉시 읽지 않은 알림 개수 계산 및 헤더 업데이트
                    calculateAndNotifyUnreadCount(updated);

                    return updated;
                });

                // 읽음 처리 후 전체 목록 다시 불러오기
                console.log("fetchNotifications 호출 예정");
                fetchNotifications();
            })
            .catch(error => {
                console.error("문의 답변 알림 읽음 처리 실패:", error);
                console.error("에러 응답:", error.response?.data);
                console.error("에러 상태:", error.response?.status);
            });
    };

    // 우클릭 메뉴 열기
    const handleContextMenu = (event, notification) => {
        event.preventDefault();
        setSelectedNotification(notification);
        setContextMenu(
            contextMenu === null
                ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 }
                : null
        );
    };

    // 우클릭 메뉴 닫기
    const handleCloseContextMenu = () => {
        setContextMenu(null);
        setSelectedNotification(null);
    };

    // 알림 삭제 (화면에서만 제거)
    const handleDeleteNotification = () => {
        if (selectedNotification) {
            setNotifications(prevNoti => {
                const updated = prevNoti.filter(noti => {
                    if (noti.type === 'CONTACT_REPLY') {
                        return noti.contactId !== selectedNotification.contactId;
                    } else {
                        return noti.chatdeclarationresultId !== selectedNotification.chatdeclarationresultId;
                    }
                });

                // 삭제 후 읽지 않은 알림 개수 다시 계산
                calculateAndNotifyUnreadCount(updated);
                return updated;
            });
        }
        handleCloseContextMenu();
    };



    return (
        <>
            <StyledDrawer
                anchor="right"
                open={open}
                onClose={onClose}
                ModalProps={{
                    keepMounted: true
                }}
            >
                <NotificationHeader>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#222' }}>
                        알림
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseRoundedIcon />
                    </IconButton>
                </NotificationHeader>

                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <List sx={{ p: 0 }}>
                        {notifications && Array.isArray(notifications) && notifications.length > 0 ? (
                            notifications.map((noti, index) => {
                                if (!noti) return null;

                                // 문의 답변 알림인지 확인
                                if (noti.type === 'CONTACT_REPLY') {
                                    // 문의 답변 알림 표시
                                    return (
                                        <React.Fragment key={`contact-${noti.contactId}`}>
                                            <NotificationItem
                                                onClick={() => handleNotificationClick(noti)}
                                                onContextMenu={(e) => handleContextMenu(e, noti)}
                                                sx={{ position: 'relative' }}
                                            >
                                                <ListItemAvatar>
                                                    <Box sx={{ position: 'relative' }}>
                                                        <Avatar sx={{
                                                            width: 48,
                                                            height: 48,
                                                            bgcolor: '#d4edda',
                                                            fontSize: '20px'
                                                        }}>
                                                            💬
                                                        </Avatar>
                                                    </Box>
                                                </ListItemAvatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222' }}>
                                                            문의 답변 완료
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#666', fontSize: '12px' }}>
                                                            {formatTime(noti.updatedAt)}
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#155724',
                                                            fontSize: '13px',
                                                            fontWeight: 500,
                                                            mb: 0.5,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            maxWidth: 200
                                                        }}
                                                    >
                                                        💬 문의 답변 완료
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#666',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                maxWidth: 180,
                                                                fontSize: '14px',
                                                                fontWeight: noti.isRead === 0 ? 'bold' : 'normal',
                                                            }}
                                                        >
                                                            문의 "{noti.subject}"에 대한 답변이 등록되었습니다.
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {noti.isRead === 0 && (
                                                                <Chip
                                                                    label="N"
                                                                    size="small"
                                                                    sx={{
                                                                        height: 20,
                                                                        minWidth: 20,
                                                                        fontSize: '11px',
                                                                        fontWeight: 600,
                                                                        backgroundColor: '#28a745',
                                                                        color: '#fff'
                                                                    }}
                                                                />
                                                            )}

                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </NotificationItem>
                                            {index < notifications.length - 1 && (
                                                <Divider sx={{ mx: 3 }} />
                                            )}
                                        </React.Fragment>
                                    );
                                }

                                // 후기 알림인지 신고 알림인지 구분
                                const isReviewNotification = noti.notificationType === 'REVIEW_REQUEST';

                                if (isReviewNotification) {
                                    // 후기 알림 표시
                                    return (
                                        <React.Fragment key={noti.chatdeclarationresultId}>
                                            <NotificationItem
                                                onClick={() => handleNotificationClick(noti)}
                                                onContextMenu={(e) => handleContextMenu(e, noti)}
                                                sx={{ position: 'relative' }}
                                            >
                                                <ListItemAvatar>
                                                    <Box sx={{ position: 'relative' }}>
                                                        <Avatar sx={{
                                                            width: 48,
                                                            height: 48,
                                                            bgcolor: '#fff3cd',
                                                            fontSize: '20px'
                                                        }}>
                                                            ⭐
                                                        </Avatar>
                                                    </Box>
                                                </ListItemAvatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222' }}>
                                                            후기 작성 요청
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#666', fontSize: '12px' }}>
                                                            {formatTime(noti.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#856404',
                                                            fontSize: '13px',
                                                            fontWeight: 500,
                                                            mb: 0.5,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            maxWidth: 200
                                                        }}
                                                    >
                                                        ⭐ 후기 작성 요청
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#666',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                maxWidth: 180,
                                                                fontSize: '14px',
                                                                fontWeight: noti.isRead === 0 ? 'bold' : 'normal',
                                                            }}
                                                        >
                                                            {noti.reviewerNickname || 'Unknown'}님이 후기를 작성했습니다.
                                                            {noti.postTitle ? ` (${noti.postTitle})` : ''}
                                                            후기를 작성해주세요.
                                                        </Typography>
                                                        {noti.isRead === 0 && (
                                                            <Chip
                                                                label="N"
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    minWidth: 20,
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    backgroundColor: '#ffc107',
                                                                    color: '#fff'
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            </NotificationItem>
                                            {index < notifications.length - 1 && (
                                                <Divider sx={{ mx: 3 }} />
                                            )}
                                        </React.Fragment>
                                    );
                                } else {
                                    // 신고 알림 표시 (기존 로직)
                                    const displayMessage = noti.resultContent || '신고 조치가 완료되었습니다.';

                                    return (
                                        <React.Fragment key={noti.chatdeclarationresultId}>
                                            <NotificationItem
                                                onClick={() => handleNotificationClick(noti)}
                                                onContextMenu={(e) => handleContextMenu(e, noti)}
                                                sx={{ position: 'relative' }}
                                            >
                                                <ListItemAvatar>
                                                    <Box sx={{ position: 'relative' }}>
                                                        <Avatar sx={{
                                                            width: 48,
                                                            height: 48,
                                                            bgcolor: '#e3f0fd',
                                                            fontSize: '20px'
                                                        }}>
                                                            🚨
                                                        </Avatar>
                                                    </Box>
                                                </ListItemAvatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#222' }}>
                                                            {noti.reportedMemberNickname || 'Unknown'}님 신고
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#666', fontSize: '12px' }}>
                                                            {formatTime(noti.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                    {/* 신고 유형 표시 */}
                                                    {noti.declarationType && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#4A90E2',
                                                                fontSize: '13px',
                                                                fontWeight: 500,
                                                                mb: 0.5,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                maxWidth: 200
                                                            }}
                                                        >
                                                            🚨 {noti.declarationType}
                                                        </Typography>
                                                    )}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#666',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                maxWidth: 180,
                                                                fontSize: '14px',
                                                                fontWeight: noti.isRead === 0 ? 'bold' : 'normal',
                                                            }}
                                                        >
                                                            {displayMessage}
                                                        </Typography>
                                                        {noti.isRead === 0 && (
                                                            <Chip
                                                                label="N"
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    minWidth: 20,
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    backgroundColor: '#3182f6',
                                                                    color: '#fff'
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            </NotificationItem>
                                            {index < notifications.length - 1 && (
                                                <Divider sx={{ mx: 3 }} />
                                            )}
                                        </React.Fragment>
                                    );
                                }
                            })
                        ) : (
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 200,
                                color: '#666'
                            }}>
                                <Typography variant="body2">
                                    알림이 없습니다.
                                </Typography>
                            </Box>
                        )}
                    </List>
                </Box>
            </StyledDrawer>

            {/* 신고 상세 정보 모달 */}
            <DeclarationDetailModal
                open={declarationDetailOpen}
                onClose={handleDeclarationDetailClose}
                notification={selectedDeclaration}
                onMarkAsRead={handleDeclarationMarkAsRead}
            />

            {/* 문의 답변 상세 정보 모달 */}
            <ContactReplyDetailModal
                open={contactReplyDetailOpen}
                onClose={handleContactReplyDetailClose}
                notification={selectedContactReply}
                onMarkAsRead={handleContactReplyMarkAsRead}
            />

            {/* 우클릭 컨텍스트 메뉴 */}
            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        minWidth: 150
                    }
                }}
            >
                <MenuItem onClick={handleDeleteNotification} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <DeleteOutlineIcon fontSize="small" sx={{ color: '#dc3545' }} />
                    </ListItemIcon>
                    <Typography sx={{ color: '#dc3545', fontWeight: 500 }}>
                        삭제
                    </Typography>
                </MenuItem>
            </Menu>
        </>
    );
};

export default NotificationMain;
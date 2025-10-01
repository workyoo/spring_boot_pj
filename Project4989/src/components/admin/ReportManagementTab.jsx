import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import api from '../../lib/api';

const ReportManagementTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('신고 목록 조회 시작...');
      
      // 토큰 확인
      const token = localStorage.getItem('accessToken') || localStorage.getItem('jwtToken');
      if (!token) {
        setSnackbar({
          open: true,
          message: '로그인이 필요합니다.',
          severity: 'error'
        });
        return;
      }
      
      // 백엔드의 실제 API 엔드포인트 사용
      const response = await api.get('/post/reports');
      console.log('API 응답:', response);
      if (response.data.success) {
        setReports(response.data.reports);
        console.log('신고 목록 설정됨:', response.data.reports);
      } else {
        console.log('API 응답이 성공이 아님:', response.data);
      }
    } catch (error) {
      console.error('신고 목록 조회 실패:', error);
      console.error('에러 상세:', error.response?.data);
      
      let errorMessage = '신고 목록을 불러오는데 실패했습니다.';
      if (error.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (error.response?.status === 403) {
        errorMessage = '관리자 권한이 필요합니다.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      // 토큰 확인
      const token = localStorage.getItem('accessToken') || localStorage.getItem('jwtToken');
      if (!token) {
        setSnackbar({
          open: true,
          message: '로그인이 필요합니다.',
          severity: 'error'
        });
        return;
      }
      
      // 백엔드의 실제 API 엔드포인트 사용
      const response = await api.put(`/post/reports/${reportId}/status?status=${newStatus}`);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: '신고 상태가 업데이트되었습니다.',
          severity: 'success'
        });
        // 목록 새로고침
        fetchReports();
      }
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      
      let errorMessage = '상태 업데이트에 실패했습니다.';
      if (error.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (error.response?.status === 403) {
        errorMessage = '관리자 권한이 필요합니다.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'INVESTIGATING':
        return '조사중';
      case 'RESOLVED':
        return '해결됨';
      case 'REJECTED':
        return '기각됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'INVESTIGATING':
        return 'info';
      case 'RESOLVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  const getTargetTypeText = (targetType) => {
    switch (targetType) {
      case 'POST':
        return '게시글';
      case 'MEMBER':
        return '회원';
      default:
        return targetType;
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>로딩 중...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>신고 목록</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>신고 ID</TableCell>
                  <TableCell>신고 타입</TableCell>
                  <TableCell>신고자</TableCell>
                  <TableCell>대상</TableCell>
                  <TableCell>작성자</TableCell>
                  <TableCell>신고 사유</TableCell>
                  <TableCell>신고일</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>작업(상태변경)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.reportId}>
                    <TableCell>{report.reportId}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getTargetTypeText(report.targetType)} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {report.reporterNickname || `사용자${report.reporterId}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {report.targetType === 'POST' 
                          ? (report.targetInfo ? report.targetInfo.split(' (작성자:')[0] : '알 수 없음')
                          : report.targetInfo || '알 수 없음'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {report.targetType === 'POST' 
                          ? (report.postAuthorNickname || '알 수 없음')
                          : '-'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, wordBreak: 'break-word' }}>
                        {report.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(report.status)} 
                        color={getStatusColor(report.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={report.status || 'PENDING'}
                          onChange={(e) => handleStatusChange(report.reportId, e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="PENDING">대기중</MenuItem>
                          <MenuItem value="RESOLVED">해결됨</MenuItem>
                          <MenuItem value="REJECTED">기각됨</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ReportManagementTab;

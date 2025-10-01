import React, { useState, useEffect, useContext } from 'react';
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
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Box,
  Pagination,
  InputAdornment
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import api from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import CreditTierDisplay from '../CreditTierDisplay';

const UserManagementTab = () => {
  const { userInfo } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [editForm, setEditForm] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [recalculatingTier, setRecalculatingTier] = useState(false);

  // 회원 목록 조회
  const fetchUsers = async () => {
    try {
      console.log('=== 회원 목록 조회 시작 ===');
      console.log('현재 페이지:', page);
      console.log('검색어:', searchTerm);

      setLoading(true);
      const response = await api.get(`/api/admin/members?page=${page}&search=${searchTerm}`);

      console.log('API 응답:', response);
      console.log('응답 데이터:', response.data);

      // 응답 데이터 검증 및 설정
      if (response.data && response.data.content) {
        console.log('페이징된 데이터 형식으로 처리');
        setUsers(response.data.content);
        setTotalPages(response.data.totalPages || 1);
      } else if (Array.isArray(response.data)) {
        console.log('배열 형식 데이터로 처리');
        setUsers(response.data);
        setTotalPages(1);
      } else {
        console.warn('예상치 못한 응답 형식:', response.data);
        setUsers([]);
        setTotalPages(1);
      }

      console.log('설정된 사용자 목록:', response.data.content || response.data);
      console.log('회원 목록 새로고침 완료');
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
      setSnackbar({
        open: true,
        message: '회원 목록을 불러오는데 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  // 회원 상세 정보 조회
  const handleUserDetail = async (user) => {
    try {
      const response = await api.get(`/api/admin/members/${user.memberId}`);
      setSelectedUser(response.data);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('회원 상세 정보 조회 실패:', error);
      setSnackbar({
        open: true,
        message: '회원 상세 정보를 불러오는데 실패했습니다.',
        severity: 'error'
      });
    }
  };

  // 회원 수정
  const handleEdit = (user) => {
    setEditForm({
      member_id: user.memberId,
      login_id: user.loginId,
      nickname: user.nickname,
      email: user.email,
      phone_number: user.phoneNumber || '',
      tier: user.tier
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      console.log('=== 회원 수정 시작 ===');
      console.log('수정할 데이터:', editForm);
      console.log('API 엔드포인트:', `/api/admin/members/${editForm.member_id}`);

      const response = await api.put(`/api/admin/members/${editForm.member_id}`, editForm);

      console.log('API 응답:', response);
      console.log('응답 데이터:', response.data);

      // 로그 기록
      console.log('전송할 액션 로그 데이터:', {
        adminId: userInfo.memberId,
        actionType: 'USER_UPDATE',
        targetEntityType: 'MEMBER',
        targetEntityId: editForm.member_id,
        details: '회원 정보 수정'
      });
      console.log('userInfo:', userInfo);
      console.log('userInfo.memberId:', userInfo.memberId);

      await api.post('/api/admin/action-logs', {
        adminId: userInfo.memberId,
        actionType: 'USER_UPDATE',
        targetEntityType: 'MEMBER',
        targetEntityId: editForm.member_id,
        details: '회원 정보 수정'
      });

      // 성공 메시지 표시
      setSnackbar({
        open: true,
        message: '회원 정보가 수정되었습니다.',
        severity: 'success'
      });

      // 모달 닫기
      setIsEditOpen(false);

      // 즉시 목록 새로고침
      await fetchUsers();

      // 선택된 사용자 정보도 업데이트 (상세 모달이 열려있다면)
      if (selectedUser && selectedUser.memberId === editForm.member_id) {
        try {
          const updatedUserResponse = await api.get(`/api/admin/members/${editForm.member_id}`);
          setSelectedUser(updatedUserResponse.data);
        } catch (error) {
          console.error('사용자 정보 업데이트 실패:', error);
        }
      }

      // 로컬 상태에서도 해당 사용자 정보 즉시 업데이트
      console.log('=== 로컬 상태 업데이트 시작 ===');
      console.log('현재 사용자 목록:', users);
      console.log('수정할 사용자 ID:', editForm.member_id);

      setUsers(prevUsers => {
        console.log('이전 사용자 목록:', prevUsers);

        const updatedUsers = prevUsers.map(user => {
          if (user.memberId === editForm.member_id) {
            console.log('수정할 사용자 발견:', user);
            const updatedUser = {
              ...user,
              nickname: editForm.nickname,
              email: editForm.email,
              phoneNumber: editForm.phone_number,
              tier: editForm.tier
            };
            console.log('수정된 사용자:', updatedUser);
            return updatedUser;
          }
          return user;
        });

        console.log('업데이트된 사용자 목록:', updatedUsers);

        console.log('로컬 사용자 목록 업데이트:', {
          before: prevUsers.find(u => u.memberId === editForm.member_id),
          after: updatedUsers.find(u => u.memberId === editForm.member_id),
          editForm: editForm
        });

        return updatedUsers;
      });

    } catch (error) {
      console.error('회원 수정 실패:', error);
      setSnackbar({
        open: true,
        message: '회원 정보 수정에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  // 회원 상태 변경 (밴/해제)
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const actionType = newStatus === 'BANNED' ? 'USER_BAN' : 'USER_UNBAN';
      const details = newStatus === 'BANNED' ? `밴 사유: ${banReason}` : '밴 해제';

      await api.put(`/api/admin/members/${userId}/status`, {
        status: newStatus,
        reason: banReason
      });

      // 로그 기록
      await api.post('/api/admin/action-logs', {
        adminId: userInfo.memberId,
        actionType: actionType,
        targetEntityType: 'MEMBER',
        targetEntityId: userId,
        details: details
      });

      setSnackbar({
        open: true,
        message: newStatus === 'BANNED' ? '회원이 밴되었습니다.' : '밴이 해제되었습니다.',
        severity: 'success'
      });
      setIsBanOpen(false);
      setBanReason('');
      fetchUsers();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      setSnackbar({
        open: true,
        message: '상태 변경에 실패했습니다.',
        severity: 'error'
      });
    }
  };


  // 회원 삭제
  const handleDelete = async (userId) => {
    try {
      await api.delete(`/api/admin/members/${userId}`);

      // 로그 기록
      await api.post('/api/admin/action-logs', {
        adminId: userInfo.memberId,
        actionType: 'USER_DELETE',
        targetEntityType: 'MEMBER',
        targetEntityId: userId,
        details: '회원 삭제'
      });

      setSnackbar({
        open: true,
        message: '회원이 삭제되었습니다.',
        severity: 'success'
      });
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('회원 삭제 실패:', error);
      setSnackbar({
        open: true,
        message: '회원 삭제에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'BANNED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return '활성';
      case 'BANNED': return '밴';
      default: return status;
    }
  };

  const getTierText = (tier) => {
    switch (tier) {
      case '초보상인': return '초보상인';
      case '거래꾼': return '거래꾼';
      case '장인': return '장인';
      case '마스터': return '마스터';
      case '거래왕': return '거래왕';
      default: return tier;
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">회원 관리</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchUsers}
                disabled={loading}
              >
                새로고침
              </Button>
            </Box>
          </Box>

          {/* 검색 및 필터 */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="닉네임, 이메일, 로그인 ID로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
          </Box>

          {/* 회원 목록 테이블 */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>로그인 ID</TableCell>
                  <TableCell>닉네임</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>전화번호</TableCell>
                  <TableCell>등급</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>가입일</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.memberId}>
                      <TableCell>{user.memberId || 'N/A'}</TableCell>
                      <TableCell>{user.loginId || 'N/A'}</TableCell>
                      <TableCell>{user.nickname || 'N/A'}</TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>{user.phoneNumber || '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditTierDisplay memberId={user.memberId} showDetails={false} />

                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(user.status)}
                          color={getStatusColor(user.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleUserDetail(user)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(user)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color={user.status === 'ACTIVE' ? 'warning' : 'success'}
                          onClick={() => {
                            setSelectedUser(user);
                            setIsBanOpen(true);
                          }}
                        >
                          <BlockIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      {loading ? '로딩 중...' : '데이터가 없습니다.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 페이지네이션 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* 회원 상세 정보 모달 */}
      <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>회원 상세 정보</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>ID:</strong> {selectedUser.memberId}</Typography>
              <Typography><strong>로그인 ID:</strong> {selectedUser.loginId}</Typography>
              <Typography><strong>닉네임:</strong> {selectedUser.nickname}</Typography>
              <Typography><strong>이메일:</strong> {selectedUser.email}</Typography>
              <Typography><strong>전화번호:</strong> {selectedUser.phoneNumber || '-'}</Typography>
              <Typography><strong>등급:</strong> {getTierText(selectedUser.tier)}</Typography>
              <Typography><strong>상태:</strong> {getStatusText(selectedUser.status)}</Typography>
              <Typography><strong>가입일:</strong> {new Date(selectedUser.createdAt).toLocaleString('ko-KR')}</Typography>
              <Typography><strong>수정일:</strong> {new Date(selectedUser.updatedAt).toLocaleString('ko-KR')}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 회원 수정 모달 */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>회원 정보 수정</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="닉네임"
              value={editForm.nickname || ''}
              onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="이메일"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="전화번호"
              value={editForm.phone_number || ''}
              onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>등급</InputLabel>
              <Select
                value={editForm.tier || ''}
                onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                label="등급"
              >
                <MenuItem value="초보상인">초보상인</MenuItem>
                <MenuItem value="거래꾼">거래꾼</MenuItem>
                <MenuItem value="장인">장인</MenuItem>
                <MenuItem value="마스터">마스터</MenuItem>
                <MenuItem value="거래왕">거래왕</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>취소</Button>
          <Button onClick={handleEditSubmit} variant="contained">수정</Button>
        </DialogActions>
      </Dialog>

      {/* 회원 상태 변경 모달 */}
      <Dialog open={isBanOpen} onClose={() => setIsBanOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser?.status === 'ACTIVE' ? '회원 밴' : '밴 해제'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedUser?.status === 'ACTIVE' && (
              <TextField
                fullWidth
                label="밴 사유"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                placeholder="밴 사유를 입력하세요..."
              />
            )}
            <Alert severity="warning" sx={{ mt: 2 }}>
              {selectedUser?.status === 'ACTIVE'
                ? `'${selectedUser?.nickname}' 회원을 밴하시겠습니까?`
                : `'${selectedUser?.nickname}' 회원의 밴을 해제하시겠습니까?`
              }
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBanOpen(false)}>취소</Button>
          <Button
            onClick={() => handleStatusChange(
              selectedUser?.memberId,
              selectedUser?.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE'
            )}
            variant="contained"
            color={selectedUser?.status === 'ACTIVE' ? 'warning' : 'success'}
          >
            {selectedUser?.status === 'ACTIVE' ? '밴' : '해제'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 회원 삭제 확인 모달 */}
      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <DialogTitle>회원 삭제 확인</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 2 }}>
            <strong>'{selectedUser?.nickname}'</strong> 회원을 삭제하시겠습니까?<br />
            이 작업은 되돌릴 수 없습니다.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteOpen(false)}>취소</Button>
          <Button
            onClick={() => handleDelete(selectedUser?.memberId)}
            variant="contained"
            color="error"
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserManagementTab;
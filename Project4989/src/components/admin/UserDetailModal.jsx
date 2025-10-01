import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider
} from '@mui/material';

const UserDetailModal = ({ open, onClose, user }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>회원 상세 정보</DialogTitle>
      <DialogContent>
        {user && (
          <Box>
            <Typography variant="h6" gutterBottom>{user.nickname}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              이메일: {user.email} | 가입일: {user.joinDate}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">
              회원 상세 정보가 여기에 표시됩니다...
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button color="warning" variant="outlined">계정 정지</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailModal;

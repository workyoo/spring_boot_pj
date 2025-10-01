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

const PostDetailModal = ({ open, onClose, post }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>게시글 상세 정보</DialogTitle>
      <DialogContent>
        {post && (
          <Box>
            <Typography variant="h6" gutterBottom>{post.title}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              카테고리: {post.type} | 작성자: {post.author}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">
              게시글 내용이 여기에 표시됩니다...
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button color="error" variant="outlined">게시글 삭제</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostDetailModal;

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert
} from '@mui/material';

const SystemSettingsTab = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>시스템 설정</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          시스템 설정 기능은 개발 중입니다.
        </Alert>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>일반 설정</Typography>
            <TextField
              fullWidth
              label="사이트 제목"
              variant="outlined"
              size="small"
              defaultValue="중고거래 4989!"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="관리자 이메일"
              variant="outlined"
              size="small"
              defaultValue="admin@4989.com"
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary">
              설정 저장
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>보안 설정</Typography>
            <TextField
              fullWidth
              label="세션 타임아웃 (분)"
              variant="outlined"
              size="small"
              type="number"
              defaultValue="30"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="최대 로그인 시도"
              variant="outlined"
              size="small"
              type="number"
              defaultValue="5"
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary">
              보안 설정 저장
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SystemSettingsTab;

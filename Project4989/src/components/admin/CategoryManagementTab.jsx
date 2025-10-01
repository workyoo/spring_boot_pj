import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Alert
} from '@mui/material';

const CategoryManagementTab = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>카테고리 관리</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          카테고리 추가, 수정, 삭제 기능은 개발 중입니다.
        </Alert>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>현재 카테고리</Typography>
            <List>
              <ListItem>
                <ListItemText primary="중고거래" secondary="전자제품, 의류, 가구 등" />
              </ListItem>
              <ListItem>
                <ListItemText primary="자동차" secondary="승용차, 상용차, 오토바이" />
              </ListItem>
              <ListItem>
                <ListItemText primary="부동산" secondary="아파트, 빌라, 원룸, 상가" />
              </ListItem>
              <ListItem>
                <ListItemText primary="경매" secondary="공동경매, 온라인경매" />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>카테고리 추가</Typography>
            <TextField
              fullWidth
              label="카테고리명"
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="설명"
              variant="outlined"
              size="small"
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary">
              카테고리 추가
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CategoryManagementTab;

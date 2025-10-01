import React, { useState, useContext } from 'react';
import { Box, Tabs, Tab, Typography, Container, Paper } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import ProfileSection from './ProfileSection';
import TransactionSection from './TransactionSection';
import BiddingSection from './BiddingSection';
import WishlistSection from './WishlistSection';
import PurchaseHistorySection from './PurchaseHistorySection';
import ReviewSection from './ReviewSection';
import CreditTierDisplay from '../components/CreditTierDisplay';

// 탭 패널 컴포넌트
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mypage-tabpanel-${index}`}
      aria-labelledby={`mypage-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MyPageMain = () => {
  const { userInfo } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 로그인하지 않은 경우 처리
  if (!userInfo) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            로그인이 필요합니다
          </Typography>
          <Typography variant="body1">
            마이페이지를 이용하려면 먼저 로그인해주세요.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ width: '100%' }}>
        {/* 마이페이지 제목 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            마이페이지
          </Typography>
          <Typography variant="body1" color="text.secondary">
            안녕하세요, {userInfo.nickname}님!
          </Typography>
        </Box>

        {/* 탭 네비게이션 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="마이페이지 탭"
            variant="fullWidth"
            sx={{
              width: '100%',
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                fontWeight: 500,
                minHeight: 64,
                flex: 1,
                minWidth: 'auto',
                textTransform: 'none',
              },
              '& .MuiTabs-flexContainer': {
                width: '100%',
                justifyContent: 'space-between',
              },
              '& .MuiTabs-indicator': {
                height: 3,
              }
            }}
          >
            <Tab label="회원정보" />
            <Tab label="판매 내역" />
            <Tab label="구매 내역" />
            <Tab label="입찰중" />
            <Tab label="찜한 상품" />
            <Tab label="후기" />
          </Tabs>
        </Box>

        {/* 탭 컨텐츠 */}
        <TabPanel value={tabValue} index={0}>
          <ProfileSection userInfo={userInfo} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TransactionSection userInfo={userInfo} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <PurchaseHistorySection userInfo={userInfo} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <BiddingSection userInfo={userInfo} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <WishlistSection userInfo={userInfo} />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <ReviewSection userInfo={userInfo} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default MyPageMain;

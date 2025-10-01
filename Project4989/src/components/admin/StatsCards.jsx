import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import {
  People as PeopleIcon,
  PostAdd as PostAddIcon,
  Chat as ChatIcon,
  Report as ReportIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';
import axios from 'axios';

const StatsCards = ({ stats }) => {
  const [activeChatroom, setActiveChatroom] = useState(0);
  const [chatReports, setChatReports] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [countMember, setCountMember] = useState(0);
  const [contact, setContact] = useState(0);
  useEffect(() => {
    const list = () => {
      const url = "http://localhost:4989/api/chat-declarations/count";
      axios.get(url)
        .then(async (res) => {
          setActiveChatroom(res.data.chatCnt);
          setChatReports(res.data.reportCnt);
        })
        .catch(err => {
          console.error("에러 발생:", err);
        });
    };
    list()
  }, [])

  useEffect(() => {
    const list = () => {
      const url = "http://localhost:4989/countMember";
      axios.get(url)
        .then(async (res) => {
          setCountMember(res.data);
        })
        .catch(err => {
          console.error("에러 발생:", err);
        });
    };
    list()
  }, [])

  useEffect(() => {
    const list = () => {
      const url = "http://localhost:4989/api/contact/count";
      axios.get(url)
        .then(async (res) => {
          setContact(res.data);
        })
        .catch(err => {
          console.error("에러 발생:", err);
        });
    };
    list()
  }, [])

  useEffect(() => {
    // 총 게시글 수 가져오기
    const fetchTotalPosts = () => {
      const url = "http://localhost:4989/post/total-count";
      console.log("총 게시글 수 API 호출:", url);
      axios.get(url)
        .then(res => {
          console.log("총 게시글 수 API 응답:", res.data);
          if (res.data.success) {
            setTotalPosts(res.data.totalPosts);
            console.log("설정된 총 게시글 수:", res.data.totalPosts);
          }
        })
        .catch(err => {
          console.error("총 게시글 수 조회 에러:", err);
        });
    };
    fetchTotalPosts();
  }, [])

  return (
    <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <CardContent>
            <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {countMember}
            </Typography>
            <Typography variant="body2">총 회원 수</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <CardContent>
            <PostAddIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {totalPosts}
            </Typography>
            <Typography variant="body2">총 게시글</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <CardContent>
            <ChatIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {activeChatroom}
            </Typography>
            <Typography variant="body2">활성 채팅</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <CardContent>
            <ReportIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {stats.totalReports}
            </Typography>
            <Typography variant="body2">게시글 신고 건수</Typography>
          </CardContent>

        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <CardContent>
            <FeedbackIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {chatReports}
            </Typography>
            <Typography variant="body2">채팅 신고 건수</Typography>
          </CardContent>

        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <CardContent>
            <FeedbackIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {contact}
            </Typography>
            <Typography variant="body2">문의 건수</Typography>
          </CardContent>

        </Card>
      </Grid>
    </Grid>
  );
};

export default StatsCards;

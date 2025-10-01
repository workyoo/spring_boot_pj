import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const DashboardTab = ({ recentPosts, reports, getStatusText, getStatusColor }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              최근 게시글 현황
            </Typography>
            <List>
              {recentPosts.slice(0, 5).map((post) => (
                <ListItem key={post.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: post.reports > 0 ? 'warning.main' : 'primary.main' }}>
                      {post.reports > 0 ? <WarningIcon /> : <CheckCircleIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={post.title}
                    secondary={`${post.type} • ${post.author} • 신고: ${post.reports}건`}
                  />
                  <Chip 
                    label={getStatusText(post.status)} 
                    color={getStatusColor(post.status)} 
                    size="small" 
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" />
              최근 신고 현황
            </Typography>
            <List>
              {reports.slice(0, 5).map((report) => (
                <ListItem key={report.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getStatusColor(report.status) }}>
                      {report.status === 'resolved' ? <CheckCircleIcon /> : <WarningIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`게시글 #${report.postId} 신고`}
                    secondary={`${report.reason} • ${report.reporter} • ${report.date}`}
                  />
                  <Chip 
                    label={getStatusText(report.status)} 
                    color={getStatusColor(report.status)} 
                    size="small" 
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardTab;

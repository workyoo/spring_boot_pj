import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  return (
    <Box component="footer" sx={{ 
      background: 'linear-gradient(135deg, #FFFFFF 0%, #E3F2FD 100%)', 
      borderTop: '1px solid rgba(74, 144, 226, 0.2)', 
      py: 4, 
      mt: 0,
      height: 'auto',
      width: '100%',
      minHeight: '120px',
      fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(74, 144, 226, 0.1) 50%, transparent 100%)'
      }} />
      <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Typography variant="body2" color="#5B9BD5" sx={{ 
          mb: 1.5,
          fontSize: 14,
          fontWeight: 500,
          fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif'
        }}>
          © 2025 중고거래 4989. All rights reserved.
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 3, 
          mb: 2,
          flexWrap: 'wrap'
        }}>
          <RouterLink to="/terms" style={{
            fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            padding: '6px 12px',
            borderRadius: '6px',
            textDecoration: 'none',
            color: '#5B9BD5',
            fontSize: '13px',
            display: 'inline-block',
            '&:hover': { 
              color: '#4A90E2',
              backgroundColor: 'rgba(74, 144, 226, 0.05)',
              transform: 'translateY(-1px)'
            }
          }}>
            이용약관
          </RouterLink>
          <RouterLink to="/privacy" style={{
            fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            padding: '6px 12px',
            borderRadius: '6px',
            textDecoration: 'none',
            color: '#5B9BD5',
            fontSize: '13px',
            display: 'inline-block',
            '&:hover': { 
              color: '#4A90E2',
              backgroundColor: 'rgba(74, 144, 226, 0.05)',
              transform: 'translateY(-1px)'
            }
          }}>
            개인정보처리방침
          </RouterLink>
          <RouterLink to="/contact" style={{
            fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            padding: '6px 12px',
            borderRadius: '6px',
            textDecoration: 'none',
            color: '#5B9BD5',
            fontSize: '13px',
            display: 'inline-block',
            '&:hover': { 
              color: '#4A90E2',
              backgroundColor: 'rgba(74, 144, 226, 0.05)',
              transform: 'translateY(-1px)'
            }
          }}>
            고객센터
          </RouterLink>
        </Box>
        <Typography variant="caption" color="#94A3B8" sx={{
          fontSize: 12,
          fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
          lineHeight: 1.5
        }}>
          (주)중고거래4989 | 사업자등록번호 123-45-67890 | 서울특별시 강남구 테헤란로 123
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer

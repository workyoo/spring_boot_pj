import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import './AdminTabs.css';

const ContactManagementTab = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/api/contact/admin/all');
      setContacts(response.data);
    } catch (error) {
      console.error('문의 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/contact/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('문의 통계 조회 실패:', error);
    }
  };

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await api.put(`/api/contact/admin/${contactId}/status`, { status: newStatus });
      fetchContacts();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleReply = async (contactId) => {
    if (!replyText.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('contactId', contactId);
      params.append('adminReply', replyText);

      console.log('Sending URLSearchParams - contactId:', contactId, 'adminReply:', replyText);
      console.log('contactId type:', typeof contactId);
      console.log('contactId value:', contactId);

      await api.post('/api/contact/admin/reply', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      setReplyText('');
      setSelectedContact(null);
      fetchContacts();
      alert('답변이 등록되었습니다.');
    } catch (error) {
      console.error('답변 등록 실패:', error);
      console.error('Error response:', error.response?.data);
      alert('답변 등록에 실패했습니다.');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { text: '대기중', className: 'status-pending' },
      'PROCESSING': { text: '처리중', className: 'status-processing' },
      'COMPLETED': { text: '완료', className: 'status-completed' }
    };

    const statusInfo = statusMap[status] || { text: status, className: 'status-unknown' };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (loading) {
    return <div className="admin-loading">문의 목록을 불러오는 중...</div>;
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-header">
        <h2>고객 문의 관리</h2>
        <div className="admin-stats">
          <div className="stat-item">
            <span className="stat-label">전체 문의</span>
            <span className="stat-value">{stats.totalCount || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">대기중</span>
            <span className="stat-value pending">{stats.pendingCount || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">완료</span>
            <span className="stat-value completed">{stats.completedCount || 0}</span>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="contact-list">
          <h3>문의 목록</h3>
          {contacts.length === 0 ? (
            <p className="no-data">등록된 문의가 없습니다.</p>
          ) : (
            <div className="contact-items">
              {contacts.map((contact) => (
                <div key={contact.contactId} className="contact-item">
                  <div className="contact-header">
                    <div className="contact-info">
                      <h4>{contact.subject}</h4>
                      <p className="contact-meta">
                        <span>{contact.name} ({contact.email})</span>
                        <span>{formatDate(contact.createdAt)}</span>
                      </p>
                    </div>
                    <div className="contact-actions">
                      {getStatusBadge(contact.status)}
                      <select
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact.contactId, e.target.value)}
                        className="status-select"
                      >
                        <option value="PENDING">대기중</option>
                        <option value="PROCESSING">처리중</option>
                        <option value="COMPLETED">완료</option>
                      </select>
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="reply-btn"
                      >
                        답변
                      </button>
                    </div>
                  </div>
                  <div className="contact-message">
                    <p><strong>문의 내용:</strong></p>
                    <p>{contact.message}</p>
                  </div>
                  {contact.adminReply && (
                    <div className="admin-reply">
                      <p><strong>관리자 답변:</strong></p>
                      <p>{contact.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedContact && (
          <div className="reply-modal">
            <div className="reply-modal-content">
              <h3>답변 작성</h3>
              <p><strong>문의:</strong> {selectedContact.subject}</p>
              <p><strong>내용:</strong> {selectedContact.message}</p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="답변 내용을 입력하세요..."
                rows="6"
                className="reply-textarea"
              />
              <div className="reply-actions">
                <button
                  onClick={() => handleReply(selectedContact.contactId)}
                  className="submit-reply-btn"
                >
                  답변 등록
                </button>
                <button
                  onClick={() => {
                    setSelectedContact(null);
                    setReplyText('');
                  }}
                  className="cancel-btn"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManagementTab;

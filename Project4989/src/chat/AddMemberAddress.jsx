import React, { useContext, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import { FaMapMarkerAlt } from 'react-icons/fa';

// 페이드 인 애니메이션
const fadeIn = keyframes`
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
`;

const ModalBackground = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
        background: linear-gradient(120deg, #4A90E255 0%, #00000099 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: #fff;
    padding: 36px 32px 28px 32px;
    border-radius: 18px;
        box-shadow: 0 10px 32px 0 rgba(74,144,226,0.13), 0 2px 8px rgba(0,0,0,0.08);
    min-width: 320px;
    max-width: 95vw;
    width: 420px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 22px;
    position: relative;
        animation: ${fadeIn} 0.35s ease;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 18px;
    right: 18px;
    background: none;
    border: none;
    font-size: 2rem;
        color: #4A90E2;
    cursor: pointer;
    transition: color 0.2s;
    z-index: 2;
        &:hover {
            color: #357ABD;
            transform: scale(1.1);
        }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 14px 16px;
    border: 1.5px solid #cbe3fa;
    border-radius: 10px;
    font-size: 1.08rem;
    background: #f3faff;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
    margin-bottom: 2px;
    &:focus {
        border-color: #4A90E2;
        box-shadow: 0 0 0 2px #b3d6f7;
        outline: none;
    }
`;

const AutocompleteList = styled.ul`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 10;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    list-style: none;
    margin: 8px 0 0 0;
    padding: 0;
    border: 1.5px solid #cbe3fa;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 6px 18px rgba(74,144,226,0.08);
`;

const AutocompleteItem = styled.li`
    padding: 13px 18px;
    border-bottom: 1px solid #e3f2fd;
    cursor: pointer;
    font-size: 1.01rem;
    color: #357ABD;
    transition: background 0.18s;
    &:hover {
        background: #e3f2fd;
        color: #4A90E2;
    }
    &:last-child {
        border-bottom: none;
    }
`;

const RegisterButton = styled.button`
    width: 100%;
    padding: 14px;
    background: linear-gradient(90deg, #4A90E2 60%, #5B9BD5 100%);
    color: #fff;
    font-size: 1.08rem;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(74,144,226,0.08);
    transition: background 0.2s, transform 0.1s;
    letter-spacing: 0.02em;
    &:hover {
        background: linear-gradient(90deg, #357ABD 60%, #4A90E2 100%);
        transform: scale(1.03);
    }
    &:active {
        transform: translateY(1px);
    }
`;

// `onClose` 함수를 props로 받습니다.
const AddMemberAddress = ({ onClose, onAddressSelect, onAddressAdded, mode = "member" }) => {
    const { userInfo } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedRegionId, setSelectedRegionId] = useState(null);

    // ... (기존의 useEffect와 함수 로직은 동일) ...
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            fetchSearchResults(debouncedSearchTerm);
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearchTerm]);

    const fetchSearchResults = async (keyword) => {
        try {
            const response = await fetch(`http://localhost:4989/api/regions/find?keyword=${keyword}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            } else {
                setSearchResults([]);
                console.error('검색 결과를 가져오는 데 실패했습니다.');
            }
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            setSearchResults([]);
        }
    };

    const handleResultClick = (result) => {
        const fullAddress = `${result.province || ''} ${result.city || ''} ${result.district || ''} ${result.town || ''}`.trim();
        console.log("선택된 지역 결과:", result);
        console.log("region_id:", result.region_id);
        setSearchTerm(fullAddress);
        setSelectedRegionId(result.region_id); // regionId -> region_id로 수정
        setSearchResults([]);
    };

    const handleRegisterRegion = async () => {
        if (!searchTerm || !searchTerm.trim()) {
            alert("주소를 입력해주세요.");
            return;
        }

        // member 모드 (회원 주소 DB 저장)
        if (mode === "member") {
            if (!userInfo || !userInfo.memberId) {
                alert('로그인 후 이용 가능합니다.');
                return;
            }

            if (!selectedRegionId) {
                alert('지역을 먼저 선택해주세요.');
                return;
            }

            const memberId = userInfo.memberId;

            try {
                const response = await fetch('http://localhost:4989/api/member-region/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        memberId: memberId,
                        regionId: selectedRegionId,
                    }),
                });

                if (response.ok) {
                    alert('주소 정보가 성공적으로 등록되었습니다.');
                    onClose();
                    if (onAddressAdded) onAddressAdded(); // 주소 추가 완료 후 콜백 호출
                } else {
                    const errorMessage = await response.text();
                    alert(errorMessage);
                }
            } catch (error) {
                console.error('API 호출 중 오류:', error);
                alert('서버와 통신 중 오류가 발생했습니다.');
            }
        }

        // post 모드 (게시물 등록 시 location input에 값 넣기)
        else if (mode === "post") {
            const selectedAddress = {
                locationText: searchTerm,     // 화면에 표시할 텍스트
                locationId: selectedRegionId  // 서버 전송용 숫자
            };
            console.log("AddMemberAddress - post 모드에서 선택된 주소:", selectedAddress);
            if (onAddressSelect) onAddressSelect(selectedAddress);
            onClose();
        }
    };

    return (
        <ModalBackground onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <CloseButton onClick={onClose} title="닫기">&times;</CloseButton>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                    <FaMapMarkerAlt style={{ color: '#4A90E2', fontSize: '1.5rem' }} />
                    <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#4A90E2', margin: 0, letterSpacing: '0.01em' }}>주소 등록하기</h2>
                </div>
                <div style={{ position: 'relative' }}>
                    <SearchInput
                        type="text"
                        placeholder="읍, 면, 동 단위의 주소를 검색하세요"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    {searchResults.length > 0 && (
                        <AutocompleteList>
                            {searchResults.map((result, index) => (
                                <AutocompleteItem
                                    key={index}
                                    onClick={() => handleResultClick(result)}
                                >
                                    {`${result.province || ''} ${result.city || ''} ${result.district || ''} ${result.town || ''}`.trim()}
                                </AutocompleteItem>
                            ))}
                        </AutocompleteList>
                    )}
                </div>
                <RegisterButton onClick={handleRegisterRegion}>주소 등록</RegisterButton>
            </ModalContent>
        </ModalBackground>
    );
};

export default AddMemberAddress;
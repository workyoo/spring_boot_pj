import { useEffect, useState, useRef } from 'react';
import useKakaoLoader from './useKakaoLoader.jsx';
import styled from 'styled-components';
import { Typography } from '@mui/material';

// 스타일 컴포넌트는 이전과 동일합니다.
const SearchContainer = styled.div`
  position: relative;
  width: 350px;
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
`;
const SearchInput = styled.input`
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;
const SearchButton = styled.button`
  padding: 8px 16px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background-color: #0056b3;
  }
`;
const ResultsContainer = styled.div`
  position: absolute;
  z-index: 999;
  background: white;
  border: 1px solid #ccc;
  width: calc(100% - 90px);
  max-height: 150px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  top: 40px;
`;
const ResultItem = styled.div`
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  &:hover {
    background-color: #f0f0f0;
  }
  &:last-child {
    border-bottom: none;
  }
`;
const MapContainer = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  margin-top: 20px;
`;
const RadiusControl = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
const RadiusInput = styled.input`
  width: 200px;
  margin-top: 8px;
`;


const KakaoMap = ({ mode = null, onAddressSelect }) => {
    const isKakaoLoaded = useKakaoLoader();
    const [map, setMap] = useState(null);
    const [radius, setRadius] = useState(1000);
    const [center, setCenter] = useState(null);
    const [address, setAddress] = useState('');
    const [places, setPlaces] = useState([]);
    const [marker, setMarker] = useState(null);
    // 👈 useLocation 훅을 사용하여 현재 경로를 가져옵니다.

    // 1. 지도 초기화 (이전과 동일)
    useEffect(() => {
        if (!isKakaoLoaded) return;
        const kakao = window.kakao;
        const container = document.getElementById('map');
        const initialCenter = new kakao.maps.LatLng(37.5665, 126.9780);
        const options = { center: initialCenter, level: 3 };

        const createdMap = new kakao.maps.Map(container, options);
        setMap(createdMap);
        setCenter({ lat: initialCenter.getLat(), lng: initialCenter.getLng() });

        kakao.maps.event.addListener(createdMap, 'dragend', function () {
            const newCenter = createdMap.getCenter();
            setCenter({ lat: newCenter.getLat(), lng: newCenter.getLng() });
            setAddress('');
            setPlaces([]);
        });
    }, [isKakaoLoaded]);

    // 2. 지도 요소 업데이트 (이전과 동일)
    useEffect(() => {
        if (!map || !center) return;
        const kakao = window.kakao;
        const centerLatLng = new kakao.maps.LatLng(center.lat, center.lng);

        if (marker) marker.setMap(null);
        const newMarker = new kakao.maps.Marker({
            map: map,
            position: centerLatLng,
        });
        setMarker(newMarker);

        map.panTo(centerLatLng);
    }, [map, center, radius]);

    // 3. ✨ [수정됨] 주소 검색 기능 (Geocoder 사용)
    const handleKeywordSearch = (keyword) => {
        if (!isKakaoLoaded || !keyword.trim()) {
            setPlaces([]);
            return;
        }
        const kakao = window.kakao;
        const geocoder = new kakao.maps.services.Geocoder(); // Geocoder 객체 생성

        // 주소로 좌표를 검색합니다
        geocoder.addressSearch(keyword, function (result, status) {
            if (status === kakao.maps.services.Status.OK) {
                if (result.length === 1) {
                    // 결과가 하나면 바로 지도 이동
                    //handlePlaceClick(result[0]);
                    setPlaces(result);
                } else {
                    // 결과가 여러 개면 목록 표시
                    setPlaces(result);
                }
            } else {
                setPlaces([]);
                // 필요하다면 검색 결과가 없다는 알림을 추가할 수 있습니다.
                // alert('검색 결과가 없습니다.');
            }
        });
    };

    const handleInputChange = (e) => {
        setAddress(e.target.value);
    };

    const handleSearchClick = () => {
        handleKeywordSearch(address);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // form submit 막기
            handleSearchClick();
        }
    };

    // ✨ [수정] 검색 결과 클릭 핸들러: onAddressSelect 함수를 호출하여 부모 컴포넌트로 주소 정보 전달
    const handlePlaceClick = (place) => {
        const selectedAddressInfo = {
            location: place.address_name,
            latitude: parseFloat(place.y),
            longitude: parseFloat(place.x)
        };
        setAddress(place.address_name); // ← 이거 추가
        setCenter({ lat: parseFloat(place.y), lng: parseFloat(place.x) }); // 지도 이동
        setPlaces([]); // 클릭 후 자동완성 목록 숨기기
        
        // mode가 'address-select'일 때는 onAddressSelect를 호출하지 않음
        // 주소만 텍스트창에 입력하고, 사용자가 직접 추가 버튼을 눌러야 함
        if (mode === 'address-select') {
            // 아무것도 하지 않음 - 주소만 텍스트창에 표시
            return;
        }
    };

    const handleRadiusChange = (e) => {
        setRadius(Number(e.target.value));
    };

    if (!isKakaoLoaded) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px', fontSize: '18px', color: '#666' }}>
                지도를 불러오는 중...
            </div>
        );
    }

    // ⭐ 1. DB에 직접 등록하는 함수 (mode가 'post'가 아닐 때)
    const handleDbRegister = async () => {
        if (!center || !address) {
            alert('주소를 먼저 검색하고 선택해주세요.');
            return;
        }
        try {
            const response = await fetch('http://localhost:4989/api/regions/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: address,
                    latitude: center.lat,
                    longitude: center.lng,
                }),
            });

            if (response.ok) {
                alert('주소와 좌표가 성공적으로 등록되었습니다.');
            } else {
                alert('등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('API 호출 오류:', error);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    // ⭐ 2. 부모 컴포넌트로 데이터만 전달하는 함수 (mode가 'post'일 때)
    const handlePostRegister = () => {
        if (!center || !address) {
            alert('주소를 먼저 검색하고 선택해주세요.');
            return;
        }
        const selectedAddressInfo = {
            address: address,
            latitude: center.lat,
            longitude: center.lng,
        };
        onAddressSelect?.(selectedAddressInfo, true);
    };

    return (
        <div>
            {mode==='post' && (
            <h1>희망 거래 주소</h1>
            )}
             {mode!=='post' && (
            <h1>주소 등록</h1>
            )}
            <SearchContainer>
                <SearchInput
                    type="text"
                    value={address}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="읍, 면, 동 단위의 주소를 검색하세요"
                />
                <SearchButton type="button" onClick={handleSearchClick}>검색</SearchButton>
                {/* 1. '등록' 버튼은 mode가 'post'일 때만 보입니다. */}
                {mode === 'post' && (
                    <SearchButton type="button" onClick={handlePostRegister}>등록</SearchButton>
                )}

                {/* 2. '추가' 버튼은 mode가 'post'가 아닐 때만 보입니다. */}
                {mode !== 'post' && (
                    <SearchButton type="button" onClick={handleDbRegister}>추가</SearchButton>
                )}

                {places.length > 0 && (
                    <ResultsContainer>
                        {/* ✨ [수정됨] Geocoder 결과 표시 */}
                        {places.map((place, index) => (
                            <ResultItem
                                key={`${place.address_name}-${index}`} // key를 더 고유하게 만듭니다.
                                onClick={() => handlePlaceClick(place)}
                            >
                                {place.address_name}
                            </ResultItem>
                        ))}
                    </ResultsContainer>
                )}
            </SearchContainer>

            <MapContainer id="map">
              
            </MapContainer>

        </div>
    );
};

export default KakaoMap;

import React, { useEffect } from 'react';

const DetailMap = ({ latitude, longitude }) => {
    useEffect(() => {
        // 스크립트가 이미 로드되었는지 확인합니다.
        const kakaoMapsScript = document.getElementById('kakao-maps-script');
        if (!kakaoMapsScript) {
            // 카카오맵 스크립트를 동적으로 로드합니다.
            const script = document.createElement('script');
            script.id = 'kakao-maps-script';
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&autoload=false`;
            document.head.appendChild(script);

            // 스크립트가 로드되면 지도를 초기화합니다.
            script.onload = () => {
                window.kakao.maps.load(() => {
                    initializeMap(latitude, longitude);
                });
            };
        } else {
            // 스크립트가 이미 로드된 경우, 바로 지도를 초기화합니다.
            initializeMap(latitude, longitude);
        }
    }, [latitude, longitude]);

    const initializeMap = (lat, lng) => {
        const container = document.getElementById('map'); // 지도를 담을 HTML 요소
        if (!container) return;

        const options = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 3 // 지도의 확대 레벨
        };

        const map = new window.kakao.maps.Map(container, options);

        // 마커를 생성하고 지도에 표시합니다.
        const markerPosition = new window.kakao.maps.LatLng(lat, lng);
        const marker = new window.kakao.maps.Marker({
            position: markerPosition
        });

        marker.setMap(map);
    };

    return (
        <div
            id="map"
            style={{
                width: '100%',
                height: '180px', // 높이를 더 줄여서 가로로 길게 보이도록
                minHeight: '180px',
                maxHeight: '180px',
                position: 'relative',
                overflow: 'hidden',
            }}
        ></div>
    );
};

export default DetailMap;
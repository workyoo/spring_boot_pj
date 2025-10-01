// src/components/.../useKakaoLoader.jsx
import { useEffect, useState } from 'react';

let kakaoLoaderPromise = null;

export default function useKakaoLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 이미 로드되어 있으면 load 콜백만 태우고 끝
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => setLoaded(true));
      return;
    }

    if (!kakaoLoaderPromise) {
      kakaoLoaderPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        // https 강제 + libraries=services + autoload=false
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&libraries=services&autoload=false`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.kakao.maps.load(() => resolve());
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    kakaoLoaderPromise
      .then(() => setLoaded(true))
      .catch((e) => {
        console.error('Kakao SDK load failed:', e);
      });
  }, []);

  return loaded;
}

// /src/lib/api.js
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4989';

const api = axios.create({
  baseURL: BASE,
  withCredentials: false,
});

/** ---------- 유틸: camel <-> snake ---------- */
const isPlainObject = (v) => Object.prototype.toString.call(v) === '[object Object]';

// 언더스코어로 시작하는 키(_links 등)는 변환 대상에서 제외
const toCamelKey = (s) => s.startsWith('_') ? s : s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toSnakeKey = (s) => s.startsWith('_') ? s : s.replace(/([A-Z])/g, '_$1').toLowerCase();

const keysToCamel = (input) => {
  if (Array.isArray(input)) return input.map(keysToCamel);
  if (isPlainObject(input)) {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [toCamelKey(k), keysToCamel(v)])
    );
  }
  return input;
};

const keysToSnake = (input) => {
  if (Array.isArray(input)) return input.map(keysToSnake);
  if (isPlainObject(input)) {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [toSnakeKey(k), keysToSnake(v)])
    );
  }
  return input;
};

/** ---------- 요청 인터셉터 ---------- */
api.interceptors.request.use((config) => {
  // 1) 토큰 부착 (accessToken 우선)
  const raw = localStorage.getItem('accessToken') || localStorage.getItem('jwtToken');
  if (raw) {
    const jwt = raw.replace(/^Bearer\s+/, '');
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${jwt}`;
  }

  // 2) camel -> snake (JSON/params만, FormData 제외)
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  const ctype = (config.headers?.['Content-Type'] || config.headers?.['content-type'] || '').toLowerCase();
  const isJson = !isFormData && (!ctype || ctype.includes('application/json'));

  if (config.params) config.params = keysToSnake(config.params);
  if (isJson && config.data && !isFormData) {
    config.data = keysToSnake(config.data);
  }
  return config;
});

/** ---------- 응답 인터셉터 (성공: snake -> camel) ---------- */
api.interceptors.response.use((res) => {
  if (res?.data !== undefined) res.data = keysToCamel(res.data);
  return res;
});

/** ---------- 응답 인터셉터 (에러 & 리프레시) ---------- */
let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;
    if (!response) throw error; // 네트워크 실패

    // 리프레시 요청 자체는 재시도 로직에서 제외
    if (config?._skipAuthRefresh) throw error;

    if (response.status === 401 && !config._retry) {
      config._retry = true;

      if (!refreshPromise) {
        const refreshToken = localStorage.getItem('refreshToken');

        // ⚠️ api.post 사용: 변환기 타서 { refreshToken } -> { refresh_token } 로 전송됨
        refreshPromise = api.post('/api/auth/refresh', { refreshToken }, { _skipAuthRefresh: true })
          .then((r) => {
            const newAccess = r.data?.accessToken;
            if (!newAccess) throw new Error('No accessToken returned');
            localStorage.setItem('accessToken', newAccess);
            localStorage.removeItem('jwtToken'); // 구 키 정리
            return newAccess;
          })
          .catch((e) => {
            // 갱신 실패 → 로그인 재요청
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            throw e;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;      // 리프레시 완료(또는 실패 시 throw)
      return api(config);        // 원요청 재시도(새 토큰 자동 부착)
    }

    throw error;
  }
);

/** ---------- 도메인 API ---------- */
export const chatDeclarationAPI = {
  getAllChatDeclarations: () => api.get('/api/chat-declarations/admin'),
  getChatDeclarationsForMember: (memberId) =>
    api.get('/api/chat-declarations/declarations', { params: { memberId } }),
  submitChatDeclaration: (declarationData) =>
    api.post('/api/chat-declarations/submit', declarationData),
};

export const userAPI = {
  getUserInfo: (memberId) => api.get(`/api/users/${memberId}`),
  getMultipleUsers: (memberIds) => api.post('/api/users/multiple', memberIds),
};

export { api };
export default api;

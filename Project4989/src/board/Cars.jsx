import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronUp } from 'react-icons/fa';
import './cars.css';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';

const CAR_DETAIL_URL = `${import.meta.env.VITE_API_BASE}/post/cardetail`;
const LIST_URL = `${import.meta.env.VITE_API_BASE}/post/list`;
const PHOTO_BASE = `${import.meta.env.VITE_API_BASE}/postphoto/`;

const Cars = () => {
  const [postList, setPostList] = useState([]);
  const [carDetailMap, setCarDetailMap] = useState({}); // postId -> detail
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const itemsPerPage = 12;

  // 지역 필터 상태
  const [regionFilters, setRegionFilters] = useState({
    province: '',
    city: '',
    district: '',
    town: ''
  });

  // 지역 옵션 상태
  const [regionOptions, setRegionOptions] = useState({
    provinces: [],
    cities: [],
    districts: [],
    towns: []
  });

  const navi = useNavigate('');
  const location = useLocation();

  // ---------- 유틸 ----------
  const norm = (v) => (v ?? '').toString().trim().toUpperCase();
  const toInt = (v) => {
    if (v === null || v === undefined) return null;
    const n = parseInt(v.toString().replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(n) ? null : n;
  };
  const normalizeFuel = (v) => {
    const u = norm(v);
    if (['GAS', 'GASOLINE', 'PETROL'].includes(u)) return 'GASOLINE';
    if (u === 'DIESEL') return 'DIESEL';
    if (['EV', 'ELECTRIC'].includes(u)) return 'ELECTRIC';
    if (u === 'HYBRID') return 'HYBRID';
    if (u === 'LPG') return 'LPG';
    return u || null;
  };
  const normalizeTrans = (v) => {
    const u = norm(v);
    if (['AUTO', 'AUTOMATIC', 'AT'].includes(u)) return 'AUTOMATIC';
    if (['STICK', 'MT'].includes(u)) return 'MANUAL';
    return u || null;
  };
  const STATUS_ALIAS = (v) => (norm(v) === 'SOLD' ? 'SOLD_OUT' : norm(v));
  
  // tradeType 정규화 함수 추가
  const normalizeTrade = (v) => {
    const s = (v ?? '').toString().trim();
    const u = s.toUpperCase();
    if (u === '1' || u === 'SALE'    || s === '판매') return 'SALE';
    if (u === '2' || u === 'AUCTION' || s === '경매') return 'AUCTION';
    if (u === '3' || u === 'SHARE'   || s === '나눔' || u === 'GIVE' || u === 'GIVEAWAY' || u === 'FREE') return 'SHARE';
    return u; // 혹시 다른 값이 오면 대문자 그대로
  };

  // 스크롤 위치 감지
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setShowScrollTop(scrollTop > 300);
  };

  // 최상단으로 스크롤하는 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const MILEAGE_RANGES = [
    { key: 'ALL', label: '전체', test: () => true },
    { key: '<=50000', label: '5만km 이하', test: (m) => m !== null && m <= 50000 },
    { key: '50000-100000', label: '5만~10만km', test: (m) => m !== null && m > 50000 && m <= 100000 },
    { key: '100000-150000', label: '10만~15만km', test: (m) => m !== null && m > 100000 && m <= 150000 },
    { key: '>150000', label: '15만km 이상', test: (m) => m !== null && m > 150000 },
  ];



  // ---------- 페이지 쿼리 ----------
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const page = Number(q.get('page')) || 1;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, [location.search]);

  const handlePageChange = (page) => {
    const q = new URLSearchParams(location.search);
    q.set('page', page);
    navi(`${location.pathname}?${q.toString()}`, { replace: true });
  };
  const handleNextPage = () => currentPage < totalPages && handlePageChange(currentPage + 1);
  const handlePrevPage = () => currentPage > 1 && handlePageChange(currentPage - 1);

  // ---------- 지역 데이터 로드 ----------
  useEffect(() => {
    loadProvinces();
  }, []);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // province 변경 시 city 로드
  useEffect(() => {
    if (regionFilters.province) {
      loadCities(regionFilters.province);
    } else {
      setRegionOptions(prev => ({ ...prev, cities: [], districts: [], towns: [] }));
      setRegionFilters(prev => ({ ...prev, city: '', district: '', town: '' }));
    }
  }, [regionFilters.province]);

  // city 변경 시 district 로드 (city가 없어도 district 로드)
  useEffect(() => {
    if (regionFilters.province) {
      if (regionFilters.city) {
        loadDistricts(regionFilters.province, regionFilters.city);
      } else {
        // city가 없을 때도 district 로드 (city 파라미터를 빈 문자열로 전달)
        loadDistricts(regionFilters.province, '');
      }
    } else {
      setRegionOptions(prev => ({ ...prev, districts: [], towns: [] }));
      setRegionFilters(prev => ({ ...prev, district: '', town: '' }));
    }
  }, [regionFilters.city, regionFilters.province]);

  // district 변경 시 town 로드 (district가 없어도 town 로드)
  useEffect(() => {
    if (regionFilters.province) {
      if (regionFilters.district) {
        loadTowns(regionFilters.province, regionFilters.city, regionFilters.district);
      } else {
        // district가 없을 때도 town 로드 (district 파라미터를 빈 문자열로 전달)
        loadTowns(regionFilters.province, regionFilters.city, '');
      }
    } else {
      setRegionOptions(prev => ({ ...prev, towns: [] }));
      setRegionFilters(prev => ({ ...prev, town: '' }));
    }
  }, [regionFilters.district, regionFilters.city, regionFilters.province]);

  // 지역 데이터 로드 함수들
  const loadProvinces = async () => {
    try {
      const response = await axios.get('http://localhost:4989/post/regions', {
        params: { type: 'provinces' }
      });
      if (response.data.data) {
        setRegionOptions(prev => ({ ...prev, provinces: response.data.data }));
      }
    } catch (error) {
      console.error('Province 로드 실패:', error);
    }
  };

  const loadCities = async (province) => {
    try {
      const response = await axios.get('http://localhost:4989/post/regions', {
        params: { type: 'cities', province }
      });
      if (response.data.data) {
        setRegionOptions(prev => ({ ...prev, cities: response.data.data }));
      }
    } catch (error) {
      console.error('City 로드 실패:', error);
    }
  };

  const loadDistricts = async (province, city) => {
    try {
      const response = await axios.get('http://localhost:4989/post/regions', {
        params: { type: 'districts', province, city }
      });
      if (response.data.data) {
        setRegionOptions(prev => ({ ...prev, districts: response.data.data }));
      }
    } catch (error) {
      console.error('District 로드 실패:', error);
    }
  };

  const loadTowns = async (province, city, district) => {
    try {
      const response = await axios.get('http://localhost:4989/post/regions', {
        params: { type: 'towns', province, city, district }
      });
      if (response.data.data) {
        setRegionOptions(prev => ({ ...prev, towns: response.data.data }));
      }
    } catch (error) {
      console.error('Town 로드 실패:', error);
    }
  };

  // ---------- 데이터 로드 (공통 리스트) ----------
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(LIST_URL);
        setPostList(data || []);
      } catch (e) {
        console.error('리스트 에러:', e);
      }
    })();
  }, []);

  // 지역별 필터링된 목록 호출
  const listByRegion = async () => {
    try {
      const params = {};
      if (regionFilters.province) params.province = regionFilters.province;
      if (regionFilters.city) params.city = regionFilters.city;
      if (regionFilters.district) params.district = regionFilters.district;
      if (regionFilters.town) params.town = regionFilters.town;

      const response = await axios.get('http://localhost:4989/post/listByRegion', { params });
      setPostList(response.data || []);
    } catch (error) {
      console.error("지역별 필터링 에러:", error);
      // 에러 시 전체 목록 로드
      const { data } = await axios.get(LIST_URL);
      setPostList(data || []);
    }
  };

  useEffect(() => {
    console.log("list");
    // 지역 필터가 설정되어 있으면 지역별 필터링, 아니면 전체 목록
    if (regionFilters.province || regionFilters.city || regionFilters.district || regionFilters.town) {
      listByRegion();
    } else {
      (async () => {
        try {
          const { data } = await axios.get(LIST_URL);
          setPostList(data || []);
        } catch (e) {
          console.error('리스트 에러:', e);
        }
      })();
    }
  }, [regionFilters]);

  // ---------- CARS만 추출 ----------
  const carsFromList = useMemo(() => postList.filter((p) => p.postType === 'CARS'), [postList]);

  // ---------- car detail 프리패치 ----------
  useEffect(() => {
    const needIds = carsFromList.map((c) => c.postId).filter((id) => carDetailMap[id] === undefined);
    if (!needIds.length) return;

    Promise.all(
      needIds.map((id) =>
        axios
          .get(CAR_DETAIL_URL, { params: { postId: id } })
          .then((r) => ({ id, detail: r.data }))
          .catch((e) => {
            console.warn('cardetail 실패 postId=', id, e);
            return { id, detail: null };
          }),
      ),
    ).then((res) => {
      const next = { ...carDetailMap };
      res.forEach(({ id, detail }) => (next[id] = detail));
      setCarDetailMap(next);
    });
  }, [carsFromList]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- 공통(status) + 상세(차필드) 머지 & 정규화 ----------
  const cars = useMemo(() => {
    console.log('=== 차량 데이터 처리 ===');
    console.log('carsFromList:', carsFromList.length);
    console.log('carDetailMap keys:', Object.keys(carDetailMap));
    
    const processed = carsFromList.map((p) => {
      const d = carDetailMap[p.postId] || {};
      console.log(`차량 ${p.postId} 상세 데이터:`, d);
      
      const brand = d.brand ?? d.carBrand ?? d.make ?? d.manufacturer ?? d.Brand ?? null;
      const year = d.year ?? d.modelYear ?? d.carYear ?? d.Year ?? null;
      const mileage = d.mileage ?? d.km ?? d.kms ?? d.odometer ?? d.Mileage ?? null;
      const fuel = d.fuelType ?? d.fuel ?? d.FuelType ?? null;
      const trans = d.transmission ?? d.gearbox ?? d.Transmission ?? null;
      const commonTrade = p.tradeType ?? p.trade_type ?? p.TRADE_TYPE;

      const processedCar = {
        ...p, // 사진/제목/가격/createdAt/status 등
        // 정규화 필드(필터/옵션/비교는 전부 이 값으로)
        _status: STATUS_ALIAS(p.status), // ✅ status는 공통 리스트 기준
        _brand: brand,
        _year: toInt(year),
        _mileage: toInt(mileage),
        _fuel: normalizeFuel(fuel),
        _trans: normalizeTrans(trans),
        // tradeType 정규화 추가
        tradeType: normalizeTrade(commonTrade),
      };
      
      console.log(`차량 ${p.postId} 처리 결과:`, {
        title: processedCar.title,
        _status: processedCar._status,
        _brand: processedCar._brand,
        _year: processedCar._year,
        _mileage: processedCar._mileage,
        _fuel: processedCar._fuel,
        _trans: processedCar._trans,
        tradeType: processedCar.tradeType
      });
      
      return processedCar;
    });
    
    console.log('=== 차량 데이터 처리 완료 ===');
    return processed;
  }, [carsFromList, carDetailMap]);

  // ---------- 필터 상태 ----------
  const [filters, setFilters] = useState({
    status: 'ALL',
    brand: 'ALL',
    year: 'ALL',
    mileage: 'ALL',
    fuelType: 'ALL',
    transmission: 'ALL',
    tradeType: 'ALL',
  });



  // ---------- 필터 적용 ----------
  const filteredCars = useMemo(() => {
    console.log('=== 필터링 시작 ===');
    console.log('현재 필터:', filters);
    console.log('총 차량 수:', cars.length);
    
    const filtered = cars.filter((c) => {
      // AUCTION 타입은 항상 제외
      if (normalizeTrade(c.tradeType) === 'AUCTION') {
        console.log(`❌ AUCTION 타입 제외: ${c.title} (tradeType: ${c.tradeType})`);
        return false;
      }
      
      // 상태 필터
      if (filters.status !== 'ALL') {
        if (c._status !== filters.status) {
          console.log(`❌ 상태 필터 제외: ${c.title} (상태: ${c._status}, 필터: ${filters.status})`);
          return false;
        }
      }
      
      // 브랜드 필터
      if (filters.brand !== 'ALL') {
        const carBrand = norm(c._brand || '');
        const filterBrand = norm(filters.brand);
        if (carBrand !== filterBrand) {
          console.log(`❌ 브랜드 필터 제외: ${c.title} (브랜드: ${carBrand}, 필터: ${filterBrand})`);
          return false;
        }
      }
      
      // 연식 필터
      if (filters.year !== 'ALL') {
        const currentYear = new Date().getFullYear();
        const carYear = c._year;
        
        if (!carYear) {
          console.log(`❌ 연식 필터 제외: ${c.title} (연식 정보 없음)`);
          return false;
        }
        
        let yearMatch = false;
        const yearDiff = currentYear - carYear;
        
        switch (filters.year) {
          case '5':
            yearMatch = yearDiff <= 5;
            break;
          case '10':
            yearMatch = yearDiff <= 10;
            break;
          case '15년':
            yearMatch = yearDiff <= 15;
            break;
          default:
            yearMatch = String(carYear) === String(filters.year);
        }
        
        if (!yearMatch) {
          console.log(`❌ 연식 필터 제외: ${c.title} (${carYear}년, 차이: ${yearDiff}년, 필터: ${filters.year})`);
          return false;
        }
      }
      
      // 주행거리 필터
      if (filters.mileage !== 'ALL') {
        const range = MILEAGE_RANGES.find((r) => r.key === filters.mileage);
        if (!range?.test(c._mileage)) {
          console.log(`❌ 주행거리 필터 제외: ${c.title} (주행거리: ${c._mileage}km, 필터: ${filters.mileage})`);
          return false;
        }
      }
      
      // 연료 필터
      if (filters.fuelType !== 'ALL') {
        const carFuel = c._fuel;
        const filterFuel = filters.fuelType;
        
        let fuelMatch = false;
        if (filterFuel === 'gasoline' && carFuel === 'GASOLINE') fuelMatch = true;
        else if (filterFuel === 'diesel' && carFuel === 'DIESEL') fuelMatch = true;
        else if (filterFuel === 'electric' && carFuel === 'ELECTRIC') fuelMatch = true;
        
        if (!fuelMatch) {
          console.log(`❌ 연료 필터 제외: ${c.title} (연료: ${carFuel}, 필터: ${filterFuel})`);
          return false;
        }
      }
      
      // 변속기 필터
      if (filters.transmission !== 'ALL') {
        const carTrans = c._trans;
        const filterTrans = filters.transmission;
        
        let transMatch = false;
        if (filterTrans === 'auto' && carTrans === 'AUTOMATIC') transMatch = true;
        else if (filterTrans === 'stick' && carTrans === 'MANUAL') transMatch = true;
        
        if (!transMatch) {
          console.log(`❌ 변속기 필터 제외: ${c.title} (변속기: ${carTrans}, 필터: ${filterTrans})`);
          return false;
        }
      }
      
      // 판매타입 필터
      if (filters.tradeType !== 'ALL') {
        if (normalizeTrade(c.tradeType) !== normalizeTrade(filters.tradeType)) {
          console.log(`❌ 판매타입 필터 제외: ${c.title} (tradeType: ${c.tradeType}, 필터: ${filters.tradeType})`);
          return false;
        }
      }
      
      console.log(`✅ 필터 통과: ${c.title}`);
      return true;
    });
    
    console.log('=== 필터링 완료 ===');
    console.log('필터링 후 차량 수:', filtered.length);
    console.log('========================');
    
    return filtered;
  }, [cars, filters]);

  // ---------- 페이지네이션 (필터 이후) ----------
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredCars.length / itemsPerPage)),
    [filteredCars.length, itemsPerPage],
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = useMemo(
    () => filteredCars.slice(startIndex, startIndex + itemsPerPage),
    [filteredCars, startIndex, itemsPerPage],
  );

  // ---------- 상세에서 돌아왔을 때 포커스 ----------
  useEffect(() => {
    const focusId = location.state?.focusId;
    if (!focusId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`post-${focusId}`);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'auto' });
        el.classList.add('focused-card');
        setTimeout(() => el.classList.remove('focused-card'), 700);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [postList, currentPage, location.state]);



  // ---------- 필터 핸들러 ----------
  const setAndResetPage = (updater) => {
    setCurrentPage(1);
    setFilters((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));
  };

  const onChangeStatus = (e) => setAndResetPage({ status: e.target.value });
  const onChangeBrand = (e) => setAndResetPage({ brand: e.target.value });
  const onChangeYear = (e) => setAndResetPage({ year: e.target.value });
  const onChangeMileage = (e) => setAndResetPage({ mileage: e.target.value });
  const onChangeFuel = (e) => setAndResetPage({ fuelType: e.target.value });
  const onChangeTrans = (e) => setAndResetPage({ transmission: e.target.value });
  const onChangeTradeType = (e) => setAndResetPage({ tradeType: e.target.value });
  
  // 지역 필터 변경 핸들러
  const onChangeRegion = (type, value) => {
    setCurrentPage(1);
    setRegionFilters(prev => ({ ...prev, [type]: value }));
  };
  
  // 필터 초기화 함수
  const resetFilters = () => {
    setAndResetPage({
      status: 'ALL',
      brand: 'ALL',
      year: 'ALL',
      mileage: 'ALL',
      fuelType: 'ALL',
      transmission: 'ALL',
      tradeType: 'ALL',
    });
    setRegionFilters({
      province: '',
      city: '',
      district: '',
      town: ''
    });
  };

  return (
    <div className="cars-page">
      <div className="cars-container">
        {/* 헤더 */}
        <div className="cars-header">
          <h1 className="cars-title">자동차 목록</h1>
          <p className="cars-subtitle">다양한 자동차를 찾아보세요</p>
          {/* 등록 버튼 */}
            <button type="button" className="cars-register-btn" onClick={() => {
              // 로그인 상태 체크
              const token = localStorage.getItem('jwtToken');
              if (!token || token === 'undefined' || token === 'null') {
                alert('로그인이 필요한 서비스입니다.');
                navi('/login');
                return;
              }
              // 로그인 상태면 등록 페이지로 이동
              navi('/board/post');
            }}>
              자동차 등록하기
            </button>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="cars-main-content">
          {/* 왼쪽 사이드바 - 필터 */}
          <div className="cars-sidebar">
            
            {/* 지역 필터 */}
            <div className='region-filter'>
              <div className="region-filter-group">
                
                {/* Province 선택 */}
                <div className="region-select-container">
                  <label className="region-label">시/도</label>
                  <select 
                    value={regionFilters.province} 
                    onChange={(e) => onChangeRegion('province', e.target.value)}
                    className="region-select"
                  >
                    <option value="">전체</option>
                    {regionOptions.provinces.map((province, index) => (
                      <option key={index} value={province}>{province}</option>
                    ))}
                  </select>
                </div>

                {/* City 선택 */}
                {regionFilters.province && regionOptions.cities.length > 0 && (
                  <div className="region-select-container">
                    <label className="region-label">시/군/구</label>
                    <select 
                      value={regionFilters.city} 
                      onChange={(e) => onChangeRegion('city', e.target.value)}
                      className="region-select"
                    >
                      <option value="">전체</option>
                      {regionOptions.cities.map((city, index) => (
                        <option key={index} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* District 선택 */}
                {regionFilters.province && (regionOptions.districts.length > 0 || !regionFilters.city) && (
                  <div className="region-select-container">
                    <label className="region-label">구</label>
                    <select 
                      value={regionFilters.district} 
                      onChange={(e) => onChangeRegion('district', e.target.value)}
                      className="region-select"
                    >
                      <option value="">전체</option>
                      {regionOptions.districts.map((district, index) => (
                        <option key={index} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Town 선택 */}
                {regionFilters.province && regionOptions.towns.length > 0 && (
                  <div className="region-select-container">
                    <label className="region-label">동</label>
                    <select 
                      value={regionFilters.town} 
                      onChange={(e) => onChangeRegion('town', e.target.value)}
                      className="region-select"
                    >
                      <option value="">전체</option>
                      {regionOptions.towns.map((town, index) => (
                        <option key={index} value={town}>{town}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="cars-filters">
              {/* 필터 초기화 버튼 */}
              <div className="filter-reset-container">
                <button 
                  type="button" 
                  className="filter-reset-btn" 
                  onClick={resetFilters}
                  title="모든 필터 초기화"
                >
                  필터 초기화
                </button>
              </div>

              <div className="filter-group">
                <div className="filter-label">상태</div>
                <label><input type="radio" name="status" value="ALL" checked={filters.status === 'ALL'} onChange={onChangeStatus} /> 전체</label>
                <label><input type="radio" name="status" value="ON_SALE" checked={filters.status === 'ON_SALE'} onChange={onChangeStatus} /> 판매중</label>
                <label><input type="radio" name="status" value="RESERVED" checked={filters.status === 'RESERVED'} onChange={onChangeStatus} /> 예약</label>
                <label><input type="radio" name="status" value="SOLD" checked={filters.status === 'SOLD'} onChange={onChangeStatus} /> 판매완료</label>
              </div>

              <div className="filter-group">
                <div className="filter-label">판매타입</div>
                <label><input type="radio" name="tradeType" value="ALL" checked={filters.tradeType === 'ALL'} onChange={onChangeTradeType} /> 전체</label>
                <label><input type="radio" name="tradeType" value="SALE" checked={filters.tradeType === 'SALE'} onChange={onChangeTradeType} /> 판매</label>
                <label><input type="radio" name="tradeType" value="SHARE" checked={filters.tradeType === 'SHARE'} onChange={onChangeTradeType} /> 나눔</label>
              </div>

              <div className="filter-group">
                <div className="filter-label">브랜드</div>
                <label><input type="radio" name="brand" value="ALL" checked={filters.brand === 'ALL'} onChange={onChangeBrand} /> 전체</label>
                <label><input type="radio" name="brand" value="kia" checked={filters.brand === 'kia'} onChange={onChangeBrand} /> 기아</label>
                <label><input type="radio" name="brand" value="hyundai" checked={filters.brand === 'hyundai'} onChange={onChangeBrand} /> 현대</label>
                <label><input type="radio" name="brand" value="benz" checked={filters.brand === 'benz'} onChange={onChangeBrand} /> 벤츠</label>
                <label><input type="radio" name="brand" value="audi" checked={filters.brand === 'audi'} onChange={onChangeBrand} /> 아우디</label>
                <label><input type="radio" name="brand" value="bmw" checked={filters.brand === 'bmw'} onChange={onChangeBrand} /> BMW</label>
              </div>

              <div className="filter-group">
                <div className="filter-label">연식</div>
                <label><input type="radio" name="year" value="ALL" checked={filters.year === 'ALL'} onChange={onChangeYear} /> 전체</label>
                <label><input type="radio" name="year" value="5년" checked={filters.year === '5년'} onChange={onChangeYear} /> 5년</label>
                <label><input type="radio" name="year" value="10년" checked={filters.year === '10년'} onChange={onChangeYear} /> 10년</label>
                <label><input type="radio" name="year" value="15년" checked={filters.year === '15년'} onChange={onChangeYear} /> 15년</label>
              </div>

              <div className="filter-group">
                <div className="filter-label">주행거리</div>
                {MILEAGE_RANGES.map((r) => (
                  <label key={`mileage-${r.key}`}>
                    <input type="radio" name="mileage" value={r.key} checked={filters.mileage === r.key} onChange={onChangeMileage} />
                    {r.label}
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <div className="filter-label">연료</div>
                <label><input type="radio" name="fuelType" value="ALL" checked={filters.fuelType === 'ALL'} onChange={onChangeFuel} /> 전체</label>
                <label><input type="radio" name="fuelType" value="gasoline" checked={filters.fuelType === 'gasoline'} onChange={onChangeFuel} /> 휘발유</label>
                <label><input type="radio" name="fuelType" value="diesel" checked={filters.fuelType === 'diesel'} onChange={onChangeFuel} /> 경유</label>
                <label><input type="radio" name="fuelType" value="electric" checked={filters.fuelType === 'electric'} onChange={onChangeFuel} /> 전기</label>
              </div>

              <div className="filter-group">
                <div className="filter-label">변속기</div>
                <label><input type="radio" name="transmission" value="ALL" checked={filters.transmission === 'ALL'} onChange={onChangeTrans} /> 전체</label>
                <label><input type="radio" name="transmission" value="auto" checked={filters.transmission === 'auto'} onChange={onChangeTrans} /> 오토</label>
                <label><input type="radio" name="transmission" value="stick" checked={filters.transmission === 'stick'} onChange={onChangeTrans} /> 수동</label>
              </div>
              
            </div>
          </div>

          {/* 오른쪽 메인 컨텐츠 */}
          <div className="cars-content">
            

            {/* 목록 */}
            {filteredCars.length > 0 ? (
              <>
                <div className="cars-grid">
                  {currentItems.map((p) => (
                    <div
                      id={`post-${p.postId}`}
                      key={p.postId}
                      className="cars-card"
                      onClick={() =>
                        navi(`/board/GoodsDetail?postId=${p.postId}`, {
                          state: { from: `${location.pathname}${location.search || ''}`, page: currentPage, focusId: p.postId },
                        })
                      }
                    >
                      <div className="cars-image">
                        {p.mainPhotoUrl ? (
                          <img 
                            src={`${PHOTO_BASE}${p.mainPhotoUrl}`} 
                            alt={p.title}
                            onError={(e) => {
                              console.error('이미지 로드 실패:', `${PHOTO_BASE}${p.mainPhotoUrl}`);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                                                 <div className="cars-image-placeholder" style={{ display: p.mainPhotoUrl ? 'none' : 'block' }}>
                           <div className="camera-icon">📷</div>
                           <div className="placeholder-text">등록된 사진이 없습니다</div>
                         </div>
                      </div>
                      <div className="cars-info">
                        <h3 className="cars-title-text">{p.title}</h3>
                        <div className="cars-price">{p.price ? new Intl.NumberFormat().format(p.price) + '원' : '가격 미정'}</div>
                        <div className="cars-member">판매자: {p.nickname}</div>
                        <div>조회수: {p.viewCount}</div>
                        <div className="cars-status">
                          <span className={`status-badge ${p._status === 'ON_SALE' ? 'on-sale' : p._status === 'RESERVED' ? 'reserved' : 'sold'}`}>
                            {p._status === 'ON_SALE' ? '판매중' : p._status === 'RESERVED' ? '예약' : '판매완료'}
                          </span>
                          <span className={`trade-type-badge ${p.tradeType === 'SALE' ? 'sale' : p.tradeType === 'AUCTION' ? 'auction' : p.tradeType === 'SHARE' ? 'share' : ''}`}>
                            {p.tradeType === 'SALE' ? '판매' : p.tradeType === 'AUCTION' ? '경매' : p.tradeType === 'SHARE' ? '나눔' : p.tradeType || '미정'}
                          </span>
                        </div>
                        <div className="cars-date">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
                        
                        {/* 상태 및 차량 정보 배지 */}
                        
                      </div>
                    </div>
                  ))}
                </div>

                {/* 페이지네이션 */}
                <div className="cars-pagination">
                  <div className="cars-page-info">
                    총 {filteredCars.length}개 중 {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCars.length)}개 표시
                  </div>

                  {totalPages > 1 ? (
                    <>
                      <button className="cars-page-btn cars-prev-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
                        이전
                      </button>
                      <div className="cars-page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button key={page} className={`cars-page-number ${currentPage === page ? 'active' : ''}`} onClick={() => handlePageChange(page)}>
                            {page}
                          </button>
                        ))}
                      </div>
                      <button className="cars-page-btn cars-next-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                        다음
                      </button>
                    </>
                  ) : (
                    <div className="cars-page-single">페이지 1 / 1</div>
                  )}
                </div>
              </>
            ) : (
              <div className="cars-empty">
                <div className="cars-empty-icon">🚗</div>
                <div className="cars-empty-text">조건에 맞는 자동차가 없습니다</div>
                <button className="cars-empty-btn" onClick={() => {
                  // 로그인 상태 체크
                  const token = localStorage.getItem('jwtToken');
                  if (!token || token === 'undefined' || token === 'null') {
                    alert('로그인이 필요한 서비스입니다.');
                    navi('/login');
                    return;
                  }
                  // 로그인 상태면 등록 페이지로 이동
                  navi('/board/post');
                }}>
                  첫 번째 자동차 등록하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 최상단으로 스크롤하는 화살표 버튼 */}
        {showScrollTop && (
          <button
            className="scroll-to-top-btn"
            onClick={scrollToTop}
            title="최상단으로 이동"
          >
            <KeyboardArrowUpRoundedIcon />
          </button>
        )}

      </div>
    </div>
  );
};

export default Cars;

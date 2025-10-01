import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    Alert,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';
import KakaoMap from '../../chat/KakaoMap';

const AddressManagementTab = () => {
    const [regions, setRegions] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openMapDialog, setOpenMapDialog] = useState(false);
    const [editingRegion, setEditingRegion] = useState(null);
    const [formData, setFormData] = useState({
        province: '',
        city: '',
        district: '',
        town: '',
        latitude: '',
        longitude: ''
    });
    
    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    
    // 로딩 상태
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const SERVER_IP = 'localhost';
    const SERVER_PORT = '4989';

    // regions 데이터 가져오기
    const fetchRegions = async (page = 1, size = 10) => {
        setLoading(true);
        setError('');
        
        try {
            console.log('fetchRegions 호출됨 - page:', page, 'size:', size);
            
            const response = await axios.get(`http://${SERVER_IP}:${SERVER_PORT}/api/regions`, {
                params: {
                    page: page - 1, // Spring Boot는 0부터 시작
                    size: size
                }
            });
            
            console.log('API 응답:', response.data);
            console.log('API 응답 타입:', typeof response.data);
            console.log('API 응답 키들:', Object.keys(response.data));
            
            if (response.data && response.data.content) {
                console.log('content 배열:', response.data.content);
                console.log('첫 번째 항목:', response.data.content[0]);
                console.log('첫 번째 항목의 키들:', response.data.content[0] ? Object.keys(response.data.content[0]) : '없음');
                
                setRegions(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalCount(response.data.totalElements);
                setCurrentPage(page);
                console.log('데이터 설정 완료 - regions:', response.data.content.length, 'totalPages:', response.data.totalPages);
            }
        } catch (error) {
            console.error('지역 데이터 가져오기 실패:', error);
            setError('지역 데이터를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 지역 삭제
    const handleDelete = async (regionId) => {
        if (window.confirm('정말로 이 지역을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://${SERVER_IP}:${SERVER_PORT}/api/regions/${regionId}`);
                // 삭제 후 현재 페이지 다시 로드
                fetchRegions(currentPage, pageSize);
            } catch (error) {
                console.error('지역 삭제 실패:', error);
                alert('지역 삭제에 실패했습니다.');
            }
        }
    };

    // 지역 추가/수정
    const handleSubmit = async () => {
        try {
            if (editingRegion) {
                // 수정
                const response = await axios.put(`http://${SERVER_IP}:${SERVER_PORT}/api/regions/${editingRegion.regionId}`, formData);
                
                // 성공 메시지 표시
                alert('지역 정보가 성공적으로 수정되었습니다.');
                
                // 다이얼로그 닫기
                handleCloseDialog();
                
                // 목록 새로고침
                fetchRegions(currentPage, pageSize);
            } else {
                // 추가
                const response = await axios.post(`http://${SERVER_IP}:${SERVER_PORT}/api/regions`, formData);
                
                // 성공 메시지 표시
                alert('새 지역이 성공적으로 추가되었습니다.');
                
                // 다이얼로그 닫기
                handleCloseDialog();
                
                // 새로 추가된 지역을 목록에 바로 추가
                if (response.data) {
                    const newRegion = {
                        regionId: response.data.regionId || Date.now(), // 임시 ID 생성
                        province: formData.province,
                        city: formData.city,
                        district: formData.district,
                        town: formData.town,
                        latitude: formData.latitude,
                        longitude: formData.longitude
                    };
                    
                    // 목록 맨 앞에 추가
                    setRegions(prevRegions => [newRegion, ...prevRegions]);
                    
                    // 총 개수 증가
                    setTotalCount(prev => prev + 1);
                }
            }
        } catch (error) {
            console.error('지역 저장 실패:', error);
            alert('지역 저장에 실패했습니다.');
        }
    };

    // 페이지 변경
    const handlePageChange = (event, newPage) => {
        setCurrentPage(newPage);
        fetchRegions(newPage, pageSize);
    };

    // 페이지 크기 변경
    const handlePageSizeChange = (event) => {
        const newSize = event.target.value;
        setPageSize(newSize);
        setCurrentPage(1);
        fetchRegions(1, newSize);
    };

    // 다이얼로그 열기
    const handleOpenDialog = (region = null) => {
        if (region) {
            setEditingRegion(region);
            setFormData({
                province: region.province || '',
                city: region.city || '',
                district: region.district || '',
                town: region.town || '',
                latitude: region.latitude || '',
                longitude: region.longitude || ''
            });
        } else {
            setEditingRegion(null);
            setFormData({
                province: '',
                city: '',
                district: '',
                town: '',
                latitude: '',
                longitude: ''
            });
        }
        setOpenDialog(true);
    };

    // 다이얼로그 닫기
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingRegion(null);
        setFormData({
            province: '',
            city: '',
            district: '',
            town: '',
            latitude: '',
            longitude: ''
        });
    };

    // 카카오맵 모달 열기
    const handleOpenMapDialog = () => {
        setOpenMapDialog(true);
    };

    // 카카오맵 모달 닫기
    const handleCloseMapDialog = () => {
        setOpenMapDialog(false);
    };

    // 카카오맵에서 주소 선택 시
    const handleAddressSelect = (addressData) => {
        console.log('카카오맵에서 주소 선택됨:', addressData);
        
        let newFormData = {};
        
        // 카카오맵에서 전달하는 데이터 형식에 맞게 처리
        if (addressData.location) {
            // 주소 문자열을 파싱하여 세부 정보 추출
            const addressParts = addressData.location.split(' ');
            console.log('주소 파싱 결과:', addressParts);
            
            let province = '';
            let city = '';
            let district = '';
            let town = '';
            
            if (addressParts.length >= 1) {
                province = addressParts[0]; // 첫 번째 부분은 도/시
            }
            if (addressParts.length >= 2) {
                city = addressParts[1]; // 두 번째 부분은 시/군/구
            }
            if (addressParts.length >= 3) {
                district = addressParts[2]; // 세 번째 부분은 구/군
            }
            if (addressParts.length >= 4) {
                town = addressParts[3]; // 네 번째 부분은 동/읍/면
            }
            
            // 빈 문자열이면 기본값 설정
            if (!province || province.trim() === '') {
                province = '서울특별시'; // 기본값
            }
            if (!city || city.trim() === '') {
                city = '강남구'; // 기본값
            }
            if (!district || district.trim() === '') {
                district = '역삼동'; // 기본값
            }
            if (!town || town.trim() === '') {
                town = '역삼동'; // 기본값
            }
            
            newFormData = {
                province: province,
                city: city,
                district: district,
                town: town,
                latitude: addressData.latitude || '',
                longitude: addressData.longitude || ''
            };
        } else {
            // 기존 형식 지원
            newFormData = {
                province: addressData.province || '서울특별시',
                city: addressData.city || '강남구',
                district: addressData.district || '역삼동',
                town: addressData.town || '역삼동',
                latitude: addressData.latitude || '',
                longitude: addressData.longitude || ''
            };
        }
        
        console.log('최종 formData:', newFormData);
        
        // formData 업데이트 (DB 저장하지 않고 폼에만 입력)
        setFormData(newFormData);
        
        // 모달 닫기
        handleCloseMapDialog();
        
        // 사용자에게 안내 메시지
        alert('주소가 입력되었습니다. 추가 버튼을 눌러 저장해주세요.');
    };

    // 입력 필드 변경
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchRegions(currentPage, pageSize);
    }, []);

    // formData 변경 시 로그 출력 (디버깅용)
    useEffect(() => {
        console.log('formData가 변경됨:', formData);
    }, [formData]);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    지역 관리
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenMapDialog}
                        sx={{ borderRadius: 2 }}
                    >
                        새 지역 추가
                    </Button>
                </Box>
            </Box>

            {/* 페이지 크기 선택 */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>페이지 크기</InputLabel>
                    <Select
                        value={pageSize}
                        label="페이지 크기"
                        onChange={handlePageSizeChange}
                    >
                        <MenuItem value={5}>5개</MenuItem>
                        <MenuItem value={10}>10개</MenuItem>
                        <MenuItem value={20}>20개</MenuItem>
                        <MenuItem value={50}>50개</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* 에러 메시지 */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* 지역 목록 테이블 */}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 600 }}>지역 ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>도/시</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>시/군/구</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>구/군</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>동/읍/면</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>위도</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>경도</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography>로딩 중...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : regions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography>등록된 지역이 없습니다.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                regions.map((region) => (
                                    <TableRow key={region.region_id} hover>
                                        <TableCell>{region.region_id}</TableCell>
                                        <TableCell>{region.province || '-'}</TableCell>
                                        <TableCell>{region.city || '-'}</TableCell>
                                        <TableCell>{region.district || '-'}</TableCell>
                                        <TableCell>{region.town || '-'}</TableCell>
                                        <TableCell>{region.latitude ? region.latitude.toFixed(6) : '-'}</TableCell>
                                        <TableCell>{region.longitude ? region.longitude.toFixed(6) : '-'}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(region)}
                                                sx={{ color: '#1976d2' }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(region.region_id)}
                                                sx={{ color: '#d32f2f' }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            {/* 페이지 정보 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    총 {totalCount}개 중 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)}개 표시
                </Typography>
            </Box>

            {/* 지역 추가/수정 다이얼로그 */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingRegion ? '지역 수정' : '새 지역 추가'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="도/시"
                                name="province"
                                value={formData.province}
                                onChange={handleInputChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="시/군/구"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                margin="normal"
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="구/군"
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="동/읍/면"
                                name="town"
                                value={formData.town}
                                onChange={handleInputChange}
                                margin="normal"
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="위도"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleInputChange}
                                margin="normal"
                                type="number"
                                inputProps={{ step: "0.000001" }}
                            />
                            <TextField
                                fullWidth
                                label="경도"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleInputChange}
                                margin="normal"
                                type="number"
                                inputProps={{ step: "0.000001" }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} variant="outlined">
                        취소
                    </Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingRegion ? '수정' : '추가'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 카카오맵 모달 */}
            <Dialog 
                open={openMapDialog} 
                onClose={handleCloseMapDialog} 
                maxWidth="lg" 
                fullWidth
                PaperProps={{
                    sx: { height: '80vh' }
                }}
            >
                <DialogTitle>
                    지도에서 주소 선택
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ height: '100%', minHeight: '500px' }}>
                        <KakaoMap 
                            mode="address-select"
                            onAddressSelect={handleAddressSelect}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMapDialog} variant="outlined">
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AddressManagementTab;

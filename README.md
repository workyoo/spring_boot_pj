
# 🛒 4989 중고거래 플랫폼

## 🚀 프로젝트 개요
중고 물품 거래 과정을 **실제 서비스 수준**으로 구현한 풀스택 프로젝트입니다.  
CRUD, 검색, 채팅, 신고, 관리자 기능을 포함하여 **거래 프로세스 전반을 체험할 수 있는 구조**를 설계했습니다.

<hr style="border:0; border-top:1px solid #ccc; margin:20px 0;" />

## 👥 팀 협업 포인트
- GitHub Flow 브랜치 전략 적용 (feature → develop → main)
- 코드 리뷰를 통한 품질 관리 및 컨벤션 통일
- ERD/와이어프레임을 사전 설계 후 작업 분배
- 주 단위 스크럼 회의로 진행 상황 공유

<hr style="border:0; border-top:1px solid #ccc; margin:20px 0;" />

## ⚙️ 기술적 특징

### Backend
- Spring Boot + MyBatis 기반 REST API
- Spring Security + JWT 인증/인가
- WebSocket을 이용한 실시간 채팅
- Docker + Jenkins CI/CD 파이프라인 구축

### Frontend
- React + Vite 개발 환경
- Material UI 기반 UI 컴포넌트 설계
- Axios API 연동 및 상태 관리

### Database & Infra
- MySQL (AWS RDS), AWS EC2 배포
- `posts` 중심 다중 테이블 관계 설계
- S3 또는 서버 디렉토리 기반 파일 관리

<hr style="border:0; border-top:1px solid #ccc; margin:20px 0;" />

## 📑 구현 기능 요약
- **게시글 CRUD**: 공통 posts + 도메인 확장 테이블 설계, 다중 이미지 업로드
- **검색·필터링**: MyBatis 동적 SQL, 회원 지역 기반 필터링
- **채팅 기능**: 게시글 단위 1:1 실시간 대화
- **신고/관리자 기능**: 신고 접수, 관리자 검토·제재 처리
- **거래 편의 기능**: 찜, 거래 후기, 거래 상태 전환

<hr style="border:0; border-top:1px solid #ccc; margin:20px 0;" />

## 🗄️ DB 설계 핵심
- `posts` 테이블을 중심으로 **cars, real_estates, used_items**와 1:1 확장
- `post_photos`, `favorites`, `chatroom`, `reports` 등 **거래와 관리에 필요한 보조 테이블** 구성
- FK 무결성을 지키면서 **ON DELETE 정책**을 활용해 참조 일관성 유지

<hr style="border:0; border-top:1px solid #ccc; margin:20px 0;" />

## 🔧 트러블 슈팅
- **N+1 문제**  
  → MyBatis `resultMap` 적용, 필요한 컬럼만 JOIN으로 최적화  
- **파일 업로드 무결성 문제**  
  → DB 트랜잭션과 파일 저장을 묶어 롤백 처리  
- **검색 성능 저하**  
  → OR 조건 분리 + 인덱스(`location, created_at`) 추가  
- **신고 처리 제약**  
  → FK 제약에 맞게 `ON DELETE SET NULL` / `CASCADE` 분리 적용  

<hr style="border:0; border-top:1px solid #ccc; margin:20px 0;" />

## 📈 개선 및 성과
- DB 조회 효율 향상: 불필요한 쿼리 제거, JOIN 구조 단순화  
- 데이터 무결성 확보: 업로드 실패 시 자동 롤백 처리  
- 검색 최적화: 인덱스로 풀스캔 방지, 조건별 성능 개선  
- 신고 처리 안정화: FK 제약 준수하며 데이터 일관성 유지

<hr style="border:0; border-top:1px solid #ccc; margin:20px 0;" />

## 📝 회고
- **SQL 최적화 경험**: 동적 SQL과 인덱싱을 통해 실제 성능 개선을 경험  
- **보안 학습**: JWT + Spring Security 적용으로 인증/인가 흐름 이해도 상승  
- **팀워크 경험**: 코드 리뷰와 회의 과정을 통해 협업 속도와 품질을 동시에 확보




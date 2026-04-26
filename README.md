# 교대조 근무 현황 관리 시스템 (Shift Management App)

본 어플리케이션은 4조 2교대 근무조의 일정을 관리하고 조회하기 위한 웹 기반 대시보드입니다.

## 주요 기능
- **메인 현황**: 오늘 날짜 기준 전사 근무 현황 및 조별 상세 스케줄 통합 조회
- **개괄판 (3개월)**: 전 조의 3개월치 근무 일정을 한눈에 확인 가능
- **장기 데이터**: 2030년까지의 근무 로직 자동 반영
- **보안**: 성명 실명 기반 조회 및 데이터 시각화 최적화

## 기술 스택
- **Frontend**: Vite, Vanilla JS, CSS3 (Glassmorphism UI)
- **Backend (Cloud Server)**: Flask (Python 3.10) - 정적 파일 서빙용

## 설치 및 실행 방법

### 로컬 개발 환경
1. 의존성 설치: `npm install`
2. 개발 서버 구동: `npm run dev`
3. 빌드: `npm run build`

### 클라우드 배포 (Python 환경)
1. 의존성 설치: `pip install -r requirements.txt`
2. 서버 실행: `python main.py`

## 주의 사항
- 보안을 위해 원본 PDF 및 엑셀 데이터 파일은 Git 관리 대상에서 제외되었습니다. (`.gitignore` 설정 완료)

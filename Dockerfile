FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사 후 종속성 설치
COPY package.json package-lock.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 개발 서버 실행
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 
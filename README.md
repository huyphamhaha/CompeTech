# CompeTech

CompeTech là hệ thống hỗ trợ học tập và định hướng nghề nghiệp, gồm giao diện người dùng, trang quản trị, các dịch vụ backend và ứng dụng React Native.

## Cấu trúc dự án

```text
competech/
├── front-end/       # Web người dùng - React, Vite, Firebase
├── admin/ccpad/     # Web quản trị - React, Vite, Firebase
├── back-end/        # API và dịch vụ AI - Flask, FastAPI, Docker
└── app/competech/   # Ứng dụng mobile - React Native
```

## Yêu cầu

- Node.js 20 trở lên và npm
- Docker Desktop và Docker Compose để chạy backend hoặc web bằng container
- Android Studio/JDK cho ứng dụng Android
- macOS, Xcode và CocoaPods nếu chạy ứng dụng iOS

## Cấu hình môi trường

Các file `.env` chứa khóa Firebase, Gemini/OpenAI và địa chỉ API. Không commit khóa thật lên Git.

### Web và Admin

Hai ứng dụng sử dụng các biến `VITE_*`, gồm cấu hình Firebase và địa chỉ của các dịch vụ backend:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_API_BASE_URL=http://localhost
VITE_CV_API_URL=http://localhost:5000
VITE_INTERVIEW_API_URL=http://localhost:5005
VITE_RAG_API_URL=http://localhost:5002
VITE_MAJOR_API_URL=http://localhost:8001
VITE_UNIVERSITY_API_URL=http://localhost:8000

VITE_GEMINI_API_KEY=
VITE_GEMINI_MODEL=gemini-2.5-flash
```

Điền các giá trị tương ứng trong `front-end/.env` và `admin/ccpad/.env`.

### Backend

Cấu hình `back-end/.env` với các biến cần thiết. Tối thiểu cần khóa AI, khóa bí mật ứng dụng và địa chỉ Redis/MongoDB phù hợp với môi trường chạy:

```env
OPENAI_API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL_NAME=gemini-2.5-flash
JWT_SECRET_KEY=
FLASK_SECRET_KEY=
ALLOWED_ORIGINS=http://localhost:3000
REDIS_URL=
MONGODB_URL=
ENVIRONMENT=development
```

### Mobile

```powershell
Set-Location app/competech
Copy-Item .env.example .env
```

Sau đó cập nhật `GEMINI_API_KEY`, `GEMINI_MODEL_NAME`, `API_ENVIRONMENT` và `USE_BACKEND_API` trong file `.env`.

## Khởi chạy Backend

Backend được tổ chức thành nhiều dịch vụ Docker:

| Dịch vụ | Cổng |
| --- | ---: |
| CV evaluation | 5000 |
| RAG career counseling | 5002 |
| Health check | 5004 |
| Interview | 5005 |
| University list | 8000 |
| Major list | 8001 |
| Redis | 6379 |
| MongoDB | 27017 |
| Nginx gateway | 80 |

Khởi chạy toàn bộ backend:

```powershell
Set-Location back-end
docker compose up --build
```

Dừng hệ thống:

```powershell
docker compose down
```

## Khởi chạy Web người dùng

### Chế độ phát triển

```powershell
Set-Location front-end
npm install
npm run dev
```

Vite sẽ hiển thị địa chỉ truy cập trong terminal.

### Chạy bằng Docker

```powershell
Set-Location front-end
docker compose up --build
```

Truy cập `http://localhost:3000`.

## Khởi chạy trang Admin

```powershell
Set-Location admin/ccpad
npm install
npm run dev
```

Vite sẽ hiển thị địa chỉ truy cập trong terminal.

## Khởi chạy ứng dụng Mobile

Cài dependencies:

```powershell
Set-Location app/competech
npm install
```

Mở terminal thứ nhất để chạy Metro:

```powershell
npm start
```

Mở terminal thứ hai tại `app/competech` và chạy Android:

```powershell
npm run android
```

Trên macOS, cài CocoaPods và chạy iOS:

```bash
bundle install
bundle exec pod install --project-directory=ios
npm run ios
```

## Kiểm tra mã nguồn

Web, Admin và Mobile đều có lệnh lint:

```powershell
npm run lint
```

Mobile có thêm Jest:

```powershell
Set-Location app/competech
npm test
```

Build bản production của Web hoặc Admin:

```powershell
npm run build
```

## Lưu ý

- Khởi chạy backend trước nếu Web, Admin hoặc Mobile được cấu hình sử dụng API thật.
- Firebase phải được cấu hình đúng cho từng ứng dụng trước khi đăng nhập hoặc sử dụng Firestore/Storage.
- Các tính năng AI cần khóa Gemini hoặc OpenAI hợp lệ.
- Không đưa `.env`, khóa API, tài khoản dịch vụ hoặc dữ liệu nhạy cảm vào commit.

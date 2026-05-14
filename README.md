# Full-Stack Online Class Platform

یک پلتفرم کلاس آنلاین مشابه BigBlueButton با قابلیت‌های پیشرفته ویدیو کنفرانس، وایت‌برد همزمان، ضبط کلاس و مدیریت کاربران.

## 🏗️ معماری سیستم

### فرانت‌اند
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** برای استایل‌دهی
- **Zustand** برای مدیریت state
- **LiveKit SDK** برای WebRTC
- **Tldraw + Yjs** برای وایت‌برد همزمان

### بک‌اند
- **Node.js + Express**
- **Socket.io** برای ارتباط بلادرنگ
- **Prisma** (PostgreSQL) برای دیتابیس
- **Redis** برای کش و session
- **MinIO/S3** برای ذخیره فایل‌ها

### زیرساخت
- **LiveKit SFU** برای مدیریت WebRTC
- **CoTurn** برای NAT traversal
- **Docker Compose** برای deployment

## 📁 ساختار پروژه

```
/workspace
├── backend/
│   ├── src/
│   │   ├── config/         # تنظیمات دیتابیس، Redis، S3
│   │   ├── controllers/    # Auth, Room, File, Recording
│   │   ├── middleware/     # Auth, RBAC, Rate Limiting
│   │   ├── routes/         # API Routes
│   │   ├── services/       # Business Logic
│   │   ├── utils/          # JWT Helpers
│   │   └── server.js       # Entry Point
│   ├── prisma/
│   │   └── schema.prisma   # Database Schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # Whiteboard, Video, Layout
│   │   ├── hooks/          # useLiveKit, useWhiteboard, useSocket
│   │   ├── lib/            # API Client
│   │   ├── store/          # Zustand Stores
│   │   └── types/          # TypeScript Types
│   └── package.json
├── docker/
│   ├── livekit.yaml        # LiveKit Configuration
│   └── turnserver.conf     # CoTurn Configuration
├── docker-compose.yml      # Full Stack Deployment
└── README.md
```

## 🚀 راه‌اندازی سریع

### پیش‌نیازها
- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 15+

### نصب با Docker Compose

```bash
# Clone repository
cd /workspace

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### دسترسی به سرویس‌ها

| سرویس | آدرس | توضیحات |
|-------|------|---------|
| Frontend | http://localhost:3000 | Next.js App |
| Backend API | http://localhost:3001 | Express API |
| MinIO Console | http://localhost:9001 | Object Storage UI |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |
| LiveKit | ws://localhost:7880 | WebRTC SFU |

## 🔐 احراز هویت و امنیت

### JWT Token Rotation
- Access Token: 15 دقیقه
- Refresh Token: 7 روز
- Auto-refresh با interceptor

### RBAC (Role-Based Access Control)
- **ADMIN**: دسترسی کامل به همه بخش‌ها
- **TEACHER**: ساخت کلاس، مدیریت دانش‌آموزان، ضبط کلاس
- **STUDENT**: شرکت در کلاس، چت، مشاهده فایل‌ها

### Security Features
- ✅ Rate Limiting
- ✅ CORS Protection
- ✅ Helmet.js Headers
- ✅ Password Hashing (bcrypt)
- ✅ Input Validation

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register    # ثبت‌نام کاربر جدید
POST /api/auth/login       # ورود
POST /api/auth/refresh     # دریافت توکن جدید
POST /api/auth/logout      # خروج
GET  /api/auth/profile     # پروفایل کاربر
```

### Rooms
```
POST   /api/rooms          # ساخت کلاس جدید
GET    /api/rooms          # لیست کلاس‌ها
GET    /api/rooms/:id      # جزئیات کلاس
PUT    /api/rooms/:id      # ویرایش کلاس
DELETE /api/rooms/:id      # حذف کلاس
POST   /api/rooms/:id/start   # شروع کلاس
POST   /api/rooms/:id/end     # پایان کلاس
POST   /api/rooms/:id/enroll  # ثبت‌نام دانش‌آموز
```

## 🎮 قابلیت‌ها

### 1. داشبورد Admin
- مدیریت کاربران (CRUD)
- مشاهده همه کلاس‌ها
- مدیریت ضبط‌ها
- لاگ‌های سیستم
- تنظیمات TURN سرور

### 2. داشبورد Teacher
- ساخت و مدیریت کلاس
- دعوت دانش‌آموزان
- کنترل WebRTC (mute/unmute)
- وایت‌برد همزمان
- آپلود فایل
- شروع/توقف ضبط

### 3. داشبورد Student
- ورود به کلاس
- چت متنی
- مشاهده فایل‌ها
- درخواست وبکم/میکروفون
- واکنش‌ها (Raise Hand)

### 4. Whiteboard همزمان
- رسم اشکال، متن، خطوط
- Undo/Redo
- ذخیره خودکار
- همزمانی با Yjs/WebSocket

### 5. WebRTC Features
- ویدیو کنفرانس تا 50 نفر
- اشتراک صفحه‌نمایش
- کنترل صدا/تصویر
- کیفیت تطبیقی

### 6. ضبط کلاس
- ضبط از طریق LiveKit Recorder
- ذخیره در MinIO/S3
- فرمت MP4
- متادیتا کامل

## 🔧 تنظیمات محیطی

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/online_class
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_LIVEKIT_WS_URL=ws://localhost:7880
NEXT_PUBLIC_WHITEBOARD_WS_URL=ws://localhost:1234
```

## 📦 Deploy روی Ubuntu Server

### 1. نصب Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. نصب Nginx
```bash
sudo apt update
sudo apt install nginx -y
```

### 3. تنظیم SSL با Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### 4. Nginx Configuration
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 5. اجرای Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ توسعه

### Backend Development
```bash
cd backend
npm install
npm run prisma:migrate
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## 📝 مدل‌های دیتابیس

- **User**: کاربران با نقش‌های مختلف
- **Room**: کلاس‌های درس
- **Enrollment**: ثبت‌نام دانش‌آموزان
- **File**: فایل‌های آپلود شده
- **Recording**: ضبط‌های کلاس
- **Attendance**: حضور و غیاب
- **Log**: لاگ‌های سیستم

## 🤝 مشارکت

1. Fork پروژه
2. Branch ایجاد کنید (`git checkout -b feature/new-feature`)
3. Commit کنید (`git commit -m 'Add new feature'`)
4. Push کنید (`git push origin feature/new-feature`)
5. Pull Request باز کنید

## 📄 لایسنس

MIT License

## 📞 پشتیبانی

برای گزارش باگ یا درخواست ویژگی جدید، لطفاً Issue ایجاد کنید.

---

**توسعه یافته با ❤️ برای آموزش آنلاین**

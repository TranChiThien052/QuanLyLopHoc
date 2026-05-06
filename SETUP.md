# 📋 Hướng Dẫn Cài Đặt Hệ Thống Quản Lý Lớp Học

## 📖 Mục Lục
1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Cài Đặt Local](#cài-đặt-local)
3. [Cài Đặt Production/Online](#cài-đặt-productiononline)
---

## 🔧 Yêu Cầu Hệ Thống

### Backend
- **Node.js**: v14.x trở lên
- **npm hoặc yarn**: v6.x trở lên
- **PostgreSQL**: v10.x trở lên (hoặc sử dụng cloud database)

### Frontend
- **Node.js**: v14.x trở lên
- **npm hoặc yarn**: v6.x trở lên
- **Trình duyệt hiện đại** (Chrome, Firefox, Edge, Safari)

### Services
- **Cloudinary**: Tài khoản để upload hình ảnh
- **JWT Secret**: Khóa bí mật cho authentication

---

## 🏠 Cài Đặt Local

### Bước 1: Chuẩn Bị

1. **Cài đặt Node.js**
   - Tải từ https://nodejs.org/ (LTS version)
   - Xác nhận cài đặt: `node --version` và `npm --version`

2. **Cài đặt PostgreSQL** (nếu chưa có)
   - Tải từ https://www.postgresql.org/download/
   - Ghi nhớ username và password khi cài đặt
   - Tạo database mới:
     ```sql
     CREATE DATABASE quan_ly_lop_hoc;
     ```

3. **Clone Repository** (nếu chưa có)
   ```bash
   git clone <repository-url>
   cd QuanLyLopHoc
   ```

### Bước 2: Cài Đặt Backend

1. **Chuyển vào thư mục backend**
   ```bash
   cd backend
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Tạo file `.env`**
   ```bash
   # Windows
   copy .env.example .env
   # Hoặc tạo file .env thủ công
   ```

4. **Cấu hình file `.env`**
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/quan_ly_lop_hoc

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

6. **Tạo database**
   Sử dụng file init.sql bên trong thư mục db để tạo database và thêm tài khoản admin

7. **Chạy backend**
   npm run dev

   Server sẽ chạy tại: `http://localhost:3001`

### Bước 3: Cài Đặt Frontend

**Mở terminal mới và thực hiện:**

1. **Chuyển vào thư mục frontend**
   cd frontend

2. **Cài đặt dependencies**
   npm install

3. **Tạo file `.env`** (trong thư mục frontend)
   # .env hoặc .env.local
   REACT_APP_API_URL=http://localhost:3001

4. **Chạy frontend**
   npm start

   Ứng dụng sẽ mở tại: `http://localhost:3000`

### ✅ Kiểm Tra Local Setup
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## 🌐 Cài Đặt Production/Online (Render + Vercel)

### Tổng Quan
- **Backend**: Deploy trên **Render** (Node.js + PostgreSQL)
- **Frontend**: Deploy trên **Vercel** (React)
- **Ưu điểm**: Tự động HTTPS, CI/CD, scale dễ dàng, free tier có sẵn

---

## 🚀 Phần 1: Deploy Backend trên Render

### Bước 1: Chuẩn Bị Repository

1. **Đảm bảo có file `render.yaml`** hoặc cấu hình trong Render Dashboard
2. **Kiểm tra file `.gitignore`**
   ```
   node_modules/
   .env
   .env.local
   .DS_Store
   build/
   dist/
   ```

3. **Tạo hoặc cập nhật `package.json` (backend)**
   ```json
   {
     "name": "backend",
     "version": "1.0.0",
     "engines": {
       "node": "18.x"
     },
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

4. **Push code lên GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### Bước 2: Tạo PostgreSQL Database trên Render

1. **Truy cập** https://dashboard.render.com
2. **Đăng nhập hoặc đăng ký** với GitHub account
3. **Tạo Database mới:**
   - Click "New +" → "PostgreSQL"
   - Điền thông tin:
     - **Name**: `quan-ly-lop-hoc-db`
     - **Database**: `quan_ly_lop_hoc`
     - **User**: `admin`
     - Chọn **Region** gần bạn nhất
     - Chọn **Plan**: Free (hoặc Standard nếu production)
   - Click "Create Database"

4. **Sao chép Connection String**
   - Trang Database → Copy Internal Database URL
   - Format: `postgresql://user:password@host:port/database`
   - Lưu giữ để sử dụng sau

### Bước 3: Deploy Backend Service

1. **Tạo Web Service**
   - Truy cập https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Kết nối GitHub repository
   - Chọn repository `QuanLyLopHoc`

2. **Cấu hình Service**
   - **Name**: `quan-ly-lop-hoc`
   - **Environment**: Node
   - **Build Command**: 
     ```bash
     cd backend && npm install
     ```
   - **Start Command**: 
     ```bash
     cd backend && npm start
     ```
   - **Branch**: main
   - **Plan**: Free (hoặc Starter)

3. **Thêm Environment Variables**
   - Trong Web Service → "Environment"
   - Thêm các biến sau:
     ```
     DATABASE_URL
     JWT_SECRET
     JWT_EXPIRES_IN
     SALT_ROUNDS
     CLOUDINARY_CLOUD_NAME
     CLOUDINARY_API_KEY
     CLOUDINARY_API_SECRET
     ```

4. **Chờ Deployment**
   - Render sẽ tự động build và deploy
   - URL backend sẽ được tự bởi dịch vụ Render

---

## 🚀 Phần 2: Deploy Frontend trên Vercel

### Bước 1: Chuẩn Bị Frontend

1. **Cập nhật `frontend/package.json`**
   ```json
   {
     "name": "frontend",
     "version": "0.1.0",
     "private": true,
     "scripts": {
       "start": "react-scripts start",
       "build": "CI=false react-scripts build",
       "test": "react-scripts test",
       "eject": "react-scripts eject"
     }
   }
   ```

2. **Tạo `frontend/.env`**
   ```env
   REACT_APP_API_URL = đường_dẫn_backend
   ```

3. **Tạo `frontend/vercel.json`**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "env": {
       "REACT_APP_API_URL": "@REACT_APP_API_URL"
     },
     "redirects": [
       {
         "source": "/(.*)",
         "destination": "/index.html",
         "statusCode": 200
       }
     ]
   }
   ```

4. **Push code**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### Bước 2: Deploy trên Vercel

1. **Truy cập** https://vercel.com
2. **Đăng nhập hoặc đăng ký** với GitHub
3. **Import Project**
   - Click "Add New ..." → "Project"
   - Chọn repository: Tên_repository

4. **Cấu hình Project**
   - **Project Name**: `quan-ly-lop-hoc`
   - **Framework Preset**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. **Thêm Environment Variables**
   - Trong Project Settings → "Environment Variables"
   - Thêm biến:
     ```
     REACT_APP_API_URL = đường_dẫn_backend
     GENERATE_SOURCEMAP = false
     CI = false
     ```

6. **Deploy**
   - Click "Deploy"
   - Vercel sẽ tự động build và deploy
   - URL frontend sẽ được nền tảng Vercel tạo

### ✅ Kiểm Tra Frontend

## 🔗 Kết Nối Backend & Frontend

### Sau Deploy:

1. **Backend URL**: đường_dẫn_backend
2. **Frontend URL**: đường_dẫn_frontend

## Cấu hình biến môi trường cho frontend
   ``
   REACT_APP_API_URL = đường_dẫn_backend
   ``

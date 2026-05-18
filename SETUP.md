# 📋 Hướng Dẫn Cài Đặt Hệ Thống Quản Lý Lớp Học

## 📖 Mục Lục
1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Cài Đặt Local (Không khuyến khích do không thể kết nối bằng điện thoại đến máy chủ host)](#cài-đặt-local) 
3. [Cài Đặt Production/Online (Khuyến khích do có thể dùng điện thoại cho các chức năng của sinh viên)](#cài-đặt-productiononline)
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

## 🏠 Cài Đặt Local (Không khuyến khích do không thể kết nối bằng điện thoại đến máy chủ host)

### Bước 1: Chuẩn Bị

1. **Cài đặt Node.js**
   - Tải từ https://nodejs.org/ (LTS version)
   - Xác nhận cài đặt: `node --version` và `npm --version`

2. **Cài đặt PostgreSQL**
   - Tải từ https://www.postgresql.org/download/
   - Ghi nhớ username và password khi cài đặt
   - Tạo database mới:
     ```sql
     CREATE DATABASE quan_ly_lop_hoc;
     ```
   - Truy cập vào database vừa tạo, sử dụng file init.sql trong thư mục db để tạo cơ sở dữ liệu
   - Tên tài khoản và mật khẩu của admin lần lượt là: admin và admin123@

3. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd QuanLyLopHoc
   ```

4. **Tạo tài khoản và lấy key Cloudinary**
   - Truy cập vào trang web: https://cloudinary.com/ và đăng ký tài khoản
   - Vào phần Settings, chọn API Keys, lưu lại API Key, API Secret, và Cloud Name

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
   Sử dụng file .env example để cấu hình các biến môi trường và sửa tên file thành .env
   ```

4. **Cấu hình file `.env`**
   # Database
   DATABASE_URL=postgresql://username:password@localhost:port/databasename

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. **Chạy backend**
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
- **Cloudinary**: Lưu trữ ảnh cho chức năng điểm danh
- **Backend**: Deploy trên **Render** (Node.js + PostgreSQL)
- **Frontend**: Deploy trên **Vercel** (React)

---
## Phần 1: Chuẩn bị GitHub Repository để deploy
### Bước 1: Tạo Repository
- Tạo Repository trên GitHub và đặt tên theo ý muốn
- Lưu trữ lại đường dẫn của Repository trên GitHub
### Bước 2: Tải dự án về máy
- Tạo thư mục lưu trữ dự án
- Mở ứng dụng Command Prompt hoặc sử dụng Terminal trên IDE
- Clone dự án:
  ```bash
  git clone https://github.com/TranChiThien052/QuanLyLopHoc.git
  ```
### Bước 3: Đưa dự án lên Repository mới
- Cập nhật lại repository remote của dự án bằng các lệnh sau:
  ```bash
  git remote remove origin
  git remote add origin <đường_dẫn_của_repository_mới>
  ```
- Push code lên repository mới:
  ```bash
  git checkout main
  git push -u origin main
  ```

---
## Phần 2: Tạo tài Service Cloudinary
- Truy cập vào trang web: https://cloudinary.com/ và đăng nhập hoặc đăng ký tài khoản
- Vào phần Settings, chọn API Keys, lưu lại API Key, API Secret, và Cloud Name

---
## Phần 3: Tạo host trên Render
### Bước 1: Đăng nhập
- Đăng nhập vào trang Render bằng tài khoản GitHub có repository chứa dự án
### Bước 2: Tạo Project
- Nếu chưa có Project hoặc muốn tạo một Project mới để sử dụng, chọn Create new project tại trang dashboard
- Đặt tên cho Project
### Bước 3: Tạo Webservice (host backend)
- Chọn "+ New", chọn Web Service
- Tại phần Git Provider của trang tiếp theo, chọn repository chứa dự án
- Chọn Node cho phần Language
- Tại Root Directory, điền vào giá trị "backend"
- Chọn Deploy Web Service
### Bước 4: Tạo Database
- Chọn "+ New", chọn Postgres tại giao diện Dashboard của Project
- Nhập các giá trị tên (Postgres Instance), tên database, tên người dùng (user)
- Tại phần Plan Options, chọn theo nhu cầu (có thể sử dụng Free với mục đích dùng thử hệ thống)
- Chọn Create Database  
### Bước 5: Cấu hình biến môi trường cho backend
- Truy cập vào Webservice đã tạo để deploy backend
- Vào phần Environments, tại Environment, Environment Variables chọn Edit và nhập các biến môi trường (tham khảo file /backend/.env.example), kết nối với Database đã tạo bằng cách chọn Datastore URL trong phần Add variable
- Chọn Save and Deploy sau khi cấu hình xong
### Bước 6: Kiểm tra
- Kiểm tra Web Service (backend) đã hoạt động chưa bằng cách click vào đường dẫn tại dashboard
### Bước 7: Khởi tạo database
- Truy cập vào database đã được tạo trên Render
- Lưu lại các thông tin tại phần Info
- Sử dụng pgAdmin4, chuột phải tại bất kỳ Server Group đã được tạo hoặc tạo mới Server Group, chọn Register
- Nhập các thông tin của database trong pgAdmin
- Sau khi kết nối thành công, sử dụng Query Tool để nhập nội dung file init.sql ở thư mục db và chạy

---
## Phần 4: Tạo host trên Vercel
### Bước 1: Đăng nhập
- Đăng nhập vào trang Vercel bằng tài khoản GitHub có repository chứa dự án
### Bước 2: Tạo host
- Bấm vào mục Add New...
- Chọn Project
- Tại phần Import Git Repository, chọn Continue with GitHub
- Chọn repository chứa dự án, chọn import
- Tại phần Application Preset trong trang tiếp theo, chọn thư mục frontend
- Chọn Deploy
### Bước 3: Cấu hình biến môi trường
- Tại mục Dashboard của Project, chọn mục Settings
- Vào phần Environments, chọn Production
- Trong giao diện Production, Chọn Add Environment Variable, thêm các biến môi trường (tham khảo file /frontend/.env.example)

---
## Phần 5: Sử dụng
- Sau khi cấu hình, có thể sử dụng tài khoản admin (username: admin & password: admin123@) để đăng nhập
- Trong giao diện admin có thể tạo thêm các tài khoản sinh viên và giảng viên để sử dụng các tính năng khác
- Mật khẩu mặc định của tài khoản sinh viên và giảng viên trùng với tên đăng nhập (mã giảng viên/mã sinh viên)
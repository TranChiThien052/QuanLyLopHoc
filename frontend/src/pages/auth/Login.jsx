import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu đăng nhập:", formData);
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <h1 className="stu-logo">STU <span>System</span></h1>
          <p className="welcome-text">Trường Đại Học Công Nghệ Sài Gòn</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Username giữ nguyên */}
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Nhập tên đăng nhập" 
              required
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu" 
                required
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              {/* --- PHẦN THAY ĐỔI ICON TẠI ĐÂY --- */}
              <button 
                type="button" 
                className="toggle-password-btn" 
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  /* Icon Mắt gạch chéo (Ẩn) - Phong cách tối giản */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894 L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L9.878 9.878" />
                  </svg>
                ) : (
                  /* Icon Mắt mở (Hiện) - Phong cách tối giản */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.011 9.963 7.183a1.012 1.012 0 0 1 0 .639C18.573 16.49 14.638 19.5 12 19.5c-4.638 0-8.573-3.011-9.963-7.183Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
              {/* ---------------------------------- */}
            </div>
          </div>

          <button type="button" className="forgot-link-btn">
            Quên mật khẩu?
          </button>

          <button type="submit" className="btn-login-modern">
            ĐĂNG NHẬP
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
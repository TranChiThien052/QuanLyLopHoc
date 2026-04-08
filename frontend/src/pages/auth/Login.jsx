import React from 'react';

function Login() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Đăng nhập</h1>
      <p>Hệ thống Quản lý Lớp Học</p>
      <form>
        <div>
          <label>Tên đăng nhập:</label><br />
          <input type="text" />
        </div>
        <div>
          <label>Mật khẩu:</label><br />
          <input type="password" />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}

export default Login;

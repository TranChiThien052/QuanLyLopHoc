import React from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';

const MainLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  let menuItems = [];
  let roleTitle = "";

  // Xác định menu dựa trên URL
  if (path.startsWith('/student')) {
    roleTitle = "Sinh Viên";
    menuItems = [
      { label: "Dashboard", path: "/student/dashboard" },
      { label: "Thông tin cá nhân", path: "/student/profile" },
      { label: "Điểm danh", path: "/student/attendance" },
      { label: "Lịch sử điểm danh", path: "/student/attendance-history" },
    ];
  } else if (path.startsWith('/teacher')) {
    roleTitle = "Giảng Viên";
    menuItems = [
      { label: "Thông tin cá nhân", path: "/teacher/profile" },
      { label: "Quản lý lớp học", path: "/teacher/classes" },
      { label: "Quản lý điểm danh", path: "/teacher/attendance" },
      { label: "Thống kê", path: "/teacher/statistics" },
    ];
  } else if (path.startsWith('/admin')) {
    roleTitle = "Quản Trị Viên";
    menuItems = [
      { label: "Quản lý tài khoản", path: "/admin/accounts" },
      { label: "Thông tin điểm danh", path: "/admin/attendance-report" },
    ];
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <header style={{ 
        backgroundColor: '#1a73e8', 
        color: 'white', 
        padding: '10px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h2 style={{ margin: 0 }}>Hệ Thống Quản Lý Lớp Học</h2>
        <span>Vai trò: <strong>{roleTitle}</strong></span>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* SIDEBAR / MENU */}
        <nav style={{ 
          width: '250px', 
          backgroundColor: '#f8f9fa', 
          borderRight: '1px solid #ddd', 
          padding: '20px' 
        }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {menuItems.map((item) => (
              <li key={item.path} style={{ marginBottom: '10px' }}>
                <Link 
                  to={item.path} 
                  style={{ 
                    textDecoration: 'none', 
                    color: path === item.path ? '#1a73e8' : '#333',
                    fontWeight: path === item.path ? 'bold' : 'normal',
                    display: 'block',
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: path === item.path ? '#e8f0fe' : 'transparent'
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <hr />
          <Link to="/" style={{ color: 'red', textDecoration: 'none' }}>Đăng xuất</Link>
        </nav>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: '20px', backgroundColor: '#fff' }}>
          <Outlet />
        </main>
      </div>

      {/* FOOTER */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '10px', 
        backgroundColor: '#f1f3f4', 
        borderTop: '1px solid #ddd',
        fontSize: '0.9rem'
      }}>
        © 2024 Dự án Quản Lý Lớp Học - STU
      </footer>
    </div>
  );
};

export default MainLayout;

import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MainLayout.css";

export default function MainLayout() {
  const location = useLocation();
  const path = location.pathname;
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();

  let menuItems = [];
  let roleTitle = "";

  if (path.startsWith("/student")) {
    roleTitle = "Sinh Viên";
    menuItems = [
      { label: "Thông tin", path: "/student/profile" },
      { label: "Điểm danh", path: "/student/attendance" },
      { label: "Lịch sử", path: "/student/attendance-history" },
    ];
  } else if (path.startsWith("/teacher")) {
    roleTitle = "Giảng Viên";
    menuItems = [
      { label: "Thông tin", path: "/teacher/profile" },
      { label: "Lớp học", path: "/teacher/classes" },
      { label: "Điểm danh", path: "/teacher/attendance" },
    ];
  } else if (path.startsWith("/admin")) {
    roleTitle = "Admin";
    menuItems = [
      { label: "Tài khoản", path: "/admin/accounts" },
      { label: "Báo cáo", path: "/admin/attendance-report" },
    ];
  }

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <h3 className="logo">STU</h3>

        <nav>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                "nav-link " + (isActive ? "active" : "")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* OVERLAY (mobile) */}
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* MAIN */}
      <div className="main">

        {/* HEADER */}
        <header className="header">
          <button className="menu-btn" onClick={() => setOpen(true)}>
            ☰
          </button>

          <h3 className="title">STU System</h3>

          <div className="header-right">
            <span className="user-name">{user?.username || ''}</span>
            <span className="role">{roleTitle}</span>
            <button className="logout-btn" onClick={logout} title="Đăng xuất">Đăng xuất
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
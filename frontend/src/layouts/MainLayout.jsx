import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./MainLayout.css";

export default function MainLayout() {
  const location = useLocation();
  const path = location.pathname;
  const [open, setOpen] = useState(false);

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

          <span className="role">{roleTitle}</span>
        </header>

        {/* CONTENT */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
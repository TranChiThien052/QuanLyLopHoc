import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const location = useLocation();
  const path = location.pathname;
  const [collapsed, setCollapsed] = useState(false);

  let menuItems = [];
  let roleTitle = "";

  // 🔥 Logic từ MainLayout
  if (path.startsWith("/student")) {
    roleTitle = "Sinh Viên";
    menuItems = [
      { label: "Thông tin cá nhân", path: "/student/profile" },
      { label: "Điểm danh", path: "/student/attendance" },
      { label: "Lịch sử điểm danh", path: "/student/attendance-history" },
    ];
  } else if (path.startsWith("/teacher")) {
    roleTitle = "Giảng Viên";
    menuItems = [
      { label: "Thông tin cá nhân", path: "/teacher/profile" },
      { label: "Quản lý lớp học", path: "/teacher/classes" },
      { label: "Quản lý điểm danh", path: "/teacher/attendance" },
      { label: "Thống kê", path: "/teacher/statistics" },
    ];
  } else if (path.startsWith("/admin")) {
    roleTitle = "Quản Trị Viên";
    menuItems = [
      { label: "Quản lý tài khoản", path: "/admin/accounts" },
      { label: "Thông tin điểm danh", path: "/admin/attendance-report" },
    ];
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>

      {/* SIDEBAR */}
      <aside
        style={{
          width: collapsed ? "70px" : "220px",
          backgroundColor: "#31A7BF",
          color: "white",
          transition: "0.3s",
          padding: "20px 10px"
        }}
      >
        <h3 style={{ textAlign: "center" }}>
          {collapsed ? "STU" : "STU System"}
        </h3>

        <nav>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: "block",
                padding: "10px",
                margin: "5px 0",
                borderRadius: "6px",
                textDecoration: "none",
                color: "white",
                backgroundColor: isActive ? "#0099B8" : "transparent",
                fontWeight: isActive ? "bold" : "normal"
              })}
            >
              {collapsed ? item.label[0] : item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* HEADER */}
        <header
          style={{
            backgroundColor: "#0099B8",
            color: "white",
            padding: "10px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <button onClick={() => setCollapsed(!collapsed)}>
            ☰
          </button>

          <h3 style={{ margin: 0 }}>Hệ Thống Quản Lý Lớp Học</h3>

          <span>{roleTitle}</span>
        </header>

        {/* CONTENT */}
        <main style={{ padding: "20px", background: "#f5f5f5", flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
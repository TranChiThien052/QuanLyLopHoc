import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AttendanceManagement.css';

const sessionsData = [
  { id: "BH122026", classId: "cntt-th10", className: "Lớp CNTT TH10", studentCount: 70, time: "7:00 - 12:00" },
  { id: "BH12242", classId: "qtkd-kd07", className: "Lớp Quản trị kinh doanh KD07", studentCount: 79, time: "12:35 - 15:00" },
  { id: "BH122786", classId: "tkdh-06", className: "Lớp Thiết Kế Đồ Họa 06", studentCount: 90, time: "15:10 - 17:40" },
  { id: "BH125526", classId: "cntt-th10", className: "Lớp CNTT TH10", studentCount: 80, time: "7:00 - 9:15" },
  { id: "BH1213226", classId: "tkdh-06", className: "Lớp Thiết Kế Đồ Họa 06", studentCount: 69, time: "7:00 - 12:00" },
  { id: "BH122029", classId: "mkt-mk01", className: "Lớp Marketing MK01", studentCount: 50, time: "13:00 - 15:00" }, // Dữ liệu giả thêm để test phân trang
];

export default function AttendanceManagement() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số lượng buổi học mỗi trang

  // Mỗi khi tìm kiếm, reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const classSessions = sessionsData.filter(s => s.classId === classId);
  const displayClassName = classSessions.length > 0 ? classSessions[0].className : "Lớp học không xác định";

  // 1. Logic lọc danh sách theo từ khóa tìm kiếm
  const filteredSessions = classSessions.filter((session) =>
    session.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  return (
    <div className="mgmt-container">
      {/* TOP BAR: Title & Search */}
      <div className="mgmt-top-bar">
        <h1 className="mgmt-title">Quản lý điểm danh - {displayClassName}</h1>
        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm buổi học..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-search">Tìm kiếm</button>
        </div>
      </div>

      {/* DATE BANNER */}
      <div className="date-banner" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: '15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
          &larr; Quay lại
        </button>
        <span>DANH SÁCH CÁC BUỔI HỌC </span>
      </div>

      {/* TABLE SECTION */}
      <div className="mgmt-table-wrapper">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Mã buổi học</th>
              <th>Tên lớp học</th>
              <th>Số lượng SV</th>
              <th>Thời gian</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((session, index) => (
                <tr key={index}>
                  <td data-label="Mã buổi">{session.id}</td>
                  <td data-label="Tên lớp">{session.className}</td>
                  <td data-label="Số lượng">
                    <strong>{session.studentCount}</strong> sinh viên
                  </td>
                  <td data-label="Thời gian">{session.time}</td>
                  <td data-label="Thao tác" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-create-code"
                      style={{ backgroundColor: '#28a745' }}
                      onClick={() => navigate(`/teacher/statistics/${session.id}`, { state: { className: session.className } })}
                    >
                      Thống kê buổi
                    </button>
                    <button
                      className="btn-create-code"
                      onClick={() => navigate(`/teacher/attendance/process/${session.id}?type=face`)}
                    >
                      Tạo mã điểm danh
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  Không tìm thấy lớp học nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION SECTION */}
      {totalPages > 1 && (
        <div className="mgmt-pagination">
          <button
            className="page-btn-nav"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            ‹
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="page-btn-nav"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
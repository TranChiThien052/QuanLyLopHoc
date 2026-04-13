import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AttendanceManagement.css'; // Reusing the css

const classesData = [
  { id: "cntt-th10", name: "Lớp CNTT TH10", studentCount: 80, schedule: "Thứ 2, Thứ 4" },
  { id: "qtkd-kd07", name: "Lớp Quản trị kinh doanh KD07", studentCount: 79, schedule: "Thứ 3, Thứ 5" },
  { id: "tkdh-06", name: "Lớp Thiết Kế Đồ Họa 06", studentCount: 90, schedule: "Thứ 6" },
  { id: "mkt-mk01", name: "Lớp Marketing MK01", studentCount: 50, schedule: "Thứ 7" },
];

export default function AttendanceManagementClass() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredClasses = classesData.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mgmt-container">
      <div className="mgmt-top-bar">
        <h1 className="mgmt-title">Quản lý điểm danh - Chọn lớp học</h1>
        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm lớp học..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-search">Tìm kiếm</button>
        </div>
      </div>

      <div className="mgmt-table-wrapper">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Mã lớp</th>
              <th>Tên lớp học</th>
              <th>Số lượng SV</th>
              <th>Lịch học</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls, index) => (
                <tr key={index}>
                  <td data-label="Mã lớp">{cls.id.toUpperCase()}</td>
                  <td data-label="Tên lớp">{cls.name}</td>
                  <td data-label="Số lượng">
                    <strong>{cls.studentCount}</strong> sinh viên
                  </td>
                  <td data-label="Lịch học">{cls.schedule}</td>
                  <td data-label="Thao tác" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-create-code"
                      style={{ backgroundColor: '#28a745' }}
                      onClick={() => navigate(`/teacher/class-statistics/${cls.id}`)}
                    >
                      Thống kê lớp
                    </button>
                    <button
                      className="btn-create-code"
                      onClick={() => navigate(`/teacher/attendance/${cls.id}`)}
                    >
                      Xem buổi học
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
    </div>
  );
}

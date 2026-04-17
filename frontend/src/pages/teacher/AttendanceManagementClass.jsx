import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AttendanceManagement.css';

export default function AttendanceManagementClass() {
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/classes');
        setClasses(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu lớp học. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5); // "12:35:00" -> "12:35"
  };

  const filteredClasses = classes.filter((cls) =>
    (cls.tenlop || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.monhoc || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="mgmt-container">
      <div className="loading-state">Đang tải danh sách lớp học...</div>
    </div>
  );

  if (error) return (
    <div className="mgmt-container">
      <div className="error-state">{error}</div>
    </div>
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
              <th>Môn học</th>
              <th>Lịch học</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls, index) => (
                <tr key={index}>
                  <td data-label="Mã lớp">{cls.malop}</td>
                  <td data-label="Tên lớp">{cls.tenlop}</td>
                  <td data-label="Môn học">{cls.monhoc}</td>
                  <td data-label="Lịch học" className="schedule-cell">
                    <div className="schedule-item">
                      {cls.ngayhoccodinh} - {formatTime(cls.giobatdau)} - {formatTime(cls.gioketthuc)}
                    </div>
                  </td>
                  <td data-label="Thao tác" className="actions-cell">
                    <button
                      className="btn-create-code"
                      style={{ backgroundColor: '#28a745' }}
                      onClick={() => navigate(`/teacher/class-statistics/${cls.malop}`)}
                    >
                      Thống kê lớp
                    </button>
                    <button
                      className="btn-create-code"
                      onClick={() => navigate(`/teacher/attendance/${cls.malop}`, { state: { cls } })}
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

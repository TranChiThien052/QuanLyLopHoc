import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./AttendanceDetail.css";

export default function AttendanceDetail() {
  const { subjectId } = useParams(); // malop
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchAttendanceDetail = async () => {
      if (!user) return;
      const maSinhVien = user.masinhvien || user.username || user.id;

      try {
        const response = await api.get(`/diemDanh/classAndSinhVien/${subjectId}/${maSinhVien}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAttendanceData(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết điểm danh:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceDetail();
  }, [subjectId, user]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = attendanceData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(attendanceData.length / itemsPerPage);

  if (loading) {
    return (
      <div className="attendance-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu điểm danh...</p>
      </div>
    );
  }

  return (
    <div className="attendance-detail-container">
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <h1>Chi Tiết Điểm Danh</h1>
      </header>

      <div className="detail-content">
        {attendanceData.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Mã điểm danh</th>
                    <th>Mã buổi học</th>
                    <th>Trạng thái</th>
                    <th>Thời gian cập nhật</th>
                    <th className="column-ghichu">Ghi chú</th>
                    <th>Người cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={index}>
                      <td data-label="Mã điểm danh">
                        <span className="id-tag">{item.madiemdanh}</span>
                      </td>
                      <td data-label="Mã buổi học">
                        <span className="buoi-hoc-tag">{item.mabuoihoc}</span>
                      </td>
                      <td data-label="Trạng thái">
                        <span className={`status-badge-new ${item.trangthai === 'Có mặt' || item.trangthai === '1' ? 'present' : 'absent'}`}>
                          {item.trangthai || 'N/A'}
                        </span>
                      </td>
                      <td data-label="Cập nhật">
                        {item.thoigiancapnhat ? new Date(item.thoigiancapnhat).toLocaleString('vi-VN') : '---'}
                      </td>
                      <td data-label="Ghi chú" className="column-ghichu">
                        <span className="ghichu-text">{item.ghichu || 'Không có'}</span>
                      </td>
                      <td data-label="Người cập nhật">
                        <span className="updater-tag">
                          {item.manguoicapnhat === (user.masinhvien || user.username || user.id) ? 'Sinh viên' : 'Giảng viên'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="modern-pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="page-control"
                >
                  Trước
                </button>
                <div className="page-info">
                  Trang {currentPage} / {totalPages}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="page-control"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-data">
            <div className="no-data-icon">📅</div>
            <p>Chưa có dữ liệu điểm danh cho môn học này.</p>
          </div>
        )}
      </div>
    </div>
  );
}
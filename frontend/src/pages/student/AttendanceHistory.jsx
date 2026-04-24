import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AttendanceHistory.css";

export default function AttendanceHistory() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get("/students/ds/monhoc", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSubjects(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách môn học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="history-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách môn học...</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <header className="history-header-new">
        <h1>Lịch Sử Điểm Danh</h1>
        <p className="subtitle">Danh sách các môn học bạn đã tham gia</p>
      </header>

      <div className="history-grid">
        {subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <div key={index} className="history-card">
              <div className="card-header">
                <div className="subject-icon">📚</div>
                <h3 className="history-subject">{subject.monhoc}</h3>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">Lịch học:</span>
                  <span className="info-value">Thứ {subject.ngayhoccodinh}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Thời gian:</span>
                  <span className="info-value">{subject.giobatdau?.substring(0, 5)} - {subject.gioketthuc?.substring(0, 5)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Giai đoạn:</span>
                  <span className="info-value">
                    {subject.ngaybatdau ? new Date(subject.ngaybatdau).toLocaleDateString('vi-VN') : 'N/A'} - {subject.ngayketthuc ? new Date(subject.ngayketthuc).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button
                  className="history-btn-view"
                  onClick={() => navigate(`/student/attendance/${subject.malop}`)}
                >
                  Xem kết quả
                  <span className="btn-icon">→</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>Bạn chưa có lịch sử điểm danh nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
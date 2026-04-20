import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AttendanceHistory.css";

export default function AttendanceHistory() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get("/students/monhoc", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSubjects(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách môn học:", error);
        alert("Không thể tải danh sách môn học. Vui lòng thử lại sau!");
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div className="history-container">
      {/* HEADER */}
      <div className="history-header">LỊCH SỬ ĐIỂM DANH</div>

      {/* SUB HEADER */}
      <div className="history-subheader">Lựa chọn môn học</div>

      {/* LIST */}
      <div className="history-list">
        {subjects.map((subject, index) => (
          <div key={index} className="history-item">
            <div className="history-subject">{subject.monhoc}</div>
            <div className="history-details">
              <p>Ngày học cố định: {subject.ngayhoccodinh}</p>
              <p>Ngày bắt đầu: {subject.ngaybatdau}</p>
              <p>Ngày kết thúc: {subject.ngayketthuc}</p>
              <p>Giờ bắt đầu: {subject.giobatdau}</p>
              <p>Giờ kết thúc: {subject.gioketthuc}</p>
            </div>
            <button
              className="history-btn"
              onClick={() => navigate(`/student/attendance/${subject.malop}`)}
            >
              Xem kết quả
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
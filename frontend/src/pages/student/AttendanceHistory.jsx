import { useNavigate } from "react-router-dom";
import "./AttendanceHistory.css";

const subjects = [
  "Tiếng Anh 3",
  "Lập Trình Web",
  "Lập Trình Hướng Đối Tượng",
  "Kỹ Năng Giao Tiếp",
  "Thực Hành Mã Nguồn Mở",
  "Cấu Trúc Dữ Liệu & Giải Thuật",
];

export default function AttendanceHistory() {
  const navigate = useNavigate();

  return (
    <div className="history-container">
      
      {/* HEADER */}
      <div className="history-header">
        LỊCH SỬ ĐIỂM DANH
      </div>

      {/* SUB HEADER */}
      <div className="history-subheader">
        Lựa chọn môn học
      </div>

      {/* LIST */}
      <div className="history-list">
        {subjects.map((subject, index) => (
          <div key={index} className="history-item">
            <div className="history-subject">{subject}</div>

            <button 
              className="history-btn"
              onClick={() => navigate(`/student/attendance/${index}`)}
            >
              Xem kết quả
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
import React, { useState } from "react";
import "./AttendanceDetail.css";

const data = [
  { id: "BH122026", classId: "D22_TH02", date: "12/02/2026", start: "7:00", end: "12:00", status: "present" },
  { id: "BH122526", classId: "D22_TH05", date: "11/02/2026", start: "12:35", end: "15:00", status: "present" },
  { id: "BH122776", classId: "D22_TH13", date: "10/02/2026", start: "7:00", end: "9:35", status: "absent" },
  { id: "BH12826", classId: "D22_TH08", date: "09/02/2026", start: "12:35", end: "17:40", status: "absent" },
  { id: "BH125026", classId: "D22_TH06", date: "07/02/2026", start: "12:35", end: "17:40", status: "present" },
  { id: "BH122027", classId: "D22_TH02", date: "05/02/2026", start: "7:00", end: "12:00", status: "present" },
  { id: "BH122528", classId: "D22_TH05", date: "04/02/2026", start: "12:35", end: "15:00", status: "absent" },
];

export default function AttendanceDetail() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số lượt hiển thị trên mỗi trang

  // Tính toán dữ liệu hiển thị theo trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="attendance-container">
      {/* HEADER TỔNG */}
      <div className="header-top">
        <h1>LỊCH SỬ ĐIỂM DANH</h1>
      </div>

      {/* TÊN MÔN HỌC */}
      <div className="header-subject">
        <h2>Môn: Tiếng Anh 3</h2>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="table-responsive">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Mã buổi học</th>
              <th>Mã lớp</th>
              <th>Ngày học</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td data-label="Mã buổi">{item.id}</td>
                <td data-label="Mã lớp">{item.classId}</td>
                <td data-label="Ngày học" className="bold-date">{item.date}</td>
                <td data-label="Bắt đầu">{item.start}</td>
                <td data-label="Kết thúc">{item.end}</td>
                <td data-label="Trạng thái">
                  <span className={`status-badge ${item.status}`}>
                    {item.status === "present" ? "Đã điểm danh" : "Vắng"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG (PAGINATION) */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-node"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ←
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`page-node ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button 
            className="page-node"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
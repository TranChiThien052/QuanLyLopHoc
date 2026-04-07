import React from 'react';

function AttendanceReport() {
  return (
    <div>
      <h3>Thông tin điểm danh (Dành cho Quản trị viên)</h3>
      <p>Tra cứu tình hình điểm danh trên toàn hệ thống:</p>
      <input type="text" placeholder="Tìm kiếm theo MSSV hoặc MSSG..." />
      <button>Tra cứu</button>
      <p>Báo cáo hàng tuần/tháng...</p>
    </div>
  );
}

export default AttendanceReport;

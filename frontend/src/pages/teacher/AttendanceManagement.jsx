import React from 'react';

function AttendanceManagement() {
  return (
    <div>
      <h3>Quản lý điểm danh</h3>
      <p>Chọn lớp để thực hiện điểm danh:</p>
      <select>
        <option>-- Chọn lớp --</option>
        <option>Lập trình Web</option>
        <option>Cơ sở dữ liệu</option>
      </select>
      <button>Mở điểm danh</button>
    </div>
  );
}

export default AttendanceManagement;

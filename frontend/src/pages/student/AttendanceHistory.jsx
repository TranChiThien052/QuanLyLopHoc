import React from 'react';

function AttendanceHistory() {
  return (
    <div>
      <h3>Lịch sử điểm danh</h3>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>Ngày</th>
            <th>Môn học</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>01/01/2024</td>
            <td>Lập trình Web</td>
            <td style={{ color: 'green' }}>Có mặt</td>
          </tr>
          <tr>
            <td>08/01/2024</td>
            <td>Lập trình Web</td>
            <td style={{ color: 'red' }}>Vắng</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceHistory;

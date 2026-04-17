import React, { useState, useEffect } from 'react';
import './AttendanceReport.css';

// Tầng 1: Dữ liệu mẫu danh sách Lớp
const MOCK_CLASSES = [
  { maLop: 'D22_TH02', tenLop: 'Lập trình Web', khoa: 'CNTT', siSo: 55 },
  { maLop: 'D23_QT11', tenLop: 'Quản trị kinh doanh', khoa: 'QTKD', siSo: 45 },
  { maLop: 'D24_TH01', tenLop: 'Cấu trúc dữ liệu', khoa: 'CNTT', siSo: 50 },
  { maLop: 'D22_TH13', tenLop: 'Mạng máy tính', khoa: 'CNTT', siSo: 60 },
  { maLop: 'D22_TH08', tenLop: 'Hệ điều hành', khoa: 'CNTT', siSo: 40 },
];

// Tầng 2: Buổi học (Dữ liệu gốc của bạn)
const MOCK_SESSIONS = [
  { id: 'BH122026', maLop: 'D22_TH02', ngayHoc: '12/2/2026', batDau: '7:00', ketThuc: '12:00' },
  { id: 'BH102026', maLop: 'D23_QT11', ngayHoc: '10/2/2026', batDau: '7:00', ketThuc: '12:00' },
  { id: 'BH102126', maLop: 'D24_TH01', ngayHoc: '10/2/2026', batDau: '12:35', ketThuc: '15:00' },
  { id: 'BH092026', maLop: 'D22_TH13', ngayHoc: '9/2/2026', batDau: '3:10', ketThuc: '17:40' },
  { id: 'BH122027', maLop: 'D22_TH08', ngayHoc: '9/2/2026', batDau: '7:00', ketThuc: '9:35' },
];

// Tầng 3: Chi tiết điểm danh (Dữ liệu gốc của bạn)
const MOCK_DETAILS = [
  { mssv: 'DH51245', maLop: 'D22_TH02', thoiGian: '7:10', ghiChu: 'Đi trễ', trangThai: 'Đã điểm danh' },
  { mssv: 'DH51246', maLop: 'D22_TH02', thoiGian: '7:09', ghiChu: 'Nghỉ có phép', trangThai: 'Vắng' },
  { mssv: 'DH51247', maLop: 'D22_TH02', thoiGian: '7:00', ghiChu: '--', trangThai: 'Vắng' },
  { mssv: 'DH51248', maLop: 'D22_TH02', thoiGian: '7:00', ghiChu: '--', trangThai: 'Đã điểm danh' },
  { mssv: 'DH51249', maLop: 'D22_TH02', thoiGian: '7:05', ghiChu: '--', trangThai: 'Đã điểm danh' },
];

const AttendanceReport = () => {
  const [selectedClass, setSelectedClass] = useState(null); // Quản lý Lớp đang chọn
  const [selectedSession, setSelectedSession] = useState(null); // Quản lý Buổi đang chọn
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedSession]);

  // Logic lấy dữ liệu theo tầng hiện tại
  const getCurrentData = () => {
    if (selectedSession) {
      return MOCK_DETAILS.filter(d => d.mssv.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedClass) {
      return MOCK_SESSIONS.filter(s => s.maLop === selectedClass.maLop && s.id.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return MOCK_CLASSES.filter(c => c.maLop.toLowerCase().includes(searchTerm.toLowerCase()) || c.tenLop.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const filteredData = getCurrentData();
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const Pagination = () => (
    totalPages > 1 && (
      <div className="modern-pagination">
        <button className="p-nav" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>‹</button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i + 1} className={`p-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
        ))}
        <button className="p-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>›</button>
      </div>
    )
  );

  return (
    <div className="attendance-page">
      <div className="main-card">
        
        {/* TẦNG 1: DANH SÁCH LỚP HỌC */}
        {!selectedClass && (
          <div className="list-section">
            <div className="page-header">
              <div className="title-group">
                <h2 className="main-title">Thống kê theo Lớp</h2>
                <p className="sub-title">Chọn một lớp để xem danh sách các buổi học</p>
              </div>
              <div className="modern-search">
                <input type="text" placeholder="Tìm mã lớp hoặc tên môn..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button className="search-icon-btn">🔍</button>
              </div>
            </div>
            <div className="glass-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Mã Lớp</th>
                    <th>Tên Môn Học</th>
                    <th>Khoa</th>
                    <th>Sĩ Số</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((c) => (
                    <tr key={c.maLop} onClick={() => setSelectedClass(c)} className="clickable-row">
                      <td className="session-tag">{c.maLop}</td>
                      <td className="font-600">{c.tenLop}</td>
                      <td>{c.khoa}</td>
                      <td className="font-600">{c.siSo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>
        )}

        {/* TẦNG 2: DANH SÁCH BUỔI HỌC CỦA LỚP */}
        {selectedClass && !selectedSession && (
          <div className="list-section">
            <div className="detail-header-row">
              <button className="back-btn-modern" onClick={() => setSelectedClass(null)}>← Trở lại danh sách lớp</button>
              <div className="modern-search">
                <input type="text" placeholder="Tìm mã buổi học..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button className="search-icon-btn">🔍</button>
              </div>
            </div>
            <div className="page-header">
              <h2 className="main-title">Lớp: {selectedClass.maLop}</h2>
              <p className="sub-title">{selectedClass.tenLop}</p>
            </div>
            <div className="glass-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Mã buổi</th>
                    <th>Ngày học</th>
                    <th>Bắt đầu</th>
                    <th>Kết thúc</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((s) => (
                    <tr key={s.id} onClick={() => setSelectedSession(s)} className="clickable-row">
                      <td className="session-tag">{s.id}</td>
                      <td>{s.ngayHoc}</td>
                      <td>{s.batDau}</td>
                      <td>{s.ketThuc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>
        )}

        {/* TẦNG 3: CHI TIẾT ĐIỂM DANH BUỔI HỌC */}
        {selectedSession && (
          <div className="detail-section">
            <div className="detail-header-row">
              <button className="back-btn-modern" onClick={() => setSelectedSession(null)}>← Trở lại danh sách buổi</button>
              <div className="modern-search detail-search">
                <input type="text" placeholder="Tìm MSSV..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button className="search-icon-btn">🔍</button>
              </div>
            </div>
            <div className="detail-top-card">
              <div className="session-summary">
                <h3>Lớp: <span>{selectedClass.maLop}</span></h3>
                <div className="summary-pills">
                  <span>Mã buổi: {selectedSession.id}</span>
                  <span>📅 {selectedSession.ngayHoc}</span>
                </div>
              </div>
              <div className="session-metrics">
                <div className="metric-item"><span className="m-val">{selectedClass.siSo}</span><span className="m-lbl">SĨ SỐ</span></div>
                <div className="metric-item highlight"><span className="m-val">40</span><span className="m-lbl">HIỆN DIỆN</span></div>
              </div>
            </div>
            <div className="glass-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>MSSV</th>
                    <th>MÃ LỚP</th>
                    <th>CẬP NHẬT</th>
                    <th className="hide-sm">GHI CHÚ</th>
                    <th>TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((d, i) => (
                    <tr key={i}>
                      <td className="font-600">{d.mssv}</td>
                      <td>{d.maLop}</td>
                      <td className="font-600">{d.thoiGian}</td>
                      <td className="hide-sm">{d.ghiChu}</td>
                      <td>
                        <span className={`status-text ${d.trangThai === 'Đã điểm danh' ? 'text-present' : 'text-absent'}`}>
                          {d.trangThai}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceReport;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './Statistics.css';

// Dữ liệu mẫu danh sách buổi học
const MOCK_SESSIONS = [
  { id: 'BH122026', maLop: 'D22_TH02', ngayHoc: '12/2/2026', batDau: '7:00', ketThuc: '12:00' },
  { id: 'BH102026', maLop: 'D23_QT11', ngayHoc: '10/2/2026', batDau: '7:00', ketThuc: '12:00' },
  { id: 'BH102126', maLop: 'D24_TH01', ngayHoc: '10/2/2026', batDau: '12:35', ketThuc: '15:00' },
  { id: 'BH092026', maLop: 'D22_TH13', ngayHoc: '9/2/2026', batDau: '3:10', ketThuc: '17:40' },
  { id: 'BH122027', maLop: 'D22_TH08', ngayHoc: '9/2/2026', batDau: '7:00', ketThuc: '9:35' },
  { id: 'BH122028', maLop: 'D22_TH09', ngayHoc: '8/2/2026', batDau: '7:00', ketThuc: '12:00' }, // Thêm để test phân trang
];

// Dữ liệu mẫu chi tiết điểm danh sinh viên
const MOCK_DETAILS = [
  { mssv: 'DH51245', maLop: 'D22_TH02', thoiGian: '7:10', ghiChu: 'Đi trễ', trangThai: 'Đã điểm danh' },
  { mssv: 'DH51246', maLop: 'D22_TH02', thoiGian: '7:09', ghiChu: 'Nghỉ có phép', trangThai: 'Vắng' },
  { mssv: 'DH51247', maLop: 'D22_TH02', thoiGian: '7:00', ghiChu: '--', trangThai: 'Vắng' },
  { mssv: 'DH51248', maLop: 'D22_TH02', thoiGian: '7:00', ghiChu: '--', trangThai: 'Đã điểm danh' },
  { mssv: 'DH51249', maLop: 'D22_TH02', thoiGian: '7:05', ghiChu: '--', trangThai: 'Đã điểm danh' },
  { mssv: 'DH51250', maLop: 'D22_TH02', thoiGian: '7:15', ghiChu: '--', trangThai: 'Vắng' },
];

const Statistics = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const selectedSession = MOCK_SESSIONS.find(s => s.id === sessionId) || {
    id: sessionId || 'Unknown',
    maLop: state?.className || 'Lớp học không xác định',
    ngayHoc: '--/--/----',
    batDau: '--:--',
    ketThuc: '--:--'
  };

  const [detailSearch, setDetailSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset về trang 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [detailSearch, sessionId]);

  // Logic lọc dữ liệu sinh viên trong buổi
  const filteredData = MOCK_DETAILS.filter(d => d.mssv.toLowerCase().includes(detailSearch.toLowerCase()));

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Component phân trang dùng chung
  const Pagination = () => (
    totalPages > 1 && (
      <div className="modern-pagination">
        <button
          className="p-nav"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          ‹
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            className={`p-num ${currentPage === i + 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="p-nav"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          ›
        </button>
      </div>
    )
  );

  return (
    <div className="attendance-page">
      <div className="main-card">
        {/* GIAO DIỆN CHI TIẾT ĐIỂM DANH */}
        <div className="detail-section">
          <div className="detail-header-row">
            <button className="back-btn-modern" onClick={() => navigate(-1)}>
              ← Trở lại
            </button>
            <div className="modern-search detail-search">
              <input
                type="text"
                placeholder="Tìm kiếm sinh viên..."
                value={detailSearch}
                onChange={(e) => setDetailSearch(e.target.value)}
              />
              <button className="search-icon-btn">🔍</button>
            </div>
          </div>

          <div className="detail-top-card">
            <div className="session-summary">
              <h3>Lớp: <span>{selectedSession.maLop}</span></h3>
              <div className="summary-pills">
                <span>Mã: {selectedSession.id}</span>
                <span>📅 {selectedSession.ngayHoc}</span>
              </div>
            </div>
            <div className="session-metrics">
              <div className="metric-item">
                <span className="m-val">55</span>
                <span className="m-lbl">SỈ SỐ</span>
              </div>
              <div className="metric-item highlight">
                <span className="m-val">40</span>
                <span className="m-lbl">HIỆN DIỆN</span>
              </div>
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
      </div>
    </div>
  );
};

export default Statistics;

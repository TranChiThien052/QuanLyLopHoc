import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Statistics.css';

// Dữ liệu mẫu danh sách lớp
const CLASSES_DB = [
  { id: 'cntt-th10', name: 'Lớp CNTT TH10', totalStudents: 80, avgAttendance: 75 },
  { id: 'qtkd-kd07', name: 'Lớp Quản trị kinh doanh KD07', totalStudents: 79, avgAttendance: 70 },
  { id: 'tkdh-06', name: 'Lớp Thiết Kế Đồ Họa 06', totalStudents: 90, avgAttendance: 85 },
  { id: 'mkt-mk01', name: 'Lớp Marketing MK01', totalStudents: 50, avgAttendance: 48 },
];

// Dữ liệu mẫu thống kê các buổi học của lớp
const MOCK_CLASS_SESSIONS = [
  { id: 'BH122026', classId: "cntt-th10", ngayHoc: '12/2/2026', batDau: '7:00', ketThuc: '12:00', siSo: 80, hienDien: 70, tiLe: '88%' },
  { id: 'BH102026', classId: "cntt-th10", ngayHoc: '10/2/2026', batDau: '7:00', ketThuc: '12:00', siSo: 80, hienDien: 80, tiLe: '100%' },
  { id: 'BH12242', classId: "qtkd-kd07", ngayHoc: '10/2/2026', batDau: '12:35', ketThuc: '15:00', siSo: 79, hienDien: 79, tiLe: '100%' },
  { id: 'BH122786', classId: "tkdh-06", ngayHoc: '9/2/2026', batDau: '3:10', ketThuc: '17:40', siSo: 90, hienDien: 90, tiLe: '100%' },
  { id: 'BH1213226', classId: "tkdh-06", ngayHoc: '9/2/2026', batDau: '7:00', ketThuc: '9:35', siSo: 90, hienDien: 69, tiLe: '76%' },
  { id: 'BH122029', classId: "mkt-mk01", ngayHoc: '8/2/2026', batDau: '7:00', ketThuc: '12:00', siSo: 50, hienDien: 48, tiLe: '96%' },
];

const ClassStatistics = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const currentClass = CLASSES_DB.find(c => c.id === classId) || {
    id: classId || 'Unknown',
    name: 'Lớp không xác định',
    totalStudents: 0,
    avgAttendance: 0
  };

  const classSessionsData = MOCK_CLASS_SESSIONS.filter(s => s.classId === classId);

  // Reset về trang 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Logic lọc dữ liệu
  const filteredData = classSessionsData.filter(s => s.id.toLowerCase().includes(searchTerm.toLowerCase()));

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Component phân trang
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
        <div className="detail-section">
          <div className="detail-header-row">
            <button className="back-btn-modern" onClick={() => navigate(-1)}>
              ← Trở lại
            </button>
            <div className="modern-search detail-search">
              <input
                type="text"
                placeholder="Tìm kiếm mã buổi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-icon-btn">🔍</button>
            </div>
          </div>

          <div className="detail-top-card">
            <div className="session-summary">
              <h3>Lớp: <span>{currentClass.name}</span></h3>
              <div className="summary-pills">
                <span>Mã lớp: {currentClass.id}</span>
                <span>📅 Năm học 2026</span>
              </div>
            </div>
            <div className="session-metrics">
              <div className="metric-item">
                <span className="m-val">{currentClass.totalStudents}</span>
                <span className="m-lbl">SỈ SỐ LỚP</span>
              </div>
              <div className="metric-item highlight">
                <span className="m-val">{currentClass.avgAttendance}</span>
                <span className="m-lbl">HIỆN DIỆN (Trung bình)</span>
              </div>
            </div>
          </div>

          <div className="glass-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>MÃ BUỔI</th>
                  <th>NGÀY HỌC</th>
                  <th>B.ĐẦU - K.THÚC</th>
                  <th>HIỆN DIỆN/SỈ SỐ</th>
                  <th>TỈ LỆ</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((s, i) => (
                  <tr key={i}>
                    <td className="font-600 session-tag">{s.id}</td>
                    <td>{s.ngayHoc}</td>
                    <td>{s.batDau} - {s.ketThuc}</td>
                    <td className="font-600">{s.hienDien} / {s.siSo}</td>
                    <td>
                      <span className="status-text text-present">
                        {s.tiLe}
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

export default ClassStatistics;

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './ClassManagement.css';

const MOCK_STUDENTS = [
  { mssv: 'DH52201', hoTen: 'Nguyễn Văn A', sdt: '0901234567', email: 'a@stu.edu.vn' },
  { mssv: 'DH52202', hoTen: 'Trần Thị B', sdt: '0907654321', email: 'b@stu.edu.vn' },
  { mssv: 'DH52203', hoTen: 'Lê Văn C', sdt: '0911223344', email: 'c@stu.edu.vn' },
  { mssv: 'DH52204', hoTen: 'Phạm Minh D', sdt: '0988776655', email: 'd@stu.edu.vn' },
  { mssv: 'DH52205', hoTen: 'Hoàng Anh E', sdt: '0933445566', email: 'e@stu.edu.vn' },
];

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState('');

  const isMobile = window.innerWidth < 768;
  const itemsPerPage = isMobile ? 3 : 5;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/classes');
        setClasses(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu lớp học:", err);
        setError("Không thể tải dữ liệu lớp học.");
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, searchTerm]);

  const rawData = selectedClass ? MOCK_STUDENTS : classes;
  const filteredData = rawData.filter(item => {
    const search = searchTerm.toLowerCase();
    if (selectedClass) {
      return (item.hoTen || "").toLowerCase().includes(search) || (item.mssv || "").includes(search);
    }
    return (item.tenlop || "").toLowerCase().includes(search) || (item.malop || "").toString().toLowerCase().includes(search);
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  const Pagination = () => (
    totalPages > 1 && (
      <div className="modern-pagination">
        <button className="p-nav" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
        {[...Array(totalPages)].map((_, i) => (
          <button 
            key={i+1} 
            className={`p-num ${currentPage === i + 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button className="p-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
      </div>
    )
  );

  if (loading && !selectedClass) return <div className="class-page center-msg">Đang tải dữ liệu lớp học...</div>;
  if (error && !selectedClass) return <div className="class-page center-msg text-error">{error}</div>;

  return (
    <div className="class-page">
      <div className="main-card-full">
        {!selectedClass ? (
          <div className="view-animate">
            <div className="class-header">
              <div className="header-text">
                <h2 className="title-modern">Quản lý lớp học</h2>
                <p className="subtitle">Giảng viên: <span><strong>Bùi Nhật Bằng</strong></span></p>
              </div>
              <div className="header-actions">
                <div className="search-wrapper">
                  <input 
                    type="text" 
                    placeholder="Tìm mã lớp, tên lớp..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Thêm lớp</button>
              </div>
            </div>

            <div className="desktop-only">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Mã lớp</th>
                    <th>Tên lớp</th>
                    <th>Môn học</th>
                    <th>Lịch học</th>
                    <th>Thời gian</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((c) => (
                    <tr key={c.malop} className="row-hover" onClick={() => setSelectedClass(c)}>
                      <td className="font-bold text-navy">{c.malop}</td>
                      <td>{c.tenlop}</td>
                      <td>{c.monhoc}</td>
                      <td className="text-cyan font-bold">
                        {c.ngayhoccodinh} ({formatTime(c.giobatdau)} - {formatTime(c.gioketthuc)})
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {c.ngaybatdau} đến {c.ngayketthuc}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="action-flex">
                          <button className="icon-btn edit">✏️</button>
                          <button className="icon-btn delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-only">
              {currentItems.map((c) => (
                <div className="mobile-card" key={c.malop} onClick={() => setSelectedClass(c)}>
                  <div className="card-top">
                    <span className="badge">{c.malop}</span>
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="action-small">✏️</button>
                      <button className="action-small">🗑️</button>
                    </div>
                  </div>
                  <h3>Lớp {c.tenlop}</h3>
                  <p>Môn: {c.monhoc}</p>
                  <p>Lịch: <span className="text-cyan font-bold">{c.ngayhoccodinh}</span></p>
                  <p style={{ fontSize: '11px' }}>{c.ngaybatdau} → {c.ngayketthuc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="view-animate">
            <div className="class-header">
              <button className="btn-back" onClick={() => setSelectedClass(null)}>← Trở lại</button>
              <div className="header-actions">
                <div className="search-wrapper">
                  <input 
                    type="text" 
                    placeholder="Tìm MSSV, tên..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn-primary">+ Thêm SV</button>
              </div>
            </div>

            <div className="hero-banner">
              <div className="hero-info">
                <h2>Lớp: <span className="text-cyan"><strong>{selectedClass.tenlop}</strong></span></h2>
                <p>Môn học: <strong>{selectedClass.monhoc}</strong> | Mã: <strong>{selectedClass.malop}</strong></p>
              </div>
              <div className="hero-stat">
                <span className="stat-lbl">Lịch: </span>
                <span className="stat-num"><strong>{selectedClass.ngayhoccodinh}</strong></span>
              </div>
            </div>

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>MSSV</th>
                    <th>Họ và Tên</th>
                    <th className="hide-sm">Số điện thoại</th>
                    <th className="hide-sm">Email</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((s) => (
                    <tr key={s.mssv}>
                      <td className="font-bold text-navy">{s.mssv}</td>
                      <td className="font-bold">{s.hoTen}</td>
                      <td className="hide-sm">{s.sdt}</td>
                      <td className="hide-sm">{s.email}</td>
                      <td>
                        <div className="action-flex">
                          <button className="icon-btn edit">✏️</button>
                          <button className="icon-btn delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <Pagination />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <div className="modal-header">
              <h3>Tạo lớp học phần mới</h3>
              <button className="close-x" onClick={() => {setShowModal(false); setFileName('');}}>×</button>
            </div>
            
            <form className="modal-form" onSubmit={(e) => {e.preventDefault(); setShowModal(false);}}>
              <div className="input-group">
                <label>Môn học</label>
                <input type="text" placeholder="Ví dụ: Lập trình Web" required />
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Ngày bắt đầu</label>
                  <input type="date" required />
                </div>
                <div className="input-group">
                  <label>Ngày kết thúc</label>
                  <input type="date" required />
                </div>
              </div>

              <div className="student-input-section">
                <p className="section-label">Thông tin sinh viên</p>
                
                <label className="excel-drop-zone">
                  <span className="icon">📊</span>
                  <span className="text">{fileName || "Chọn file Excel danh sách SV (.xlsx)"}</span>
                  <input 
                    type="file" 
                    hidden 
                    accept=".xlsx, .xls" 
                    onChange={(e) => setFileName(e.target.files[0]?.name)} 
                    disabled={true}
                  />
                </label>

                <div className="manual-divider">
                  <span>HOẶC</span>
                </div>

                <button type="button" className="btn-manual-entry">
                  Nhập thủ công thông tin sinh viên
                </button>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => {setShowModal(false); setFileName('');}}>Hủy bỏ</button>
                <button type="submit" className="btn-modal-confirm">Xác nhận tạo lớp</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;

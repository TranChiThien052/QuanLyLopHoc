import React, { useState, useEffect } from 'react';
import './ClassManagement.css';

// Dữ liệu mẫu
const MOCK_CLASSES = [
  { id: 'D22_TH10', tenLop: 'CNTT TH10', soLuong: 70, monHoc: 'Lập trình web', ngayBD: '2026-01-10', ngayKT: '2026-05-20' },
  { id: 'D23_QT11', tenLop: 'Quản trị KD07', soLuong: 79, monHoc: 'Kỹ năng giao tiếp', ngayBD: '2026-02-15', ngayKT: '2026-06-15' },
  { id: 'D22_TH05', tenLop: 'CNTT TH05', soLuong: 90, monHoc: 'Cấu trúc dữ liệu', ngayBD: '2026-01-05', ngayKT: '2026-05-15' },
  { id: 'D24_TH01', tenLop: 'CNTT TH01', soLuong: 85, monHoc: 'Mạng máy tính', ngayBD: '2026-03-10', ngayKT: '2026-07-10' },
  { id: 'D22_TH12', tenLop: 'CNTT TH12', soLuong: 65, monHoc: 'Cơ sở dữ liệu', ngayBD: '2026-02-01', ngayKT: '2026-06-01' },
  { id: 'D22_TH08', tenLop: 'CNTT TH08', soLuong: 75, monHoc: 'Hệ điều hành', ngayBD: '2026-01-20', ngayKT: '2026-05-25' },
];

const MOCK_STUDENTS = [
  { mssv: 'DH52201', hoTen: 'Nguyễn Văn A', sdt: '0901234567', email: 'a@stu.edu.vn' },
  { mssv: 'DH52202', hoTen: 'Trần Thị B', sdt: '0907654321', email: 'b@stu.edu.vn' },
  { mssv: 'DH52203', hoTen: 'Lê Văn C', sdt: '0911223344', email: 'c@stu.edu.vn' },
  { mssv: 'DH52204', hoTen: 'Phạm Minh D', sdt: '0988776655', email: 'd@stu.edu.vn' },
  { mssv: 'DH52205', hoTen: 'Hoàng Anh E', sdt: '0933445566', email: 'e@stu.edu.vn' },
];

const ClassManagement = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- STATE MỚI CHO POPUP ---
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState('');

  // Tự động nhận diện số lượng item theo màn hình
  const isMobile = window.innerWidth < 768;
  const itemsPerPage = isMobile ? 3 : 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, searchTerm]);

  const rawData = selectedClass ? MOCK_STUDENTS : MOCK_CLASSES;
  const filteredData = rawData.filter(item => {
    const search = searchTerm.toLowerCase();
    if (selectedClass) {
      return item.hoTen.toLowerCase().includes(search) || item.mssv.includes(search);
    }
    return item.tenLop.toLowerCase().includes(search) || item.id.toLowerCase().includes(search);
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                {/* GẮN SỰ KIỆN MỞ MODAL */}
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Thêm lớp</button>
              </div>
            </div>

            <div className="desktop-only">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Mã lớp</th>
                    <th>Tên lớp</th>
                    <th>Sỉ số</th>
                    <th>Môn học</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((c) => (
                    <tr key={c.id} className="row-hover" onClick={() => setSelectedClass(c)}>
                      <td className="font-bold text-navy">{c.id}</td>
                      <td>{c.tenLop}</td>
                      <td className="text-cyan font-bold">{c.soLuong} SV</td>
                      <td>{c.monHoc}</td>
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
                <div className="mobile-card" key={c.id} onClick={() => setSelectedClass(c)}>
                  <div className="card-top">
                    <span className="badge">{c.id}</span>
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="action-small">✏️</button>
                      <button className="action-small">🗑️</button>
                    </div>
                  </div>
                  <h3>Lớp {c.tenLop}</h3>
                  <p>Môn: {c.monHoc}</p>
                  <p>Sỉ số: <span className="text-cyan font-bold">{c.soLuong} SV</span></p>
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
                <h2>Lớp: <span className="text-cyan"><strong>{selectedClass.tenLop}</strong></span></h2>
                <p>Môn học: <strong>{selectedClass.monHoc}</strong> | Mã: <strong>{selectedClass.id}</strong></p>
              </div>
              <div className="hero-stat">
                <span className="stat-lbl">Sinh viên: </span>
                <span className="stat-num"><strong>{selectedClass.soLuong}</strong></span>
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

      {/* --- MODAL THÊM LỚP (GIỮ NGUYÊN JSX CỦA BẠN VÀ FIX LỖI) --- */}
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
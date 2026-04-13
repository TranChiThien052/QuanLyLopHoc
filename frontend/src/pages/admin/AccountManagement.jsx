import React, { useState, useEffect } from 'react';
import './AccountManagement.css';

const MOCK_DATA = [
  // --- SINH VIÊN ---
  { id: 1, maTK: 'TK1001', taiKhoan: 'SV52201', hoTen: 'Nguyễn Văn An', lop: 'D22_TH01', loai: 'sinhvien' },
  { id: 2, maTK: 'TK1002', taiKhoan: 'SV52202', hoTen: 'Trần Thị Bình', lop: 'D22_TH03', loai: 'sinhvien' },
  { id: 3, maTK: 'TK1003', taiKhoan: 'SV52203', hoTen: 'Lê Hoàng Chúc', lop: 'D22_TH10', loai: 'sinhvien' },
  { id: 4, maTK: 'TK1004', taiKhoan: 'SV52204', hoTen: 'Phạm Minh Đăng', lop: 'D22_TH10', loai: 'sinhvien' },
  { id: 5, maTK: 'TK1005', taiKhoan: 'SV52205', hoTen: 'Võ Thành Huy', lop: 'D22_TH07', loai: 'sinhvien' },
  { id: 6, maTK: 'TK1006', taiKhoan: 'SV52206', hoTen: 'Đỗ Quốc Khoa', lop: 'D22_TH10', loai: 'sinhvien' },
  { id: 7, maTK: 'TK1007', taiKhoan: 'SV52207', hoTen: 'Ngô Minh Quý', lop: 'D22_TH10', loai: 'sinhvien' },
  { id: 8, maTK: 'TK1008', taiKhoan: 'SV52208', hoTen: 'Bùi Thanh Phong', lop: 'D22_TH10', loai: 'sinhvien' },
  { id: 9, maTK: 'TK1009', taiKhoan: 'SV52209', hoTen: 'Phan Tuấn Anh', lop: 'D22_TH10', loai: 'sinhvien' },
  { id: 10, maTK: 'TK1010', taiKhoan: 'SV52210', hoTen: 'Trương Mỹ Linh', lop: 'D23_QT01', loai: 'sinhvien' },
  { id: 11, maTK: 'TK1011', taiKhoan: 'SV52211', hoTen: 'Lý Tiểu Phụng', lop: 'D23_QT05', loai: 'sinhvien' },
  { id: 12, maTK: 'TK1012', taiKhoan: 'SV52212', hoTen: 'Hà Vĩnh Thụy', lop: 'D24_TH02', loai: 'sinhvien' },

  // --- GIẢNG VIÊN ---
  { id: 101, maTK: 'TK2001', taiKhoan: 'GV001', hoTen: 'Nguyễn Văn Xuân', lop: 'Khoa CNTT', loai: 'giangvien' },
  { id: 102, maTK: 'TK2002', taiKhoan: 'GV002', hoTen: 'Trần Thị Yên', lop: 'Khoa Cơ Khí', loai: 'giangvien' },
  { id: 103, maTK: 'TK2003', taiKhoan: 'GV003', hoTen: 'Lê Quang Định', lop: 'Khoa Điện Tử', loai: 'giangvien' },
  { id: 104, maTK: 'TK2004', taiKhoan: 'GV004', hoTen: 'Hoàng Hữu Phước', lop: 'Khoa CNTT', loai: 'giangvien' },
  { id: 105, maTK: 'TK2005', taiKhoan: 'GV005', hoTen: 'Đặng Minh Châu', lop: 'Khoa Quản Trị', loai: 'giangvien' },
  { id: 106, maTK: 'TK2006', taiKhoan: 'GV006', hoTen: 'Vũ Hoài Nam', lop: 'Khoa CNTT', loai: 'giangvien' },
];

const AccountManagement = () => {
  const [activeTab, setActiveTab] = useState('sinhvien');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- STATE CHO MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ma: '',
    ho: '',
    ten: '',
    ngaySinh: '',
    email: '',
    sdt: '',
    lop: ''
  });

  const filteredData = MOCK_DATA.filter(item => 
    item.loai === activeTab && 
    (item.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.taiKhoan.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // --- XỬ LÝ MODAL ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ ma: '', ho: '', ten: '', ngaySinh: '', email: '', sdt: '', lop: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu thêm mới:", formData);
    // Xử lý logic thêm dữ liệu tại đây
    closeModal();
  };

  return (
    <div className="admin-page-container">
      <div className="admin-card">
        <div className="admin-header">
          <h2 className="header-title">Quản lý tài khoản</h2>
          <div className="header-controls">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Tìm tên, mã số..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-add" onClick={() => setShowModal(true)}>+ Thêm mới</button>
          </div>
        </div>

        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'sinhvien' ? 'active' : ''}`} 
            onClick={() => setActiveTab('sinhvien')}
          >
            Sinh Viên
          </button>
          <button 
            className={`tab-btn ${activeTab === 'giangvien' ? 'active' : ''}`} 
            onClick={() => setActiveTab('giangvien')}
          >
            Giảng viên
          </button>
        </div>

        <div className="table-wrapper">
          {filteredData.length > 0 ? (
            <>
              <table className="account-table">
                <thead>
                  <tr>
                    <th className={activeTab === 'sinhvien' ? 'hide-mobile' : ''}>Mã TK</th>
                    <th>Tài Khoản</th>
                    <th>Họ Tên</th>
                    <th className={activeTab === 'giangvien' ? 'hide-mobile' : ''}>Lớp Học</th>
                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id}>
                      <td className={activeTab === 'sinhvien' ? 'hide-mobile' : ''}>{item.maTK}</td>
                      <td>{item.taiKhoan}</td>
                      <td className="text-bold">{item.hoTen}</td>
                      <td className={activeTab === 'giangvien' ? 'hide-mobile' : ''}>{item.lop}</td>
                      <td>
                        <div className="action-box">
                          <button className="icon-btn delete" title="Xóa">🗑️</button>
                          <button className="icon-btn edit" title="Sửa">📝</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="modern-pagination">
                  <button className="p-nav" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>‹</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} className={`p-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="p-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>›</button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>Không tìm thấy tài khoản nào phù hợp.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- POPUP MODAL THÊM MỚI --- */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-text">
                <h3>Thêm {activeTab === 'sinhvien' ? 'Sinh Viên' : 'Giảng Viên'}</h3>
                <p>Nhập đầy đủ thông tin để tạo tài khoản mới</p>
              </div>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Mã {activeTab === 'sinhvien' ? 'sinh viên' : 'giảng viên'}</label>
                  <input type="text" name="ma" value={formData.ma} onChange={handleInputChange} required placeholder="Ví dụ: DH5220..." />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Họ</label>
                    <input type="text" name="ho" value={formData.ho} onChange={handleInputChange} required placeholder="Nguyễn Văn" />
                  </div>
                  <div className="form-group">
                    <label>Tên</label>
                    <input type="text" name="ten" value={formData.ten} onChange={handleInputChange} required placeholder="An" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="tel" name="sdt" value={formData.sdt} onChange={handleInputChange} required placeholder="09xx xxx xxx" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="vi_du@stu.edu.vn" />
                </div>

                {activeTab === 'sinhvien' && (
                  <div className="form-group">
                    <label>Lớp đang theo học</label>
                    <input type="text" name="lop" value={formData.lop} onChange={handleInputChange} required placeholder="D22_TH10" />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Hủy</button>
                <button type="submit" className="btn-submit">Lưu tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
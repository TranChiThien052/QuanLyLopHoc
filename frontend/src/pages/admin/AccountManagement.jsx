import React, { useState, useEffect } from 'react';
import './AccountManagement.css';

const MOCK_DATA = [
  // Thêm trường maTK để giống Figma
  { id: 1, maTK: 'TK1245', taiKhoan: 'SV12345', hoTen: 'Nguyễn Văn A', lop: 'D22_TH01', loai: 'sinhvien' },
  { id: 2, maTK: 'TK1245', taiKhoan: 'SV12312', hoTen: 'Trần Văn B', lop: 'D22_TH03', loai: 'sinhvien' },
  { id: 3, maTK: 'TK1245', taiKhoan: 'SV12548', hoTen: 'Hoàng Thị A', lop: 'D22_TH10', loai: 'sinhvien' },
  { id: 4, maTK: 'TK1245', taiKhoan: 'SV12388', hoTen: 'Trần Thanh C', lop: 'D22_TH07', loai: 'sinhvien' },
  { id: 5, maTK: 'TK1245', taiKhoan: 'SV12345', hoTen: 'Trần Phương D', lop: 'D22_TH08', loai: 'sinhvien' },
  { id: 6, maTK: 'TK1245', taiKhoan: 'SV99999', hoTen: 'Lý Tiểu Long', lop: 'D22_TH10', loai: 'sinhvien' },
  { id: 101, maTK: 'TK1245', taiKhoan: 'GV001', hoTen: 'Nguyễn Văn X', lop: 'Khoa CNTT', loai: 'giangvien' },
  { id: 102, maTK: 'TK1245', taiKhoan: 'GV002', hoTen: 'Trần Thị Y', lop: 'Khoa Cơ Khí', loai: 'giangvien' },
];

const AccountManagement = () => {
  const [activeTab, setActiveTab] = useState('sinhvien');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
            <button className="btn-add">+ Thêm mới</button>
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
                    {/* Sinh viên thì ẩn Mã TK trên mobile */}
                    <th className={activeTab === 'sinhvien' ? 'hide-mobile' : ''}>Mã TK</th>
                    <th>Tài Khoản</th>
                    <th>Họ Tên</th>
                    {/* Giảng viên thì ẩn Lớp Học trên mobile */}
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
                          <button className="btn-icon delete" title="Xóa">🗑️</button>
                          <button className="btn-icon edit" title="Sửa">📝</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-arrow"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    ←
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button 
                    className="page-arrow"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    →
                  </button>
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
    </div>
  );
};

export default AccountManagement;
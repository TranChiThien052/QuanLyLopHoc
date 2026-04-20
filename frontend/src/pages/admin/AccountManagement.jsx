import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AccountManagement.css';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });

const AccountManagement = () => {
  const [allProfiles, setAllProfiles] = useState([]); 
  const [profiles, setProfiles] = useState([]);         
  const [activeTab, setActiveTab] = useState('sinhvien');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Đã xóa selectedAccount và setSelectedAccount để hết lỗi ESLint
  
  const [formData, setFormData] = useState({
    ma: '', ho: '', ten: '', ngaySinh: '', email: '', sodienthoai: '', malop: ''
  });
  const [errors, setErrors] = useState({});

  // 1. Tải dữ liệu từ Backend
  const loadProfiles = useCallback(async () => {
    try {
      const path = activeTab === 'sinhvien' ? '/students' : '/teachers';
      const response = await api.get(path);
      setAllProfiles(response.data);
      setProfiles(response.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  }, [activeTab]);

  useEffect(() => {
    loadProfiles();
    setCurrentPage(1);
  }, [loadProfiles]);

  // 2. Tìm kiếm (Live Search)
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      const cleanSearch = searchTerm.trim().toLowerCase();
      if (!cleanSearch) {
        setProfiles(allProfiles);
        return;
      }
      const found = allProfiles.filter(p => {
        const maSo = (p.masinhvien || p.magiangvien || "").toString().trim().toLowerCase();
        const hoTen = `${p.holot} ${p.ten}`.toLowerCase();
        return maSo.includes(cleanSearch) || hoTen.includes(cleanSearch);
      });
      setProfiles(found);
    }, 450);
    return () => clearTimeout(delaySearch);
  }, [searchTerm, allProfiles]);

  // 3. Mở Modal sửa hồ sơ
  const openEditModal = (p) => {
    setFormData({
      ma: (p.masinhvien || p.magiangvien).toString().trim(),
      ho: p.holot || '',
      ten: p.ten || '',
      ngaySinh: p.ngaysinh ? p.ngaysinh.substring(0, 10) : '', 
      email: p.email || '',        
      sodienthoai: p.sodienthoai || '', 
      malop: p.malop || ''
    });
    setErrors({});
    setShowEditModal(true);
  };

  // 4. Xóa hồ sơ (Đã khớp với Route Backend)
  const handleDelete = async (id) => {
    const cleanId = id.toString().trim();
    if (!window.confirm(`Bạn có chắc muốn xoá vĩnh viễn ${cleanId}?`)) return;

    try {
      const profilePath = activeTab === 'sinhvien' ? `/students/${cleanId}` : `/teachers/${cleanId}`;
      await api.delete(profilePath);

      const updated = allProfiles.filter(p => (p.masinhvien || p.magiangvien).toString().trim() !== cleanId);
      setAllProfiles(updated);
      setProfiles(updated);
      alert("Đã xoá thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi xoá. Vui lòng kiểm tra kết nối host!");
    }
  };

  // 5. Kiểm tra dữ liệu Form (Validate)
  const validate = (isEdit = false) => {
    let newErrors = {};
    const cleanMa = formData.ma.trim();
    const cleanHo = formData.ho.trim();
    const cleanTen = formData.ten.trim();
    const cleanEmail = formData.email.trim();
    const cleanSdt = formData.sodienthoai.trim();
    // Đã xóa cleanLop không dùng ở đây để hết lỗi ESLint

    if (!isEdit) {
      if (!cleanMa) newErrors.ma = "Mã tài khoản không được trống";
      else if (allProfiles.some(p => (p.masinhvien || p.magiangvien || "").toString().trim().toLowerCase() === cleanMa.toLowerCase())) {
        newErrors.ma = "Mã này đã tồn tại!";
      }
    }

    if (!cleanHo) newErrors.ho = "Vui lòng nhập họ lót";
    if (!cleanTen) newErrors.ten = "Vui lòng nhập tên";
    if (!formData.ngaySinh) newErrors.ngaySinh = "Ngày sinh là bắt buộc";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) newErrors.email = "Email không hợp lệ";

    const phoneRegex = /^[0-9]{10}$/;
    if (!cleanSdt || !phoneRegex.test(cleanSdt)) newErrors.sodienthoai = "SĐT phải đủ 10 chữ số";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file || activeTab === 'giangvien') return;
    const data = new FormData();
    data.append('excelFile', file);
    try {
      // Gọi đúng Route /students/bulk
      const response = await api.post('/students/bulk', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.code === 200) {
        alert(response.data.message);
        loadProfiles();
      }
    } catch (err) {
      alert("Lỗi Import: Kiểm tra định dạng cột trong file Excel!");
    } finally { e.target.value = null; }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validate(false)) return;
    try {
      const pData = { ten: formData.ten, holot: formData.ho, ngaysinh: formData.ngaySinh, email: formData.email, sodienthoai: formData.sodienthoai };
      if (activeTab === 'sinhvien') {
        await api.post('/students', { masinhvien: formData.ma, ...pData, malop: formData.malop });
      } else {
        await api.post('/teachers', { magiangvien: formData.ma, ...pData });
      }
      alert("Thêm thành công!"); 
      setShowAddModal(false);
      loadProfiles();
    } catch (err) { alert("Lỗi khi thêm hồ sơ mới!"); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanId = formData.ma.trim();
      const path = activeTab === 'sinhvien' ? `/students/${cleanId}` : `/teachers/${cleanId}`;
      const updateData = { holot: formData.ho, ten: formData.ten, ngaysinh: formData.ngaySinh, email: formData.email, sodienthoai: formData.sodienthoai, ...(activeTab === 'sinhvien' && { malop: formData.malop }) };
      await api.put(path, updateData);
      alert("Cập nhật thành công!");
      setShowEditModal(false);
      loadProfiles();
    } catch (error) { alert("Lỗi cập nhật dữ liệu!"); }
  };

  const handleResetPassword = async (username) => {
    if (window.confirm(`Reset mật khẩu cho ${username}?`)) {
      try {
        // Khớp với Route /accounts/:username
        await api.put(`/accounts/${username}`, {
          mataikhoan: username,
          password: username,
          role: activeTab === 'sinhvien' ? 'student' : 'teacher'
        });
        alert("Reset thành công!");
      } catch (e) { alert("Lỗi Backend khi reset mật khẩu!"); }
    }
  };

  const currentItems = profiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(profiles.length / itemsPerPage);

  return (
    <div className="admin-page-container">
      <div className="admin-card">
        <div className="admin-header">
          <h2 className="header-title">Quản lý STU</h2>
          <div className="header-controls">
            <input type="text" placeholder="Tìm mã tài khoản..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {activeTab === 'sinhvien' && (
                <label className="btn-import-excel-label">
                  📁 Nhập Excel
                  <input type="file" accept=".xlsx, .xls" hidden onChange={handleImportExcel} />
                </label>
              )}
            <button className="btn-add" onClick={() => { setShowAddModal(true); setFormData({ma:'',ho:'',ten:'',ngaySinh:'',email:'',sodienthoai:'',malop:''}); }}>+ Thêm mới</button>
          </div>
        </div>

        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'sinhvien' ? 'active' : ''}`} onClick={() => setActiveTab('sinhvien')}>Sinh Viên</button>
          <button className={`tab-btn ${activeTab === 'giangvien' ? 'active' : ''}`} onClick={() => setActiveTab('giangvien')}>Giảng Viên</button>
        </div>

        <div className="table-wrapper">
          <table className="account-table">
            <thead>
              <tr>
                <th>Mã tài khoản</th>
                <th>Họ và tên</th>
                <th className="hide-mobile">Ngày sinh</th>
                <th>{activeTab === 'sinhvien' ? 'Lớp' : 'Email'}</th> 
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p) => (
                <tr key={(p.masinhvien || p.magiangvien).toString().trim()}>
                  <td className="text-id">{(p.masinhvien || p.magiangvien).toString().trim()}</td>
                  <td className="text-bold">{p.holot} {p.ten}</td>
                  <td className="hide-mobile">{p.ngaysinh}</td>
                  <td>{activeTab === 'sinhvien' ? p.malop : p.email}</td>
                  <td>
                    <div className="action-box">
                      <button className="icon-btn delete" onClick={() => handleDelete(p.masinhvien || p.magiangvien)}>🗑️</button>
                      <button className="icon-btn edit" onClick={() => openEditModal(p)}>📝</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="modern-pagination">
            <button className="p-nav" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i + 1} className={`p-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="p-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
          </div>
        )}
      </div>

      {/* MODAL THÊM MỚI (PHONG CÁCH TỐI GIẢN) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered"><h3>Thêm hồ sơ mới</h3><button className="close-btn-round" onClick={() => setShowAddModal(false)}>&times;</button></div>
            <form onSubmit={handleAddSubmit} className="modal-body-form">
              <div className="form-group-centered"><label>Mã tài khoản</label><input type="text" placeholder="Nhập mã..." onChange={e => setFormData({...formData, ma: e.target.value})} />{errors.ma && <span className="error-message-text">{errors.ma}</span>}</div>
              <div className="form-row">
                <div className="form-group-centered" style={{flex:1}}><label>Họ lót</label><input type="text" onChange={e => setFormData({...formData, ho: e.target.value})} />{errors.ho && <span className="error-message-text">{errors.ho}</span>}</div>
                <div className="form-group-centered" style={{flex:1}}><label>Tên</label><input type="text" onChange={e => setFormData({...formData, ten: e.target.value})} />{errors.ten && <span className="error-message-text">{errors.ten}</span>}</div>
              </div>
              <div className="form-row">
                <div className="form-group-centered" style={{flex:1}}><label>Ngày sinh</label><input type="date" onChange={e => setFormData({...formData, ngaySinh: e.target.value})} /></div>
                <div className="form-group-centered" style={{flex:1}}><label>SĐT</label><input type="text" onChange={e => setFormData({...formData, sodienthoai: e.target.value})} /></div>
              </div>
              <div className="form-group-centered"><label>Email</label><input type="email" onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              {activeTab === 'sinhvien' && (<div className="form-group-centered"><label>Mã lớp</label><input type="text" onChange={e => setFormData({...formData, malop: e.target.value})} /></div>)}
              <div className="modal-footer-centered"><button type="button" className="btn-cancel-round" onClick={() => setShowAddModal(false)}>Hủy</button><button type="submit" className="btn-submit-round">Lưu hồ sơ</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SỬA (TÍCH HỢP RESET MẬT KHẨU) */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered"><h3>Sửa hồ sơ</h3><button className="close-btn-round" onClick={() => setShowEditModal(false)}>&times;</button></div>
            <form onSubmit={handleEditSubmit} className="modal-body-form">
              <div className="form-group-centered"><label>Mã tài khoản</label><input type="text" value={formData.ma} disabled style={{ opacity: 0.6 }} /></div>
              <div className="form-row">
                <div className="form-group-centered" style={{ flex: 1 }}><label>Họ lót</label><input type="text" value={formData.ho} onChange={e => setFormData({ ...formData, ho: e.target.value })} /></div>
                <div className="form-group-centered" style={{ flex: 1 }}><label>Tên</label><input type="text" value={formData.ten} onChange={e => setFormData({ ...formData, ten: e.target.value })} /></div>
              </div>
              <div className="form-group-centered"><label>Ngày sinh</label><input type="date" value={formData.ngaySinh} onChange={e => setFormData({ ...formData, ngaySinh: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group-centered" style={{ flex: 1 }}><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                <div className="form-group-centered" style={{ flex: 1 }}><label>SĐT</label><input type="text" value={formData.sodienthoai} onChange={e => setFormData({ ...formData, sodienthoai: e.target.value })} /></div>
              </div>
              {activeTab === 'sinhvien' && (<div className="form-group-centered"><label>Lớp</label><input type="text" value={formData.malop} onChange={e => setFormData({ ...formData, malop: e.target.value })} /></div>)}
              <div className="reset-pw-section">
                <button type="button" className="btn-reset-pw-simple" onClick={() => handleResetPassword(formData.ma)}>🔄 Reset mật khẩu về mặc định</button>
              </div>
              <div className="modal-footer-centered"><button type="button" className="btn-cancel-round" onClick={() => setShowEditModal(false)}>Hủy</button><button type="submit" className="btn-submit-round">Cập nhật</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
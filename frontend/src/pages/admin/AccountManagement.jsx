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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  const [formData, setFormData] = useState({
    ma: '', ho: '', ten: '', ngaySinh: '', email: '', sodienthoai: '', malop: ''
  });
  const [errors, setErrors] = useState({});

  // 1. Tải dữ liệu
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

  // 3. HÀM MỞ MODAL SỬA (FIX LỖI 'openEditModal' is not defined)
  const openEditModal = (p) => {
    setFormData({
      ma: (p.masinhvien || p.magiangvien).toString().trim(),
      ho: p.holot || '',
      ten: p.ten || '',
      ngaySinh: p.ngaysinh || '',
      email: p.email || '',        // Phải lấy cả Email
      sodienthoai: p.sodienthoai || '', // Phải lấy cả SĐT
      malop: p.malop || ''
    });
    setErrors({});
    setShowEditModal(true);
  };

  // 4. XOÁ TRIỆT ĐỂ (DATABASE + FRONTEND SYNC)
  const handleDelete = async (id) => {
    const cleanId = id.toString().trim();
    if (window.confirm(`Bạn có muốn xoá VĨNH VIỄN hồ sơ và tài khoản của ${cleanId}?`)) {
      try {
        // BƯỚC 1: Xoá hồ sơ (Sinh viên hoặc Giảng viên)
        const profilePath = activeTab === 'sinhvien' ? `/students/${cleanId}` : `/teachers/${cleanId}`;
        await api.delete(profilePath);

        // BƯỚC 2: Xoá luôn tài khoản đăng nhập
        await api.delete(`/accounts/${cleanId}`);
        
        // BƯỚC 3: Cập nhật giao diện Frontend
        const updated = allProfiles.filter(p => (p.masinhvien || p.magiangvien).toString().trim() !== cleanId);
        setAllProfiles(updated);
        setProfiles(updated);
        
        alert("Đã xoá thành công!");
      } catch (error) {
        console.error("Lỗi xoá:", error);
        alert("Lỗi: Có thể bạn đã xoá hồ sơ nhưng tài khoản chưa được xoá, hoặc ngược lại.");
      }
    }
  };

  // 5. CÁC HÀM XỬ LÝ FORM (ADD / EDIT / DETAIL)
  const validate = (isEdit = false) => {
    let newErrors = {};
    const cleanMa = formData.ma.trim().toLowerCase();
    if (!isEdit) {
      if (!cleanMa) newErrors.ma = "Trống mã tài khoản";
      else if (allProfiles.some(p => (p.masinhvien || p.magiangvien || "").toString().trim().toLowerCase() === cleanMa)) {
        newErrors.ma = "Mã tài khoản này đã tồn tại!";
      }
    }
    if (!formData.ho.trim()) newErrors.ho = "Vui lòng nhập họ";
    if (!formData.ten.trim()) newErrors.ten = "Vui lòng nhập tên";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validate(false)) return;
    try {
      const cleanMa = formData.ma.trim();
      await api.post('/accounts', { mataikhoan: cleanMa, username: cleanMa, password: "123", role: activeTab === 'sinhvien' ? 'student' : 'teacher' });
      const pData = { ten: formData.ten.trim(), holot: formData.ho, ngaysinh: formData.ngaySinh, email: formData.email, sodienthoai: formData.sodienthoai };
      if (activeTab === 'sinhvien') await api.post('/students', { masinhvien: cleanMa, ...pData, malop: formData.malop });
      else await api.post('/teachers', { magiangvien: cleanMa, ...pData });
      alert("Thêm thành công!");
      setShowAddModal(false);
      loadProfiles();
    } catch (err) { alert("Lỗi thêm hồ sơ!"); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanId = formData.ma.trim();
      const path = activeTab === 'sinhvien' ? `/students/${cleanId}` : `/teachers/${cleanId}`;
      
      // GỬI ĐỦ 5 TRƯỜNG NHƯ BACKEND YÊU CẦU
      const updateData = {
        holot: formData.ho.trim(),
        ten: formData.ten.trim(),
        ngaysinh: formData.ngaySinh,
        email: formData.email,
        sodienthoai: formData.sodienthoai,
        // Nếu là sinh viên thì gửi thêm mã lớp (tùy vào logic Service của bạn)
        ...(activeTab === 'sinhvien' && { malop: formData.malop })
      };

      const res = await api.put(path, updateData);

      if (res.data.code === 404) {
        alert("Không tìm thấy người này để sửa!");
      } else {
        alert("Cập nhật ngày sinh và thông tin thành công!");
        setShowEditModal(false);
        loadProfiles(); // Tải lại danh sách mới
      }
    } catch (error) {
      console.error("Lỗi 500 khi sửa:", error.response?.data);
      alert("Lỗi Server: Vui lòng kiểm tra định dạng ngày sinh (YYYY-MM-DD)!");
    }
  };

  // Hàm xử lý Reset mật khẩu
  const handleResetPassword = async (account) => {
    // Kiểm tra nếu account hoặc username không tồn tại thì dừng lại luôn
    if (!account?.username) {
      alert("Lỗi: Không tìm thấy tên đăng nhập!");
      return;
    }

    const username = account.username.trim();

    if (window.confirm(`Bạn có chắc muốn đặt mật khẩu của ${username}?`)) {
      try {
        // Backend (accountController.js) yêu cầu: mataikhoan, password, role
        const updateData = {
          mataikhoan: username,
          password: username,
          role: account.role
        };

        await api.put(`/accounts/${username}`, updateData);
        
        alert("Đã reset mật khẩu thành công!");
        setShowDetailModal(false);
        loadProfiles();
      } catch (error) {
        console.error("Lỗi 500 từ Server:", error.response?.data);
        alert("Server báo lỗi 500. Tuệ hãy kiểm tra xem Backend đã viết hàm update chưa nhé!");
      }
    }
  };

  const openDetail = async (id) => {
    const cleanId = id.toString().trim();
    try {
      const res = await api.get(`/accounts/${cleanId}`);
      setSelectedAccount(res.data);
      setShowDetailModal(true);
    } catch (err) {
      if (err.response?.status === 404) {
        alert("Hồ sơ này không có tài khoản!");
        const sync = allProfiles.filter(p => (p.masinhvien || p.magiangvien).toString().trim() !== cleanId);
        setAllProfiles(sync);
        setProfiles(sync);
      }
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
            <button className="btn-add" onClick={() => { setShowAddModal(true); setErrors({}); setFormData({ma:'',ho:'',ten:'',ngaySinh:'',email:'',sodienthoai:'',malop:''}); }}>+ Thêm mới</button>
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
                {/* Cột động: SV hiện Lớp, GV hiện Email */}
                <th>{activeTab === 'sinhvien' ? 'Lớp' : 'Email'}</th> 
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p) => (
                <tr key={(p.masinhvien || p.magiangvien).toString().trim()} onClick={() => openDetail(p.masinhvien || p.magiangvien)} className="row-clickable">
                  <td className="text-id">{(p.masinhvien || p.magiangvien).toString().trim()}</td>
                  <td className="text-bold">{p.holot} {p.ten}</td>
                  <td className="hide-mobile">{p.ngaysinh}</td>
                  
                  {/* Hiển thị dữ liệu tương ứng theo Tab */}
                  <td>{activeTab === 'sinhvien' ? p.malop : p.email}</td>
                  
                  <td onClick={(e) => e.stopPropagation()}>
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

      {/* MODAL THÊM MỚI */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered"><h3>Thêm hồ sơ mới</h3><button className="close-btn-round" onClick={() => setShowAddModal(false)}>&times;</button></div>
            <form onSubmit={handleAddSubmit} className="modal-body-form">
              <div className="form-group-centered"><label>Mã tài khoản</label><input type="text" placeholder="Nhập mã tài khoản..." onChange={e => setFormData({...formData, ma: e.target.value})} /></div>
              
              <div className="form-row">
                <div className="form-group-centered" style={{flex:1}}><label>Họ lót</label><input type="text" placeholder="Nhập họ..." onChange={e => setFormData({...formData, ho: e.target.value})} /></div>
                <div className="form-group-centered" style={{flex:1}}><label>Tên</label><input type="text" placeholder="Tên..." onChange={e => setFormData({...formData, ten: e.target.value})} /></div>
              </div>

              <div className="form-row">
                <div className="form-group-centered" style={{flex:1}}><label>Ngày sinh</label><input type="date" onChange={e => setFormData({...formData, ngaySinh: e.target.value})} /></div>
                <div className="form-group-centered" style={{flex:1}}><label>SĐT</label><input type="text" placeholder="Số điện thoại..." onChange={e => setFormData({...formData, sodienthoai: e.target.value})} /></div>
              </div>

              <div className="form-group-centered"><label>Email</label><input type="email" placeholder="Địa chỉ email..." onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              
              {activeTab === 'sinhvien' && (
                <div className="form-group-centered"><label>Mã lớp</label><input type="text" placeholder="Ví dụ: D22_TH10" onChange={e => setFormData({...formData, malop: e.target.value})} /></div>
              )}

              <div className="modal-footer-centered">
                <button type="button" className="btn-cancel-round" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit-round">Lưu hồ sơ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SỬA */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered"><h3>Sửa hồ sơ</h3><button className="close-btn-round" onClick={() => setShowEditModal(false)}>&times;</button></div>
            <form onSubmit={handleEditSubmit} className="modal-body-form">
              <div className="form-group-centered"><label>Mã tài khoản</label><input type="text" value={formData.ma} disabled style={{opacity:0.6}} /></div>
              <div className="form-row">
                <div className="form-group-centered" style={{flex:1}}><label>Họ lót</label><input type="text" value={formData.ho} onChange={e => setFormData({...formData, ho: e.target.value})} /></div>
                <div className="form-group-centered" style={{flex:1}}><label>Tên</label><input type="text" value={formData.ten} onChange={e => setFormData({...formData, ten: e.target.value})} /></div>
              </div>
              <div className="form-group-centered"><label>Ngày sinh</label><input type="date" value={formData.ngaySinh} onChange={e => setFormData({...formData, ngaySinh: e.target.value})} /></div>
              {activeTab === 'sinhvien' && <div className="form-group-centered"><label>Lớp</label><input type="text" value={formData.malop} onChange={e => setFormData({...formData, malop: e.target.value})} /></div>}
              <div className="modal-footer-centered"><button type="button" className="btn-cancel-round" onClick={() => setShowEditModal(false)}>Hủy</button><button type="submit" className="btn-submit-round">Cập nhật</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT */}
      {showDetailModal && selectedAccount && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered">
              <h3>Chi tiết Tài khoản</h3>
              <button className="close-btn-round" onClick={() => setShowDetailModal(false)}>&times;</button>
            </div>
            <div className="modal-body-detail">
              <div className="info-row"><strong>Tên đăng nhập:</strong> <span>{selectedAccount.username}</span></div>
              <div className="info-row"><strong>Vai trò:</strong> <span>{selectedAccount.role === 'sv' ? 'Sinh viên' : 'Giảng viên'}</span></div>
              
              {/* Nút Reset mật khẩu mới */}
              <div className="modal-footer-centered" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-reset-pw" 
                  onClick={() => handleResetPassword(selectedAccount)} // Truyền nguyên object này vào
                >
                  🔄 Reset mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
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
  const [ errors, setErrors] = useState({});

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
      // Cắt lấy 10 ký tự đầu (YYYY-MM-DD) nếu ngày sinh từ DB có kèm giờ giấc
      ngaySinh: p.ngaysinh ? p.ngaysinh.substring(0, 10) : '', 
      email: p.email || '',        
      sodienthoai: p.sodienthoai || '', 
      malop: p.malop || ''
    });
    setErrors({});
    setShowEditModal(true);
  };

  // 4. XOÁ TRIỆT ĐỂ (DATABASE + FRONTEND SYNC)
  const handleDelete = async (id) => {
    const cleanId = id.toString().trim();
    if (!window.confirm(`Bạn có chắc muốn xoá vĩnh viễn ${cleanId}?`)) return;

    try {
      // Bước 1: Xoá hồ sơ và tk
      const profilePath = activeTab === 'sinhvien' ? `/students/${cleanId}` : `/teachers/${cleanId}`;
      await api.delete(profilePath);

      // Luôn cập nhật giao diện vì hồ sơ đã được xử lý
      const updated = allProfiles.filter(p => (p.masinhvien || p.magiangvien).toString().trim() !== cleanId);
      setAllProfiles(updated);
      setProfiles(updated);
      
      alert("Đã xoá thành công!");
    } catch (error) {
      console.error("Lỗi xoá:", error);
      alert("Có lỗi xảy ra khi xoá. Hãy thử load lại trang!");
      loadProfiles();
    }
  };

  // 5. CÁC HÀM XỬ LÝ FORM (ADD / EDIT / DETAIL)
  const validate = (isEdit = false) => {
    let newErrors = {};
    const cleanMa = formData.ma.trim();
    const cleanHo = formData.ho.trim();
    const cleanTen = formData.ten.trim();
    const cleanEmail = formData.email.trim();
    const cleanSdt = formData.sodienthoai.trim();
    const cleanLop = formData.malop.trim();

    // 1. Kiểm tra Mã tài khoản (CHAR/STRING 10)
    if (!isEdit) {
      if (!cleanMa) {
        newErrors.ma = "Mã tài khoản không được để trống";
      } else if (cleanMa.length > 10) {
        newErrors.ma = "Mã tài khoản tối đa 10 ký tự";
      } else if (allProfiles.some(p => (p.masinhvien || p.magiangvien || "").toString().trim().toLowerCase() === cleanMa.toLowerCase())) {
        newErrors.ma = "Mã tài khoản này đã tồn tại!";
      }
    }

    // 2. Kiểm tra Họ lót (STRING 30)
    if (!cleanHo) {
      newErrors.ho = "Vui lòng nhập họ lót";
    } else if (cleanHo.length > 30) {
      newErrors.ho = "Họ lót quá dài (tối đa 30 ký tự)";
    }

    // 3. Kiểm tra Tên (STRING 20)
    if (!cleanTen) {
      newErrors.ten = "Vui lòng nhập tên";
    } else if (cleanTen.length > 20) {
      newErrors.ten = "Tên quá dài (tối đa 20 ký tự)";
    }

    // 4. Kiểm tra Ngày sinh (DATEONLY - allowNull: false)
    if (!formData.ngaySinh) {
      newErrors.ngaySinh = "Ngày sinh là bắt buộc";
    }

    // 5. Kiểm tra Email (STRING 50 + isEmail)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      newErrors.email = "Email là bắt buộc";
    } else if (cleanEmail.length > 50) {
      newErrors.email = "Email tối đa 50 ký tự";
    } else if (!emailRegex.test(cleanEmail)) {
      newErrors.email = "Định dạng email không hợp lệ";
    }

    // 6. Kiểm tra Số điện thoại (CHAR 10 + Regex /^[0-9]{10}$/)
    const phoneRegex = /^[0-9]{10}$/;
    if (!cleanSdt) {
      newErrors.sodienthoai = "Số điện thoại là bắt buộc";
    } else if (!phoneRegex.test(cleanSdt)) {
      newErrors.sodienthoai = "SĐT phải có đúng 10 chữ số";
    }

    // 7. Kiểm tra Mã lớp (CHAR 10 - Chỉ dành cho sinh viên)
    if (activeTab === 'sinhvien' && cleanLop.length > 10) {
      newErrors.malop = "Mã lớp tối đa 10 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // BE hiện tại chỉ viết logic Import cho Sinh viên nên mình chặn luôn ở FE
    if (activeTab === 'giangvien') {
      alert("Tính năng Import Excel hiện chỉ hỗ trợ cho Sinh viên!");
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', file); // 'excelFile' phải khớp 100% với BE

    try {
      // Gọi đúng API /students/bulk
      const response = await api.post('/students/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.code === 200) {
        alert(response.data.message); // Ví dụ: "Tạo lớp sinh viên thành công với 10 sinh viên."
        loadProfiles(); // Tải lại danh sách
      }
    } catch (error) {
      // Hiển thị lỗi chi tiết nếu file thiếu cột hoặc sai định dạng
      const errorMsg = error.response?.data?.error || "Lỗi khi xử lý file Excel";
      alert(`Thất bại: ${errorMsg}`);
    } finally {
      e.target.value = null; // Reset để có thể chọn lại cùng 1 file
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validate(false)) return; // Vẫn dùng hàm validate để check form

    try {
      const cleanMa = formData.ma.trim();
      // 1. Chuẩn bị object dữ liệu hồ sơ
      const pData = { 
        ten: formData.ten.trim(), 
        holot: formData.ho.trim(), 
        ngaysinh: formData.ngaySinh || null, 
        email: formData.email.trim(), 
        sodienthoai: formData.sodienthoai.trim() || null 
      };

      // 2. CHỈ GỌI DUY NHẤT 1 API NÀY (Backend sẽ tự tạo Account cho bạn)
      if (activeTab === 'sinhvien') {
        // Gọi BE tạo Sinh viên + Tự tạo Account (mật khẩu mặc định là masinhvien)
        await api.post('/students', { masinhvien: cleanMa, ...pData, malop: formData.malop.trim() });
      } else {
        // Gọi BE tạo Giảng viên + Tự tạo Account (mật khẩu mặc định là magiangvien)
        await api.post('/teachers', { magiangvien: cleanMa, ...pData });
      }

      alert("Thêm thành công!"); 
      setShowAddModal(false);
      loadProfiles(); // Tải lại danh sách để hiện người mới
    } catch (err) {
      // Nếu lỗi 999 xảy ra, nó sẽ hiện tin nhắn thực tế từ Server
      const serverMsg = err.response?.data?.message || "Lỗi không xác định";
      alert(`Thất bại: ${serverMsg}`);
    }
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
        email: formData.email.trim() || null, // Gửi null nếu trống để BE dễ xử lý
        sodienthoai: formData.sodienthoai.trim() || null, // Gửi null thay vì chuỗi rỗng
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
            {/* CHỈ HIỆN NÚT IMPORT KHI Ở TAB SINH VIÊN */}
              {activeTab === 'sinhvien' && (
                <label className="btn-import-excel" style={{
                  backgroundColor: '#27ae60',
                  color: 'white',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  marginRight: '12px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: 'none',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  📁 Nhập Excel
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    hidden 
                    onChange={handleImportExcel} 
                  />
                </label>
              )}
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
              <div className="form-group-centered"><label>Mã tài khoản</label><input type="text" placeholder="Nhập mã tài khoản..." onChange={e => setFormData({...formData, ma: e.target.value})} />{/* Hiển thị câu báo lỗi nếu có */}
  {errors.ma && <span className="error-message-text">{errors.ma}</span>}</div>
              
              <div className="form-row">
                <div className="form-group-centered" style={{flex:1}}><label>Họ lót</label><input type="text" placeholder="Nhập họ..." onChange={e => setFormData({...formData, ho: e.target.value})} />{errors.ho && <span className="error-message-text">{errors.ho}</span>}</div>
                <div className="form-group-centered" style={{flex:1}}><label>Tên</label><input type="text" placeholder="Tên..." onChange={e => setFormData({...formData, ten: e.target.value})} />{errors.ten && <span className="error-message-text">{errors.ten}</span>}</div>
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
            <div className="modal-header-centered">
              <h3>Sửa hồ sơ</h3>
              <button className="close-btn-round" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="modal-body-form">
              <div className="form-group-centered">
                <label>Mã tài khoản</label>
                <input type="text" value={formData.ma} disabled style={{ opacity: 0.6 }} />
              </div>

              <div className="form-row">
                <div className="form-group-centered" style={{ flex: 1 }}>
                  <label>Họ lót</label>
                  <input type="text" value={formData.ho} onChange={e => setFormData({ ...formData, ho: e.target.value })} />
                </div>
                <div className="form-group-centered" style={{ flex: 1 }}>
                  <label>Tên</label>
                  <input type="text" value={formData.ten} onChange={e => setFormData({ ...formData, ten: e.target.value })} />
                </div>
              </div>

              <div className="form-group-centered">
                <label>Ngày sinh</label>
                <input type="date" value={formData.ngaySinh} onChange={e => setFormData({ ...formData, ngaySinh: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group-centered" style={{ flex: 1 }}>
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group-centered" style={{ flex: 1 }}>
                  <label>SĐT</label>
                  <input type="text" value={formData.sodienthoai} onChange={e => setFormData({ ...formData, sodienthoai: e.target.value })} />
                </div>
              </div>

              {/* Hiển thị Lớp nếu là Sinh viên */}
              {activeTab === 'sinhvien' && (
                <div className="form-group-centered">
                  <label>Lớp</label>
                  <input type="text" value={formData.malop} onChange={e => setFormData({ ...formData, malop: e.target.value })} />
                </div>
              )}

              {/* CHUYỂN NÚT RESET MẬT KHẨU */}
              <div className="form-group-centered" style={{ marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px', textAlign: 'center' }}>
                  Reset về mã mặc định ({formData.ma})
                </p>
                <button 
                  type="button" 
                  className="btn-reset-pw" 
                  style={{ 
                    width: '100%', 
                    backgroundColor: '#f39c12', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px', 
                    borderRadius: '20px', 
                    fontWeight: 'bold',
                    cursor: 'pointer' 
                  }}
                  onClick={() => handleResetPassword({ 
                    username: formData.ma, 
                    role: activeTab === 'sinhvien' ? 'student' : 'teacher' 
                  })}
                >
                  🔄 Reset mật khẩu
                </button>
              </div>

              <div className="modal-footer-centered" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-cancel-round" onClick={() => setShowEditModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit-round">Cập nhật</button>
              </div>
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
              <div className="info-row"><strong>Vai trò:</strong> <span>{selectedAccount.role === 'student' ? 'Sinh viên' : 'Giảng viên'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
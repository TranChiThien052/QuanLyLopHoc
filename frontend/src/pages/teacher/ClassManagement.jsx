import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import './ClassManagement.css';

const ClassManagement = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    MonHoc: '',
    NgayBatDau: '',
    NgayKetThuc: '',
    NgayHocCoDinh: '',
    GioBatDau: '',
    GioKetThuc: '',
    MaGiangVien: user?.id || user?.username || ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // States for Student
  const [classStudents, setClassStudents] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentFile, setStudentFile] = useState(null);
  const [studentCode, setStudentCode] = useState('');
  const [classStudentFile, setClassStudentFile] = useState(null);

  const isMobile = window.innerWidth < 768;
  const itemsPerPage = isMobile ? 3 : 5;

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes');
      const data = response.data;
      setClasses(Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []));
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu lớp học:", err);
      setLoading(false);
    }
  }, []);

  const fetchClassStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const res = await api.get(`/lopsinhvien/${selectedClass.malop}`);
      const data = res.data;
      let basicStudents = [];
      if (Array.isArray(data)) {
        basicStudents = data;
      } else if (data && Array.isArray(data.data)) {
        basicStudents = data.data;
      } else if (data && data.masinhvien) {
        basicStudents = [data];
      }

      // Lấy thêm thông tin chi tiết từng sinh viên
      const detailedPromises = basicStudents.map(async (student) => {
        try {
          const detailRes = await api.get(`/students/${student.masinhvien}`);
          const detailData = detailRes.data;
          const actualData = detailData?.data || detailData;
          return { ...student, ...actualData };
        } catch (e) {
          console.error(`Lỗi khi lấy chi tiết SV ${student.masinhvien}:`, e);
          return student;
        }
      });

      const detailedStudents = await Promise.all(detailedPromises);
      setClassStudents(detailedStudents);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sinh viên:", err);
      setClassStudents([]);
      setLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
    } else {
      fetchClasses();
    }
  }, [selectedClass, fetchClasses, fetchClassStudents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (c) => {
    setIsEditing(true);
    setEditingId(c.malop);
    setFormData({
      MonHoc: c.monhoc || '',
      NgayBatDau: c.ngaybatdau ? c.ngaybatdau.substring(0, 10) : '',
      NgayKetThuc: c.ngayketthuc ? c.ngayketthuc.substring(0, 10) : '',
      NgayHocCoDinh: c.ngayhoccodinh || '',
      GioBatDau: c.giobatdau || '',
      GioKetThuc: c.gioketthuc || '',
      MaGiangVien: c.magiangvien || user?.id || user?.username || ''
    });
    setShowModal(true);
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      try {
        await api.delete(`/classes/${id}`);
        fetchClasses();
      } catch (err) {
        console.error("Lỗi khi xóa lớp học:", err);
        alert("Có lỗi xảy ra khi xóa lớp học");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/classes/${editingId}`, formData);
      } else {
        const payload = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
             let value = formData[key];
             // Bơm thêm giây (:00) vào đuôi để khớp với Backend LocalTime (HH:mm:ss)
             if ((key === 'GioBatDau' || key === 'GioKetThuc') && value && value.length === 5) {
                value = `${value}:00`;
             }
             payload.append(key, value);
          }
        });
        
        if (classStudentFile) {
          payload.append('excelFile', classStudentFile);
        }
        
        await api.post('/classes', payload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      fetchClasses();
      closeModal();
    } catch (err) {
      console.error("Lỗi khi lưu lớp học:", err);
      alert("Có lỗi xảy ra khi lưu lớp học");
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setClassStudentFile(null);
    setFormData({ ...initialFormState, MaGiangVien: user?.username || user?.id || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setClassStudentFile(null);
  };

  // Student methods
  const handleDeleteStudent = async (masinhvien) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá sinh viên này khỏi lớp?")) {
      try {
        await api.delete('/lopsinhvien/', { data: { malop: selectedClass.malop, masinhvien } });
        fetchClassStudents();
      } catch (err) {
        console.error("Lỗi xóa SV:", err);
        alert("Lỗi khi xoá sinh viên.");
      }
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (studentFile) {
        const reader = new FileReader();
        reader.onload = async (evt) => {
          try {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const listmasinhvien = [];
            let mssvIndex = -1;
            for (let i = 0; i < data.length; i++) {
              const row = data[i];
              if (!row || row.length === 0) continue;

              if (mssvIndex === -1) {
                for (let j = 0; j < row.length; j++) {
                  const head = String(row[j] || '').toLowerCase().trim();
                  if (head.includes('mã sinh viên') || head === 'mssv' || head === 'mã sv') {
                    mssvIndex = j;
                    break;
                  }
                }
                if (mssvIndex !== -1) continue;
              }

              if (mssvIndex === -1 && i > 5) mssvIndex = 0;

              if (mssvIndex !== -1) {
                const cellVal = String(row[mssvIndex] || '').trim();
                if (cellVal && !cellVal.toLowerCase().includes('mã sinh viên') && cellVal.toLowerCase() !== 'mssv') {
                  const cleanMssv = cellVal.replace(/\s+/g, '');
                  if (cleanMssv.length >= 4) listmasinhvien.push(cleanMssv);
                }
              }
            }

            if (listmasinhvien.length > 0) {
              await api.post(`/lopsinhvien/bulk`, { malop: selectedClass.malop, listmasinhvien });
              fetchClassStudents();
            } else {
              alert("Không tìm thấy mã sinh viên ở cột đầu tiên của file Excel!");
            }
          } catch (err) {
            console.error("Lỗi đọc excel:", err);
            alert("Lỗi phân tích file Excel.");
          }
        };
        reader.readAsBinaryString(studentFile);
      } else if (studentCode) {
        await api.post(`/lopsinhvien/`, { malop: selectedClass.malop, masinhvien: studentCode });
        fetchClassStudents();
      } else {
        alert("Vui lòng nhập MSSV hoặc tải lên file Excel");
        return;
      }

      setShowStudentModal(false);
      setStudentFile(null);
      setStudentCode("");
    } catch (err) {
      console.error("Lỗi thêm SV:", err);
      alert("Lỗi khi thêm sinh viên.");
    }
  };

  const renderData = (selectedClass ? classStudents : classes) || [];
  const filteredData = (Array.isArray(renderData) ? renderData : []).filter(item => {
    const search = searchTerm.toLowerCase();
    if (selectedClass) {
      const hoTen = `${item.holot || ''} ${item.ten || ''}`.toLowerCase();
      return (item.masinhvien || "").toLowerCase().includes(search) || hoTen.includes(search);
    }
    return (item.tenlop || "").toLowerCase().includes(search) || (item.malop || "").toString().toLowerCase().includes(search);
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(totalPages, 5);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    const visiblePages = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);

    return (
      <div className="modern-pagination">
        <button className="p-nav" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
        {startPage > 1 && <span style={{ color: '#cbd5e0', padding: '0 5px' }}>...</span>}

        {visiblePages.map(page => (
          <button
            key={page}
            className={`p-num ${currentPage === page ? 'active' : ''}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && <span style={{ color: '#cbd5e0', padding: '0 5px' }}>...</span>}
        <button className="p-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
      </div>
    );
  };

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
                <button className="btn-primary" onClick={openAddModal}>+ Thêm lớp</button>
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
                  {loading && classes.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#718096', fontWeight: 600 }}>Đang tải dữ liệu...</td>
                    </tr>
                  ) : currentItems.length > 0 ? currentItems.map((c) => (
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
                          <button className="icon-btn edit" onClick={() => handleEditClick(c)}>✏️</button>
                          <button className="icon-btn delete" onClick={() => handleDeleteClass(c.malop)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#718096', fontWeight: 600 }}>Không tìm thấy lớp học</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mobile-only">
              {currentItems.map((c) => (
                <div className="mobile-card" key={c.malop} onClick={() => setSelectedClass(c)}>
                  <div className="card-top">
                    <span className="badge">{c.malop}</span>
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="action-small" onClick={() => handleEditClick(c)}>✏️</button>
                      <button className="action-small" onClick={() => handleDeleteClass(c.malop)}>🗑️</button>
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
              <button className="btn-back" onClick={() => { setSelectedClass(null); setSearchTerm(""); }}>← Trở lại</button>
              <div className="header-actions">
                <div className="search-wrapper">
                  <input
                    type="text"
                    placeholder="Tìm MSSV..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn-primary" onClick={() => setShowStudentModal(true)}>+ Thêm SV</button>
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

            <div className="desktop-only table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>MSSV</th>
                    <th>Họ và Tên</th>
                    <th className="hide-sm">Ngày sinh</th>
                    <th className="hide-sm">Email</th>
                    <th className="hide-sm">SĐT</th>
                    <th className="hide-sm">Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && classStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#718096', fontWeight: 600 }}>Đang tải danh sách sinh viên...</td>
                    </tr>
                  ) : currentItems.length > 0 ? currentItems.map((s, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-navy">{s.masinhvien}</td>
                      <td>{s.holot ? `${s.holot} ${s.ten}` : (s.ten || 'N/A')}</td>
                      <td className="hide-sm">{s.ngaysinh?.substring(0, 10) || 'N/A'}</td>
                      <td className="hide-sm">{s.email || 'N/A'}</td>
                      <td className="hide-sm">{s.sodienthoai || 'N/A'}</td>
                      <td className="hide-sm"><span style={{ color: '#28a745' }}>Đã phân lớp</span></td>
                      <td>
                        <div className="action-flex">
                          <button className="icon-btn delete" onClick={() => handleDeleteStudent(s.masinhvien)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#718096', fontWeight: 600 }}>Lớp chưa có sinh viên</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mobile-only">
              {loading && classStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#718096', fontWeight: 600 }}>Đang tải danh sách sinh viên...</div>
              ) : currentItems.length > 0 ? currentItems.map((s, idx) => (
                <div className="mobile-card" key={idx}>
                  <div className="card-top">
                    <span className="badge" style={{ backgroundColor: '#e6f4ea', color: '#1e8e3e' }}>✓ Đã phân lớp</span>
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="action-small" onClick={() => handleDeleteStudent(s.masinhvien)}>🗑️</button>
                    </div>
                  </div>
                  <h3>{s.holot ? `${s.holot} ${s.ten}` : (s.ten || 'N/A')}</h3>
                  <p><strong>MSSV:</strong> <span className="font-bold text-navy">{s.masinhvien}</span></p>
                  <p><strong>Ngày sinh:</strong> {s.ngaysinh?.substring(0, 10) || 'N/A'}</p>
                  <p><strong>Email:</strong> {s.email || 'N/A'}</p>
                  <p><strong>S ĐT:</strong> <span className="text-cyan font-bold">{s.sodienthoai || 'N/A'}</span></p>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#718096', fontWeight: 600 }}>Lớp chưa có sinh viên</div>
              )}
            </div>
          </div>
        )}
        <Pagination />
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <div className="modal-header">
              <h3>{isEditing ? 'Cập nhật lớp học' : 'Tạo lớp học phần mới'}</h3>
              <button className="close-x" type="button" onClick={closeModal}>×</button>
            </div>

            <form className="modal-form" onSubmit={handleFormSubmit}>
              <div className="input-group">
                <label>Môn học</label>
                <input type="text" name="MonHoc" value={formData.MonHoc} onChange={handleChange} placeholder="Ví dụ: Lập trình Web" required />
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Ngày bắt đầu</label>
                  <input type="date" name="NgayBatDau" value={formData.NgayBatDau} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Ngày kết thúc</label>
                  <input type="date" name="NgayKetThuc" value={formData.NgayKetThuc} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Ngày học cố định</label>
                  <select name="NgayHocCoDinh" value={formData.NgayHocCoDinh} onChange={handleChange} required>
                    <option value="">Chọn ngày học</option>
                    <option value="Hai">Thứ 2</option>
                    <option value="Ba">Thứ 3</option>
                    <option value="Bốn">Thứ 4</option>
                    <option value="Năm">Thứ 5</option>
                    <option value="Sáu">Thứ 6</option>
                    <option value="Bảy">Thứ 7</option>
                    <option value="Chủ Nhật">Chủ nhật</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Giờ bắt đầu</label>
                  <input type="time" name="GioBatDau" value={formData.GioBatDau} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Giờ kết thúc</label>
                  <input type="time" name="GioKetThuc" value={formData.GioKetThuc} onChange={handleChange} required />
                </div>
              </div>

              {!isEditing && (
                <div className="student-input-section" style={{ marginTop: '20px' }}>
                  <p className="section-label">Thông tin sinh viên (Tự động nhận diện cột Mã SSV)</p>

                  <label className="excel-drop-zone">
                    <span className="icon">📊</span>
                    <span className="text">{classStudentFile?.name || "Chọn file Excel danh sách SV (.xlsx)"}</span>
                    <input
                      type="file"
                      hidden
                      accept=".xlsx, .xls"
                      onChange={(e) => setClassStudentFile(e.target.files[0])}
                    />
                  </label>
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-modal-cancel" onClick={closeModal}>Hủy bỏ</button>
                <button type="submit" className="btn-modal-confirm">{isEditing ? 'Cập nhật' : 'Xác nhận'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <div className="modal-header">
              <h3>Thêm sinh viên vào lớp</h3>
              <button className="close-x" type="button" onClick={() => { setShowStudentModal(false); setStudentFile(null); setStudentCode(''); }}>×</button>
            </div>

            <form className="modal-form" onSubmit={handleStudentSubmit}>
              <div className="student-input-section">
                <p className="section-label">Thêm bằng file Excel (Tự động nhận diện cột Mã SSV)</p>

                <label className="excel-drop-zone">
                  <span className="icon">📊</span>
                  <span className="text">{studentFile?.name || "Chọn file Excel danh sách SV (.xlsx)"}</span>
                  <input
                    type="file"
                    hidden
                    accept=".xlsx, .xls"
                    onChange={(e) => setStudentFile(e.target.files[0])}
                  />
                </label>

                <div className="manual-divider">
                  <span>HOẶC</span>
                </div>

                <p className="section-label">Nhập mã thủ công</p>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="VD: DH5220..."
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '15px' }}>
                <button type="button" className="btn-modal-cancel" onClick={() => { setShowStudentModal(false); setStudentFile(null); setStudentCode(''); }}>Hủy bỏ</button>
                <button type="submit" className="btn-modal-confirm">Thêm sinh viên</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;

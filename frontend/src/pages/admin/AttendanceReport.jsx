import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Đảm bảo đường dẫn này đúng
import './AttendanceReport.css';

const AttendanceReport = () => {
  const { user } = useAuth(); // Lấy role để điều hướng API
  const [classList, setClassList] = useState([]);
  const [sessionList, setSessionList] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);

  // Trạng thái điều hướng
  const [selectedClass, setSelectedClass] = useState(null); 
  const [selectedSession, setSelectedSession] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  /**
   * TẦNG 1: Lấy danh sách Lớp học (Admin lấy hết, Teacher lấy lớp của mình)
   */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Vì ông đã sửa BE nên cả Admin và Teacher đều gọi được vào endpoint này
        // Tuy nhiên, Admin thường muốn xem TẤT CẢ các lớp thay vì chỉ lớp mình dạy
        const endpoint = user?.role === 'admin' ? '/classes' : '/teachers/ds/monhoc';
        
        const res = await axios.get(`${API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClassList(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách lớp:", err);
      }
    };
    if (token && user) fetchClasses();
  }, [API_URL, token, user]);

  /**
   * TẦNG 2: Lấy danh sách Buổi học
   */
  const handleSelectClass = async (cls) => {
    try {
      const res = await axios.get(`${API_URL}/lessons/lop/${cls.malop}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessionList(res.data);
      setSelectedClass(cls);
      setSearchTerm('');
      setCurrentPage(1); // Reset trang để tránh lỗi trắng bảng
    } catch (err) {
      setSessionList([]);
      setSelectedClass(cls);
      setCurrentPage(1);
    }
  };

  /**
   * TẦNG 3: Lấy chi tiết điểm danh
   */
  const handleSelectSession = async (session) => {
    try {
      const res = await axios.get(`${API_URL}/diemDanh/buoihoc/${session.mabuoihoc}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceDetails(res.data?.data || res.data || []);
      setSelectedSession(session);
      setSearchTerm('');
      setCurrentPage(1); 
    } catch (err) {
      console.error("Lỗi lấy chi tiết điểm danh:", err);
    }
  };

  // Logic lọc dữ liệu
  const getCurrentData = () => {
    const cleanSearch = searchTerm.toLowerCase();
    if (selectedSession) return attendanceDetails.filter(d => d.masinhvien.toLowerCase().includes(cleanSearch));
    if (selectedClass) return sessionList.filter(s => s.mabuoihoc.toLowerCase().includes(cleanSearch));
    return classList.filter(c => 
      c.malop.toString().includes(cleanSearch) || 
      (c.tenlop && c.tenlop.toLowerCase().includes(cleanSearch)) ||
      (c.monhoc && c.monhoc.toLowerCase().includes(cleanSearch))
    );
  };

  const filteredData = getCurrentData();
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const Pagination = () => (
    totalPages > 1 && (
      <div className="modern-pagination">
        <button className="p-nav" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i + 1} className={`p-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
        ))}
        <button className="p-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
      </div>
    )
  );

  return (
    <div className="attendance-page">
      <div className="main-card">
        {/* TẦNG 1: DANH SÁCH LỚP HỌC */}
        {!selectedClass && (
          <div className="list-section">
            <div className="page-header">
              <div className="title-group">
                <h2 className="main-title">Thống kê theo Lớp</h2>
                <p className="sub-title">{user?.role === 'admin' ? 'Chế độ quản trị viên' : 'Lớp học của tôi'}</p>
              </div>
              <div className="modern-search">
                <input type="text" placeholder="Tìm mã hoặc tên lớp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="glass-table-wrapper">
              <table className="modern-table">
                <thead><tr><th>Mã Lớp</th><th>Tên Lớp</th><th>Thời gian</th><th>Ngày học</th><th>Giờ học</th></tr></thead>
                <tbody>
                  {currentItems.map((c) => (
                    <tr key={c.malop} onClick={() => handleSelectClass(c)} className="clickable-row">
                      <td className="session-tag">{c.malop}</td>
                      <td className="font-600">{c.tenlop || c.monhoc}</td>
                      <td>{c.ngaybatdau} - {c.ngayketthuc}</td>
                      <td>{c.ngayhoccodinh}</td>
                      <td className="font-600">{c.giobatdau} - {c.gioketthuc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>
        )}

        {/* TẦNG 2: DANH SÁCH BUỔI HỌC */}
        {selectedClass && !selectedSession && (
          <div className="list-section">
            <button className="back-btn-modern" onClick={() => {setSelectedClass(null); setCurrentPage(1);}}>← Trở lại</button>
            <h2 className="main-title">Lớp: {selectedClass.tenlop || selectedClass.monhoc}</h2>
            <div className="glass-table-wrapper">
              <table className="modern-table">
                <thead><tr><th>Mã buổi</th><th>Ngày Bắt Đầu Buổi Học</th><th>Giờ Bắt đầu</th><th>Giờ Kết thúc</th></tr></thead>
                <tbody>
                  {currentItems.map((s) => (
                    <tr key={s.mabuoihoc} onClick={() => handleSelectSession(s)} className="clickable-row">
                      <td className="session-tag">{s.mabuoihoc}</td>
                      <td>{s.ngayhoc}</td><td>{s.giobatdau}</td><td>{s.gioketthuc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>
        )}

        {/* TẦNG 3: CHI TIẾT ĐIỂM DANH */}
        {selectedSession && (
          <div className="detail-section">
            <button className="back-btn-modern" onClick={() => {setSelectedSession(null); setCurrentPage(1);}}>← Trở lại</button>
            <div className="detail-top-card">
              <div className="session-summary">
                <h3>Buổi: <span>{selectedSession.mabuoihoc}</span></h3>
                <div className="summary-pills"><span>📅 {selectedSession.ngayhoc}</span></div>
              </div>
              <div className="session-metrics">
                <div className="metric-item highlight"><span className="m-val">{attendanceDetails.length}</span><span className="m-lbl">TỔNG SV</span></div>
                <div className="metric-item highlight">
                  <span className="m-val">{attendanceDetails.filter(d => d.trangthai === 'Có mặt').length}</span>
                  <span className="m-lbl">HIỆN DIỆN</span>
                </div>
              </div>
            </div>
            <div className="glass-table-wrapper">
              <table className="modern-table">
                <thead><tr><th>MSSV</th><th>THỜI GIAN QUÉT</th><th>GHI CHÚ</th><th>TRẠNG THÁI</th></tr></thead>
                <tbody>
                  {currentItems.map((d, i) => (
                    <tr key={i}>
                      <td className="font-600">{d.masinhvien}</td>
                      <td>{d.thoigiancapnhat ? new Date(d.thoigiancapnhat).toLocaleTimeString('vi-VN') : '--:--'}</td>
                      <td>{d.ghichu || '--'}</td>
                      <td><span className={`status-text ${d.trangthai === 'Có mặt' ? 'text-present' : 'text-absent'}`}>{d.trangthai}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceReport;
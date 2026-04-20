import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AttendanceReport.css';

const AttendanceReport = () => {
  // Trạng thái dữ liệu từ API
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

  /**
   * TẦNG 1: Lấy danh sách Lớp học khi vào trang
   */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_URL}/classes`);
        setClassList(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách lớp:", err);
      }
    };
    fetchClasses();
  }, [API_URL]);

  /**
   * TẦNG 2: Lấy danh sách Buổi học khi chọn một Lớp
   */
  const handleSelectClass = async (cls) => {
    try {
      const res = await axios.get(`${API_URL}/lessons/lop/${cls.malop}`);
      setSessionList(res.data);
      setSelectedClass(cls);
      setSearchTerm('');
    } catch (err) {
      console.error("Lớp chưa có buổi học nào!");
      setSessionList([]);
      setSelectedClass(cls);
    }
  };

  /**
   * TẦNG 3: Lấy chi tiết điểm danh khi chọn một Buổi học
   */
  const handleSelectSession = async (session) => {
    try {
      const res = await axios.get(`${API_URL}/diemDanh/buoihoc/${session.mabuoihoc}`);
      setAttendanceDetails(res.data?.data || res.data || []);
      setSelectedSession(session);
      setSearchTerm('');
    } catch (err) {
      console.error("Lỗi lấy chi tiết điểm danh:", err);
    }
  };

  // Logic lọc dữ liệu dựa trên ô tìm kiếm
  const getCurrentData = () => {
    if (selectedSession) {
      return attendanceDetails.filter(d => d.masinhvien.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedClass) {
      return sessionList.filter(s => s.mabuoihoc.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return classList.filter(c => 
      c.malop.toString().includes(searchTerm) || 
      c.monhoc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredData = getCurrentData();
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const Pagination = () => (
    totalPages > 1 && (
      <div className="modern-pagination">
        <button className="p-nav" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>‹</button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i + 1} className={`p-num ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
        ))}
        <button className="p-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>›</button>
      </div>
    )
  );

  return (
    <div className="attendance-page">
      <div className="main-card">
        
        {/* TẦNG 1: DANH SÁCH LỚP HỌC (Hiển thị các trường theo yêu cầu) */}
        {!selectedClass && (
          <div className="list-section">
            <div className="page-header">
              <div className="title-group">
                <h2 className="main-title">Thống kê theo Lớp</h2>
                <p className="sub-title">Danh sách các lớp học phần đang quản lý</p>
              </div>
              <div className="modern-search">
                <input type="text" placeholder="Tìm mã lớp hoặc môn..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button className="search-icon-btn">🔍</button>
              </div>
            </div>
            <div className="glass-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Mã Lớp</th>
                    <th>Tên Môn Học</th>
                    <th>Thời gian học (BĐ - KT)</th>
                    <th>Ngày học</th>
                    <th>Giờ học</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((c) => (
                    <tr key={c.malop} onClick={() => handleSelectClass(c)} className="clickable-row">
                      <td className="session-tag">{c.malop}</td>
                      <td className="font-600">{c.monhoc}</td>
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
            <div className="detail-header-row">
              <button className="back-btn-modern" onClick={() => setSelectedClass(null)}>← Trở lại danh sách lớp</button>
              <div className="modern-search">
                <input type="text" placeholder="Tìm mã buổi học..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="page-header">
              <h2 className="main-title">Lớp: {selectedClass.malop} - {selectedClass.monhoc}</h2>
            </div>
            <div className="glass-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Mã buổi</th>
                    <th>Ngày học</th>
                    <th>Bắt đầu</th>
                    <th>Kết thúc</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((s) => (
                    <tr key={s.mabuoihoc} onClick={() => handleSelectSession(s)} className="clickable-row">
                      <td className="session-tag">{s.mabuoihoc}</td>
                      <td>{s.ngayhoc}</td>
                      <td>{s.giobatdau}</td>
                      <td>{s.gioketthuc}</td>
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
            <div className="detail-header-row">
              <button className="back-btn-modern" onClick={() => setSelectedSession(null)}>← Trở lại danh sách buổi</button>
              <div className="modern-search detail-search">
                <input type="text" placeholder="Tìm MSSV..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="detail-top-card">
              <div className="session-summary">
                <h3>Lớp: <span>{selectedClass.malop}</span></h3>
                <div className="summary-pills">
                  <span>Mã buổi: {selectedSession.mabuoihoc}</span>
                  <span>📅 {selectedSession.ngayhoc}</span>
                </div>
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
                <thead>
                  <tr>
                    <th>MSSV</th>
                    <th>MÃ BUỔI</th>
                    <th>THỜI GIAN QUÉT</th>
                    <th className="hide-sm">GHI CHÚ</th>
                    <th>TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((d, i) => (
                    <tr key={i}>
                      <td className="font-600">{d.masinhvien}</td>
                      <td>{d.mabuoihoc}</td>
                      <td className="font-600">
                        {d.thoigiancapnhat ? new Date(d.thoigiancapnhat).toLocaleTimeString('vi-VN') : '--:--'}
                      </td>
                      <td className="hide-sm">{d.ghichu || '--'}</td>
                      <td>
                        <span className={`status-text ${d.trangthai === 'Có mặt' ? 'text-present' : 'text-absent'}`}>
                          {d.trangthai}
                        </span>
                      </td>
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
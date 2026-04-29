import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import './AttendanceManagement.css';

export default function AttendanceManagement() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedClass = location.state?.cls;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [classSessions, setClassSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceRate, setAttendanceRate] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [lessonDate, setLessonDate] = useState('');
  const [lessonStartTime, setLessonStartTime] = useState('');
  const [lessonEndTime, setLessonEndTime] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const itemsPerPage = 5;
  const classLabel = passedClass?.tenlop || `Lớp ${classId}`;
  const classCode = passedClass?.malop || classId;

  // Lọc reset trang
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const displayClassName = classLabel;

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lessons/lop/${classId}`);
      const data = response.data?.data || response.data || [];
      setClassSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải danh sách buổi học:', error);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (classId) fetchLessons();
  }, [classId, fetchLessons]);

  useEffect(() => {
    const fetchAttendanceRate = async () => {
      try {
        const response = await api.get(`/classes/${classId}/attendance-rate`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAttendanceRate(response.data.rate);
      } catch (error) {
        console.error("Lỗi khi tải tỷ lệ điểm danh:", error);
      }
    };

    if (classId) fetchAttendanceRate();
  }, [classId]);

  const openCreateModal = () => {
    setFormError('');
    setLessonDate('');
    setLessonStartTime('');
    setLessonEndTime('');
    setLessonContent('');
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isSubmitting) return;
    setIsCreateModalOpen(false);
    setFormError('');
  };

  const handleCreateLesson = async (event) => {
    event.preventDefault();

    if (!lessonDate || !lessonStartTime || !lessonEndTime || !lessonContent.trim()) {
      setFormError('Vui lòng nhập đầy đủ ngày học, giờ bắt đầu, giờ kết thúc và nội dung buổi học.');
      return;
    }

    if (lessonStartTime >= lessonEndTime) {
      setFormError('Giờ kết thúc phải lớn hơn giờ bắt đầu.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      const payload = {
        malop: classCode,
        ngayhoc: lessonDate,
        giobatdau: lessonStartTime,
        gioketthuc: lessonEndTime,
        noidungbuoihoc: lessonContent.trim(),
      };
      await api.post(`/lessons`, payload);
      await fetchLessons();
      setIsCreateModalOpen(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể tạo buổi học. Vui lòng thử lại.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSessions = classSessions.filter((session) => {
    const searchLow = searchTerm.toLowerCase();
    const ma = (session.mabuiohoc || '').toLowerCase();
    const ndi = (session.noidungbuoihoc || '').toLowerCase();
    return ma.includes(searchLow) || ndi.includes(searchLow);
  });

  // 2. Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  return (
    <div className="mgmt-container">
      {/* TOP BAR: Title & Search */}
      <div className="mgmt-top-bar">
        <h1 className="mgmt-title">Quản lý điểm danh - {displayClassName}</h1>
        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm buổi học..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-search">Tìm kiếm</button>
          <button className="btn-create-session" onClick={openCreateModal} type="button">
            Tạo buổi học
          </button>
        </div>
      </div>

      {passedClass && (
        <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '20px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div><strong style={{ color: '#6c757d', fontSize: '13px' }}>Tên lớp học</strong> <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{passedClass.tenlop}</div></div>
          <div><strong style={{ color: '#6c757d', fontSize: '13px' }}>Mã lớp học</strong> <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a73e8' }}>{passedClass.malop}</div></div>
          <div><strong style={{ color: '#6c757d', fontSize: '13px' }}>Môn học</strong> <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{passedClass.monhoc}</div></div>
          {attendanceRate !== null && (
            <div><strong style={{ color: '#6c757d', fontSize: '13px' }}>Tỉ lệ có mặt</strong> <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>{attendanceRate}%</div></div>
          )}
        </div>
      )}

      {/* DATE BANNER */}
      <div className="date-banner" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: '15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
          &larr; Quay lại
        </button>
        <span>DANH SÁCH CÁC BUỔI HỌC </span>
      </div>

      {/* TABLE SECTION */}
      <div className="mgmt-table-wrapper">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Mã buổi học</th>
              <th>Nội dung</th>
              <th>Ngày học</th>
              <th>Thời gian</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Đang tải danh sách buổi học...</td></tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((session, index) => (
                <tr key={index}>
                  <td data-label="Mã buổi"><strong>{session.mabuoihoc}</strong></td>
                  <td data-label="Nội dung">{session.noidungbuoihoc || 'N/A'}</td>
                  <td data-label="Ngày học">{session.ngayhoc ? session.ngayhoc.substring(0, 10) : 'N/A'}</td>
                  <td data-label="Thời gian">
                    {session.giobatdau ? session.giobatdau.substring(0, 5) : ''} - {session.gioketthuc ? session.gioketthuc.substring(0, 5) : ''}
                  </td>
                  <td data-label="Thao tác" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>

                    <button
                      className="btn-create-code"
                      onClick={() => navigate(`/teacher/attendance/process/${session.mabuoihoc}?type=face`, { state: { session, cls: passedClass, className: displayClassName } })}
                    >
                      Xem buổi học
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  Không tìm thấy lớp học nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION SECTION */}
      {totalPages > 1 && (
        <div className="mgmt-pagination">
          <button
            className="page-btn-nav"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            ‹
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="page-btn-nav"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            ›
          </button>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content lesson-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tạo buổi học mới</h3>
            <form className="lesson-form" onSubmit={handleCreateLesson}>
              <label className="lesson-field">
                <span>Ngày học</span>
                <input
                  type="date"
                  value={lessonDate}
                  onChange={(e) => setLessonDate(e.target.value)}
                  required
                />
              </label>

              <div className="lesson-time-row">
                <label className="lesson-field">
                  <span>Giờ bắt đầu</span>
                  <input
                    type="time"
                    value={lessonStartTime}
                    onChange={(e) => setLessonStartTime(e.target.value)}
                    required
                  />
                </label>

                <label className="lesson-field">
                  <span>Giờ kết thúc</span>
                  <input
                    type="time"
                    value={lessonEndTime}
                    onChange={(e) => setLessonEndTime(e.target.value)}
                    required
                  />
                </label>
              </div>

              <label className="lesson-field">
                <span>Nội dung buổi học</span>
                <textarea
                  rows="4"
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Nhập nội dung buổi học..."
                  required
                />
              </label>

              {formError && <div className="lesson-form-error">{formError}</div>}

              <div className="lesson-actions">
                <button type="button" className="btn-cancel" onClick={closeCreateModal} disabled={isSubmitting}>
                  Hủy
                </button>
                <button type="submit" className="btn-confirm" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang tạo...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
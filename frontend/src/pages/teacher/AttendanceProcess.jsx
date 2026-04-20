import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AttendanceProcess.css';

export default function AttendanceProcess() {
    const { sessionId } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Lấy thông tin session được truyền từ trang trước
    const passedSession = location.state?.session || {};
    const passedClass = location.state?.cls || {};
    const passedClassName = passedClass.tenlop || location.state?.className || "Chưa rõ lớp";
    const maLop = passedClass.malop || passedSession.malop || '';

    const [studentSearch, setStudentSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [students, setStudents] = useState([]);

    // --- NEW STATES FOR QR ---
    const [isGenerating, setIsGenerating] = useState(false);
    const [duration, setDuration] = useState(60); // giây
    const [timeLeft, setTimeLeft] = useState(0);
    const [showQRModal, setShowQRModal] = useState(false);

    // Get Attendance List from BE (Lấy Sĩ số + Lấy Điểm danh)
    const fetchAttendance = useCallback(async () => {
        try {
            // Luồng 1: Lấy khung sĩ số sinh viên của lớp
            let baseStudents = [];
            if (maLop) {
                try {
                    const lopsinhvienRes = await api.get(`/lopsinhvien/${maLop}`);
                    const lsData = lopsinhvienRes.data?.data || lopsinhvienRes.data || [];
                    let initialStudents = [];
                    if (Array.isArray(lsData)) {
                        initialStudents = lsData;
                    } else if (lsData && lsData.masinhvien) {
                        initialStudents = [lsData];
                    }

                    // Tận dụng gọi API students lấy Tên Sinh Viên
                    const detailedPromises = initialStudents.map(async (st) => {
                        try {
                            const detailRes = await api.get(`/students/${st.masinhvien}`);
                            const detailData = detailRes.data?.data || detailRes.data;
                            return { ...st, ...detailData };
                        } catch (e) {
                            console.error(`Lỗi tải tên SV ${st.masinhvien}:`, e);
                            return st;
                        }
                    });

                    baseStudents = await Promise.all(detailedPromises);
                } catch (err) {
                    console.error("Lỗi lấy danh sách sinh viên lớp:", err);
                }
            }

            // Luồng 2: Lấy dữ liệu điểm danh
            const response = await api.get(`/diemDanh/buoiHoc/${sessionId}`);
            const diemdanhData = response.data?.data || response.data || [];
            const ddArray = Array.isArray(diemdanhData) ? diemdanhData : [];

            // Bước 3: Gộp (Merge)
            const roster = baseStudents.length > 0 ? baseStudents : ddArray;

            const mappedStudents = roster.map(studentBase => {
                const svId = studentBase.masinhvien;
                const ddRecord = ddArray.find(d => d.masinhvien === svId);
                const tenXacDinh = studentBase.holot ? `${studentBase.holot} ${studentBase.ten}` : (studentBase.ten || 'Chưa cập nhật');

                let parsedTime = '--';
                if (ddRecord?.thoigiancapnhat) {
                    const d = new Date(ddRecord.thoigiancapnhat);
                    if (!isNaN(d.getTime())) {
                        parsedTime = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                    } else if (ddRecord.thoigiancapnhat.includes(' ')) {
                        parsedTime = ddRecord.thoigiancapnhat.split(' ')[1].substring(0, 5);
                    } else {
                        parsedTime = ddRecord.thoigiancapnhat.substring(0, 5);
                    }
                }

                return {
                    mssv: svId || '--',
                    tenSV: tenXacDinh,
                    maLop: maLop || '--',
                    updateTime: parsedTime,
                    note: ddRecord?.ghichu || '--',
                    status: ddRecord?.trangthai || 'Lựa chọn', // Tiếng việt mặc định
                    madiemdanh: ddRecord?.madiemdanh || null
                };
            });

            setStudents(mappedStudents);
        } catch (error) {
            console.error("Lỗi tải danh sách điểm danh UI:", error);
        }
    }, [sessionId, maLop]);

    // Load lúc mới vào trang
    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    // Cập nhật lại duy nhất 1 sinh viên thay vì gọi lại toàn bộ 
    const fetchSingleStudentAttendance = async (mssv) => {
        try {
            const response = await api.get(`/diemDanh/sinhvien/${mssv}`);
            const data = response.data?.data || response.data || [];
            const ddArray = Array.isArray(data) ? data : [];
            // Lọc đúng buổi học hiện tại
            const ddRecord = ddArray.find(d => String(d.mabuoihoc) === String(sessionId));

            if (ddRecord) {
                let parsedTime = '--';
                if (ddRecord.thoigiancapnhat) {
                    const d = new Date(ddRecord.thoigiancapnhat);
                    if (!isNaN(d.getTime())) {
                        parsedTime = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                    } else if (ddRecord.thoigiancapnhat.includes(' ')) {
                        parsedTime = ddRecord.thoigiancapnhat.split(' ')[1].substring(0, 5);
                    } else {
                        parsedTime = ddRecord.thoigiancapnhat.substring(0, 5);
                    }
                }

                setStudents(prev => prev.map(s =>
                    s.mssv === mssv ? {
                        ...s,
                        updateTime: parsedTime,
                        note: ddRecord.ghichu || '--',
                        status: ddRecord.trangthai || 'Lựa chọn',
                        madiemdanh: ddRecord.madiemdanh
                    } : s
                ));
            }
        } catch (error) {
            console.error(`Lỗi tải điểm danh cá nhân SV ${mssv}:`, error);
        }
    };

    const handleStatusChange = async (mssv, newStatus) => {
        if (showQRModal) return;

        // Optimistic UI update
        setStudents(prev => prev.map(s =>
            s.mssv === mssv ? { ...s, status: newStatus } : s
        ));

        const student = students.find(s => s.mssv === mssv);
        if (!student) return;

        const maNguoiCapNhat = user?.id || user?.username || 'admin';

        try {
            if (student.madiemdanh) {
                // Đã có mã -> Nhấn PUT Cập Nhật
                await api.put(`/diemDanh/${student.madiemdanh}`, {
                    madiemdanh: student.madiemdanh,
                    maSinhVien: mssv,
                    maBuoiHoc: sessionId,
                    trangThai: newStatus,
                    ghiChu: (student.note && student.note !== '--') ? student.note : ' ',
                    maNguoiCapNhat: maNguoiCapNhat
                });
                await fetchSingleStudentAttendance(mssv); // Tải lại độc lập
            } else {
                // Chưa có mã -> Nhấn POST Tạo Mới
                await api.post(`/diemDanh/`, {
                    maSinhVien: mssv,
                    maBuoiHoc: sessionId,
                    trangThai: newStatus,
                    ghiChu: (student.note && student.note !== '--') ? student.note : ' ',
                    maNguoiCapNhat: maNguoiCapNhat
                });
                await fetchSingleStudentAttendance(mssv); // Refetch lấy madiemdanh mới tạo
            }
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái điểm danh:", error);
            await fetchSingleStudentAttendance(mssv); // Revert
        }
    };

    // Chỉ cập nhật value ở Input (Giữ mượt UI)
    const handleNoteChange = (mssv, newNote) => {
        if (showQRModal) return;
        setStudents(prev => prev.map(s =>
            s.mssv === mssv ? { ...s, note: newNote } : s
        ));
    };

    // Khi người dùng bấm click ra ngoài Input (Mất Focus) -> Lưu Note xuống BE
    const handleNoteBlur = async (mssv, finalNote) => {
        if (showQRModal) return;
        const student = students.find(s => s.mssv === mssv);
        if (!student) return;

        const maNguoiCapNhat = user?.id || user?.username || 'admin';

        try {
            if (student.madiemdanh) {
                await api.put(`/diemDanh/${student.madiemdanh}`, {
                    madiemdanh: student.madiemdanh,
                    maSinhVien: mssv,
                    maBuoiHoc: sessionId,
                    trangThai: student.status,
                    ghiChu: finalNote || ' ',
                    maNguoiCapNhat: maNguoiCapNhat
                });
                await fetchSingleStudentAttendance(mssv);
            } else {
                await api.post(`/diemDanh/`, {
                    maSinhVien: mssv,
                    maBuoiHoc: sessionId,
                    trangThai: student.status,
                    ghiChu: finalNote || ' ',
                    maNguoiCapNhat: maNguoiCapNhat
                });
                await fetchSingleStudentAttendance(mssv);
            }
        } catch (error) {
            console.error("Lỗi cập nhật ghi chú:", error);
            await fetchSingleStudentAttendance(mssv);
        }
    };

    // Hàm tự động quét và chốt danh sách vắng thi / vắng học
    const handleCloseQRProcess = async () => {
        const missingStudents = students.filter(s => s.status === 'Lựa chọn' || s.status === 'choice');
        const maNguoiCapNhat = user?.id || user?.username || 'admin';

        if (missingStudents.length === 0) {
            fetchAttendance();
            return;
        }

        // Cập nhật Giao diện ngay lập tức thành Vắng (Optimistic UI)
        setStudents(prev => prev.map(s =>
            (s.status === 'Lựa chọn' || s.status === 'choice') ? { ...s, status: 'Vắng không phép' } : s
        ));

        try {
            // Đồng bộ đồng loạt xuống Backend
            await Promise.all(missingStudents.map(student => {
                const payload = {
                    maSinhVien: student.mssv,
                    maBuoiHoc: sessionId,
                    trangThai: 'Vắng không phép',
                    ghiChu: ' ',
                    maNguoiCapNhat: maNguoiCapNhat
                };
                if (student.madiemdanh) {
                    return api.put(`/diemDanh/${student.madiemdanh}`, { madiemdanh: student.madiemdanh, ...payload });
                } else {
                    return api.post(`/diemDanh/`, payload);
                }
            }));
            fetchAttendance(); // Tải lại chốt sổ cuối cùng độ chính xác 100%
        } catch (error) {
            console.error("Lỗi tự động chốt vắng:", error);
            fetchAttendance();
        }
    };

    // Timer logic
    useEffect(() => {
        let timer;
        if (showQRModal && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (showQRModal && timeLeft === 0) {
            setShowQRModal(false);
            handleCloseQRProcess(); // Hết giờ -> Chốt vắng toàn bộ những kẻ sót lại
        }
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showQRModal, timeLeft]); // Không cho handleCloseQRProcess vào để tránh đứt gãy Đồng hồ đếm ngược

    const startQR = () => {
        setTimeLeft(duration);
        setShowQRModal(true);
        setIsGenerating(false);
    };

    const cancelQR = () => {
        setShowQRModal(false);
        setTimeLeft(0);
        handleCloseQRProcess(); // Quản lý hủy ngang cũng chốt sổ
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [studentSearch]);

    // Dữ liệu tạo QR (Chuỗi JSON chứa Mã Buổi Học và Ngày Học)
    // const qrDataObj = {
    //     mabuoihoc: sessionId,
    //     ngayhoc: passedSession.ngayhoc || ""
    // };

    // T tạm thời khoá lại nha
    //const qrDataString = encodeURIComponent(JSON.stringify(qrDataObj));

    // Tạo link dẫn thẳng tới trang điểm danh của sinh viên
    //const attendanceURL = `${window.location.origin}/student/attendance/${sessionId}`;
    const attendanceURL = `${window.location.origin}/student/attendance?sessionId=${sessionId}`;
    const qrDataString = encodeURIComponent(attendanceURL);

    
    const sessionInfo = {
        code: `QR-${sessionId}`,
        sessionId: sessionId,
        className: passedClassName,
        students: students.length, // Sĩ số tính tổng sinh viên
        present: students.filter(s => ['present', 'late', 'Có mặt', 'Đi trễ'].includes(s.status)).length,
        absent: students.filter(s => ['excused', 'unexcused', 'Vắng có phép', 'Vắng không phép'].includes(s.status)).length,
        time: `${passedSession.giobatdau ? passedSession.giobatdau.substring(0, 5) : '--'} - ${passedSession.gioketthuc ? passedSession.gioketthuc.substring(0, 5) : '--'}`
    };

    const filteredStudents = students.filter(s => {
        const mssvStr = s?.mssv || '';
        const tenSVStr = s?.tenSV || '';
        const searchStr = studentSearch || '';
        return mssvStr.toLowerCase().includes(searchStr.toLowerCase()) ||
            tenSVStr.toLowerCase().includes(searchStr.toLowerCase());
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    // Bốc riêng các bạn Bị Lỗi (Đang xem xét) sang lưới cách ly
    const reviewStudents = students.filter(s => s.status === 'Đang xem xét');

    return (
        <div className={`process-container ${showQRModal ? 'locked' : ''}`}>
            {/* MODAL QR CENTERED */}
            {showQRModal && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal-content">
                        <h2>Mã QR Điểm Danh</h2>
                        <div className="qr-display">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrDataString}`} alt="QR" />
                        </div>
                        <div className="timer-display">
                            Thời gian còn lại: <strong>{timeLeft}s</strong>
                        </div>
                        <button className="btn-cancel-qr" onClick={cancelQR}>Hủy bỏ & Cập nhật DS</button>
                    </div>
                </div>
            )}

            <div className="info-header">
                <div className="header-title">THÔNG TIN BUỔI HỌC</div>

                {/* NÚT TẠO MÃ QR (Chỉ hiện khi type là face) */}
                {type === 'face' && !isGenerating && !showQRModal && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '15px' }}>
                        <button className="btn-init-qr" onClick={() => setIsGenerating(true)}>
                            Tạo mã QR cho điểm danh khuôn mặt
                        </button>
                    </div>
                )}

                {/* FORM NHẬP THỜI GIAN */}
                {isGenerating && (
                    <div className="qr-setup-box">
                        <label>Nhập thời gian hiệu lực (giây):</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min="10"
                            max="300"
                        />
                        <div className="setup-actions">
                            <button className="btn-confirm-qr" onClick={startQR}>Xác nhận</button>
                            <button className="btn-cancel-setup" onClick={() => setIsGenerating(false)}>Đóng</button>
                        </div>
                    </div>
                )}

                <div className="info-grid">
                    <div className="info-text">
                        <p>Mã điểm danh (QR): <strong>{sessionInfo.code}</strong></p>
                        <p>Mã buổi học: <strong>{sessionInfo.sessionId}</strong></p>
                        <p>Tên lớp: <strong>{sessionInfo.className}</strong></p>
                        <p>Sỉ số: {sessionInfo.students} | Thời gian: {sessionInfo.time}</p>
                    </div>

                    <div className="stats-box">
                        <div className="stat-item present">Điểm danh: {sessionInfo.present}/{sessionInfo.students}</div>
                        <div className="stat-item absent">Vắng: {sessionInfo.absent}</div>
                        <button className="btn-bulk" disabled={showQRModal}>Điểm danh hàng loạt</button>
                    </div>
                </div>
            </div>

            <div className="student-search-bar">
                <input
                    type="text"
                    placeholder="Nhập mã sinh viên hoặc tên..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    disabled={showQRModal}
                />
                <span className="search-icon">🔍</span>
            </div>

            <div className="attendance-tables-wrapper">
                {/* ZONE LEFT: BẢNG DANH SÁCH CHÍNH */}
                <div className="main-table-side">
                    <div className="student-list-section">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>MSSV</th>
                                    <th>Tên Sinh Viên</th>
                                    <th>Cập nhật</th>
                                    <th>Ghi chú</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentStudents.map((student) => (
                                    <tr key={student.mssv}>
                                        <td>{student.mssv}</td>
                                        <td>{student.tenSV}</td>
                                        <td style={{ fontWeight: '900' }}>{student.updateTime}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="note-input"
                                                value={student.note === '--' ? '' : student.note}
                                                placeholder="Thêm ghi chú..."
                                                onChange={(e) => handleNoteChange(student.mssv, e.target.value)}
                                                onBlur={(e) => handleNoteBlur(student.mssv, e.target.value)}
                                                disabled={showQRModal || student.status === 'Đang xem xét'}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className={`status-select ${student.status === 'Có mặt' ? 'present' :
                                                        student.status === 'Vắng có phép' ? 'excused' :
                                                            student.status === 'Vắng không phép' ? 'unexcused' :
                                                                student.status === 'Đang xem xét' ? 'review' :
                                                                    student.status === 'Đi trễ' ? 'late' : 'choice'
                                                    }`}
                                                value={student.status}
                                                onChange={(e) => handleStatusChange(student.mssv, e.target.value)}
                                                disabled={showQRModal || student.status === 'Đang xem xét'}
                                            >
                                                <option value="Lựa chọn">Lựa chọn</option>
                                                <option value="Có mặt">Có mặt</option>
                                                <option value="Vắng có phép">Vắng có phép</option>
                                                <option value="Vắng không phép">Vắng không phép</option>
                                                <option value="Đi trễ">Đi trễ</option>
                                                <option value="Đang xem xét">Đang xem xét</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {currentStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Không có sinh viên nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mgmt-pagination">
                            <button className="page-btn-nav" disabled={currentPage === 1 || showQRModal} onClick={() => setCurrentPage(prev => prev - 1)}>‹</button>
                            {(() => {
                                let startPage = Math.max(1, currentPage - 2);
                                let endPage = Math.min(totalPages, startPage + 4);
                                if (endPage - startPage < 4) {
                                    startPage = Math.max(1, endPage - 4);
                                }

                                const pages = [];
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            className={`page-btn ${currentPage === i ? 'active' : ''}`}
                                            disabled={showQRModal}
                                            onClick={() => setCurrentPage(i)}
                                        >
                                            {i}
                                        </button>
                                    );
                                }
                                return pages;
                            })()}
                            <button className="page-btn-nav" disabled={currentPage === totalPages || showQRModal} onClick={() => setCurrentPage(prev => prev + 1)}>›</button>
                        </div>
                    )}
                </div>

                {/* ZONE RIGHT: BẢNG XÉT DUYỆT CÁCH LY */}
                <div className="review-table-side">
                    <h3 className="review-title">⚠️ Danh sách Cần Xem Xét ({reviewStudents.length})</h3>
                    <table className="review-table">
                        <thead>
                            <tr>
                                <th>MSSV</th>
                                <th>Tên</th>
                                <th>Xét Duyệt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviewStudents.length > 0 ? (
                                reviewStudents.map(student => (
                                    <tr key={student.mssv}>
                                        <td style={{ fontWeight: 700 }}>{student.mssv}</td>
                                        <td>{student.tenSV}</td>
                                        <td>
                                            <div className="review-actions">
                                                <button
                                                    className="btn-rv approve"
                                                    onClick={() => handleStatusChange(student.mssv, 'Có mặt')}
                                                    disabled={showQRModal}
                                                >Có mặt
                                                </button>
                                                <button
                                                    className="btn-rv reject"
                                                    onClick={() => handleStatusChange(student.mssv, 'Vắng không phép')}
                                                    disabled={showQRModal}
                                                >Vắng
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ padding: '20px', color: '#666', fontStyle: 'italic' }}>Tất cả đều ổn thỏa.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <button className="back-btn" disabled={showQRModal} onClick={() => navigate(-1)}>Quay lại</button>
            </div>
        </div>
    );
}
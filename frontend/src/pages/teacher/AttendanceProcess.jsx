import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import './AttendanceProcess.css';

const MOCK_STUDENTS = [
    { mssv: 'DH51245', maLop: 'D22_TH02', updateTime: '7:10', note: 'Đi trễ', status: 'late' },
    { mssv: 'DH51246', maLop: 'D22_TH02', updateTime: '7:09', note: 'Xin nghỉ có phép', status: 'excused' },
    { mssv: 'DH51247', maLop: 'D22_TH02', updateTime: '7:00', note: '--', status: 'choice' },
    { mssv: 'DH51248', maLop: 'D22_TH02', updateTime: '7:02', note: '--', status: 'present' },
    { mssv: 'DH51249', maLop: 'D22_TH02', updateTime: '--', note: '--', status: 'unexcused' },
    { mssv: 'DH51250', maLop: 'D22_TH02', updateTime: '7:05', note: 'Quên thẻ', status: 'present' },
    { mssv: 'DH51251', maLop: 'D22_TH02', updateTime: '7:15', note: 'Lý do cá nhân', status: 'choice' },
    { mssv: 'DH51252', maLop: 'D22_TH02', updateTime: '--', note: '--', status: 'unexcused' },
    { mssv: 'DH51253', maLop: 'D22_TH02', updateTime: '7:00', note: '--', status: 'present' },
    { mssv: 'DH51254', maLop: 'D22_TH02', updateTime: '7:12', note: 'Đi trễ', status: 'late' },
];

export default function AttendanceProcess() {
    const { sessionId } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const navigate = useNavigate();

    const [studentSearch, setStudentSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [students, setStudents] = useState(MOCK_STUDENTS);

    // --- NEW STATES FOR QR ---
    const [isGenerating, setIsGenerating] = useState(false);
    const [duration, setDuration] = useState(60); // giây
    const [timeLeft, setTimeLeft] = useState(0);
    const [showQRModal, setShowQRModal] = useState(false);

    const handleStatusChange = (mssv, newStatus) => {
        if (showQRModal) return; // Khóa thao tác khi đang hiện QR
        setStudents(prev => prev.map(s =>
            s.mssv === mssv ? { ...s, status: newStatus } : s
        ));
    };

    const handleNoteChange = (mssv, newNote) => {
        if (showQRModal) return; // Khóa thao tác khi đang hiện QR
        setStudents(prev => prev.map(s =>
            s.mssv === mssv ? { ...s, note: newNote } : s
        ));
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
        }
        return () => clearInterval(timer);
    }, [showQRModal, timeLeft]);

    const startQR = () => {
        setTimeLeft(duration);
        setShowQRModal(true);
        setIsGenerating(false);
    };

    const cancelQR = () => {
        setShowQRModal(false);
        setTimeLeft(0);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [studentSearch]);

    const sessionInfo = {
        code: "DD122026",
        sessionId: sessionId,
        className: "CNTT TH10",
        students: 70,
        present: students.filter(s => s.status === 'present' || s.status === 'late').length,
        absent: students.filter(s => s.status === 'excused' || s.status === 'unexcused').length,
        time: "7:00 - 12:00"
    };

    const filteredStudents = students.filter(s =>
        s.mssv.toLowerCase().includes(studentSearch.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    return (
        <div className={`process-container ${showQRModal ? 'locked' : ''}`}>
            {/* MODAL QR CENTERED */}
            {showQRModal && (
                <div className="qr-modal-overlay">
                    <div className="qr-modal-content">
                        <h2>Mã QR Điểm Danh</h2>
                        <div className="qr-display">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${sessionInfo.code}`} alt="QR" />
                        </div>
                        <div className="timer-display">
                            Thời gian còn lại: <strong>{timeLeft}s</strong>
                        </div>
                        <button className="btn-cancel-qr" onClick={cancelQR}>Hủy bỏ</button>
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
                        <p>Mã điểm danh: <strong>{sessionInfo.code}</strong></p>
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
                    placeholder="Nhập mã sinh viên..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    disabled={showQRModal}
                />
                <span className="search-icon">🔍</span>
            </div>

            <div className="student-list-section">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>MSSV</th>
                            <th>Mã Lớp</th>
                            <th>Cập nhật</th>
                            <th>Ghi chú</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentStudents.map((student) => (
                            <tr key={student.mssv}>
                                <td>{student.mssv}</td>
                                <td>{student.maLop}</td>
                                <td style={{ fontWeight: '900' }}>{student.updateTime}</td>
                                <td>
                                    <input
                                        type="text"
                                        className="note-input"
                                        value={student.note === '--' ? '' : student.note}
                                        placeholder="Thêm ghi chú..."
                                        onChange={(e) => handleNoteChange(student.mssv, e.target.value)}
                                        disabled={showQRModal}
                                    />
                                </td>
                                <td>
                                    <select
                                        className={`status-select ${student.status}`}
                                        value={student.status}
                                        onChange={(e) => handleStatusChange(student.mssv, e.target.value)}
                                        disabled={showQRModal}
                                    >
                                        <option value="choice">Lựa chọn</option>
                                        <option value="present">Có mặt</option>
                                        <option value="excused">Vắng có phép</option>
                                        <option value="unexcused">Vắng không phép</option>
                                        <option value="late">Đi trễ</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mgmt-pagination">
                    <button className="page-btn-nav" disabled={currentPage === 1 || showQRModal} onClick={() => setCurrentPage(prev => prev - 1)}>‹</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i + 1} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} disabled={showQRModal} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                    ))}
                    <button className="page-btn-nav" disabled={currentPage === totalPages || showQRModal} onClick={() => setCurrentPage(prev => prev + 1)}>›</button>
                </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <button className="back-btn" disabled={showQRModal} onClick={() => navigate(-1)}>Quay lại</button>
            </div>
        </div>
    );
}
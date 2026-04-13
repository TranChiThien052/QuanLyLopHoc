import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import './AttendanceProcess.css';

const MOCK_STUDENTS = [
    { mssv: 'DH51245', maLop: 'D22_TH02', updateTime: '7:10', note: 'Đi trễ', status: 'present' },
    { mssv: 'DH51246', maLop: 'D22_TH02', updateTime: '7:09', note: 'Xin nghỉ có phép', status: 'choice' },
    { mssv: 'DH51247', maLop: 'D22_TH02', updateTime: '7:00', note: '--', status: 'choice' },
    { mssv: 'DH51248', maLop: 'D22_TH02', updateTime: '7:02', note: '--', status: 'present' },
    { mssv: 'DH51249', maLop: 'D22_TH02', updateTime: '--', note: '--', status: 'absent' },
    { mssv: 'DH51250', maLop: 'D22_TH02', updateTime: '7:05', note: 'Quên thẻ', status: 'present' },
    { mssv: 'DH51251', maLop: 'D22_TH02', updateTime: '7:15', note: 'Lý do cá nhân', status: 'choice' },
    { mssv: 'DH51252', maLop: 'D22_TH02', updateTime: '--', note: '--', status: 'absent' },
    { mssv: 'DH51253', maLop: 'D22_TH02', updateTime: '7:00', note: '--', status: 'present' },
    { mssv: 'DH51254', maLop: 'D22_TH02', updateTime: '7:12', note: 'Đi trễ', status: 'present' },
];

export default function AttendanceProcess() {
    const { sessionId } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const navigate = useNavigate();

    const [studentSearch, setStudentSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // QUAN TRỌNG: Mọi thay đổi phải diễn ra trên state này
    const [students, setStudents] = useState(MOCK_STUDENTS);

    const handleStatusChange = (mssv, newStatus) => {
        const updatedStudents = students.map(s =>
            s.mssv === mssv ? { ...s, status: newStatus } : s
        );
        setStudents(updatedStudents);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [studentSearch]);

    const sessionInfo = {
        code: "DD122026",
        sessionId: sessionId,
        className: "CNTT TH10",
        students: 70,
        present: students.filter(s => s.status === 'present').length, // Tính toán động
        absent: students.filter(s => s.status === 'absent').length,   // Tính toán động
        time: "7:00 - 12:00"
    };

    // SỬA LỖI: Lọc từ state 'students' thay vì 'MOCK_STUDENTS'
    const filteredStudents = students.filter(s =>
        s.mssv.toLowerCase().includes(studentSearch.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    return (
        <div className="process-container">
            <div className="info-header">
                <div className="header-title">THÔNG TIN BUỔI HỌC</div>
                <div className="info-grid">
                    <div className="info-text">
                        <p>Mã điểm danh: <strong>{sessionInfo.code}</strong></p>
                        <p>Mã buổi học: <strong>{sessionInfo.sessionId}</strong></p>
                        <p>Tên lớp: <strong>{sessionInfo.className}</strong></p>
                        <p>Sỉ số: {sessionInfo.students} | Thời gian: {sessionInfo.time}</p>
                    </div>

                    {type === 'face' ? (
                        <div className="qr-section">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${sessionInfo.code}`} alt="QR" />
                            <button className="btn-zoom">Phóng To QR</button>
                        </div>
                    ) : (
                        <div className="stats-box">
                            <div className="stat-item present">Điểm danh: {sessionInfo.present}/{sessionInfo.students}</div>
                            <div className="stat-item absent">Vắng: {sessionInfo.absent}</div>
                            <button className="btn-bulk">Điểm danh hàng loạt</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="student-search-bar">
                <input
                    type="text"
                    placeholder="Nhập mã sinh viên..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
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
                        {currentStudents.length > 0 ? (
                            currentStudents.map((student) => (
                                <tr key={student.mssv}>
                                    <td>{student.mssv}</td>
                                    <td>{student.maLop}</td>
                                    <td style={{ fontWeight: '900' }}>{student.updateTime}</td>
                                    <td>{student.note}</td>
                                    <td>
                                        <select
                                            className={`status-select ${student.status}`}
                                            value={student.status} // Dùng value thay cho defaultValue để đồng bộ state
                                            onChange={(e) => handleStatusChange(student.mssv, e.target.value)}
                                        >
                                            <option value="choice">Lựa chọn</option>
                                            <option value="present">Đã điểm danh</option>
                                            <option value="absent">Vắng</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Không tìm thấy sinh viên</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mgmt-pagination">
                    <button className="page-btn-nav" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>‹</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i + 1} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                    ))}
                    <button className="page-btn-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>›</button>
                </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                <button className="back-btn" onClick={() => navigate(-1)}>Quay lại</button>
            </div>
        </div>
    );
}
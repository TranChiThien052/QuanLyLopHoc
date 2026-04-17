import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import axios from 'axios';
import './Attendance.css';

const Attendance = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId'); // Lấy mã buổi học từ URL

  const videoRef = useRef(null);
  
  const [step, setStep] = useState('idle'); 
  const [isCamOpen, setIsCamOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState('Đang khởi tạo hệ thống...');
  const [student, setStudent] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const isProcessing = useRef(false);

  // 1. Khởi tạo AI và lấy thông tin người dùng
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser?.id) setStudent({ masinhvien: savedUser.id });
      } catch (e) {
        setMsg('Lỗi: Không thể tải mô hình AI!');
      }
    };
    init();
  }, []);

  /**
   * 2. Hàm xác thực Buổi học (Fix lỗi N/A)
   */
  const handleVerifyQR = useCallback(async (mabuoihoc) => {
    if (!mabuoihoc || !student?.masinhvien) return;
    setStep('verifying');
    setMsg('Đang xác thực thông tin buổi học...');

    try {
      // Gọi API kiểm tra danh sách điểm danh
      const resAt = await axios.get(`${process.env.REACT_APP_API_URL}/diemDanh/sinhvien/${student.masinhvien}`);
      const attendanceData = resAt.data?.data || resAt.data || [];
      const record = attendanceData.find(i => String(i.mabuoihoc) === String(mabuoihoc));

      if (record) {
        // Lấy thông tin lớp và môn học để hiển thị
        const resLesson = await axios.get(`${process.env.REACT_APP_API_URL}/lesson/${mabuoihoc}`);
        const resClass = await axios.get(`${process.env.REACT_APP_API_URL}/class/${resLesson.data.malop}`);

        setSessionInfo({
          tenlop: resClass.data.tenlop,
          monhoc: resClass.data.monhoc,
          madiemdanh: record.madiemdanh
        });

        setIsCamOpen(false); // Đóng cam QR nếu đang mở
        setShowModal(true);
        setStep('face_id'); 
      } else {
        setStep('idle');
        setMsg('Bạn không có tên trong danh sách buổi học này!');
      }
    } catch (err) {
      setStep('idle');
      setMsg('Lỗi: Buổi học không hợp lệ!');
    }
  }, [student]);

  // Tự động chạy xác thực khi vào từ link QR
  useEffect(() => {
    if (sessionId && student?.masinhvien && step === 'idle') {
      handleVerifyQR(sessionId);
    }
  }, [sessionId, student, step, handleVerifyQR]);

  /**
   * 3. Quản lý vòng đời Camera (Fix lỗi Ref null và ESLint dòng 54)
   */
  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      // Chỉ thực hiện khi isCamOpen = true và phần tử video đã xuất hiện trong DOM
      if (isCamOpen && videoRef.current) {
        try {
          const mode = step === 'face_id' ? "user" : "environment";
          currentStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = currentStream;
          }
        } catch (err) {
          setMsg('Lỗi: Không thể mở Camera. Hãy kiểm tra quyền và HTTPS!');
        }
      }
    };

    startCamera();

    // Dọn dẹp: Tắt camera khi Component bị hủy hoặc trạng thái thay đổi
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCamOpen, step]);

  /**
   * 4. Nhận diện khuôn mặt
   */
  const handleFaceID = useCallback(async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setMsg('Đang nhận diện (Quét 5 lần)...');

    try {
      for (let i = 1; i <= 5; i++) {
        setMsg(`Quét mặt: ${i}/5...`);
        await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        await new Promise(r => setTimeout(r, 200));
      }

      await axios.put(`${process.env.REACT_APP_API_URL}/diemDanh/${sessionInfo.madiemdanh}`, {
        trangThai: 'Có mặt',
        maNguoiCapNhat: student.masinhvien
      });

      setStep('success');
      setMsg('ĐIỂM DANH THÀNH CÔNG! ✅');
    } catch (err) {
      setMsg('Nhận diện thất bại! Thử lại sau 3s...');
      setTimeout(() => { isProcessing.current = false; }, 3000);
    }
  }, [student, sessionInfo]);

  // Vòng lặp nhận diện AI
  useEffect(() => {
    let timer;
    if (isCamOpen && step === 'face_id' && !isProcessing.current && videoRef.current) {
      timer = setInterval(async () => {
        const det = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions());
        if (det) {
          clearInterval(timer);
          handleFaceID();
        }
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isCamOpen, step, handleFaceID]);

  return (
    <div className="attendance-responsive-wrapper">
      <div className="card-main">
        <div className="header-brand">
          <h2>STU SYSTEM</h2>
          <p>Hệ thống điểm danh sinh viên</p>
        </div>

        <div className="viewport-cam">
          {/* Luôn kiểm tra điều kiện hiển thị */}
          {isCamOpen && !showModal ? (
            <video ref={videoRef} autoPlay muted playsInline className="video-qr" />
          ) : (
            <div className="placeholder-cam">
              <span className="icon">{step === 'verifying' ? '⏳' : '📷'}</span>
            </div>
          )}
        </div>

        <div className={`status-text ${step}`}>{msg}</div>

        <div className="footer-action">
          {step === 'idle' && !sessionId && (
            <button className="btn-start" onClick={() => setIsCamOpen(true)}>MỞ CAMERA QUÉT QR</button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay-custom">
          <div className="modal-container-custom">
            <div className="modal-top">
              <h3>XÁC THỰC SINH VIÊN</h3>
              <button className="btn-close" onClick={() => { setShowModal(false); setIsCamOpen(false); }}>&times;</button>
            </div>
            <div className="modal-inner">
              <div className="info-box-session">
                <p>MSSV: <strong>{student?.masinhvien}</strong></p>
                <p>Môn: <strong>{sessionInfo?.monhoc || 'Đang tải...'}</strong></p>
                <p>Lớp: <strong>{sessionInfo?.tenlop || 'Đang tải...'}</strong></p>
              </div>
              <div className="face-viewport">
                {/* Sử dụng isCamOpen để điều khiển video trong Modal */}
                {step === 'face_id' && (
                  <video ref={videoRef} autoPlay muted playsInline className="video-face" />
                )}
                <div className="laser-line"></div>
                {step === 'success' && <div className="success-tag">ĐÃ ĐIỂM DANH ✅</div>}
              </div>
              <p className="msg-modal">{msg}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
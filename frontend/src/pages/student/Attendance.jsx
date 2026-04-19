import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import jsQR from 'jsqr'; // Đảm bảo đã chạy: npm install jsqr
import axios from 'axios';
import './Attendance.css';

const Attendance = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId'); // Lấy ID từ ?sessionId=...

  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas')); 
  const isProcessing = useRef(false);
  
  const [step, setStep] = useState('idle'); 
  const [isCamOpen, setIsCamOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState('Đang khởi tạo hệ thống...');
  const [errorLine, setErrorLine] = useState('');
  const [student, setStudent] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  // 1. Khởi tạo AI và lấy thông tin User
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
        setErrorLine('');
        setMsg('Sẵn sàng. Hãy mở Camera sau để quét mã QR giảng viên!');
      } catch (e) {
        setErrorLine(`Lỗi khởi tạo: ${e?.message || 'Không xác định'}`);
        setMsg('Lỗi: Không thể tải mô hình AI!');
      }
    };
    init();
  }, []);

  /**
   * 2. Xác thực Buổi học (Fix lỗi N/A)
   */
  const handleVerifyQR = useCallback(async (mabuoihoc) => {
    if (!mabuoihoc || !student?.masinhvien || isProcessing.current) return;
    isProcessing.current = true;
    setStep('verifying');
    setMsg('Đã nhận mã! Đang kiểm tra danh sách lớp...');
    setErrorLine('');

    try {
      const resAt = await axios.get(`${process.env.REACT_APP_API_URL}/diemDanh/sinhvien/${student.masinhvien}`);
      const attendanceData = resAt.data?.data || resAt.data || [];
      const record = attendanceData.find(i => String(i.mabuoihoc) === String(mabuoihoc));
      setMsg(attendanceData + " - " + record);

      if (record) {
        const resLesson = await axios.get(`${process.env.REACT_APP_API_URL}/lesson/${mabuoihoc}`);
        const resClass = await axios.get(`${process.env.REACT_APP_API_URL}/class/${resLesson.data.malop}`);

        setSessionInfo({
          tenlop: resClass.data.tenlop,
          monhoc: resClass.data.monhoc,
          madiemdanh: record.madiemdanh
        });

        setIsCamOpen(false); // Reset cam để chuyển bước
        setShowModal(true);
        setStep('face_id'); 
      } else {
        setStep('idle');
        setMsg('Bạn không có tên trong buổi học này!');
      }
    } catch (err) {
      setStep('idle');
      setErrorLine(`Dữ liệu lỗi QR: ${err?.response?.data?.message || err?.message || String(err)}`);
      setMsg('Lỗi: Buổi học không hợp lệ!' + err.message);
    } finally {
      isProcessing.current = false;
    }
  }, [student]);

  /**
   * 3. Giải mã QR từ Camera
   */
  const scanQRCode = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        // Trích xuất ID từ link quét được
        const params = new URLSearchParams(code.data.split('?')[1]);
        const sid = params.get('sessionId') || code.data;
        handleVerifyQR(sid);
      }
    }
  }, [handleVerifyQR]);

  /**
   * 4. Nhận diện khuôn mặt
   */
  const handleFaceID = useCallback(async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setMsg('Đang nhận diện mặt (5 lần)...');

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
      setMsg('Thất bại! Thử lại sau 3s...');
      setTimeout(() => { isProcessing.current = false; }, 3000);
    }
  }, [student, sessionInfo]);

  /**
   * 5. Vòng đời Camera & Loop
   */
  useEffect(() => {
    let stream = null;
    const startCam = async () => {
      if (isCamOpen && videoRef.current) {
        try {
          const mode = step === 'face_id' ? "user" : "environment";
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: mode, width: { ideal: 1280 } } 
          });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) { setMsg('Lỗi: Hãy cấp quyền Camera và dùng HTTPS!'); }
      }
    };
    startCam();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [isCamOpen, step]);

  useEffect(() => {
    let timer;
    if (isCamOpen && videoRef.current) {
      timer = setInterval(() => {
        if (step === 'scanning_qr') scanQRCode();
        else if (step === 'face_id' && !isProcessing.current) {
          faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).then(det => {
            if (det) { clearInterval(timer); handleFaceID(); }
          });
        }
      }, step === 'scanning_qr' ? 300 : 500);
    }
    return () => clearInterval(timer);
  }, [isCamOpen, step, scanQRCode, handleFaceID]);

  // Tự động chạy nếu link đã có sessionId sẵn
  useEffect(() => {
    if (sessionId && student?.masinhvien && step === 'idle') {
      handleVerifyQR(sessionId);
    }
  }, [sessionId, student, step, handleVerifyQR]);

  return (
    <div className="attendance-responsive-wrapper">
      <div className="card-main">
        <div className="header-brand">
          <h2>STU SYSTEM</h2>
          <p>Hệ thống điểm danh sinh viên</p>
        </div>
        <div className="viewport-cam">
          {isCamOpen && !showModal ? (
            <div className="scanner-container">
              <video ref={videoRef} autoPlay muted playsInline className="video-stream" />
              <div className="qr-overlay-frame"></div>
            </div>
          ) : (
            <div className="placeholder-cam">
              <span className="icon">{step === 'verifying' ? '⏳' : '📷'}</span>
            </div>
          )}
        </div>
        <div className={`status-text ${step}`}>{msg}</div>
        {errorLine && <div className="status-text error">{errorLine}</div>}
        <div className="footer-action">
          {step === 'idle' && !sessionId && (
            <button className="btn-start" onClick={() => { setIsCamOpen(true); setStep('scanning_qr'); }}>MỞ CAMERA QUÉT QR</button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay-custom">
          <div className="modal-container-custom">
            <div className="modal-top">
              <h3>XÁC THỰC SINH VIÊN</h3>
              <button className="btn-close" onClick={() => { setShowModal(false); setIsCamOpen(false); setStep('idle'); }}>&times;</button>
            </div>
            <div className="modal-inner">
              <div className="info-box-session">
                <p>MSSV: <strong>{student?.masinhvien}</strong></p>
                <p>Môn: <strong>{sessionInfo?.monhoc || 'Đang tải...'}</strong></p>
                <p>Lớp: <strong>{sessionInfo?.tenlop || 'Đang tải...'}</strong></p>
              </div>
              <div className="face-viewport">
                {step === 'face_id' && <video ref={videoRef} autoPlay muted playsInline className="video-stream mirror" />}
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
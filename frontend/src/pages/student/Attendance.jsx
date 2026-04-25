import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import jsQR from 'jsqr'; // Đảm bảo đã chạy: npm install jsqr
import axios from 'axios';
import './Attendance.css';

const getDeviceLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Trình duyệt không hỗ trợ geolocation.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

const Attendance = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId'); // Lấy ID từ ?sessionId=...

  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas')); 
  const isProcessing = useRef(false);
  
  const [step, setStep] = useState('idle'); 
  const [isCamOpen, setIsCamOpen] = useState(false);
  const [msg, setMsg] = useState('Đang khởi tạo hệ thống...');
  const [student, setStudent] = useState(null);

  // 1. Khởi tạo thông tin User
  useEffect(() => {
    const init = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser?.id) setStudent({ masinhvien: savedUser.id });
        setMsg('Sẵn sàng. Hãy mở Camera sau để quét mã QR giảng viên!');
      } catch (e) {
        setMsg('Lỗi: Không thể khởi tạo dữ liệu!');
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

    try {
      const resAt = await axios.get(`${process.env.REACT_APP_API_URL}/diemDanh/sinhvien/${student.masinhvien}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const attendanceData = resAt.data?.data || resAt.data || [];
      const record = attendanceData.find(i => String(i.mabuoihoc) === String(mabuoihoc));

      if (record) {
        let deviceLocation = null;
        try {
          deviceLocation = await getDeviceLocation();
        } catch (locationError) {
          console.warn('Không lấy được vị trí thiết bị:', locationError);
        }

        const resLesson = await axios.get(`${process.env.REACT_APP_API_URL}/lessons/${mabuoihoc}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const resClass = await axios.get(`${process.env.REACT_APP_API_URL}/classes/${resLesson.data.malop}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Khi đã có record, chuyển sang trang xác thực khuôn mặt với camera trước.
        navigate(`/student/attendance/lesson/${mabuoihoc}`, {
          state: {
            mabuoihoc,
            masinhvien: student.masinhvien,
            madiemdanh: record.madiemdanh,
            tenlop: resClass.data.tenlop,
            monhoc: resClass.data.monhoc,
            deviceLocation
          }
        });
      } else {
        setStep('idle');
        setMsg('Bạn không có tên trong buổi học này!');
      }
    } catch (err) {
      setStep('idle');
      setMsg(err);
    } finally {
      isProcessing.current = false;
    }
  }, [student, navigate]);

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
   * 4. Vòng đời Camera & Loop
   */
  useEffect(() => {
    let stream = null;
    const startCam = async () => {
      if (isCamOpen && videoRef.current) {
        try {
          const mode = 'environment';
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
      }, step === 'scanning_qr' ? 300 : 500);
    }
    return () => clearInterval(timer);
  }, [isCamOpen, step, scanQRCode]);

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
          {isCamOpen ? (
            <div className="scanner-container">
              <video ref={videoRef} autoPlay muted playsInline className="video-qr" />
              <div className="qr-overlay-frame"></div>
            </div>
          ) : (
            <div className="placeholder-cam">
              <span className="icon">{step === 'verifying' ? '⏳' : '📷'}</span>
            </div>
          )}
        </div>
        <div className={`status-text ${step}`}>{msg}</div>
        <div className="footer-action">
          {step === 'idle' && !sessionId && (
            <button className="btn-start" onClick={() => { setIsCamOpen(true); setStep('scanning_qr'); }}>MỞ CAMERA QUÉT QR</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
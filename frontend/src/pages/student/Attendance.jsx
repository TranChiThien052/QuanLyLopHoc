import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import './Attendance.css';

const Attendance = () => {
  const { mabuoihoc } = useParams(); // Tự động lấy mã buổi từ link QR
  const videoRef = useRef();
  const isProcessing = useRef(false);
  
  const [status, setStatus] = useState('loading');
  const [msg, setMsg] = useState('Đang khởi tạo AI...');
  const [student, setStudent] = useState(null);

  // Fix lỗi dependency startCamera để lên host không bị chặn
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onplay = () => {
          const timer = setInterval(async () => {
            if (isProcessing.current || status === 'success') {
              clearInterval(timer);
              return;
            }
            const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions());
            if (detection) handleBurstScan();
          }, 300);
        };
      }
    } catch (err) {
      setMsg('Lỗi: Vui lòng cấp quyền Camera!');
      setStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);

        const savedUser = JSON.parse(localStorage.getItem('user'));
        // Dùng 'id' để khớp với mã sinh viên từ Backend
        if (savedUser && savedUser.id) {
          setStudent({ masinhvien: savedUser.id });
          setStatus('ready');
          setMsg('Vui lòng đưa mặt vào khung hình');
          startCamera();
        } else {
          setMsg('Vui lòng đăng nhập trước!');
          setStatus('error');
        }
      } catch (err) {
        setMsg('Lỗi tải hệ thống AI');
        setStatus('error');
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCamera]);

  const handleBurstScan = async () => {
    isProcessing.current = true;
    setStatus('scanning');
    try {
      for (let i = 1; i <= 5; i++) {
        setMsg(`Đang nhận diện: ${i}/5...`);
        const start = Date.now();
        await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
        const delay = 180 - (Date.now() - start); // Giữ nhịp quét 0.18s
        if (delay > 0) await new Promise(r => setTimeout(r, delay));
      }

      // API định dạng: masinhvien_mabuoihoc
      const maDiemDanh = `${student.masinhvien}_${mabuoihoc}`;
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/diemDanh/${maDiemDanh}`, {
        trangThai: 'Có mặt',
        ghiChu: 'Quét QR + FaceID tự động',
        maNguoiCapNhat: student.masinhvien
      });

      if (res.status === 200) {
        setStatus('success');
        setMsg('ĐIỂM DANH THÀNH CÔNG! ✅');
      }
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.error || 'Lỗi hệ thống!');
      setTimeout(() => { isProcessing.current = false; setStatus('ready'); }, 3000);
    }
  };

  return (
    <div className="attendance-page-container">
      <div className="attendance-card-modern">
        <div className="card-top-header">
          <div className="brand-name">STU SYSTEM</div>
          <div className="brand-sub">Hệ thống điểm danh khuôn mặt</div>
        </div>

        <div className="main-camera-frame">
          <video ref={videoRef} autoPlay muted playsInline />
          {status === 'scanning' && <div className="scanning-laser-v2"></div>}
          {status === 'success' && <div className="full-result success">THÀNH CÔNG</div>}
          {status === 'error' && <div className="full-result error">THẤT BẠI</div>}
        </div>

        <div className={`status-message-bar ${status}`}>{msg}</div>

        <div className="card-bottom-info">
          <div className="info-row">
            <span>MSSV: <b>{student?.masinhvien || '...'}</b></span>
            <span>Buổi: <b>{mabuoihoc || 'N/A'}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
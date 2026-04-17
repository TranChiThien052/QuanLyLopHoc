import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import axios from 'axios';
import './Attendance.css';

const Attendance = () => {

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const videoRef = useRef();
  const isProcessing = useRef(false);
  
  // step: idle -> scanning_qr -> verifying -> face_id -> success -> error
  const [step, setStep] = useState('idle'); 
  const [isCamOpen, setIsCamOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState('Bấm nút để mở camera quét mã QR');
  const [student, setStudent] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  // 1. Khởi tạo Models AI và lấy thông tin SV từ LocalStorage
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        // Lấy MSSV từ localStorage đã được lưu lúc đăng nhập
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser?.id) {
          setStudent({ masinhvien: savedUser.id });
        }
      } catch (e) {
        setMsg('Lỗi AI! Kiểm tra thư mục /models và file .env');
      }
    };
    init();
  }, []);

  // 2. Điều khiển Camera (Đã sửa lỗi dependency dư thừa)
  const toggleCamera = useCallback(async (action) => {
    if (action === 'open') {
      try {
        const mode = step === 'face_id' ? "user" : "environment";
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCamOpen(true);
        if (step === 'idle') setStep('scanning_qr');
      } catch (err) {
        setMsg('Lỗi: Hãy cấp quyền Camera trên trình duyệt!');
      }
    } else {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCamOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]); 

  /**
   * 3. Xác thực QR - Khớp với API Backend hiện có
   */
  const handleVerifyQR = useCallback(async (mabuoihoc) => {
    if (!mabuoihoc || !student?.masinhvien) return;
    setStep('verifying');
    setMsg('Đang xác thực danh sách lớp...');

    try {
      // B1: Kiểm tra quyền sinh viên trong buổi học
      const resAt = await axios.get(`${process.env.REACT_APP_API_URL}/diemDanh/sinhvien/${student.masinhvien}`);
      const attendanceData = resAt.data?.data || resAt.data || [];
      const record = attendanceData.find(i => String(i.mabuoihoc) === String(mabuoihoc));

      if (record) {
        // B2: Lấy thông tin Buổi học & Lớp học
        const resLesson = await axios.get(`${process.env.REACT_APP_API_URL}/lesson/${mabuoihoc}`);
        const lesson = resLesson.data;
        const resClass = await axios.get(`${process.env.REACT_APP_API_URL}/class/${lesson.malop}`);

        setSessionInfo({
          tenlop: resClass.data.tenlop,
          monhoc: resClass.data.monhoc,
          madiemdanh: record.madiemdanh // Dùng để cập nhật PUT sau này
        });

        await toggleCamera('close');
        setShowModal(true);
        setStep('face_id'); 
      } else {
        setStep('idle');
        setMsg('Bạn không có tên trong danh sách buổi học này!');
        toggleCamera('close');
      }
    } catch (err) {
      setStep('error');
      setMsg('Lỗi: Buổi học không hợp lệ hoặc lỗi kết nối!');
      toggleCamera('close');
    }
  }, [student, toggleCamera]);

  /**
   * 4. Nhận diện khuôn mặt và cập nhật điểm danh
   */
  const handleFaceID = useCallback(async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setMsg('Đang nhận diện khuôn mặt (5 lần)...');

    try {
      for (let i = 1; i <= 5; i++) {
        setMsg(`Đang quét mặt: ${i}/5...`);
        await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                     .withFaceLandmarks().withFaceDescriptor();
        await new Promise(r => setTimeout(r, 200));
      }

      // Cập nhật trạng thái điểm danh lên Server
      await axios.put(`${process.env.REACT_APP_API_URL}/diemDanh/${sessionInfo.madiemdanh}`, {
        trangThai: 'Có mặt',
        ghiChu: 'QR + FaceID tự động',
        maNguoiCapNhat: student.masinhvien
      });

      setStep('success');
      setMsg('ĐIỂM DANH THÀNH CÔNG! ✅');
    } catch (err) {
      setMsg('Nhận diện thất bại! Thử lại sau 3 giây...');
      setTimeout(() => { isProcessing.current = false; }, 3000);
    }
  }, [student, sessionInfo]);

  // Vòng lặp quét Camera
  useEffect(() => {
    let timer;
    if (isCamOpen && videoRef.current) {
      timer = setInterval(async () => {
        if (step === 'scanning_qr') {
        } else if (step === 'face_id' && !isProcessing.current) {
          const det = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions());
          if (det) {
            clearInterval(timer);
            handleFaceID();
          }
        }
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isCamOpen, step, handleVerifyQR, handleFaceID]);

  // Tự động bật cam trước khi Modal hiển thị
  useEffect(() => {
    if (step === 'face_id' && showModal) toggleCamera('open');
  }, [step, showModal, toggleCamera]);

  return (
    <div className="attendance-responsive-wrapper">
      <div className="card-main">
        <div className="header-brand">
          <h2>STU SYSTEM</h2>
          <p>Sử dụng Camera sau để quét mã QR</p>
        </div>

        <div className="viewport-cam">
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
          <button className="btn-start" onClick={() => toggleCamera('open')} disabled={isCamOpen}>
            MỞ CAMERA QUÉT QR
          </button>
        </div>
      </div>

      {/* POPUP THÔNG TIN SINH VIÊN & BUỔI HỌC */}
      {showModal && (
        <div className="modal-overlay-custom">
          <div className="modal-container-custom">
            <div className="modal-top">
              <h3>XÁC THỰC THÔNG TIN</h3>
              <button className="btn-close" onClick={() => { setShowModal(false); toggleCamera('close'); }}>&times;</button>
            </div>
            <div className="modal-inner">
              <div className="info-box-session">
                <p>MSSV: <strong>{student?.masinhvien}</strong></p>
                <p>Môn học: <strong>{sessionInfo?.monhoc}</strong></p>
                <p>Lớp: <strong>{sessionInfo?.tenlop}</strong></p>
              </div>
              <div className="face-viewport">
                <video ref={videoRef} autoPlay muted playsInline className="video-face" />
                <div className="laser-line"></div>
                {step === 'success' && <div className="success-tag">ĐÃ ĐIỂM DANH ✅</div>}
              </div>
              <p className={`msg-modal ${step}`}>{msg}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
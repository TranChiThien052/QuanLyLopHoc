import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import axios from 'axios';
import './Attendance.css';

const Attendance = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  // KHAI BÁO CÁC REF (Đây là chỗ Tuệ còn thiếu nè)
  const videoRef = useRef(null);
  const streamRef = useRef(null); // Kho chứa luồng Camera để không bị mất khi render
  const isProcessing = useRef(false);
  
  const [step, setStep] = useState('idle'); 
  const [isCamOpen, setIsCamOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState('Đang khởi tạo hệ thống AI...');
  const [student, setStudent] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  /**
   * PHẦN 1: HÀM ĐIỀU KHIỂN CAMERA
   */
  const toggleCamera = useCallback(async (action) => {
    if (action === 'open') {
      try {
        const mode = step === 'face_id' ? "user" : "environment";
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
        });

        streamRef.current = stream; // Cất luồng vào kho
        setIsCamOpen(true);         // Lệnh cho thẻ <video> hiện lên
        
        if (step === 'idle') setStep('scanning_qr');
        setMsg(step === 'face_id' ? 'Vui lòng đưa mặt vào khung hình' : 'Hãy quét mã QR giảng viên');
      } catch (err) {
        setMsg('Lỗi: Hãy cấp quyền Camera hoặc chạy trên HTTPS!');
      }
    } else {
      // Tắt cam: Dừng tất cả các luồng trong kho
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCamOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]); 

  // Hiệu ứng "đổ" dữ liệu từ kho vào thẻ Video khi thẻ đã hiện ra
  useEffect(() => {
    if (isCamOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCamOpen]);

  /**
   * PHẦN 2: XÁC THỰC VÀ NHẬN DIỆN
   */
  const handleVerifyQR = useCallback(async (mabuoihoc) => {
    if (!mabuoihoc || !student?.masinhvien) return;
    setStep('verifying');
    setMsg('Đang xác thực thông tin buổi học...');

    try {
      const resAt = await axios.get(`${process.env.REACT_APP_API_URL}/diemDanh/sinhvien/${student.masinhvien}`);
      const attendanceData = resAt.data?.data || resAt.data || [];
      const record = attendanceData.find(i => String(i.mabuoihoc) === String(mabuoihoc));

      if (record) {
        const resLesson = await axios.get(`${process.env.REACT_APP_API_URL}/lesson/${mabuoihoc}`);
        const resClass = await axios.get(`${process.env.REACT_APP_API_URL}/class/${resLesson.data.malop}`);

        setSessionInfo({
          tenlop: resClass.data.tenlop,
          monhoc: resClass.data.monhoc,
          madiemdanh: record.madiemdanh
        });

        await toggleCamera('close');
        setStep('ready_to_face'); 
        setMsg('Xác thực thành công! Hãy chuẩn bị quét khuôn mặt.');
      } else {
        setStep('idle');
        setMsg('Bạn không có tên trong danh sách buổi học này!');
      }
    } catch (err) {
      setStep('idle');
      setMsg('Lỗi: Không tìm thấy buổi học hoặc mất kết nối!');
    }
  }, [student, toggleCamera]);

  const handleFaceID = useCallback(async () => {
    if (isProcessing.current || !sessionInfo?.madiemdanh) return;
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
      setMsg('Thất bại! Đang thử lại...');
      setTimeout(() => { isProcessing.current = false; }, 3000);
    }
  }, [student, sessionInfo]);

  /**
   * PHẦN 3: CÁC HIỆU ỨNG (EFFECTS)
   */
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
        setMsg(sessionId ? 'Đã nhận mã. Hãy xác nhận thông tin!' : 'Vui lòng quét mã QR giảng viên');
      } catch (e) { setMsg('Lỗi tải AI Models! Kiểm tra thư mục /public/models'); }
    };
    init();
  }, [sessionId]);

  useEffect(() => {
    if (sessionId && student?.masinhvien && step === 'idle') {
      handleVerifyQR(sessionId);
    }
  }, [sessionId, student, step, handleVerifyQR]);

  useEffect(() => {
    let timer;
    if (isCamOpen && step === 'face_id' && !isProcessing.current && videoRef.current) {
      timer = setInterval(async () => {
        const det = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions());
        if (det) { clearInterval(timer); handleFaceID(); }
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
        <div className={`status-text ${step}`}>{msg}</div>
        <div className="footer-action">
          {step === 'ready_to_face' && (
            <button className="btn-start" onClick={() => { setStep('face_id'); setShowModal(true); toggleCamera('open'); }}>BẮT ĐẦU QUÉT MẶT</button>
          )}
          {!sessionId && step === 'idle' && (
            <button className="btn-start" onClick={() => toggleCamera('open')}>MỞ CAMERA QUÉT QR</button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay-custom">
          <div className="modal-container-custom">
            <div className="modal-top">
              <h3>XÁC THỰC KHUÔN MẶT</h3>
              <button className="btn-close" onClick={() => { setShowModal(false); toggleCamera('close'); setStep('idle'); }}>&times;</button>
            </div>
            <div className="modal-inner">
              <div className="info-box-session">
                <p>MSSV: <strong>{student?.masinhvien}</strong></p>
                <p>Môn: <strong>{sessionInfo?.monhoc}</strong></p>
                <p>Lớp: <strong>{sessionInfo?.tenlop}</strong></p>
              </div>
              <div className="face-viewport">
                <video ref={videoRef} autoPlay muted playsInline className="video-face" />
                <div className="laser-line"></div>
                {step === 'success' && <div className="success-tag">THÀNH CÔNG ✅</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
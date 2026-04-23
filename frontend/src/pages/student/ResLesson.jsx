import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import axios from 'axios';
import './Attendance.css';

const ResLesson = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const isProcessing = useRef(false);
  // const {mabuoihoc} = useParams();

  const [step, setStep] = useState('loading');
  const [msg, setMsg] = useState('Đang tải mô hình nhận diện...');

  const masinhvien = state?.masinhvien;
  const madiemdanh = state?.madiemdanh;
  const monhoc = state?.monhoc;
  const tenlop = state?.tenlop;
  console.log('State received in ResLesson:', state);

  useEffect(() => {
    const init = async () => {
      if (!masinhvien || !madiemdanh) {
        setStep('error');
        setMsg('Thiếu dữ liệu buổi học. Vui lòng quét QR lại.');
        return;
      }

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setStep('face_id');
        setMsg('Sẵn sàng. Hướng camera trước vào khuôn mặt của bạn.');
      } catch (error) {
        setStep('error');
        setMsg('Không thể tải mô hình AI. Vui lòng thử lại.');
      }
    };

    init();
  }, [masinhvien, madiemdanh]);

  const handleFaceID = useCallback(async () => {
    if (isProcessing.current || !madiemdanh || !masinhvien) return;

    isProcessing.current = true;
    setMsg('Đang nhận diện mặt (5 lần)...');

    try {
      for (let i = 1; i <= 5; i += 1) {
        setMsg(`Quét mặt: ${i}/5...`);
        await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();
        await new Promise((resolve) => setTimeout(resolve, 220));
      }

      await axios.put(`${process.env.REACT_APP_API_URL}/diemDanh/${madiemdanh}`, {
        trangThai: 'Có mặt',
        maNguoiCapNhat: masinhvien
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setStep('success');
      setMsg('ĐIỂM DANH THÀNH CÔNG! ✅');
    } catch (error) {
      setStep('error');
      setMsg('Xác thực thất bại. Vui lòng thử lại.');
      isProcessing.current = false;
    }
  }, [madiemdanh, masinhvien]);

  // Luôn mở camera trước để ưu tiên thiết bị điện thoại.
  useEffect(() => {
    let stream;

    const openFrontCamera = async () => {
      if (step !== 'face_id' || !videoRef.current) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'user' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        setStep('error');
        setMsg('Không mở được camera trước. Hãy cấp quyền camera và thử lại.');
      }
    };

    openFrontCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [step]);

  useEffect(() => {
    let timer;

    if (step === 'face_id') {
      timer = setInterval(() => {
        if (videoRef.current && !isProcessing.current) {
          faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .then((det) => {
              if (det) {
                clearInterval(timer);
                handleFaceID();
              }
            });
        }
      }, 500);
    }

    return () => clearInterval(timer);
  }, [step, handleFaceID]);

  return (
    <div className="attendance-responsive-wrapper">
      <div className="card-main">
        <div className="header-brand">
          <h2>STU SYSTEM</h2>
          <p>Xác thực sinh viên - Camera trước</p>
        </div>

        <div className="info-box-session">
          <p>MSSV: <strong>{masinhvien || 'N/A'}</strong></p>
          <p>Môn: <strong>{monhoc || 'Đang tải...'}</strong></p>
          <p>Lớp: <strong>{tenlop || 'Đang tải...'}</strong></p>
        </div>

        <div className="viewport-cam">
          {step === 'face_id' || step === 'success' ? (
            <video ref={videoRef} autoPlay muted playsInline className="video-face" />
          ) : (
            <div className="placeholder-cam">
              <span className="icon">📷</span>
            </div>
          )}
        </div>

        <div className={`status-text ${step}`}>{msg}</div>

        <div className="footer-action">
          {step === 'success' && (
            <button className="btn-start" onClick={() => navigate('/student/attendance-history')}>
              XEM LỊCH SỬ ĐIỂM DANH
            </button>
          )}
          {step === 'error' && (
            <button className="btn-start" onClick={() => navigate('/student/attendance')}>
              QUAY LẠI QUÉT QR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResLesson;

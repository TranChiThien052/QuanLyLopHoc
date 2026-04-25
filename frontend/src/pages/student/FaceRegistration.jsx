import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import axios from 'axios';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './FaceRegistration.css';

const captureFrameFromVideo = (videoElement) => {
  return new Promise((resolve) => {
    if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
      resolve(null);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      resolve(null);
      return;
    }

    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
  });
};

const FaceRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [msg, setMsg] = useState('Đang khởi tạo...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  
  // TRẠNG THÁI MỚI: Kiểm tra camera có chạy hay không
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    let stream = null;

    const init = async () => {
      try {
        setMsg('Đang tải mô hình AI...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setIsModelsLoaded(true);

        setMsg('Đang mở Camera...');
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } 
          });
          setIsCameraActive(true); // Đánh dấu Camera đã sẵn sàng
          setMsg('Sẵn sàng quét khuôn mặt');
        } catch (e) {
          // Nếu rơi vào đây nghĩa là máy không có cam hoặc bị chặn
          setIsCameraActive(false); 
          setMsg('❌ Lỗi: Không tìm thấy Camera!');
        }
        
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setMsg('Lỗi hệ thống!');
      }
    };

    init();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleRegisterFace = async () => {
    // Chặn tuyệt đối nếu không có Cam hoặc đang xử lý
    if (isProcessing || !isModelsLoaded || !isCameraActive) return;
    
    setIsProcessing(true);
    setMsg('Đang phân tích...');

    try {
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        setMsg('❌ Không tìm thấy mặt!');
        setIsProcessing(false);
        return;
      }

      const faceDescriptorArray = Array.from(detection.descriptor);
      const studentId = user?.masinhvien || user?.id;
      const faceImageBlob = await captureFrameFromVideo(videoRef.current);

      if (!faceImageBlob) {
        throw new Error('Khong chup duoc anh tu camera');
      }

      const formData = new FormData();
      formData.append('faceid', JSON.stringify(faceDescriptorArray));
      formData.append('faceImage', faceImageBlob, `${studentId || 'student'}.jpg`);

      await axios.put(`${process.env.REACT_APP_API_URL}/students/update-faceid`, 
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setMsg('✅ THÀNH CÔNG!');
      setTimeout(() => navigate('/student/profile'), 2000);
    } catch (error) {
      console.log(error);
      setMsg('❌ Lỗi lưu dữ liệu!');
      setIsProcessing(false);
    }
  };

  return (
    <div className="face-reg-container">
      <div className="reg-card">
        <h3>THIẾT LẬP KHUÔN MẶT</h3>
        
        <div className="video-box">
          <video ref={videoRef} autoPlay muted playsInline />
          {isCameraActive && <div className="scan-line"></div>}
        </div>

        <p className={`status-msg ${!isCameraActive ? 'error-text' : ''}`}>
          {msg}
        </p>

        <div className="action-btns">
          {/* Nút này sẽ bị Disable nếu isCameraActive là false */}
          <button 
            className="btn-confirm-scan" 
            onClick={handleRegisterFace} 
            disabled={isProcessing || !isModelsLoaded || !isCameraActive}
          >
            {isProcessing ? "ĐANG QUÉT..." : "XÁC NHẬN QUÉT"}
          </button>

          <button className="btn-cancel-scan" onClick={() => navigate(-1)}>
            HỦY BỎ
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import axios from 'axios';
import './Attendance.css';

// Hàm tính khoảng cách giữa 2 tọa độ lat/lon ra mét (Công thức Haversine)
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Bán kính trái đất (mét)
  const toRad = angle => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// Hàm lấy vị trí hiện tại dưới dạng Promise để dùng chung với async/await
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Trình duyệt hoặc thiết bị không hỗ trợ định vị GPS.'));
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

const ResLesson = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { mabuoihoc } = useParams();
  const videoRef = useRef(null);
  const isProcessing = useRef(false);

  const [step, setStep] = useState('loading');
  const [msg, setMsg] = useState('Đang tải mô hình nhận diện...');

  // Data from state (passed from QR scan) or from URL params
  const [masinhvien, setMaSinhVien] = useState(state?.masinhvien || null);
  const [madiemdanh, setMaDiemDanh] = useState(state?.madiemdanh || null);
  const [monhoc, setMonHoc] = useState(state?.monhoc || null);
  const [tenlop, setTenLop] = useState(state?.tenlop || null);
  console.log('State received in ResLesson:', state);
  console.log('URL params - mabuoihoc:', mabuoihoc);

  // Fetch student attendance data if navigating via URL
  useEffect(() => {
    const fetchStudentAttendanceData = async () => {
      if (!mabuoihoc || masinhvien) {
        return; // Already have data from state or no URL param
      }

      try {
        setMsg('Đang tải thông tin buổi học...');
        
        // Get current user info from localStorage or token
        const currentUserId = localStorage.getItem('user');


        // Fetch all attendance records for this lesson
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/diemDanh/buoihoc/${mabuoihoc}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        const attendanceRecords = response.data;
        
        // Find the record for current student
        const currentStudentRecord = attendanceRecords.find(
          record => record.masinhvien === currentUserId
        );

        if (!currentStudentRecord) {
          setStep('error');
          setMsg('Không tìm thấy thông tin sinh viên cho buổi học này.');
          return;
        }

        // Set attendance info
        setMaDiemDanh(currentStudentRecord.madiemdanh);
        setMaSinhVien(currentStudentRecord.masinhvien);

        // Fetch full student details
        const studentResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/student/${currentStudentRecord.masinhvien}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        if (studentResponse.data) {
          const student = studentResponse.data;
          setMonHoc(student.monhoc || 'Đang tải...'); // Adjust field name as needed
          setTenLop(student.tenlop || 'Đang tải...'); // Adjust field name as needed
        }

        setMsg('Thông tin buổi học đã tải xong!');
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setStep('error');
        setMsg('Lỗi khi tải thông tin. Vui lòng thử lại.');
      }
    };

    fetchStudentAttendanceData();
  }, [mabuoihoc, masinhvien]);

  useEffect(() => {
    const init = async () => {
      if (!masinhvien || !madiemdanh) {
        // Wait a bit to allow data fetch to complete
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
      let descriptors = [];
      let trangThaiDiemDanh = 'Có mặt';
      let ghiChu = '';
      let gpsString = '';

      const studentInfo = await axios.get(
        `${process.env.REACT_APP_API_URL}/students/info/student`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      console.log('Fetched student info from API:', studentInfo.data);
      for (let i = 1; i <= 5; i += 1) {
        setMsg(`Quét mặt: ${i}/5...`);
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor(); // cần thêm bước này để có descriptor

        if (detection) {
          descriptors.push(Array.from(detection.descriptor));
        }
        await new Promise((resolve) => setTimeout(resolve, 220));
      }

      if (descriptors.length === 0) {
        throw new Error('Không thu được descriptor khuôn mặt');
      }

      const descriptorLength = descriptors[0].length;
      const averageDescriptor = Array.from({ length: descriptorLength }, (_, idx) => {
        const sum = descriptors.reduce((acc, descriptor) => acc + descriptor[idx], 0);
        return sum / descriptors.length;
      });
      console.log("Student's average descriptor:", studentInfo.data.faceid);
      console.log('Average descriptor:', averageDescriptor);

      const distance = faceapi.euclideanDistance(averageDescriptor, studentInfo.data.faceid);

      console.log('Distance to stored faceID:', distance);

      if (distance > 0.4) {
        const studentLocation = await getCurrentLocation();
        gpsString = `${studentLocation.lat},${studentLocation.lon}`;
        trangThaiDiemDanh = 'Xem xét';
        ghiChu = 'Khuôn mặt không khớp';
      }
      else{
      // ---- BẮT ĐẦU XỬ LÝ GPS ----
      setMsg('Đang lấy vị trí hiện tại (GPS)...');
      
      
      // Thay bằng tọa độ thực tế nơi diễn ra buổi học 
      // (VD: Đây là toạ độ tham khảo lấy theo Google Maps)
      const TARGET_LAT = 10.738028962835843; //Vĩ độ trường
      const TARGET_LON = 106.67793576132826; //Kinh độ trường

      // const TARGET_LAT = 10.747572888673872; //Vĩ độ STU
      // const TARGET_LON = 106.68251246342655; //Kinh độ STU 10.747572888673872, 106.68251246342655
      
      try {
        const studentLocation = await getCurrentLocation();
        
        // Tính khoảng cách
        const distanceToClass = getDistanceInMeters(
          studentLocation.lat, studentLocation.lon, 
          TARGET_LAT, TARGET_LON
        );
        
        console.log(`Khoảng cách đo được: ${distanceToClass.toFixed(2)} mét`);
        
        // Nếu cách xa hơn 50m => đưa vào trạng thái cần xem xét
        if (distanceToClass > 50) {
          trangThaiDiemDanh = 'Xem xét';
          ghiChu = 'Sinh viên nằm ngoài vùng điểm danh';
        }
        
        // Format chuỗi GPS truyền lên Backend (Lat,Lon) nếu BE cần thiết lưu lịch sử vị trí
        gpsString = studentLocation.lat + ',' + studentLocation.lon;
        console.log('Vị trí GPS của sinh viên:', gpsString);
        
      } catch (geoError) {
        console.error('Lỗi khi lấy GPS:', geoError);
        // Tùy theo logic dự án: nếu sinh viên không mở quyền truy cập GPS thì tự động đánh dấu "Xem xét"
        trangThaiDiemDanh = 'Xem xét'; 
      }
    }
      // ---- GỌI API CẬP NHẬT TRẠNG THÁI ----
      setMsg('Đang gửi dữ liệu lên máy chủ...');
      
      await axios.put(`${process.env.REACT_APP_API_URL}/diemDanh/${madiemdanh}`, {
        trangThai: trangThaiDiemDanh,
        maNguoiCapNhat: masinhvien,
        ghiChu: ghiChu,
        GPS: gpsString // Truyền thêm GPS string lên DB
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // await axios.put(`${process.env.REACT_APP_API_URL}/diemDanh/${madiemdanh}`, {
      //   trangThai: 'Có mặt',
      //   maNguoiCapNhat: masinhvien
      // }, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });

      setStep('success');
      setMsg(`ĐIỂM DANH THÀNH CÔNG! ✅ (Trạng thái: ${trangThaiDiemDanh})`);
    } catch (error) {
      console.log(error);
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

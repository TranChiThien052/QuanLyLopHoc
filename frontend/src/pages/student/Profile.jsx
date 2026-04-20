import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./StudentProfile.css";

export default function StudentProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ma: "",
    holot: "",
    ten: "",
    malop: "",
    ngaysinh: "",
    email: "",
    sodienthoai: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const studentId = user.masinhvien || user.username || user.id;
      try {
        const response = await api.get('/students/infoStudent', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const profiles = response.data || [];
        const myProfile = Array.isArray(profiles) ? profiles.find(p => p.masinhvien === studentId) : profiles;

        if (myProfile) {
          setFormData({
            ma: myProfile.masinhvien || "",
            holot: myProfile.holot || "",
            ten: myProfile.ten || "",
            malop: myProfile.malop || "",
            ngaysinh: myProfile.ngaysinh ? myProfile.ngaysinh.substring(0, 10) : "",
            email: myProfile.email || "",
            sodienthoai: myProfile.sodienthoai || ""
          });
        } else {
          setFormData(prev => ({ ...prev, ma: studentId }));
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin sinh viên:", error);
        setFormData(prev => ({ ...prev, ma: studentId }));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        holot: formData.holot,
        ten: formData.ten,
        ngaysinh: formData.ngaysinh || null,
        email: formData.email,
        sodienthoai: formData.sodienthoai,
        malop: formData.malop
      };

      await api.put(`/students/`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Cập nhật thông tin sinh viên thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật sinh viên:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại!");
    }
  };

  if (loading) return <div className="student-profile-loading">Đang tải dữ liệu...</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Thông tin cá nhân sinh viên</h2>

      <div className="profile-content central-layout">
        <div className="profile-form-box">

          <div className="form-row">
            <label>Mã sinh viên</label>
            <input type="text" name="ma" value={formData.ma} disabled className="readonly-input" />
          </div>

          <div className="form-row-multi">
            <div className="form-group flex-2">
              <label>Họ lót</label>
              <input
                type="text"
                name="holot"
                value={formData.holot}
                onChange={handleChange}
                placeholder="Nhập họ lót"
              />
            </div>

            <div className="form-group flex-1">
              <label>Tên</label>
              <input
                type="text"
                name="ten"
                value={formData.ten}
                onChange={handleChange}
                placeholder="Nhập tên"
              />
            </div>
          </div>

          <div className="form-row">
            <label>Tên lớp</label>
            <input
              type="text"
              name="malop"
              value={formData.malop}
              onChange={handleChange}
              placeholder="Nhập mã lớp"
            />
          </div>

          <div className="form-row">
            <label>Ngày sinh</label>
            <input
              type="date"
              name="ngaysinh"
              value={formData.ngaysinh}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
            />
          </div>

          <div className="form-row">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="sodienthoai"
              value={formData.sodienthoai}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="form-actions">
            <button className="btn-save-profile" onClick={handleUpdate}>
              Cập nhật thông tin
            </button>

            <button 
              className="btn-face-id-link" 
              onClick={() => navigate('/student/register-face')}
            >
              🔄 Cập nhật FaceID
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
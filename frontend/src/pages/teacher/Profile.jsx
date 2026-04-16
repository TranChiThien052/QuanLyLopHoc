import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

export default function TeacherProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    ma: "",
    holot: "",
    ten: "",
    ngaysinh: "",
    email: "",
    sodienthoai: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const teacherId = user.magiangvien || user.username || user.id;
      
      try {
        const response = await api.get('/teachers');
        const profiles = response.data || [];
        const myProfile = profiles.find(p => p.magiangvien === teacherId);
        
        if (myProfile) {
          setFormData({
            ma: teacherId,
            holot: myProfile.holot || "",
            ten: myProfile.ten || "",
            ngaysinh: myProfile.ngaysinh ? myProfile.ngaysinh.substring(0, 10) : "",
            email: myProfile.email || "",
            sodienthoai: myProfile.sodienthoai || ""
          });
        } else {
          setFormData(prev => ({ ...prev, ma: teacherId }));
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin giảng viên:", error);
        setFormData(prev => ({ ...prev, ma: teacherId }));
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
        sodienthoai: formData.sodienthoai
      };
      
      await api.put(`/teachers/${formData.ma}`, payload);
      alert("Cập nhật thông tin giảng viên thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật giảng viên:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại!");
    }
  };

  if (loading) return <div className="profile-loading">Đang tải dữ liệu...</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Thông tin cá nhân</h2>

      <div className="profile-content central-layout">
        <div className="profile-form-box">
          
          <div className="form-row">
            <label>Mã giáo viên</label>
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
          </div>

        </div>
      </div>
    </div>
  );
}
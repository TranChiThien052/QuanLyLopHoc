import "./Profile.css";

export default function TeacherProfile() {
  return (
    <div className="profile-container">
      
      <h2 className="profile-title">Thông tin cá nhân</h2>

      <div className="profile-content">

        {/* LEFT: AVATAR */}
        <div className="profile-left">
          <div className="avatar-box">
            <img src="https://placehold.co/285x273" alt="avatar" />
          </div>

          <button className="btn-edit-avatar">
            Chỉnh ảnh
          </button>
        </div>

        {/* RIGHT: INFO */}
        <div className="profile-right">
          
          <div className="form-row">
            <label>Mã giáo viên</label>
            <input type="text" value="GV021" readOnly />
          </div>

          <div className="form-row">
            <label>Họ tên</label>
            <input type="text" value="Nguyễn Văn A" />
          </div>

          <div className="form-row">
            <label>Ngày sinh</label>
            <input type="date" />
          </div>

          <div className="form-row">
            <label>Giới tính</label>
            <input type="text" />
          </div>

          <div className="form-row">
            <label>Địa chỉ</label>
            <input type="text" />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input type="email" />
          </div>

          <div className="form-row">
            <label>Số điện thoại</label>
            <input type="text" />
          </div>

        </div>
      </div>
    </div>
  );
}
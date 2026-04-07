import "./AttendanceDetail.css";

const data = [
  {
    id: "BH122026",
    classId: "D22_TH02",
    date: "12/02/2026",
    start: "7:00",
    end: "12:00",
    status: "present",
  },
  {
    id: "BH122526",
    classId: "D22_TH05",
    date: "11/02/2026",
    start: "12:35",
    end: "15:00",
    status: "present",
  },
  {
    id: "BH122776",
    classId: "D22_TH13",
    date: "10/02/2026",
    start: "7:00",
    end: "9:35",
    status: "absent",
  },
];

export default function AttendanceDetail() {
  return (
    <div className="detail-container">
      
      {/* HEADER */}
      <div className="detail-header">
        LỊCH SỬ ĐIỂM DANH
      </div>

      {/* SUBJECT */}
      <div className="detail-subject">
        Môn: Tiếng Anh 3
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Mã buổi</th>
              <th>Mã lớp</th>
              <th>Ngày học</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.id}</td>
                <td>{item.classId}</td>
                <td>{item.date}</td>
                <td>{item.start}</td>
                <td>{item.end}</td>
                <td>
                  <span className={`status ${item.status}`}>
                    {item.status === "present" ? "Đã điểm danh" : "Vắng"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
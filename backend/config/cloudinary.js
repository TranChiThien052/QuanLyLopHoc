const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const hasCloudinaryConfig = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
      && process.env.CLOUDINARY_API_KEY
      && process.env.CLOUDINARY_API_SECRET,
  );
};

const uploadAttendanceImage = (fileBuffer, maDiemDanh) => {
  return new Promise((resolve, reject) => {
    if (!hasCloudinaryConfig()) {
      reject(new Error("Cloudinary chua duoc cau hinh trong file .env"));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "diem-danh",
        resource_type: "image",
        public_id: `${maDiemDanh}_${Date.now()}`,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      },
    );

    uploadStream.end(fileBuffer);
  });
};

const uploadStudentFaceImage = (fileBuffer, maSinhVien) => {
  return new Promise((resolve, reject) => {
    if (!hasCloudinaryConfig()) {
      reject(new Error("Cloudinary chua duoc cau hinh trong file .env"));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "student-faceid",
        resource_type: "image",
        public_id: `${maSinhVien}_${Date.now()}`,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      },
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  uploadAttendanceImage,
  uploadStudentFaceImage,
};

-- Init SQL for QuanLyLopHoc
-- Creates tables matching backend Sequelize models and inserts initial admin account

BEGIN;

-- Table: taikhoan
CREATE TABLE IF NOT EXISTS taikhoan (
  mataikhoan CHAR(10) PRIMARY KEY,
  username CHAR(10) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(7) NOT NULL
);

-- Table: giangvien
CREATE TABLE IF NOT EXISTS giangvien (
  magiangvien CHAR(10) PRIMARY KEY,
  ten VARCHAR(20) NOT NULL,
  holot VARCHAR(30) NOT NULL,
  ngaysinh DATE NOT NULL,
  email VARCHAR(50) UNIQUE NOT NULL,
  sodienthoai CHAR(10) UNIQUE NOT NULL
);

-- Table: lophoc
CREATE TABLE IF NOT EXISTS lophoc (
  malop SERIAL PRIMARY KEY,
  tenlop VARCHAR(50) NOT NULL,
  monhoc VARCHAR(40) NOT NULL,
  ngaybatdau DATE NOT NULL,
  ngayketthuc DATE NOT NULL,
  ngayhoccodinh VARCHAR(20) NOT NULL,
  giobatdau TIME NOT NULL,
  gioketthuc TIME NOT NULL,
  magiangvien CHAR(10) NOT NULL,
  CONSTRAINT fk_lophoc_giangvien FOREIGN KEY(magiangvien) REFERENCES giangvien(magiangvien)
);

-- Table: sinhvien
CREATE TABLE IF NOT EXISTS sinhvien (
  masinhvien CHAR(10) PRIMARY KEY,
  ten VARCHAR(20) NOT NULL,
  holot VARCHAR(30) NOT NULL,
  ngaysinh DATE,
  email VARCHAR(50) UNIQUE NOT NULL,
  sodienthoai CHAR(10) UNIQUE,
  malop CHAR(10),
  faceid DOUBLE PRECISION[],
  img_url TEXT
);

-- Table: buoihoc
CREATE TABLE IF NOT EXISTS buoihoc (
  mabuoihoc VARCHAR(15) PRIMARY KEY,
  malop INTEGER NOT NULL,
  ngayhoc DATE NOT NULL,
  giobatdau TIME NOT NULL,
  gioketthuc TIME NOT NULL,
  noidungbuoihoc TEXT,
  CONSTRAINT fk_buoihoc_lophoc FOREIGN KEY(malop) REFERENCES lophoc(malop)
);

-- Table: diemdanh
CREATE TABLE IF NOT EXISTS diemdanh (
  madiemdanh VARCHAR(25) PRIMARY KEY,
  masinhvien CHAR(10) NOT NULL,
  mabuoihoc VARCHAR(15) NOT NULL,
  trangthai VARCHAR(20),
  ghichu TEXT,
  thoigiancapnhat TIMESTAMP,
  manguoicapnhat VARCHAR(10),
  gps TEXT,
  img_url TEXT,
  CONSTRAINT fk_diemdanh_sinhvien FOREIGN KEY(masinhvien) REFERENCES sinhvien(masinhvien),
  CONSTRAINT fk_diemdanh_buoihoc FOREIGN KEY(mabuoihoc) REFERENCES buoihoc(mabuoihoc)
);

-- Table: lop_sinhvien (many-to-many)
CREATE TABLE IF NOT EXISTS lop_sinhvien (
  malop INTEGER NOT NULL,
  masinhvien CHAR(10) NOT NULL,
  PRIMARY KEY (malop, masinhvien),
  CONSTRAINT fk_lop_sinhvien_lophoc FOREIGN KEY(malop) REFERENCES lophoc(malop),
  CONSTRAINT fk_lop_sinhvien_sinhvien FOREIGN KEY(masinhvien) REFERENCES sinhvien(masinhvien)
);

-- Insert initial admin account
-- Password for 'admin' is hashed using bcrypt with SALT_ROUNDS = 10
-- Hashed value computed and inserted below
INSERT INTO taikhoan (mataikhoan, username, password, role) VALUES
('admin','admin','$2b$10$QNju4Ib8RSpiEKrUztzBtO7SIf8WQYutKr0Aqd8k0NnifwLpDPElq','admin')
ON CONFLICT (mataikhoan) DO NOTHING;

COMMIT;

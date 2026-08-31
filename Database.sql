CREATE DATABASE healthcare_db;

USE healthcare_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(30) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(10) NOT NULL,
    reason TEXT,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled')
        DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    diagnosis VARCHAR(255),
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medical_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    report_title VARCHAR(200) NOT NULL,
    report_date DATE NOT NULL,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    appointment_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    status ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Paid',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'New',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE beds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bed_number VARCHAR(50) NOT NULL UNIQUE,
    ward VARCHAR(100) NOT NULL,
    bed_type VARCHAR(100) NOT NULL,
    status ENUM('Available','Reserved','Occupied','Maintenance')
        NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bed_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    bed_id INT NULL,
    department VARCHAR(100) NOT NULL,
    bed_type VARCHAR(100) NOT NULL,
    admission_date DATE NOT NULL,
    duration_days INT NOT NULL,
    reason TEXT,
    status ENUM(
        'Pending',
        'Confirmed',
        'Waiting',
        'Payment Pending',
        'Paid',
        'Cancelled'
    ) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME NULL,
    expires_at DATETIME NULL
);

CREATE TABLE bed_waiting_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    patient_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    status ENUM('Waiting','Converted','Expired','Cancelled')
        NOT NULL DEFAULT 'Waiting'
);

INSERT INTO beds
(bed_number, ward, bed_type, status)
VALUES
('G-01', 'General Ward', 'General', 'Available'),
('G-02', 'General Ward', 'General', 'Available'),
('G-03', 'General Ward', 'General', 'Occupied'),
('ICU-01', 'ICU', 'ICU', 'Available'),
('ICU-02', 'ICU', 'ICU', 'Occupied'),
('P-01', 'Private Ward', 'Private', 'Available');

SELECT * FROM bed_reservations
ORDER BY id DESC;

-- =========================================================
-- CREATE 100 BEDS FOR EACH BED TYPE
-- TOTAL = 400 BEDS
-- =========================================================

INSERT IGNORE INTO beds
(
    bed_number,
    ward,
    bed_type,
    status
)

WITH RECURSIVE numbers AS (
    SELECT 1 AS n

    UNION ALL

    SELECT n + 1
    FROM numbers
    WHERE n < 100
)

SELECT
    CONCAT('G-', LPAD(n, 3, '0')) AS bed_number,
    'General Ward' AS ward,
    'General' AS bed_type,
    'Available' AS status
FROM numbers

UNION ALL

SELECT
    CONCAT('SP-', LPAD(n, 3, '0')) AS bed_number,
    'Semi-Private Ward' AS ward,
    'Semi-Private' AS bed_type,
    'Available' AS status
FROM numbers

UNION ALL

SELECT
    CONCAT('P-', LPAD(n, 3, '0')) AS bed_number,
    'Private Ward' AS ward,
    'Private' AS bed_type,
    'Available' AS status
FROM numbers

UNION ALL

SELECT
    CONCAT('ICU-', LPAD(n, 3, '0')) AS bed_number,
    'ICU' AS ward,
    'ICU' AS bed_type,
    'Available' AS status
FROM numbers;


SELECT *
FROM contact_messages
ORDER BY created_at DESC;
CREATE TABLE IF NOT EXISTS bed_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    reservation_id INT NOT NULL,
    patient_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    payment_method VARCHAR(50) NOT NULL,

    transaction_id VARCHAR(100) NOT NULL UNIQUE,

    status ENUM(
        'Paid',
        'Failed',
        'Pending'
    ) NOT NULL DEFAULT 'Paid',

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bed_payment_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES bed_reservations(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_bed_payment_patient
        FOREIGN KEY (patient_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_bed_payment_reservation (reservation_id),
    INDEX idx_bed_payment_patient (patient_id),
    INDEX idx_bed_payment_status (status)
);

SELECT *
FROM notifications
ORDER BY id DESC;

SELECT id, name, email, role
FROM users
WHERE role = 'patient';

INSERT INTO payments
(
    patient_id,
    appointment_id,
    amount,
    payment_method,
    transaction_id,
    status
)
VALUES
(
    1,
    NULL,
    500,
    'Google Pay',
    'TXN-HC-1001',
    'Paid'
);

SELECT id, name, mobile, email, role, created_at FROM users;


SELECT * FROM appointments;

SELECT id, name, email, role
FROM users
WHERE email = 'rahuldoctor@gmail.com';

ALTER TABLE users
ADD COLUMN status ENUM('active', 'inactive')
NOT NULL DEFAULT 'active';

ALTER TABLE users
MODIFY COLUMN profile_photo LONGTEXT NULL;

DESCRIBE users;
ALTER TABLE users
ADD COLUMN date_of_birth DATE NULL,
ADD COLUMN gender VARCHAR(20) NULL,
ADD COLUMN profile_photo VARCHAR(500) NULL;

ALTER TABLE contact_messages
ADD COLUMN user_id INT NULL,
ADD COLUMN user_role VARCHAR(20) NULL,
ADD COLUMN admin_reply TEXT NULL,
ADD COLUMN replied_at DATETIME NULL;



-- Run this once in MySQL
ALTER TABLE notifications
ADD COLUMN doctor_id INT NULL AFTER patient_id;

-- Optional indexes for faster notification loading
CREATE INDEX idx_notifications_patient_id
ON notifications (patient_id);

-- Run ONLY if notifications.doctor_id does not already exist.
ALTER TABLE notifications
ADD COLUMN doctor_id INT NULL AFTER patient_id;

CREATE INDEX idx_notifications_doctor_id
ON notifications (doctor_id);

ALTER TABLE notifications
MODIFY COLUMN patient_id INT NULL;

CREATE INDEX idx_notifications_doctor_id
ON notifications (doctor_id);
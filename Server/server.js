const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// =========================
// Middleware
// =========================

app.use(cors());

app.use(
  express.json({
    limit: "5mb",
  })
);

// =========================
// MySQL Connection
// =========================

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// =========================
// Basic Test Route
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "Healthcare Management API is running",
  });
});

// =========================
// SIGNUP
// =========================

app.post("/api/signup", async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      role,
      password,
    } = req.body;

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ? OR mobile = ?",
      [email, mobile]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "Email or mobile number already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO users
      (name, mobile, email, role, password)
      VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        mobile,
        email,
        role || "patient",
        hashedPassword,
      ]
    );

    res.status(201).json({
      message: "Account created successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =========================
// LOGIN
// =========================

app.post("/api/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =========================
// BOOK APPOINTMENT
// =========================

app.post("/api/appointments", async (req, res) => {
  try {
    const {
      patientId,
      doctorName,
      department,
      appointmentDate,
      appointmentTime,
      patientName,
      mobile,
      reason,
    } = req.body;

    if (
      !patientId ||
      !doctorName ||
      !department ||
      !appointmentDate ||
      !appointmentTime ||
      !patientName ||
      !mobile
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const [existingAppointment] = await db.execute(
      `SELECT id
       FROM appointments
       WHERE doctor_name = ?
       AND appointment_date = ?
       AND appointment_time = ?
       AND status NOT IN ('Cancelled', 'Completed')`,
      [
        doctorName,
        appointmentDate,
        appointmentTime,
      ]
    );

    if (existingAppointment.length > 0) {
      return res.status(409).json({
        message: "This appointment slot is already booked.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO appointments
      (
        patient_id,
        doctor_name,
        department,
        appointment_date,
        appointment_time,
        patient_name,
        mobile,
        reason
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        doctorName,
        department,
        appointmentDate,
        appointmentTime,
        patientName,
        mobile,
        reason || null,
      ]
    );
    

const appointmentId = result.insertId;

await db.execute(
  `INSERT INTO notifications
  (
    patient_id,
    title,
    message,
    type
  )
  VALUES (?, ?, ?, ?)`,
  [
    patientId,
    "Appointment Booked",
    `Your appointment with ${doctorName} has been booked successfully.`,
    "appointment",
  ]
);

return res.status(201).json({
  message: "Appointment booked successfully",
  appointmentId,
});
  } catch (error) {
    console.error("Appointment error:", error);

    res.status(500).json({
      message: "Unable to book appointment",
    });
  }
});

// =========================
// GET PATIENT APPOINTMENTS
// =========================

app.get("/api/appointments/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const [appointments] = await db.execute(
      `SELECT
        id,
        doctor_name,
        department,
        appointment_date,
        appointment_time,
        patient_name,
        mobile,
        reason,
        status,
        created_at
       FROM appointments
       WHERE patient_id = ?
       ORDER BY appointment_date ASC,
                appointment_time ASC`,
      [patientId]
    );

    res.json(appointments);
  } catch (error) {
    console.error(
      "Fetch appointments error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch appointments",
    });
  }
});

// =========================
// CANCEL APPOINTMENT
// =========================

app.put("/api/appointments/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      `UPDATE appointments
       SET status = 'Cancelled'
       WHERE id = ?
       AND status NOT IN ('Completed', 'Cancelled')`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Appointment cannot be cancelled",
      });
    }

    res.json({
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error(
      "Cancel appointment error:",
      error
    );

    res.status(500).json({
      message: "Unable to cancel appointment",
    });
  }
});

// =========================
// RESCHEDULE APPOINTMENT
// =========================

app.put(
  "/api/appointments/:id/reschedule",
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        appointmentDate,
        appointmentTime,
      } = req.body;

      if (!appointmentDate || !appointmentTime) {
        return res.status(400).json({
          message: "Date and time are required",
        });
      }

      const [currentAppointment] = await db.execute(
        `SELECT doctor_name
         FROM appointments
         WHERE id = ?
         AND status NOT IN ('Cancelled', 'Completed')`,
        [id]
      );

      if (currentAppointment.length === 0) {
        return res.status(404).json({
          message: "Appointment cannot be rescheduled",
        });
      }

      const doctorName =
        currentAppointment[0].doctor_name;

      const [existingSlot] = await db.execute(
        `SELECT id
         FROM appointments
         WHERE doctor_name = ?
         AND appointment_date = ?
         AND appointment_time = ?
         AND id != ?
         AND status NOT IN ('Cancelled', 'Completed')`,
        [
          doctorName,
          appointmentDate,
          appointmentTime,
          id,
        ]
      );

      if (existingSlot.length > 0) {
        return res.status(409).json({
          message:
            "This new time slot is already booked.",
        });
      }

      const [result] = await db.execute(
        `UPDATE appointments
         SET appointment_date = ?,
             appointment_time = ?,
             status = 'Pending'
         WHERE id = ?
         AND status NOT IN ('Cancelled', 'Completed')`,
        [
          appointmentDate,
          appointmentTime,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message:
            "Appointment cannot be rescheduled",
        });
      }

      res.json({
        message:
          "Appointment rescheduled successfully",
      });
    } catch (error) {
      console.error(
        "Reschedule error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to reschedule appointment",
      });
    }
  }
);

// =========================
// GET DOCTOR APPOINTMENTS
// =========================

app.get(
  "/api/doctor-appointments/:doctorName",
  async (req, res) => {
    try {
      const doctorName = decodeURIComponent(
        req.params.doctorName
      );

      const [appointments] = await db.execute(
        `SELECT
          id,
          patient_id,
          patient_name,
          mobile,
          department,
          appointment_date,
          appointment_time,
          reason,
          status,
          created_at
         FROM appointments
         WHERE doctor_name = ?
         ORDER BY appointment_date ASC,
                  appointment_time ASC`,
        [doctorName]
      );

      res.json(appointments);
    } catch (error) {
      console.error(
        "Fetch doctor appointments error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch doctor appointments",
      });
    }
  }
);

// =========================
// CREATE PRESCRIPTION
// =========================

app.post("/api/prescriptions", async (req, res) => {
  try {
    const {
      patientId,
      doctorName,
      diagnosis,
      medicineName,
      dosage,
      frequency,
      duration,
      instructions,
    } = req.body;

    if (
      !patientId ||
      !doctorName ||
      !medicineName
    ) {
      return res.status(400).json({
        message:
          "Patient, doctor and medicine are required",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO prescriptions
      (
        patient_id,
        doctor_name,
        diagnosis,
        medicine_name,
        dosage,
        frequency,
        duration,
        instructions
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        doctorName,
        diagnosis || null,
        medicineName,
        dosage || null,
        frequency || null,
        duration || null,
        instructions || null,
      ]
    );

    await db.execute(
  `INSERT INTO notifications
  (
    patient_id,
    title,
    message,
    type
  )
  VALUES (?, ?, ?, ?)`,
  [
    patientId,
    "New Prescription",
    `Dr. ${doctorName} has added a new prescription for you.`,
    "prescription",
  ]
);

    res.status(201).json({
      message:
        "Prescription created successfully",
      prescriptionId: result.insertId,
    });
  } catch (error) {
    console.error(
      "Create prescription error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to create prescription",
    });
  }
});

// =========================
// GET PATIENT PRESCRIPTIONS
// =========================

app.get(
  "/api/prescriptions/:patientId",
  async (req, res) => {
    try {
      const { patientId } = req.params;

      const [prescriptions] = await db.execute(
        `SELECT
          id,
          doctor_name,
          diagnosis,
          medicine_name,
          dosage,
          frequency,
          duration,
          instructions,
          created_at
         FROM prescriptions
         WHERE patient_id = ?
         ORDER BY created_at DESC`,
        [patientId]
      );

      res.json(prescriptions);
    } catch (error) {
      console.error(
        "Fetch prescriptions error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch prescriptions",
      });
    }
  }
);

// =========================
// CREATE MEDICAL REPORT
// =========================

app.post("/api/medical-reports", async (req, res) => {
  try {
    const {
      patientId,
      doctorName,
      reportType,
      reportTitle,
      reportDate,
      summary,
    } = req.body;

    if (
      !patientId ||
      !doctorName ||
      !reportType ||
      !reportTitle ||
      !reportDate
    ) {
      return res.status(400).json({
        message:
          "Please fill all required report fields",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO medical_reports
      (
        patient_id,
        doctor_name,
        report_type,
        report_title,
        report_date,
        summary
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        doctorName,
        reportType,
        reportTitle,
        reportDate,
        summary || null,
      ]
    );

    await db.execute(
  `INSERT INTO notifications
  (
    patient_id,
    title,
    message,
    type
  )
  VALUES (?, ?, ?, ?)`,
  [
    patientId,
    "New Medical Report",
    `Dr. ${doctorName} has added a new medical report for you.`,
    "report",
  ]
);

    res.status(201).json({
      message:
        "Medical report created successfully",
      reportId: result.insertId,
    });
  } catch (error) {
    console.error(
      "Create medical report error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to create medical report",
    });
  }
});

// =========================
// GET PATIENT MEDICAL REPORTS
// =========================

app.get(
  "/api/medical-reports/:patientId",
  async (req, res) => {
    try {
      const { patientId } = req.params;

      const [reports] = await db.execute(
        `SELECT
          id,
          doctor_name,
          report_type,
          report_title,
          report_date,
          summary,
          created_at
         FROM medical_reports
         WHERE patient_id = ?
         ORDER BY report_date DESC`,
        [patientId]
      );

      res.json(reports);
    } catch (error) {
      console.error(
        "Fetch medical reports error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch medical reports",
      });
    }
  }
);

// =========================
// GET ALL ADMIN APPOINTMENTS
// =========================

app.get("/api/admin/appointments", async (req, res) => {
  try {
    const [appointments] = await db.execute(
      `SELECT
        id,
        patient_id,
        patient_name,
        mobile,
        doctor_name,
        department,
        appointment_date,
        appointment_time,
        reason,
        status,
        created_at
       FROM appointments
       ORDER BY created_at DESC`
    );

    res.json(appointments);
  } catch (error) {
    console.error(
      "Fetch admin appointments error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch admin appointments",
    });
  }
});

// =========================
// GET ADMIN DASHBOARD STATS
// =========================

app.get("/api/admin/stats", async (req, res) => {
  try {
    const [[doctorCount]] = await db.execute(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'doctor'"
    );

    const [[patientCount]] = await db.execute(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'patient'"
    );

    const [[appointmentCount]] = await db.execute(
      "SELECT COUNT(*) AS total FROM appointments"
    );

    const [[reportCount]] = await db.execute(
      "SELECT COUNT(*) AS total FROM medical_reports"
    );

    res.json({
      doctors: doctorCount.total,
      patients: patientCount.total,
      appointments: appointmentCount.total,
      reports: reportCount.total,
    });

  } catch (error) {
    console.error(
      "Admin stats error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch admin statistics",
    });
  }
});

// =========================
// GET ALL DOCTORS
// =========================

app.get("/api/admin/doctors", async (req, res) => {
  try {
    const [doctors] = await db.execute(
      `SELECT
        id,
        name,
        mobile,
        email,
        role
       FROM users
       WHERE role = 'doctor'
       ORDER BY name ASC`
    );

    res.json(doctors);
  } catch (error) {
    console.error("Fetch admin doctors error:", error);

    res.status(500).json({
      message: "Unable to fetch doctors",
    });
  }
});

// =========================
// GET ALL PATIENTS
// =========================

app.get("/api/admin/patients", async (req, res) => {
  try {
    const [patients] = await db.execute(
      `SELECT
        id,
        name,
        mobile,
        email,
        role
       FROM users
       WHERE role = 'patient'
       ORDER BY name ASC`
    );

    res.json(patients);
  } catch (error) {
    console.error(
      "Fetch admin patients error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch patients",
    });
  }
});

// =========================
// GET ALL MEDICAL REPORTS FOR ADMIN
// =========================

app.get("/api/admin/reports", async (req, res) => {
  try {
    const [reports] = await db.execute(
      `SELECT
        id,
        patient_id,
        doctor_name,
        report_type,
        report_title,
        report_date,
        summary,
        created_at
       FROM medical_reports
       ORDER BY report_date DESC, created_at DESC`
    );

    res.json(reports);
  } catch (error) {
    console.error(
      "Fetch admin medical reports error:",
      error
    );

    res.status(500).json({
      message: "Unable to fetch medical reports",
    });
  }
});

// =========================
// UPDATE APPOINTMENT STATUS
// =========================

app.put("/api/admin/appointments/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const [appointmentRows] = await db.execute(
  `SELECT patient_id, doctor_name
   FROM appointments
   WHERE id = ?`,
  [id]
);

if (appointmentRows.length === 0) {
  return res.status(404).json({
    message: "Appointment not found",
  });
}

const patientId = appointmentRows[0].patient_id;
const doctorName = appointmentRows[0].doctor_name;

let notificationTitle = "";
let notificationMessage = "";

if (status === "Confirmed") {
  notificationTitle = "Appointment Confirmed";
  notificationMessage =
    `Your appointment with ${doctorName} has been confirmed.`;
}

if (status === "Completed") {
  notificationTitle = "Appointment Completed";
  notificationMessage =
    `Your appointment with ${doctorName} has been completed.`;
}

if (status === "Cancelled") {
  notificationTitle = "Appointment Cancelled";
  notificationMessage =
    `Your appointment with ${doctorName} has been cancelled.`;
}

if (notificationTitle) {
  await db.execute(
    `INSERT INTO notifications
    (
      patient_id,
      title,
      message,
      type
    )
    VALUES (?, ?, ?, ?)`,
    [
      patientId,
      notificationTitle,
      notificationMessage,
      "appointment",
    ]
  );
}

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    const [result] = await db.execute(
      `UPDATE appointments
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.json({
      message: "Appointment status updated successfully",
    });
  } catch (error) {
    console.error(
      "Admin appointment status error:",
      error
    );

    res.status(500).json({
      message: "Unable to update appointment status",
    });
  }
});

// =========================
// UPDATE USER STATUS
// =========================

app.put("/api/admin/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const [result] = await db.execute(
      `UPDATE users
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User status updated successfully",
    });
  } catch (error) {
    console.error(
      "Update user status error:",
      error
    );

    res.status(500).json({
      message: "Unable to update user status",
    });
  }
});

// =========================
// CHANGE PASSWORD
// =========================

app.put("/api/users/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "Current password and new password are required",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be 8+ characters with uppercase, lowercase, number and special character.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message:
          "New password must be different from current password.",
      });
    }

    const [users] = await db.execute(
      "SELECT password FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      users[0].password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await db.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    return res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      message: "Unable to change password",
    });
  }
});

// =========================
// UPDATE PATIENT PROFILE
// =========================

app.put("/api/users/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      mobile,
      email,
      dateOfBirth,
      gender,
      profilePhoto,
    } = req.body;

    if (!name || !mobile || !email) {
      return res.status(400).json({
        message:
          "Name, mobile and email are required.",
      });
    }

    const cleanName = String(name).trim();
    const cleanMobile = String(mobile).trim();
    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    const cleanGender =
      gender ? String(gender).trim() : null;

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        message:
          "Mobile number must contain exactly 10 digits.",
      });
    }

    await db.execute(
      `UPDATE users
       SET
         name = ?,
         mobile = ?,
         email = ?,
         date_of_birth = ?,
         gender = ?,
         profile_photo = ?
       WHERE id = ?`,
      [
        cleanName,
        cleanMobile,
        cleanEmail,
        dateOfBirth || null,
        cleanGender,
        profilePhoto || null,
        id,
      ]
    );

    return res.json({
      message: "Profile updated successfully.",
    });

  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      message:
        error.code === "ER_DUP_ENTRY"
          ? "This email address is already in use."
          : "Unable to update profile.",
    });
  }
});

// =========================
// CREATE PAYMENT
// =========================

app.post("/api/payments", async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      amount,
      paymentMethod,
      transactionId,
    } = req.body;

    const numericPatientId = Number(patientId);
    const numericAmount = Number(amount);

    if (
      !Number.isInteger(numericPatientId) ||
      numericPatientId <= 0 ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !String(paymentMethod || "").trim()
    ) {
      return res.status(400).json({
        message:
          "Valid patient, amount and payment method are required",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO payments
      (
        patient_id,
        appointment_id,
        amount,
        payment_method,
        transaction_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, 'Paid')`,
      [
        numericPatientId,
        appointmentId || null,
        numericAmount,
        String(paymentMethod).trim(),
        transactionId || null,
      ]
    );
await db.execute(
  `INSERT INTO notifications
  (
    patient_id,
    title,
    message,
    type
  )
  VALUES (?, ?, ?, ?)`,
  [
    numericPatientId,
    "Payment Successful",
    `Your payment of ₹${numericAmount} was completed successfully.`,
    "payment",
  ]
);
    res.status(201).json({
      message: "Payment successful",
      paymentId: result.insertId,
    });

  } catch (error) {
    console.error("Payment error:", error);

    res.status(500).json({
      message: "Unable to process payment",
    });
  }
});


// =========================
// GET PATIENT PAYMENTS
// =========================

app.get(
  "/api/payments/:patientId",
  async (req, res) => {
    try {
      const patientId = Number(
        req.params.patientId
      );

      if (
        !Number.isInteger(patientId) ||
        patientId <= 0
      ) {
        return res.status(400).json({
          message: "Invalid patient ID",
        });
      }

      const [payments] = await db.execute(
        `SELECT
          id,
          appointment_id,
          amount,
          payment_method,
          transaction_id,
          status,
          payment_date
         FROM payments
         WHERE patient_id = ?
         ORDER BY payment_date DESC, id DESC`,
        [patientId]
      );

      res.status(200).json(
        payments.map((payment) => ({
          id: payment.id,
          appointment_id: payment.appointment_id,
          amount: Number(payment.amount),
          payment_method: payment.payment_method,
          transaction_id: payment.transaction_id,
          status: payment.status,
          payment_date: payment.payment_date,
        }))
      );

    } catch (error) {
      console.error(
        "Fetch payments error:",
        error
      );

      res.status(500).json({
        message: "Unable to fetch payments",
      });
    }
  }
);

// =========================
// CREATE PATIENT BED RESERVATION REQUEST
// =========================

app.post("/api/bed-reservations", async (req, res) => {
  try {
    const {
      patientId,
      department,
      bedType,
      admissionDate,
      durationDays,
      reason,
    } = req.body;

    const numericPatientId = Number(patientId);
    const numericDuration = Number(durationDays);

    if (
      !Number.isInteger(numericPatientId) ||
      numericPatientId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid patient account.",
      });
    }

    if (
      !String(department || "").trim() ||
      !String(bedType || "").trim() ||
      !admissionDate ||
      !Number.isInteger(numericDuration) ||
      numericDuration < 1 ||
      !String(reason || "").trim()
    ) {
      return res.status(400).json({
        message:
          "Please fill all bed reservation fields correctly.",
      });
    }

    // Verify that this user is actually a patient.
    const [patientRows] = await db.execute(
      `SELECT id, name
       FROM users
       WHERE id = ?
         AND role = 'patient'`,
      [numericPatientId]
    );

    if (patientRows.length === 0) {
      return res.status(404).json({
        message: "Patient account not found.",
      });
    }

    // At this stage the request is only submitted.
    // Admin will check the beds table and decide whether to confirm
    // the request or move it to the waiting list.
    const [result] = await db.execute(
      `INSERT INTO bed_reservations
       (
         patient_id,
         department,
         bed_type,
         admission_date,
         duration_days,
         reason,
         status
       )
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        numericPatientId,
        String(department).trim(),
        String(bedType).trim(),
        admissionDate,
        numericDuration,
        String(reason).trim(),
      ]
    );

    return res.status(201).json({
      message:
        "Bed reservation request submitted successfully. Please wait for admin confirmation.",
      reservationId: result.insertId,
      status: "Pending",
    });
  } catch (error) {
    console.error(
      "Create patient bed reservation error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to submit bed reservation request.",
    });
  }
});

// =========================
// GET PATIENT BED RESERVATIONS
// =========================

app.get(
  "/api/bed-reservations/:patientId",
  async (req, res) => {
    try {
      const patientId = Number(req.params.patientId);

      if (
        !Number.isInteger(patientId) ||
        patientId <= 0
      ) {
        return res.status(400).json({
          message: "Invalid patient ID.",
        });
      }

      const [reservations] = await db.execute(
        `SELECT
           br.id,
           br.patient_id,
           br.bed_id,
           br.department,
           br.bed_type,
           br.admission_date,
           br.duration_days,
           br.reason,
           br.status,
           br.created_at,
           br.confirmed_at,
           br.expires_at,
           b.bed_number,
           b.ward,
           COALESCE(
             (
               SELECT bp.amount
               FROM bed_payments bp
               WHERE bp.reservation_id = br.id
                 AND bp.status = 'Paid'
               ORDER BY bp.id DESC
               LIMIT 1
             ),
             (br.duration_days * 1000)
           ) AS amount,
           (
             SELECT bp.transaction_id
             FROM bed_payments bp
             WHERE bp.reservation_id = br.id
               AND bp.status = 'Paid'
             ORDER BY bp.id DESC
             LIMIT 1
           ) AS transaction_id,
           CASE
             WHEN EXISTS (
               SELECT 1
               FROM bed_payments bp
               WHERE bp.reservation_id = br.id
                 AND bp.status = 'Paid'
             )
             THEN 'Paid'
             ELSE 'Pending'
           END AS payment_status
         FROM bed_reservations br
         LEFT JOIN beds b
           ON b.id = br.bed_id
         WHERE br.patient_id = ?
         ORDER BY br.created_at DESC, br.id DESC`,
        [patientId]
      );

      return res.json(reservations);
    } catch (error) {
      console.error(
        "Fetch patient bed reservations error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to fetch bed reservations.",
      });
    }
  }
);

// =========================
// ADMIN BED RESERVATION ROUTES
// =========================

// Get all bed reservation requests for admin
app.get("/api/admin/bed-reservations", async (req, res) => {
  try {
    const [reservations] = await db.execute(
      `SELECT
         br.id,
         br.patient_id,
         u.name AS patient_name,
         u.mobile AS patient_mobile,
         u.email AS patient_email,
         br.bed_id,
         br.department,
         br.bed_type,
         br.admission_date,
         br.duration_days,
         br.reason,
         br.status,
         br.created_at,
         br.confirmed_at,
         br.expires_at,
         b.bed_number,
         b.ward
       FROM bed_reservations br
       INNER JOIN users u
         ON u.id = br.patient_id
       LEFT JOIN beds b
         ON b.id = br.bed_id
       ORDER BY
         CASE
           WHEN br.status = 'Pending' THEN 0
           WHEN br.status = 'Waiting' THEN 1
           ELSE 2
         END,
         br.created_at DESC,
         br.id DESC`
    );

    return res.json(reservations);
  } catch (error) {
    console.error(
      "Admin bed reservations fetch error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to fetch bed reservations.",
    });
  }
});

// Check available beds for the requested type/date
app.get(
  "/api/admin/beds/availability",
  async (req, res) => {
    try {
      const bedType = String(
        req.query.bedType || ""
      ).trim();

      const admissionDate = String(
        req.query.admissionDate || ""
      ).trim();

      if (!bedType || !admissionDate) {
        return res.status(400).json({
          message:
            "Bed type and admission date are required.",
        });
      }

      const [beds] = await db.execute(
        `SELECT
           id,
           bed_number,
           ward,
           bed_type,
           status
         FROM beds
         WHERE bed_type = ?
           AND status = 'Available'
         ORDER BY bed_number ASC`,
        [bedType]
      );

      return res.json({
        available_count: beds.length,
        beds,
      });
    } catch (error) {
      console.error(
        "Bed availability error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to check bed availability.",
      });
    }
  }
);

// Confirm, wait-list or cancel a bed reservation
app.put(
  "/api/admin/bed-reservations/:id/status",
  async (req, res) => {
    const connection = await db.getConnection();

    try {
      const reservationId = Number(req.params.id);
      const requestedStatus = String(
        req.body.status || ""
      ).trim();

      const bedId =
        req.body.bedId !== null &&
        req.body.bedId !== undefined &&
        req.body.bedId !== ""
          ? Number(req.body.bedId)
          : null;

      const allowedStatuses = [
        "Payment Pending",
        "Waiting",
        "Cancelled",
      ];

      if (
        !Number.isInteger(reservationId) ||
        reservationId <= 0 ||
        !allowedStatuses.includes(requestedStatus)
      ) {
        return res.status(400).json({
          message:
            "Invalid reservation ID or status.",
        });
      }

      await connection.beginTransaction();

      const [rows] = await connection.execute(
        `SELECT
           br.*,
           u.name AS patient_name
         FROM bed_reservations br
         INNER JOIN users u
           ON u.id = br.patient_id
         WHERE br.id = ?
         FOR UPDATE`,
        [reservationId]
      );

      if (rows.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          message: "Bed reservation not found.",
        });
      }

      const reservation = rows[0];

      if (
        requestedStatus === "Payment Pending"
      ) {
        if (
          !Number.isInteger(bedId) ||
          bedId <= 0
        ) {
          await connection.rollback();

          return res.status(400).json({
            message:
              "Please select an available bed.",
          });
        }

        const [bedRows] = await connection.execute(
          `SELECT
             id,
             bed_number,
             ward,
             bed_type,
             status
           FROM beds
           WHERE id = ?
           FOR UPDATE`,
          [bedId]
        );

        if (bedRows.length === 0) {
          await connection.rollback();

          return res.status(404).json({
            message: "Bed not found.",
          });
        }

        const bed = bedRows[0];

        if (bed.status !== "Available") {
          await connection.rollback();

          return res.status(409).json({
            message:
              "This bed is no longer available.",
          });
        }

        if (
          String(bed.bed_type).toLowerCase() !==
          String(reservation.bed_type).toLowerCase()
        ) {
          await connection.rollback();

          return res.status(409).json({
            message:
              "Selected bed type does not match the reservation.",
          });
        }

        await connection.execute(
          `UPDATE beds
           SET status = 'Reserved'
           WHERE id = ?`,
          [bedId]
        );

        await connection.execute(
          `UPDATE bed_reservations
           SET bed_id = ?,
               status = 'Payment Pending',
               confirmed_at = NOW(),
               expires_at = NULL
           WHERE id = ?`,
          [bedId, reservationId]
        );

        await connection.execute(
          `INSERT INTO notifications
           (patient_id, title, message, type)
           VALUES (?, ?, ?, ?)`,
          [
            reservation.patient_id,
            "Bed Reservation Confirmed",
            `Your bed reservation BR-${String(
              reservationId
            ).padStart(
              4,
              "0"
            )} has been confirmed. Please complete the payment to secure your reservation.`,
            "bed",
          ]
        );
      }

      if (requestedStatus === "Waiting") {
        const expiresAt = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        );

        await connection.execute(
          `UPDATE bed_reservations
           SET status = 'Waiting',
               bed_id = NULL,
               expires_at = ?
           WHERE id = ?`,
          [expiresAt, reservationId]
        );

        await connection.execute(
          `INSERT INTO bed_waiting_list
           (
             reservation_id,
             patient_id,
             created_at,
             expires_at,
             status
           )
           VALUES (?, ?, NOW(), ?, 'Waiting')`,
          [
            reservationId,
            reservation.patient_id,
            expiresAt,
          ]
        );

        await connection.execute(
          `INSERT INTO notifications
           (patient_id, title, message, type)
           VALUES (?, ?, ?, ?)`,
          [
            reservation.patient_id,
            "Added to Waiting List",
            `No ${reservation.bed_type} bed is currently available. Your request BR-${String(
              reservationId
            ).padStart(
              4,
              "0"
            )} has been added to the 24-hour waiting list.`,
            "bed",
          ]
        );
      }

      if (requestedStatus === "Cancelled") {
        await connection.execute(
          `UPDATE bed_reservations
           SET status = 'Cancelled'
           WHERE id = ?`,
          [reservationId]
        );

        await connection.execute(
          `UPDATE bed_waiting_list
           SET status = 'Cancelled'
           WHERE reservation_id = ?
             AND status = 'Waiting'`,
          [reservationId]
        );

        await connection.execute(
          `INSERT INTO notifications
           (patient_id, title, message, type)
           VALUES (?, ?, ?, ?)`,
          [
            reservation.patient_id,
            "Bed Reservation Cancelled",
            `Your bed reservation request BR-${String(
              reservationId
            ).padStart(
              4,
              "0"
            )} has been cancelled.`,
            "bed",
          ]
        );
      }

      await connection.commit();

      const [updatedRows] = await connection.execute(
        `SELECT
           br.id,
           br.patient_id,
           u.name AS patient_name,
           u.mobile AS patient_mobile,
           u.email AS patient_email,
           br.bed_id,
           br.department,
           br.bed_type,
           br.admission_date,
           br.duration_days,
           br.reason,
           br.status,
           br.created_at,
           br.confirmed_at,
           br.expires_at,
           b.bed_number,
           b.ward
         FROM bed_reservations br
         INNER JOIN users u
           ON u.id = br.patient_id
         LEFT JOIN beds b
           ON b.id = br.bed_id
         WHERE br.id = ?`,
        [reservationId]
      );

      return res.json({
        message:
          requestedStatus === "Payment Pending"
            ? "Bed reservation confirmed. Patient can now complete payment."
            : requestedStatus === "Waiting"
            ? "Patient added to the 24-hour waiting list."
            : "Bed reservation cancelled.",
        reservation: updatedRows[0],
      });
    } catch (error) {
      try {
        await connection.rollback();
      } catch {
        // Transaction may already be closed.
      }

      console.error(
        "Admin bed reservation status error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to update bed reservation.",
      });
    } finally {
      connection.release();
    }
  }
);

// Move the oldest matching waiting request to Payment Pending
// when a specific bed has become available.
app.post(
  "/api/admin/beds/process-waiting",
  async (req, res) => {
    const connection = await db.getConnection();

    try {
      const bedId = Number(req.body.bedId);

      if (!Number.isInteger(bedId) || bedId <= 0) {
        return res.status(400).json({
          message: "Valid bed ID is required.",
        });
      }

      await connection.beginTransaction();

      const result = await processWaitingListForBed(
        connection,
        bedId
      );

      if (!result) {
        await connection.rollback();

        return res.status(404).json({
          message:
            "No active waiting-list request matches this available bed.",
        });
      }

      await connection.commit();

      return res.json({
        message:
          "Waiting-list request converted successfully. Patient was notified and can complete payment.",
        reservationId:
          result.waiting.reservation_id,
        bed: result.bed,
      });
    } catch (error) {
      try {
        await connection.rollback();
      } catch {}

      console.error(
        "Process waiting-list error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to process the waiting list.",
      });
    } finally {
      connection.release();
    }
  }
);

// =========================
// CREATE NOTIFICATION
// =========================

app.post("/api/notifications", async (req, res) => {
  try {
    const {
      patientId,
      title,
      message,
      type,
    } = req.body;

    if (!patientId || !title || !message) {
      return res.status(400).json({
        message:
          "Patient, title and message are required",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO notifications
      (
        patient_id,
        title,
        message,
        type
      )
      VALUES (?, ?, ?, ?)`,
      [
        patientId,
        title,
        message,
        type || "general",
      ]
    );

    res.status(201).json({
      message: "Notification created successfully",
      notificationId: result.insertId,
    });

  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    res.status(500).json({
      message: "Unable to create notification",
    });
  }
});


// =========================
// GET PATIENT NOTIFICATIONS
// =========================

app.get(
  "/api/notifications/:userId",
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const role = String(req.query.role || "patient")
        .trim()
        .toLowerCase();

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      if (role === "doctor") {
        const [notifications] = await db.execute(
          `SELECT id, title, message, type, is_read, created_at
           FROM notifications
           WHERE doctor_id = ?
           ORDER BY created_at DESC`,
          [userId]
        );

        return res.json(notifications);
      }

      const [notifications] = await db.execute(
        `SELECT id, title, message, type, is_read, created_at
         FROM notifications
         WHERE patient_id = ?
         ORDER BY created_at DESC`,
        [userId]
      );

      return res.json(notifications);
    } catch (error) {
      console.error("Fetch notifications error:", error);

      return res.status(500).json({
        message: "Unable to fetch notifications",
      });
    }
  }
);



// =========================
// MARK NOTIFICATION AS READ
// =========================

app.put(
  "/api/notifications/:id/read",
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await db.execute(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      res.json({
        message:
          "Notification marked as read",
      });

    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to update notification",
      });
    }
  }
);

// =========================
// WAITING-LIST PROMOTION
// =========================

async function processWaitingListForBed(
  connection,
  bedId
) {
  const [bedRows] = await connection.execute(
    `SELECT
       id,
       bed_number,
       bed_type,
       status
     FROM beds
     WHERE id = ?
     FOR UPDATE`,
    [bedId]
  );

  if (bedRows.length === 0) {
    return null;
  }

  const bed = bedRows[0];

  if (bed.status !== "Available") {
    return null;
  }

  const [waitingRows] = await connection.execute(
    `SELECT
       bw.id AS waiting_id,
       bw.reservation_id,
       bw.patient_id,
       br.department,
       br.bed_type,
       br.admission_date,
       br.duration_days
     FROM bed_waiting_list bw
     INNER JOIN bed_reservations br
       ON br.id = bw.reservation_id
     WHERE bw.status = 'Waiting'
       AND bw.expires_at > NOW()
       AND br.status = 'Waiting'
       AND LOWER(br.bed_type) = LOWER(?)
     ORDER BY bw.created_at ASC, bw.id ASC
     LIMIT 1
     FOR UPDATE`,
    [bed.bed_type]
  );

  if (waitingRows.length === 0) {
    return null;
  }

  const waiting = waitingRows[0];

  await connection.execute(
    `UPDATE beds
     SET status = 'Reserved'
     WHERE id = ?`,
    [bedId]
  );

  await connection.execute(
    `UPDATE bed_reservations
     SET bed_id = ?,
         status = 'Payment Pending',
         confirmed_at = NOW(),
         expires_at = NULL
     WHERE id = ?`,
    [bedId, waiting.reservation_id]
  );

  await connection.execute(
    `UPDATE bed_waiting_list
     SET status = 'Converted'
     WHERE id = ?
       AND status = 'Waiting'`,
    [waiting.waiting_id]
  );

  await connection.execute(
    `INSERT INTO notifications
     (patient_id, title, message, type)
     VALUES (?, ?, ?, ?)`,
    [
      waiting.patient_id,
      "Bed Now Available",
      `A suitable bed (${bed.bed_number}) is now available for reservation BR-${String(
        waiting.reservation_id
      ).padStart(
        4,
        "0"
      )}. Your request has been moved from the waiting list to Payment Pending. Please complete payment.`,
      "bed",
    ]
  );

  return {
    waiting,
    bed,
  };
}

// =========================
// BED WAITING LIST AUTO-EXPIRY
// =========================

async function processExpiredBedWaitingList() {
  try {
    const [expiredRows] = await db.execute(
      `SELECT
         id AS waiting_id,
         reservation_id,
         patient_id
       FROM bed_waiting_list
       WHERE status = 'Waiting'
         AND expires_at <= NOW()
       ORDER BY expires_at ASC`
    );

    for (const item of expiredRows) {
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        const [waitingRows] = await connection.execute(
          `SELECT id, reservation_id, patient_id, status
           FROM bed_waiting_list
           WHERE id = ?
           FOR UPDATE`,
          [item.waiting_id]
        );

        if (
          waitingRows.length === 0 ||
          waitingRows[0].status !== "Waiting"
        ) {
          await connection.rollback();
          continue;
        }

        await connection.execute(
          `UPDATE bed_waiting_list
           SET status = 'Expired'
           WHERE id = ?`,
          [item.waiting_id]
        );

        const [reservationRows] = await connection.execute(
          `SELECT id, patient_id, status
           FROM bed_reservations
           WHERE id = ?
           FOR UPDATE`,
          [item.reservation_id]
        );

        if (reservationRows.length > 0) {
          const reservation = reservationRows[0];

          if (
            String(reservation.status).toLowerCase() ===
            "waiting"
          ) {
            await connection.execute(
              `UPDATE bed_reservations
               SET status = 'Cancelled'
               WHERE id = ?`,
              [item.reservation_id]
            );

            await connection.execute(
              `INSERT INTO notifications
               (patient_id, title, message, type)
               VALUES (?, ?, ?, ?)`,
              [
                item.patient_id,
                "Bed Reservation Cancelled",
                `Your bed reservation request BR-${String(
                  item.reservation_id
                ).padStart(
                  4,
                  "0"
                )} has been cancelled because no bed became available within 24 hours.`,
                "bed",
              ]
            );
          }
        }

        await connection.commit();
      } catch (error) {
        try {
          await connection.rollback();
        } catch {}

        console.error(
          "Waiting-list expiry transaction error:",
          error
        );
      } finally {
        connection.release();
      }
    }

    if (expiredRows.length > 0) {
      console.log(
        `⏰ Processed ${expiredRows.length} expired waiting-list request(s).`
      );
    }
  } catch (error) {
    console.error(
      "Bed waiting-list expiry error:",
      error
    );
  }
}

// =========================
// PROCESS ALL AVAILABLE BEDS
// =========================

async function processAllAvailableBeds() {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [availableBeds] = await connection.execute(
      `SELECT id
       FROM beds
       WHERE status = 'Available'
       ORDER BY id ASC
       FOR UPDATE`
    );

    const promoted = [];

    for (const bed of availableBeds) {
      const result =
        await processWaitingListForBed(
          connection,
          bed.id
        );

      if (result) {
        promoted.push({
          reservationId:
            result.waiting.reservation_id,
          bedId: result.bed.id,
        });
      }
    }

    await connection.commit();

    if (promoted.length > 0) {
      console.log(
        `🔄 Promoted ${promoted.length} waiting-list request(s).`
      );
    }

    return promoted;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    console.error(
      "Process all available beds error:",
      error
    );

    return [];
  } finally {
    connection.release();
  }
}

// Get all beds for the admin panel.
app.get("/api/admin/beds", async (req, res) => {
  try {
    const [beds] = await db.execute(
      `SELECT
         id,
         bed_number,
         ward,
         bed_type,
         status,
         created_at
       FROM beds
       ORDER BY ward ASC, bed_number ASC`
    );

    return res.json(beds);
  } catch (error) {
    console.error(
      "Admin beds fetch error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to fetch beds.",
    });
  }
});

// =========================
// TEST DATABASE
// =========================

async function testDatabase() {
  try {
    const connection =
      await db.getConnection();

    console.log(
      "✅ MySQL database connected successfully"
    );

    connection.release();
  } catch (error) {
    console.error(
      "❌ MySQL connection failed:",
      error.message
    );
  }
}

// =========================
// START SERVER
// =========================


// =========================
// CONTACT MESSAGES
// =========================

// =========================
// GET USER SUPPORT REQUESTS
// =========================

app.get(
  "/api/support-requests/:userId",
  async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const role = String(
        req.query.role || "patient"
      ).trim().toLowerCase();

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      const [requests] = await db.execute(
        `SELECT
           id,
           user_id,
           user_role,
           name,
           email,
           phone,
           message,
           status,
           admin_reply,
           replied_at,
           created_at
         FROM contact_messages
         WHERE user_id = ?
           AND user_role = ?
         ORDER BY created_at DESC, id DESC`,
        [userId, role]
      );

      return res.json(requests);
    } catch (error) {
      console.error(
        "Fetch support requests error:",
        error
      );

      return res.status(500).json({
        message: "Unable to fetch support requests",
      });
    }
  }
);

app.post("/api/contact", async (req, res) => {
  try {
    const rawUserId = req.body.userId;
    const userId =
      rawUserId !== undefined &&
      rawUserId !== null &&
      rawUserId !== ""
        ? Number(rawUserId)
        : null;

    const userRole = String(req.body.userRole || "")
      .trim()
      .toLowerCase();

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim();
    const phone = String(req.body.phone || "").trim();
    const message = String(req.body.message || "").trim();

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        message: "Name, email, phone and message are required.",
      });
    }

    const safeUserId =
      Number.isInteger(userId) && userId > 0 ? userId : null;

    const safeRole =
      userRole === "patient" || userRole === "doctor"
        ? userRole
        : null;

    await db.execute(
      `INSERT INTO contact_messages
       (user_id, user_role, name, email, phone, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'New')`,
      [
        safeUserId,
        safeRole,
        name,
        email,
        phone,
        message,
      ]
    );

    return res.status(201).json({
      message:
        "Your problem has been sent to the admin successfully.",
    });
  } catch (error) {
    console.error("Contact message error:", error);

    return res.status(500).json({
      message: "Unable to save contact message.",
    });
  }
});

app.get("/api/admin/contact-messages", async (req, res) => {
  try {
    const [messages] = await db.execute(
      `SELECT
         id,
         user_id,
         user_role,
         name,
         email,
         phone,
         message,
         status,
         admin_reply,
         replied_at,
         created_at
       FROM contact_messages
       ORDER BY created_at DESC, id DESC`
    );

    return res.json(messages);
  } catch (error) {
    console.error("Fetch contact messages error:", error);

    return res.status(500).json({
      message: "Unable to fetch contact messages.",
    });
  }
});

app.put("/api/admin/contact-messages/:id/read", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      `UPDATE contact_messages
       SET status = 'Read'
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Contact message not found.",
      });
    }

    return res.json({
      message: "Contact message marked as read.",
    });
  } catch (error) {
    console.error("Mark contact message error:", error);

    return res.status(500).json({
      message: "Unable to update contact message.",
    });
  }
});

app.delete("/api/admin/contact-messages/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      `DELETE FROM contact_messages
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Contact message not found.",
      });
    }

    return res.json({
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact message error:", error);

    return res.status(500).json({
      message: "Unable to delete contact message.",
    });
  }
});

// =========================
// ADMIN REPLY TO CONTACT MESSAGE
// =========================

app.put(
  "/api/admin/contact-messages/:id/reply",
  async (req, res) => {
    try {
      const { id } = req.params;
      const reply = String(req.body.reply || "").trim();

      if (!reply) {
        return res.status(400).json({
          message: "Reply is required.",
        });
      }

      const [messages] = await db.execute(
        `SELECT user_id, user_role
         FROM contact_messages
         WHERE id = ?`,
        [id]
      );

      if (messages.length === 0) {
        return res.status(404).json({
          message: "Contact message not found.",
        });
      }

      const contactMessage = messages[0];

      await db.execute(
        `UPDATE contact_messages
         SET admin_reply = ?,
             replied_at = NOW(),
             status = 'Resolved'
         WHERE id = ?`,
        [reply, id]
      );

      const userId = Number(contactMessage.user_id);
      const role = String(contactMessage.user_role || "")
        .trim()
        .toLowerCase();

      if (
        Number.isInteger(userId) &&
        userId > 0 &&
        role === "patient"
      ) {
        await db.execute(
          `INSERT INTO notifications
           (patient_id, title, message, type)
           VALUES (?, ?, ?, ?)`,
          [
            userId,
            "Admin Replied",
            reply,
            "support",
          ]
        );
      }

      if (
        Number.isInteger(userId) &&
        userId > 0 &&
        role === "doctor"
      ) {
        await db.execute(
          `INSERT INTO notifications
           (patient_id, doctor_id, title, message, type)
           VALUES (NULL, ?, ?, ?, ?)`,
          [
            userId,
            "Admin Replied",
            reply,
            "support",
          ]
        );
      }

      return res.json({
        message:
          "Reply sent successfully. Message marked as resolved.",
      });
    } catch (error) {
      console.error("Admin reply error:", error);

      return res.status(500).json({
        message: error.message || "Unable to send admin reply.",
      });
    }
  }
);


const PORT = process.env.PORT || 5000;


// =========================
// BED RESERVATION PAYMENT
// =========================

app.post(
  "/api/bed-reservations/payment",
  async (req, res) => {
    const connection = await db.getConnection();

    try {
      const patientId = Number(req.body.patientId);
      const reservationId = Number(req.body.reservationId);
      const amount = Number(req.body.amount);
      const paymentMethod = String(
        req.body.paymentMethod || "Google Pay"
      ).trim();
      const transactionId = String(
        req.body.transactionId || `BED-TXN-${Date.now()}`
      ).trim();

      if (
        !Number.isInteger(patientId) ||
        patientId <= 0 ||
        !Number.isInteger(reservationId) ||
        reservationId <= 0
      ) {
        return res.status(400).json({
          message:
            "Valid patient and reservation IDs are required.",
        });
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
          message: "Valid payment amount is required.",
        });
      }

      if (!transactionId) {
        return res.status(400).json({
          message: "Transaction ID is required.",
        });
      }

      await connection.beginTransaction();

      const [reservationRows] =
        await connection.execute(
          `SELECT
             br.id,
             br.patient_id,
             br.bed_id,
             br.status,
             br.duration_days,
             b.bed_number
           FROM bed_reservations br
           LEFT JOIN beds b
             ON b.id = br.bed_id
           WHERE br.id = ?
             AND br.patient_id = ?
           FOR UPDATE`,
          [reservationId, patientId]
        );

      if (reservationRows.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          message:
            "Bed reservation not found for this patient.",
        });
      }

      const reservation =
        reservationRows[0];

      const reservationStatus =
        String(
          reservation.status || ""
        ).toLowerCase();

      if (
        reservationStatus !==
        "payment pending"
      ) {
        await connection.rollback();

        return res.status(409).json({
          message:
            "This bed reservation is not awaiting payment.",
        });
      }

      if (!reservation.bed_id) {
        await connection.rollback();

        return res.status(409).json({
          message:
            "No bed has been assigned to this reservation.",
        });
      }

      const [duplicatePaymentRows] =
        await connection.execute(
          `SELECT id
           FROM bed_payments
           WHERE transaction_id = ?
           LIMIT 1`,
          [transactionId]
        );

      if (duplicatePaymentRows.length > 0) {
        await connection.rollback();

        return res.status(409).json({
          message:
            "This transaction ID has already been used.",
        });
      }

      const [paymentRows] =
        await connection.execute(
          `INSERT INTO bed_payments
           (
             reservation_id,
             patient_id,
             amount,
             payment_method,
             transaction_id,
             status
           )
           VALUES (?, ?, ?, ?, ?, 'Paid')`,
          [
            reservationId,
            patientId,
            amount,
            paymentMethod,
            transactionId,
          ]
        );

      await connection.execute(
        `UPDATE bed_reservations
         SET status = 'Paid'
         WHERE id = ?`,
        [reservationId]
      );

      // The bed was already marked Reserved when admin confirmed it.
      // Keep it Reserved instead of changing it to Available.
      await connection.execute(
        `UPDATE beds
         SET status = 'Reserved'
         WHERE id = ?`,
        [reservation.bed_id]
      );

      await connection.execute(
        `INSERT INTO notifications
         (patient_id, title, message, type)
         VALUES (?, ?, ?, ?)`,
        [
          patientId,
          "Bed Payment Successful",
          `Payment successful for bed reservation BR-${String(
            reservationId
          ).padStart(
            4,
            "0"
          )}. Bed ${
            reservation.bed_number ||
            reservation.bed_id
          } is secured.`,
          "bed",
        ]
      );

      await connection.commit();

      return res.status(201).json({
        message:
          "Bed payment successful. Your reservation is secured.",
        paymentId: paymentRows.insertId,
        transactionId,
        reservation: {
          id: reservationId,
          patient_id: patientId,
          bed_id: reservation.bed_id,
          bed_number:
            reservation.bed_number || null,
          status: "Paid",
        },
      });
    } catch (error) {
      try {
        await connection.rollback();
      } catch {}

      console.error(
        "Bed payment error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to process bed payment.",
      });
    } finally {
      connection.release();
    }
  }
);


app.listen(PORT, async () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );

  await testDatabase();

  // Check waiting-list expiry every minute.
  setInterval(
    processExpiredBedWaitingList,
    60 * 1000
  );

  // Run one expiry check immediately on startup.
  await processExpiredBedWaitingList();


  await processAllAvailableBeds();

  setInterval(
    async () => {
      await processExpiredBedWaitingList();
      await processAllAvailableBeds();
    },
    60 * 1000
  );

});
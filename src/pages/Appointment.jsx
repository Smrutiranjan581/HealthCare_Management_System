import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";

function Appointment() {
  const [searchParams] = useSearchParams();

  const selectedDoctor = searchParams.get("doctor") || "";

  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState(selectedDoctor);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [mobile, setMobile] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const doctors = [
    {
      name: "Dr. Rahul Sharma",
      department: "Cardiology",
    },
    {
      name: "Dr. Priya Patel",
      department: "Neurology",
    },
    {
      name: "Dr. Arjun Mehta",
      department: "Orthopedics",
    },
    {
      name: "Dr. Sneha Das",
      department: "Pediatrics",
    },
    {
      name: "Dr. Vikash Rao",
      department: "Dermatology",
    },
    {
      name: "Dr. Ananya Singh",
      department: "Ophthalmology",
    },
  ];

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !department ||
      !doctor ||
      !date ||
      !time ||
      !patientName ||
      !mobile
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("Mobile number must contain exactly 10 digits.");
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      setError("Please login before booking an appointment.");
      return;
    }

    const user = JSON.parse(savedUser);

    try {
      setLoading(true);

      const response = await fetch(
        "https://healthcare-management-system-cjhw.onrender.com/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: user.id,
            doctorName: doctor,
            department: department,
            appointmentDate: date,
            appointmentTime: time,
            patientName: patientName,
            mobile: mobile,
            reason: reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to book appointment.");
        return;
      }

      setMessage(
        `Appointment booked successfully! Appointment ID: HC-${data.appointmentId}`
      );

      setDate("");
      setTime("");
      setPatientName("");
      setMobile("");
      setReason("");

    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-page">

      <motion.div
        className="appointment-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <p>BOOK YOUR VISIT</p>

        <h1>Book an Appointment</h1>

        <span>
          Choose your department, doctor and preferred time.
        </span>
      </motion.div>

      <motion.form
        className="appointment-card"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >

        {/* Department */}
        <div className="form-group">
          <label>Department *</label>

          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setDoctor("");
            }}
            required
          >
            <option value="">Select Department</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Dental Care">Dental Care</option>
            <option value="Ophthalmology">Ophthalmology</option>
            <option value="Dermatology">Dermatology</option>
          </select>
        </div>

        {/* Doctor */}
        <div className="form-group">
          <label>Doctor *</label>

          <select
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            required
          >
            <option value="">Select Doctor</option>

            {doctors
              .filter((item) =>
                department
                  ? item.department === department
                  : true
              )
              .map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>

        {/* Date + Time */}
        <div className="form-row">

          <div className="form-group">
            <label>Appointment Date *</label>

            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Preferred Time *</label>

            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            >
              <option value="">Select Available Time</option>
              <option value="09:00 AM">09:00 AM ✓</option>
              <option value="10:00 AM">10:00 AM ✓</option>
              <option value="11:00 AM" disabled>
                11:00 AM — Booked
              </option>
              <option value="02:00 PM">02:00 PM ✓</option>
              <option value="04:00 PM">04:00 PM ✓</option>
              <option value="05:00 PM">05:00 PM ✓</option>
            </select>
          </div>

        </div>

        {/* Patient */}
        <div className="form-row">

          <div className="form-group">
            <label>Patient Name *</label>

            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              required
            />
          </div>

          <div className="form-group">
            <label>Mobile Number *</label>

            <input
              type="tel"
              value={mobile}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);

                setMobile(value);
              }}
              placeholder="Enter 10-digit mobile number"
              inputMode="numeric"
              required
            />
          </div>

        </div>

        {/* Reason */}
        <div className="form-group">
          <label>Reason for Visit</label>

          <textarea
            rows="4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your concern..."
          />
        </div>

        {/* Error */}
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="form-success">
            {message}
          </div>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          className="confirm-appointment"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
        >
          {loading
            ? "Booking Appointment..."
            : "Confirm Appointment →"}
        </motion.button>

      </motion.form>
    </div>
  );
}

export default Appointment;
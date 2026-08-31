import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function CreateMedicalReport() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [summary, setSummary] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    const loggedInUser = JSON.parse(savedUser);

    if (loggedInUser.role !== "doctor") {
      window.location.href = "/login";
      return;
    }

    setUser(loggedInUser);

    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `https://healthcare-management-system-cjhw.onrender.com/api/doctor-appointments/${encodeURIComponent(
            loggedInUser.name
          )}`
        );

        const data = await response.json();

        if (response.ok) {
          setAppointments(data);
        }
      } catch (err) {
        console.error("Patient fetch error:", err);
      }
    };

    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !patientId ||
      !reportType ||
      !reportTitle ||
      !reportDate
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://healthcare-management-system-cjhw.onrender.com/api/medical-reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: Number(patientId),
            doctorName: user?.name,
            reportType,
            reportTitle,
            reportDate,
            summary,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to create report."
        );
        return;
      }

      setMessage(
        `Medical report created successfully! Report ID: HC-R${data.reportId}`
      );

      setPatientId("");
      setReportType("");
      setReportTitle("");
      setReportDate("");
      setSummary("");
    } catch (err) {
      console.error("Report error:", err);

      setError(
        "Unable to connect to server. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medical-report-page">

      {/* Header */}
      <motion.div
        className="report-header"
        initial={{
          opacity: 0,
          y: -30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <a
          href="/doctor-dashboard"
          className="back-link"
        >
          ← Back to Dashboard
        </a>

        <p>DOCTOR PORTAL</p>

        <h1>Create Medical Report</h1>

        <span>
          Add a medical report for your patient.
        </span>
      </motion.div>

      {/* Form */}
      <motion.form
        className="report-card"
        onSubmit={handleSubmit}
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >

        {/* Doctor */}
        <div className="report-doctor-box">

          <div className="report-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "D"}
          </div>

          <div>
            <span>Reporting Doctor</span>

            <strong>
              {user?.name || "Doctor"}
            </strong>
          </div>

        </div>

        <div className="report-divider"></div>

        {/* Patient */}
        <div className="form-group">

          <label>
            Patient *
          </label>

          <select
            value={patientId}
            onChange={(e) =>
              setPatientId(e.target.value)
            }
            required
          >
            <option value="">
              Select Patient
            </option>

            {appointments.map((appointment) => (
              <option
                key={appointment.patient_id}
                value={appointment.patient_id}
              >
                {appointment.patient_name}
              </option>
            ))}
          </select>

          {appointments.length === 0 && (
            <small className="field-note">
              No patients found from your appointments.
            </small>
          )}

        </div>

        {/* Report Type */}
        <div className="form-group">

          <label>
            Report Type *
          </label>

          <select
            value={reportType}
            onChange={(e) =>
              setReportType(e.target.value)
            }
            required
          >
            <option value="">
              Select Report Type
            </option>

            <option value="Blood Test">
              Blood Test
            </option>

            <option value="X-Ray">
              X-Ray
            </option>

            <option value="MRI">
              MRI
            </option>

            <option value="CT Scan">
              CT Scan
            </option>

            <option value="Ultrasound">
              Ultrasound
            </option>

            <option value="ECG">
              ECG
            </option>

            <option value="General Report">
              General Report
            </option>

            <option value="Other">
              Other
            </option>
          </select>

        </div>

        {/* Report Title */}
        <div className="form-group">

          <label>
            Report Title *
          </label>

          <input
            type="text"
            value={reportTitle}
            onChange={(e) =>
              setReportTitle(e.target.value)
            }
            placeholder="e.g. Complete Blood Count Report"
            required
          />

        </div>

        {/* Date */}
        <div className="form-group">

          <label>
            Report Date *
          </label>

          <input
            type="date"
            value={reportDate}
            onChange={(e) =>
              setReportDate(e.target.value)
            }
            required
          />

        </div>

        {/* Summary */}
        <div className="form-group">

          <label>
            Report Summary
          </label>

          <textarea
            rows="6"
            value={summary}
            onChange={(e) =>
              setSummary(e.target.value)
            }
            placeholder="Enter test findings, observations or report summary..."
          ></textarea>

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
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
          disabled={loading}
        >
          {loading
            ? "Saving Report..."
            : "Save Medical Report →"}
        </motion.button>

      </motion.form>
    </div>
  );
}

export default CreateMedicalReport;
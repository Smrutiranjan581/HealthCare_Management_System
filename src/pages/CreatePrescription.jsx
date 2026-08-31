import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function CreatePrescription() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");

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
    setDoctorName(loggedInUser.name);

    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/doctor-appointments/${encodeURIComponent(
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

  const handlePatientChange = (e) => {
    const selectedId = e.target.value;

    setPatientId(selectedId);

    const selectedPatient = appointments.find(
      (appointment) =>
        String(appointment.patient_id) === selectedId
    );

    if (selectedPatient) {
      setDiagnosis("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !patientId ||
      !medicineName ||
      !dosage ||
      !frequency ||
      !duration
    ) {
      setError(
        "Please fill all required prescription fields."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/prescriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: Number(patientId),
            doctorName,
            diagnosis,
            medicineName,
            dosage,
            frequency,
            duration,
            instructions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to create prescription."
        );
        return;
      }

      setMessage(
        `Prescription created successfully! Prescription ID: HC-P${data.prescriptionId}`
      );

      setPatientId("");
      setDiagnosis("");
      setMedicineName("");
      setDosage("");
      setFrequency("");
      setDuration("");
      setInstructions("");

    } catch (err) {
      console.error("Prescription error:", err);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-page">

      <motion.div
        className="prescription-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <a
          href="/doctor-dashboard"
          className="back-link"
        >
          ← Back to Dashboard
        </a>

        <p>DOCTOR PORTAL</p>

        <h1>Create Prescription</h1>

        <span>
          Create a digital prescription for your patient.
        </span>
      </motion.div>

      <motion.form
        className="prescription-card"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >

        {/* Doctor */}
        <div className="prescription-doctor-box">
          <div className="prescription-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "D"}
          </div>

          <div>
            <span>Prescribing Doctor</span>
            <strong>
              {user?.name || "Doctor"}
            </strong>
          </div>
        </div>

        <div className="prescription-divider"></div>

        {/* Patient */}
        <div className="form-group">
          <label>Patient *</label>

          <select
            value={patientId}
            onChange={handlePatientChange}
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

        {/* Diagnosis */}
        <div className="form-group">
          <label>Diagnosis</label>

          <input
            type="text"
            value={diagnosis}
            onChange={(e) =>
              setDiagnosis(e.target.value)
            }
            placeholder="Enter diagnosis"
          />
        </div>

        {/* Medicine */}
        <div className="form-group">
          <label>Medicine Name *</label>

          <input
            type="text"
            value={medicineName}
            onChange={(e) =>
              setMedicineName(e.target.value)
            }
            placeholder="e.g. Paracetamol"
            required
          />
        </div>

        {/* Dosage + Frequency */}
        <div className="form-row">

          <div className="form-group">
            <label>Dosage *</label>

            <input
              type="text"
              value={dosage}
              onChange={(e) =>
                setDosage(e.target.value)
              }
              placeholder="e.g. 500 mg"
              required
            />
          </div>

          <div className="form-group">
            <label>Frequency *</label>

            <select
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value)
              }
              required
            >
              <option value="">
                Select Frequency
              </option>

              <option value="Once daily">
                Once daily
              </option>

              <option value="Twice daily">
                Twice daily
              </option>

              <option value="Three times daily">
                Three times daily
              </option>

              <option value="Morning only">
                Morning only
              </option>

              <option value="Morning & Night">
                Morning & Night
              </option>

              <option value="As needed">
                As needed
              </option>
            </select>
          </div>

        </div>

        {/* Duration */}
        <div className="form-group">
          <label>Duration *</label>

          <select
            value={duration}
            onChange={(e) =>
              setDuration(e.target.value)
            }
            required
          >
            <option value="">
              Select Duration
            </option>

            <option value="3 days">
              3 days
            </option>

            <option value="5 days">
              5 days
            </option>

            <option value="7 days">
              7 days
            </option>

            <option value="10 days">
              10 days
            </option>

            <option value="14 days">
              14 days
            </option>

            <option value="30 days">
              30 days
            </option>
          </select>
        </div>

        {/* Instructions */}
        <div className="form-group">
          <label>Instructions</label>

          <textarea
            rows="5"
            value={instructions}
            onChange={(e) =>
              setInstructions(e.target.value)
            }
            placeholder="Example: Take after food with water."
          ></textarea>
        </div>

        {/* Messages */}
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

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
            ? "Saving Prescription..."
            : "Save Prescription →"}
        </motion.button>

      </motion.form>

    </div>
  );
}

export default CreatePrescription;
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Patients
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Doctor profile settings
  const [editProfile, setEditProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileMobile, setProfileMobile] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileSpecialization, setProfileSpecialization] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password
  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    const loggedInUser = JSON.parse(savedUser);

    // Only doctor can access this dashboard
    if (loggedInUser.role !== "doctor") {
      window.location.href = "/login";
      return;
    }

    setUser(loggedInUser);

    setProfileName(loggedInUser.name || "");
    setProfileEmail(loggedInUser.email || "");
    setProfileMobile(loggedInUser.mobile || "");
    setProfileDob(loggedInUser.date_of_birth || "");
    setProfileGender(loggedInUser.gender || "");
    setProfileSpecialization(
      loggedInUser.specialization || ""
    );
    setProfilePhoto(loggedInUser.profile_photo || "");
    setProfilePhotoPreview(
      loggedInUser.profile_photo || ""
    );

    const fetchDoctorAppointments = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/doctor-appointments/${encodeURIComponent(
            loggedInUser.name
          )}`
        );

        const data = await response.json();

        if (response.ok) {
          setAppointments(data);
        } else {
          console.error(
            "Failed to fetch doctor appointments:",
            data
          );
        }
      } catch (error) {
        console.error(
          "Doctor appointments error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAppointments();
  }, []);

  const startProfileEdit = () => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setProfileMobile(user?.mobile || "");
    setProfileDob(user?.date_of_birth || "");
    setProfileGender(user?.gender || "");
    setProfileSpecialization(
      user?.specialization || ""
    );
    setProfilePhoto(user?.profile_photo || "");
    setProfilePhotoPreview(
      user?.profile_photo || ""
    );
    setProfileError("");
    setProfileSuccess("");
    setEditProfile(true);
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError(
        "Profile photo must be smaller than 2MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;
      setProfilePhoto(result);
      setProfilePhotoPreview(result);
      setProfileError("");
    };

    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    const mobileRegex = /^[0-9]{10}$/;

    if (!profileName.trim()) {
      setProfileError("Please enter your full name.");
      return;
    }

    if (!mobileRegex.test(profileMobile.trim())) {
      setProfileError(
        "Mobile number must contain exactly 10 digits."
      );
      return;
    }

    if (!profileEmail.trim()) {
      setProfileError(
        "Please enter your email address."
      );
      return;
    }

    if (!user?.id) {
      setProfileError(
        "User session not found. Please login again."
      );
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError("");
      setProfileSuccess("");

      const response = await fetch(
        `http://localhost:5000/api/users/${user.id}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: profileName.trim(),
            mobile: profileMobile.trim(),
            email: profileEmail.trim(),
            dateOfBirth: profileDob || null,
            gender: profileGender || null,
            specialization:
              profileSpecialization.trim() || null,
            profilePhoto:
              profilePhoto || null,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update profile."
        );
      }

      const updatedUser = {
        ...user,
        name: profileName.trim(),
        mobile: profileMobile.trim(),
        email: profileEmail.trim(),
        date_of_birth: profileDob || null,
        gender: profileGender || null,
        specialization:
          profileSpecialization.trim() || null,
        profile_photo: profilePhoto || null,
      };

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setProfileSuccess(
        "Profile updated successfully."
      );

      setEditProfile(false);
    } catch (error) {
      console.error(
        "Doctor profile update error:",
        error
      );

      setProfileError(
        error.message ||
          "Unable to connect to server."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const todayString = new Date()
    .toISOString()
    .split("T")[0];

  const todayAppointments = appointments.filter(
    (appointment) => {
      const appointmentDate = new Date(
        appointment.appointment_date
      )
        .toISOString()
        .split("T")[0];

      return (
        appointmentDate === todayString &&
        appointment.status !== "Cancelled"
      );
    }
  );

  const totalPatients = new Set(
    appointments.map(
      (appointment) => appointment.patient_id
    )
  ).size;

  const patients = Array.from(
    new Map(
      appointments.map((appointment) => [
        appointment.patient_id,
        {
          patient_id: appointment.patient_id,
          patient_name:
            appointment.patient_name || "Unknown Patient",
          mobile: appointment.mobile || "-",
          appointments: appointments.filter(
            (item) =>
              Number(item.patient_id) ===
              Number(appointment.patient_id)
          ),
        },
      ])
    ).values()
  );

  const filteredPatients = patients.filter((patient) => {
    const query = patientSearch.trim().toLowerCase();

    if (!query) return true;

    return (
      patient.patient_name
        .toLowerCase()
        .includes(query) ||
      patient.mobile
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <div className="doctor-dashboard">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          🏥 Health<span>Care+</span>
        </div>

        <nav>

          <a
            className="active"
            href="/doctor-dashboard"
          >
            🏠 Overview
          </a>

          <a href="#appointments">
            📅 Appointments
          </a>

          <a href="#patients">
            👥 Patients
          </a>

          <a href="#prescriptions">
            💊 Prescriptions
          </a>

          <a href="/create-medical-report">
            📄 Medical Reports
          </a>


        </nav>

      </aside>

      {/* Main */}
      <main className="dashboard-main">

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "18px",
          }}
        >
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "10px 15px",
              border: "1px solid #dbeafe",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#2563eb",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 800,
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
            }}
          >
            ← Back to Home
          </a>
        </div>

        {/* Topbar */}
        <div className="dashboard-topbar">

          <div>
            <p>GOOD MORNING 👋</p>

            <h1>
              Welcome,{" "}
              {user?.name || "Doctor"}
            </h1>
          </div>

          <div className="patient-profile">

            <div className="patient-avatar">
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
                  alt="Doctor Profile"
                  className="patient-avatar-image"
                />
              ) : (
                user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : "D"
              )}
            </div>

            <div>
              <strong>
                {user?.name || "Doctor"}
              </strong>

              <span>
                Medical Specialist
              </span>
            </div>

          </div>

        </div>

        {/* Statistics */}
        <div className="dashboard-stats">

          <motion.div
            className="dashboard-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="stat-icon">
              📅
            </div>

            <span>
              Today's Appointments
            </span>

            <h2>
              {todayAppointments.length}
            </h2>
          </motion.div>

          <motion.div
            className="dashboard-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="stat-icon">
              👥
            </div>

            <span>
              Total Patients
            </span>

            <h2>
              {totalPatients}
            </h2>
          </motion.div>

          <motion.div
            className="dashboard-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="stat-icon">
              ✅
            </div>

            <span>
              Completed Appointments
            </span>

            <h2>
              {
                appointments.filter(
                  (appointment) =>
                    appointment.status === "Completed"
                ).length
              }
            </h2>
          </motion.div>

          <motion.div
            className="dashboard-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="stat-icon">
              ⏳
            </div>

            <span>
              Pending
            </span>

            <h2>
              {
                appointments.filter(
                  (appointment) =>
                    appointment.status === "Pending"
                ).length
              }
            </h2>
          </motion.div>

        </div>

        {/* Today's Appointments */}
        <section
          className="dashboard-section"
          id="appointments"
        >

          <div className="dashboard-section-header">

            <h2>
              Today's Appointments
            </h2>

            <span>
              {todayAppointments.length} appointments
            </span>

          </div>

          {loading ? (

            <div className="appointment-loading">

              <div className="loading-spinner"></div>

              <p>
                Loading appointments...
              </p>

            </div>

          ) : todayAppointments.length === 0 ? (

            <div className="no-appointments">

              <div className="empty-icon">
                📅
              </div>

              <h3>
                No appointments today
              </h3>

              <p>
                You don't have any appointments scheduled for today.
              </p>

            </div>

          ) : (

            <div className="doctor-appointment-list">

              {todayAppointments.map(
                (appointment) => (

                  <motion.div
                    className="doctor-appointment-item"
                    key={appointment.id}
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    whileHover={{
                      y: -2,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                  >

                    {/* Patient Avatar */}
                    <div className="dashboard-doctor-avatar">
                      {appointment.patient_name
                        ? appointment.patient_name
                            .charAt(0)
                            .toUpperCase()
                        : "P"}
                    </div>

                    {/* Patient Info */}
                    <div className="doctor-patient-info">

                      <h3>
                        {appointment.patient_name}
                      </h3>

                      <p>
                        {appointment.reason ||
                          "General Consultation"}
                      </p>

                    </div>

                    {/* Time */}
                    <span className="doctor-time">
                      🕐{" "}
                      {appointment.appointment_time}
                    </span>

                    {/* Status */}
                    <span
                      className={
                        appointment.status ===
                        "Confirmed"
                          ? "confirmed"
                          : appointment.status ===
                            "Cancelled"
                          ? "cancelled-status"
                          : appointment.status ===
                            "Completed"
                          ? "completed-status"
                          : "appointment-status"
                      }
                    >
                      {appointment.status}
                    </span>

                    {/* View */}
                    <button
                      className="view-patient-btn"
                      onClick={() =>
                        alert(
                          `Patient: ${appointment.patient_name}\nMobile: ${appointment.mobile}\nReason: ${
                            appointment.reason ||
                            "General Consultation"
                          }`
                        )
                      }
                    >
                      View
                    </button>

                  </motion.div>

                )
              )}

            </div>

          )}

        </section>

        {/* All Appointments */}
        <section className="dashboard-section">

          <div className="dashboard-section-header">

            <h2>
              All Appointments
            </h2>

            <span>
              {appointments.length} total
            </span>

          </div>

          {appointments.length === 0 ? (

            <div className="no-appointments">

              <h3>
                No appointments found
              </h3>

              <p>
                Your appointment list is empty.
              </p>

            </div>

          ) : (

            <div className="doctor-appointment-list">

              {appointments.map(
                (appointment) => (

                  <motion.div
                    className="doctor-appointment-item"
                    key={`all-${appointment.id}`}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                  >

                    <div className="dashboard-doctor-avatar">
                      {appointment.patient_name
                        ?.charAt(0)
                        .toUpperCase() || "P"}
                    </div>

                    <div className="doctor-patient-info">

                      <h3>
                        {appointment.patient_name}
                      </h3>

                      <p>
                        {appointment.department}
                      </p>

                    </div>

                    <span className="doctor-time">
                      📅{" "}
                      {new Date(
                        appointment.appointment_date
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </span>

                    <span className="doctor-time">
                      🕐{" "}
                      {appointment.appointment_time}
                    </span>

                    <span
                      className={
                        appointment.status ===
                        "Confirmed"
                          ? "confirmed"
                          : appointment.status ===
                            "Cancelled"
                          ? "cancelled-status"
                          : appointment.status ===
                            "Completed"
                          ? "completed-status"
                          : "appointment-status"
                      }
                    >
                      {appointment.status}
                    </span>

                  </motion.div>

                )
              )}

            </div>

          )}

        </section>

        {/* Patients */}
        <section
          className="dashboard-section"
          id="patients"
        >
          <div className="doctor-section-heading-row">
            <div>
              <h2>My Patients</h2>
              <p>
                Patients who have appointments with you.
              </p>
            </div>

            <div className="doctor-patient-count">
              {patients.length} patients
            </div>
          </div>

          <div className="doctor-patient-search">
            <span>🔎</span>

            <input
              type="text"
              value={patientSearch}
              onChange={(e) =>
                setPatientSearch(e.target.value)
              }
              placeholder="Search by patient name or mobile number..."
            />
          </div>

          {filteredPatients.length === 0 ? (
            <div className="doctor-empty">
              <div className="empty-icon">
                👥
              </div>

              <h3>
                No patients found
              </h3>

              <p>
                Try a different name or mobile number.
              </p>
            </div>
          ) : (
            <div className="doctor-patients-grid">
              {filteredPatients.map((patient) => (
                <motion.div
                  className="doctor-patient-card"
                  key={patient.patient_id}
                  whileHover={{ y: -3 }}
                >
                  <div className="doctor-patient-card-top">
                    <div className="doctor-patient-large-avatar">
                      {patient.patient_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="patient-appointment-count">
                      {patient.appointments.length}{" "}
                      {patient.appointments.length === 1
                        ? "appointment"
                        : "appointments"}
                    </span>
                  </div>

                  <h3>
                    {patient.patient_name}
                  </h3>

                  <p>
                    📱 {patient.mobile}
                  </p>

                  <button
                    className="doctor-view-patient-btn"
                    onClick={() =>
                      setSelectedPatient(patient)
                    }
                  >
                    View Details →
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section
          className="dashboard-section"
          id="prescriptions"
        >

          <div className="dashboard-section-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="doctor-quick-actions">

            {/* Create Prescription */}
            <motion.a
              href="/create-prescription"
              whileHover={{ y: -5 }}
              className="doctor-action-card"
            >
              <div>💊</div>

              <h3>
                Create Prescription
              </h3>

              <p>
                Write a new prescription
                for a patient.
              </p>

            </motion.a>

            {/* Patients */}
            <motion.a
              href="#patients"
              whileHover={{ y: -5 }}
              className="doctor-action-card"
            >
              <div>👥</div>

              <h3>
                View Patients
              </h3>

              <p>
                Access patient history
                and details.
              </p>

            </motion.a>

            {/* Reports */}
            <motion.a
              href="#reports"
              whileHover={{ y: -5 }}
              className="doctor-action-card"
            >
              <div>📄</div>

              <h3>
                Medical Reports
              </h3>

              <p>
                Review patient medical
                reports.
              </p>

            </motion.a>

          </div>

        </section>

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div className="modal-overlay">
            <motion.div
              className="doctor-patient-modal"
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <button
                className="modal-close"
                onClick={() =>
                  setSelectedPatient(null)
                }
              >
                ×
              </button>

              <div className="doctor-patient-modal-header">
                <div className="doctor-patient-large-avatar">
                  {selectedPatient.patient_name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2>
                    {selectedPatient.patient_name}
                  </h2>

                  <p>
                    Patient ID: #
                    {selectedPatient.patient_id}
                  </p>
                </div>
              </div>

              <div className="doctor-patient-contact-card">
                <div>
                  <span>Mobile</span>
                  <strong>
                    {selectedPatient.mobile}
                  </strong>
                </div>

                <div>
                  <span>Total Appointments</span>
                  <strong>
                    {selectedPatient.appointments.length}
                  </strong>
                </div>
              </div>

              <h3 className="doctor-patient-history-title">
                Appointment History
              </h3>

              <div className="doctor-patient-history">
                {selectedPatient.appointments
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(
                        b.appointment_date
                      ) -
                      new Date(
                        a.appointment_date
                      )
                  )
                  .map((appointment) => (
                    <div
                      className="doctor-patient-history-item"
                      key={appointment.id}
                    >
                      <div>
                        <strong>
                          {new Date(
                            appointment.appointment_date
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </strong>

                        <span>
                          🕐{" "}
                          {appointment.appointment_time}
                        </span>

                        <p>
                          {appointment.reason ||
                            "General Consultation"}
                        </p>
                      </div>

                      <span
                        className={
                          appointment.status ===
                          "Confirmed"
                            ? "confirmed"
                            : appointment.status ===
                              "Cancelled"
                            ? "cancelled-status"
                            : appointment.status ===
                              "Completed"
                            ? "completed-status"
                            : "appointment-status"
                        }
                      >
                        {appointment.status}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="doctor-patient-modal-actions">
                <button
                  className="modal-cancel"
                  onClick={() =>
                    setSelectedPatient(null)
                  }
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Settings */}
        <section
          className="dashboard-section doctor-settings-section"
          id="settings"
          style={{ display: "none" }}
        >
          <div className="doctor-section-heading-row">
            <div>
              <h2>Settings</h2>
              <p>
                Manage your professional profile and account.
              </p>
            </div>

            {!editProfile && (
              <button
                className="edit-profile-btn"
                onClick={startProfileEdit}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          <div className="settings-card doctor-settings-card">
            <div className="settings-profile-top">
              <div className="profile-photo-wrapper">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview}
                    alt="Doctor Profile"
                    className="profile-photo"
                  />
                ) : (
                  <div className="settings-profile-avatar">
                    {user?.name
                      ? user.name
                          .charAt(0)
                          .toUpperCase()
                      : "D"}
                  </div>
                )}
              </div>

              {editProfile && (
                <div className="profile-photo-controls">
                  <label className="change-photo-btn">
                    📷 Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      hidden
                    />
                  </label>

                  {profilePhotoPreview && (
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => {
                        setProfilePhoto("");
                        setProfilePhotoPreview("");
                      }}
                    >
                      Remove Photo
                    </button>
                  )}

                  <small>
                    JPG, PNG or WEBP • Max 2MB
                  </small>
                </div>
              )}
            </div>

            <div className="settings-profile-info">
              <div className="settings-profile-heading">
                <div>
                  <h3>
                    Professional Profile
                  </h3>
                  <p>
                    Keep your doctor information up to date.
                  </p>
                </div>
              </div>

              <div className="settings-grid">
                <div>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={
                      editProfile
                        ? profileName
                        : user?.name || ""
                    }
                    onChange={(e) =>
                      setProfileName(e.target.value)
                    }
                    readOnly={!editProfile}
                  />
                </div>

                <div>
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={
                      editProfile
                        ? profileDob
                        : user?.date_of_birth || ""
                    }
                    onChange={(e) =>
                      setProfileDob(e.target.value)
                    }
                    readOnly={!editProfile}
                  />
                </div>

                <div>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    value={
                      editProfile
                        ? profileMobile
                        : user?.mobile || ""
                    }
                    onChange={(e) =>
                      setProfileMobile(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    readOnly={!editProfile}
                    inputMode="numeric"
                    maxLength="10"
                  />
                </div>

                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={
                      editProfile
                        ? profileEmail
                        : user?.email || ""
                    }
                    onChange={(e) =>
                      setProfileEmail(e.target.value)
                    }
                    readOnly={!editProfile}
                  />
                </div>

                <div>
                  <label>Gender</label>

                  {editProfile ? (
                    <select
                      value={profileGender}
                      onChange={(e) =>
                        setProfileGender(
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Gender
                      </option>
                      <option value="Male">
                        Male
                      </option>
                      <option value="Female">
                        Female
                      </option>
                      <option value="Other">
                        Other
                      </option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={
                        user?.gender ||
                        "Not specified"
                      }
                      readOnly
                    />
                  )}
                </div>

                <div>
                  <label>Specialization</label>

                  <input
                    type="text"
                    value={
                      editProfile
                        ? profileSpecialization
                        : user?.specialization ||
                          "Not specified"
                    }
                    onChange={(e) =>
                      setProfileSpecialization(
                        e.target.value
                      )
                    }
                    readOnly={!editProfile}
                    placeholder="e.g. Cardiologist"
                  />
                </div>

                <div>
                  <label>Account Type</label>
                  <input
                    type="text"
                    value="Doctor"
                    readOnly
                  />
                </div>
              </div>

              {profileError && (
                <div className="profile-message error">
                  ❌ {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="profile-message success">
                  ✅ {profileSuccess}
                </div>
              )}

              {editProfile && (
                <div className="profile-edit-actions">
                  <button
                    className="profile-cancel-btn"
                    onClick={() => {
                      setEditProfile(false);
                      setProfileError("");
                      setProfileSuccess("");

                      setProfileName(
                        user?.name || ""
                      );
                      setProfileEmail(
                        user?.email || ""
                      );
                      setProfileMobile(
                        user?.mobile || ""
                      );
                      setProfileDob(
                        user?.date_of_birth || ""
                      );
                      setProfileGender(
                        user?.gender || ""
                      );
                      setProfileSpecialization(
                        user?.specialization || ""
                      );
                      setProfilePhoto(
                        user?.profile_photo || ""
                      );
                      setProfilePhotoPreview(
                        user?.profile_photo || ""
                      );
                    }}
                    disabled={savingProfile}
                  >
                    Cancel
                  </button>

                  <button
                    className="profile-save-btn"
                    onClick={saveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile
                      ? "Saving..."
                      : "💾 Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="settings-security-card">
            <div>
              <div className="security-icon">
                🔐
              </div>

              <div>
                <h3>Security</h3>
                <p>
                  Manage your account password securely.
                </p>
              </div>
            </div>

            <button
              className="change-password-btn"
              onClick={() => {
                setPasswordModal(true);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setPasswordError("");
                setPasswordSuccess("");
              }}
            >
              🔐 Change Password
            </button>
          </div>
        </section>

        {/* Change Password Modal */}
        {passwordModal && (
          <div className="modal-overlay">
            <motion.div
              className="password-modal"
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <button
                className="modal-close"
                onClick={() => {
                  if (!changingPassword) {
                    setPasswordModal(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }
                }}
                disabled={changingPassword}
              >
                ×
              </button>

              <div className="modal-icon">
                🔐
              </div>

              <h2>Change Password</h2>

              <p className="modal-doctor">
                Update your doctor account password securely.
              </p>

              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                placeholder="Enter current password"
                autoComplete="current-password"
                disabled={changingPassword}
              />

              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={changingPassword}
              />

              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={changingPassword}
              />

              <div className="password-rules">
                <span className={newPassword.length >= 8 ? "valid" : ""}>
                  {newPassword.length >= 8 ? "✓" : "○"} 8+ characters
                </span>
                <span className={/[A-Z]/.test(newPassword) ? "valid" : ""}>
                  {/[A-Z]/.test(newPassword) ? "✓" : "○"} Uppercase
                </span>
                <span className={/[a-z]/.test(newPassword) ? "valid" : ""}>
                  {/[a-z]/.test(newPassword) ? "✓" : "○"} Lowercase
                </span>
                <span className={/\d/.test(newPassword) ? "valid" : ""}>
                  {/\d/.test(newPassword) ? "✓" : "○"} Number
                </span>
                <span className={/[@$!%*?&#]/.test(newPassword) ? "valid" : ""}>
                  {/[@$!%*?&#]/.test(newPassword) ? "✓" : "○"} Special character
                </span>
              </div>

              {passwordError && (
                <div className="password-message error">
                  ❌ {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="password-message success">
                  ✅ {passwordSuccess}
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="modal-cancel"
                  onClick={() => {
                    if (!changingPassword) {
                      setPasswordModal(false);
                      setPasswordError("");
                      setPasswordSuccess("");
                    }
                  }}
                  disabled={changingPassword}
                >
                  Cancel
                </button>

                <motion.button
                  className="save-reschedule"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={changingPassword}
                  onClick={async () => {
                    const passwordRegex =
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

                    if (!currentPassword) {
                      setPasswordError(
                        "Enter your current password."
                      );
                      return;
                    }

                    if (!passwordRegex.test(newPassword)) {
                      setPasswordError(
                        "Password must be 8+ characters with uppercase, lowercase, number and special character."
                      );
                      return;
                    }

                    if (newPassword !== confirmNewPassword) {
                      setPasswordError(
                        "New passwords do not match."
                      );
                      return;
                    }

                    if (newPassword === currentPassword) {
                      setPasswordError(
                        "New password must be different from current password."
                      );
                      return;
                    }

                    if (!user?.id) {
                      setPasswordError(
                        "User session not found. Please login again."
                      );
                      return;
                    }

                    try {
                      setChangingPassword(true);
                      setPasswordError("");
                      setPasswordSuccess("");

                      const response = await fetch(
                        `http://localhost:5000/api/users/${user.id}/password`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type":
                              "application/json",
                          },
                          body: JSON.stringify({
                            currentPassword,
                            newPassword,
                          }),
                        }
                      );

                      let data = {};
                      try {
                        data = await response.json();
                      } catch {
                        data = {};
                      }

                      if (!response.ok) {
                        throw new Error(
                          data.message ||
                            "Unable to change password."
                        );
                      }

                      setPasswordSuccess(
                        "Password changed successfully."
                      );

                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmNewPassword("");

                      setTimeout(() => {
                        setPasswordModal(false);
                        setPasswordSuccess("");
                      }, 1500);
                    } catch (error) {
                      console.error(
                        "Doctor password change error:",
                        error
                      );

                      setPasswordError(
                        error.message ||
                          "Unable to connect to server."
                      );
                    } finally {
                      setChangingPassword(false);
                    }
                  }}
                >
                  {changingPassword
                    ? "Updating..."
                    : "Change Password"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

      </main>


    </div>
  );
}

export default DoctorDashboard;
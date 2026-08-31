import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function AdminDashboard() {
  const [user, setUser] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);

  const [doctorSearch, setDoctorSearch] = useState("");
const [patientSearch, setPatientSearch] = useState("");

  const [reports, setReports] = useState([]);

  const [payments, setPayments] = useState([]);
  const [bedReservations, setBedReservations] = useState([]);
  const [bedLoading, setBedLoading] = useState(false);
  const [bedActionLoading, setBedActionLoading] = useState(null);
  const [bedAvailability, setBedAvailability] = useState(null);
  const [selectedBedReservation, setSelectedBedReservation] = useState(null);
  const [bedSuccessPopup, setBedSuccessPopup] = useState("");


  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    reports: 0,
  });

  const [loading, setLoading] = useState(true);

  const [replyPopupOpen, setReplyPopupOpen] =
    useState(false);

  const [selectedMessage, setSelectedMessage] =
    useState(null);

  const [adminReply, setAdminReply] =
    useState("");

  const [replySending, setReplySending] =
    useState(false);

  const [replyMessage, setReplyMessage] =
    useState("");

  const [detailsPopupOpen, setDetailsPopupOpen] =
    useState(false);

  const [selectedSupportMessage, setSelectedSupportMessage] =
    useState(null);

  const [supportDetails, setSupportDetails] =
    useState(null);

  const [supportSearch, setSupportSearch] =
    useState("");

  const [supportIssueFilter, setSupportIssueFilter] =
    useState("all");

  const [supportStatusFilter, setSupportStatusFilter] =
    useState("all");

  const [supportRoleFilter, setSupportRoleFilter] =
    useState("all");


  useEffect(() => {
    let mounted = true;

    const getJson = async (url) => {
      try {
        const response = await fetch(url);
        const data = await response.json();

        return {
          ok: response.ok,
          data,
        };
      } catch (error) {
        console.error(`API fetch failed: ${url}`, error);
        return {
          ok: false,
          data: null,
        };
      }
    };

    const loadDashboard = async () => {
      try {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
          window.location.href = "/login";
          return;
        }

        const loggedInUser = JSON.parse(savedUser);

        const role = String(
          loggedInUser?.role || ""
        )
          .trim()
          .toLowerCase();

        if (role !== "admin") {
          window.location.href = "/login";
          return;
        }

        if (mounted) {
          setUser(loggedInUser);
        }

        const [
          appointmentsResult,
          doctorsResult,
          patientsResult,
          statsResult,
          reportsResult,
          contactMessagesResult,
          paymentsResult,
          bedsResult,
        ] = await Promise.all([
          getJson(
            "https://healthcare-management-system-cjhw.onrender.com/api/admin/appointments"
          ),
          getJson(
            "https://healthcare-management-system-cjhw.onrender.com/api/admin/doctors"
          ),
          getJson(
            "https://healthcare-management-system-cjhw.onrender.com/api/admin/patients"
          ),
          getJson(
            "https://healthcare-management-system-cjhw.onrender.com/api/admin/stats"
          ),
          getJson(
            "https://healthcare-management-system-cjhw.onrender.com/api/admin/reports"
          ),
          getJson(
            "https://healthcare-management-system-cjhw.onrender.com/api/admin/contact-messages"
          ),
          getJson(
            "https://healthcare-management-system-cjhw.onrender.com/api/admin/payments"
          ),
          getJson(
            "https://healthcare-management-system-cjhw.onrender.com/api/admin/bed-reservations"
          ),
        ]);

        if (!mounted) return;

        if (appointmentsResult.ok) {
          setAppointments(
            Array.isArray(appointmentsResult.data)
              ? appointmentsResult.data
              : []
          );
        }

        if (doctorsResult.ok) {
          setDoctors(
            Array.isArray(doctorsResult.data)
              ? doctorsResult.data
              : []
          );
        }

        if (patientsResult.ok) {
          setPatients(
            Array.isArray(patientsResult.data)
              ? patientsResult.data
              : []
          );
        }

        if (statsResult.ok) {
          setStats({
            doctors:
              Number(statsResult.data?.doctors) || 0,
            patients:
              Number(statsResult.data?.patients) || 0,
            appointments:
              Number(statsResult.data?.appointments) || 0,
            reports:
              Number(statsResult.data?.reports) || 0,
          });
        }

        if (reportsResult.ok) {
          setReports(
            Array.isArray(reportsResult.data)
              ? reportsResult.data
              : []
          );
        }

        if (contactMessagesResult.ok) {
          setContactMessages(
            Array.isArray(contactMessagesResult.data)
              ? contactMessagesResult.data
              : []
          );
        }

        if (paymentsResult.ok) {
          setPayments(
            Array.isArray(paymentsResult.data)
              ? paymentsResult.data
              : []
          );
        }

        if (bedsResult.ok) {
          setBedReservations(
            Array.isArray(bedsResult.data)
              ? bedsResult.data
              : []
          );
        }
      } catch (error) {
        console.error(
          "Admin dashboard loading error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
          setBedLoading(false);
        }
      }
    };

    loadDashboard();

    const refreshSupportMessages = async () => {
      const result = await getJson(
        "https://healthcare-management-system-cjhw.onrender.com/api/admin/contact-messages"
      );

      if (mounted && result.ok) {
        setContactMessages(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      }
    };

    const refreshRegisteredUsers = async () => {
      const [
        doctorsResult,
        patientsResult,
        statsResult,
      ] = await Promise.all([
        getJson(
          "https://healthcare-management-system-cjhw.onrender.com/api/admin/doctors"
        ),
        getJson(
          "https://healthcare-management-system-cjhw.onrender.com/api/admin/patients"
        ),
        getJson(
          "https://healthcare-management-system-cjhw.onrender.com/api/admin/stats"
        ),
      ]);

      if (!mounted) return;

      if (doctorsResult.ok) {
        setDoctors(
          Array.isArray(doctorsResult.data)
            ? doctorsResult.data
            : []
        );
      }

      if (patientsResult.ok) {
        setPatients(
          Array.isArray(patientsResult.data)
            ? patientsResult.data
            : []
        );
      }

      if (statsResult.ok) {
        setStats({
          doctors:
            Number(statsResult.data?.doctors) || 0,
          patients:
            Number(statsResult.data?.patients) || 0,
          appointments:
            Number(statsResult.data?.appointments) || 0,
          reports:
            Number(statsResult.data?.reports) || 0,
        });
      }
    };

    const supportRefreshTimer = setInterval(
      refreshSupportMessages,
      15000
    );

    const registeredUsersRefreshTimer =
      setInterval(
        refreshRegisteredUsers,
        5000
      );

    const bedReservationRefreshTimer =
      setInterval(
        refreshBedReservations,
        5000
      );

    return () => {
      mounted = false;
      clearInterval(supportRefreshTimer);
      clearInterval(
        registeredUsersRefreshTimer
      );
      clearInterval(
        bedReservationRefreshTimer
      );
    };
  }, []);

  const refreshBedReservations = async () => {
    try {
      setBedLoading(true);

      const response = await fetch(
        "https://healthcare-management-system-cjhw.onrender.com/api/admin/bed-reservations"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to fetch bed reservations."
        );
      }

      setBedReservations(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error("Bed reservation refresh error:", error);
      alert(
        error.message ||
          "Unable to fetch bed reservations."
      );
    } finally {
      setBedLoading(false);
    }
  };

  const checkBedAvailability = async (reservation) => {
    try {
      setBedActionLoading(reservation.id);

      const query = new URLSearchParams({
        bedType: reservation.bed_type || "",
        admissionDate: reservation.admission_date || "",
      });

      const response = await fetch(
        `https://healthcare-management-system-cjhw.onrender.com/api/admin/beds/availability?${query.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to check bed availability."
        );
      }

      setSelectedBedReservation(reservation);
      setBedAvailability(data);
    } catch (error) {
      console.error("Bed availability error:", error);
      alert(
        error.message ||
          "Unable to check bed availability."
      );
    } finally {
      setBedActionLoading(null);
    }
  };

  const updateBedReservationStatus = async (
    reservation,
    status,
    bedId = null
  ) => {
    try {
      setBedActionLoading(reservation.id);

      const response = await fetch(
        `https://healthcare-management-system-cjhw.onrender.com/api/admin/bed-reservations/${reservation.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            bedId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update bed reservation."
        );
      }

      setBedReservations((current) =>
        current.map((item) =>
          Number(item.id) === Number(reservation.id)
            ? {
                ...item,
                ...data.reservation,
              }
            : item
        )
      );

      setSelectedBedReservation(null);
      setBedAvailability(null);

      setBedSuccessPopup(
        data.message ||
          "Bed reservation updated successfully."
      );

      window.setTimeout(() => {
        setBedSuccessPopup("");
      }, 3000);
} catch (error) {
      console.error("Bed reservation status error:", error);
      alert(
        error.message ||
          "Unable to update bed reservation."
      );
    } finally {
      setBedActionLoading(null);
    }
  };

  const updateAppointmentStatus = async (
  appointmentId,
  status
) => {
  try {
    const response = await fetch(
      `https://healthcare-management-system-cjhw.onrender.com/api/admin/appointments/${appointmentId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.message ||
          "Unable to update appointment."
      );
      return;
    }

    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status,
            }
          : appointment
      )
    );
  } catch (error) {
    console.error(
      "Appointment status error:",
      error
    );

    alert(
      "Unable to connect to server."
    );
  }
};

  const updateUserStatus = async (userId, status) => {
    try {
      const response = await fetch(
        `https://healthcare-management-system-cjhw.onrender.com/api/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to update user status."
        );
        return;
      }

      setDoctors((currentDoctors) =>
        currentDoctors.map((doctor) =>
          doctor.id === userId
            ? { ...doctor, status }
            : doctor
        )
      );

      setPatients((currentPatients) =>
        currentPatients.map((patient) =>
          patient.id === userId
            ? { ...patient, status }
            : patient
        )
      );
    } catch (error) {
      console.error(
        "User status error:",
        error
      );

      alert("Unable to connect to server.");
    }
  };

  const markContactMessageRead = async (messageId) => {
    try {
      const response = await fetch(
        `https://healthcare-management-system-cjhw.onrender.com/api/admin/contact-messages/${messageId}/read`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to mark message as read."
        );
        return;
      }

      setContactMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? { ...message, status: "Read" }
            : message
        )
      );
    } catch (error) {
      console.error(
        "Contact message read error:",
        error
      );

      alert("Unable to connect to server.");
    }
  };

  const deleteContactMessage = async (messageId) => {
    const confirmed = window.confirm(
      "Delete this contact message?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://healthcare-management-system-cjhw.onrender.com/api/admin/contact-messages/${messageId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to delete contact message."
        );
        return;
      }

      setContactMessages((currentMessages) =>
        currentMessages.filter(
          (message) => message.id !== messageId
        )
      );
    } catch (error) {
      console.error(
        "Delete contact message error:",
        error
      );

      alert("Unable to connect to server.");
    }
  };

  const openSupportDetails = (message) => {
    const rawMessage = String(message?.message || "");

    const issueMatch = rawMessage.match(
      /Issue Category:\s*(.+?)(?:\n|$)/i
    );

    const referenceMatch = rawMessage.match(
      /Reference ID:\s*(.+?)(?:\n|$)/i
    );

    const descriptionMatch = rawMessage.match(
      /Description:\s*([\s\S]*)/i
    );

    const issueType =
      issueMatch?.[1]?.trim() || "Other";

    const referenceId =
      referenceMatch?.[1]?.trim() || "";

    const description =
      descriptionMatch?.[1]?.trim() ||
      rawMessage;

    const normalizedReference =
      referenceId.replace(/^#/, "").trim();

    let matchedRecord = null;
    let matchedRecordType = "";

    if (
      normalizedReference &&
      /^\d+$/.test(normalizedReference)
    ) {
      const numericId = Number(
        normalizedReference
      );

      if (
        issueType.toLowerCase().includes("booking") ||
        issueType.toLowerCase().includes("appointment")
      ) {
        matchedRecord =
          appointments.find(
            (appointment) =>
              Number(appointment.id) === numericId
          ) || null;

        if (matchedRecord) {
          matchedRecordType = "Appointment";
        }
      }

      if (
        !matchedRecord &&
        (
          issueType.toLowerCase().includes("payment") ||
          issueType.toLowerCase().includes("transaction")
        )
      ) {
        matchedRecord =
          payments.find((payment) => {
            const paymentId =
              normalizedReference.replace(/^pay[-_]?/i, "");

            return (
              String(payment.id) === paymentId ||
              String(payment.transaction_id || "")
                .toLowerCase() ===
                normalizedReference.toLowerCase()
            );
          }) || null;

        if (matchedRecord) {
          matchedRecordType = "Payment";
        }
      }

      if (
        !matchedRecord &&
        issueType.toLowerCase().includes("report")
      ) {
        matchedRecord =
          reports.find(
            (report) =>
              Number(report.id) === numericId
          ) || null;

        if (matchedRecord) {
          matchedRecordType = "Medical Report";
        }
      }
    }

    setSelectedSupportMessage({
      ...message,
      parsed: {
        issueType,
        referenceId,
        description,
      },
    });

    setSupportDetails({
      record: matchedRecord,
      recordType: matchedRecordType,
    });

    setDetailsPopupOpen(true);
  };

  const closeSupportDetails = () => {
    setDetailsPopupOpen(false);
    setSelectedSupportMessage(null);
    setSupportDetails(null);
  };

  const openReplyPopup = (message) => {
    setSelectedMessage(message);
    setAdminReply("");
    setReplyMessage("");
    setReplyPopupOpen(true);
  };

  const closeReplyPopup = () => {
    if (replySending) return;
    setReplyPopupOpen(false);
    setSelectedMessage(null);
    setAdminReply("");
    setReplyMessage("");
  };

  const sendAdminReply = async () => {
    if (!selectedMessage) return;

    const trimmedReply = adminReply.trim();

    if (!trimmedReply) {
      setReplyMessage("Please write a reply first.");
      return;
    }

    try {
      setReplySending(true);
      setReplyMessage("");

      const response = await fetch(
        `https://healthcare-management-system-cjhw.onrender.com/api/admin/contact-messages/${selectedMessage.id}/reply`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reply: trimmedReply,
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
          data.message || "Unable to send reply."
        );
      }

      setContactMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === selectedMessage.id
            ? {
                ...message,
                status: "Resolved",
                admin_reply: trimmedReply,
                replied_at: new Date().toISOString(),
              }
            : message
        )
      );

      setSelectedMessage((current) =>
        current
          ? {
              ...current,
              status: "Resolved",
              admin_reply: trimmedReply,
            }
          : current
      );

      setAdminReply("");
      setReplyMessage(
        "Reply sent successfully. Message marked as resolved."
      );
    } catch (error) {
      console.error("Admin reply error:", error);
      setReplyMessage(
        error.message || "Unable to connect to server."
      );
    } finally {
      setReplySending(false);
    }
  };

  const filteredContactMessages =
    contactMessages.filter((item) => {
      const rawMessage = String(
        item?.message || ""
      );

      const issueMatch = rawMessage.match(
        /Issue Category:\s*(.+?)(?:\n|$)/i
      );

      const issueType = (
        issueMatch?.[1] || "Other"
      )
        .trim()
        .toLowerCase();

      const role = String(
        item?.user_role || "guest"
      )
        .trim()
        .toLowerCase();

      const status = String(
        item?.status || "New"
      )
        .trim()
        .toLowerCase();

      const searchText = [
        item?.name,
        item?.email,
        item?.phone,
        item?.message,
        item?.admin_reply,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchMatch =
        !supportSearch.trim() ||
        searchText.includes(
          supportSearch.trim().toLowerCase()
        );

      const issueMatchFilter =
        supportIssueFilter === "all" ||
        issueType ===
          supportIssueFilter.toLowerCase();

      const statusMatchFilter =
        supportStatusFilter === "all" ||
        status ===
          supportStatusFilter.toLowerCase();

      const roleMatchFilter =
        supportRoleFilter === "all" ||
        role === supportRoleFilter.toLowerCase();

      return (
        searchMatch &&
        issueMatchFilter &&
        statusMatchFilter &&
        roleMatchFilter
      );
    });

  const newSupportRequestCount =
    contactMessages.filter(
      (item) =>
        String(item?.status || "New")
          .trim()
          .toLowerCase() === "new"
    ).length;


  const pendingBedReservationCount =
    bedReservations.filter(
      (item) =>
        String(item.status || "Pending").toLowerCase() ===
        "pending"
    ).length;

  return (
    <>
      {bedSuccessPopup && (
        <motion.div
          className="bed-success-popup"
          initial={{
            opacity: 0,
            y: -22,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
        >
          <div className="bed-success-circle">✓</div>

          <div className="bed-success-text">
            <strong>Success</strong>
            <span>{bedSuccessPopup}</span>
          </div>

          <button
            type="button"
            className="bed-success-close"
            onClick={() => setBedSuccessPopup("")}
          >
            ×
          </button>
        </motion.div>
      )}
      <style>{`
        .dashboard-back-home-wrap {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 18px;
        }

        .dashboard-back-home-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 15px;
          border: 1px solid #dbeafe;
          border-radius: 10px;
          background: #ffffff;
          color: #2563eb;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .dashboard-back-home-btn:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          transform: translateY(-1px);
        }
        .admin-support-sidebar-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .admin-support-sidebar-badge {
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          border-radius: 999px;
          background: #ef4444;
          color: #ffffff;
          font-size: 9px;
          font-weight: 900;
          line-height: 1;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.24);
        }

        .support-title-row {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .admin-support-title-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 20px;
          padding: 0 8px;
          border-radius: 999px;
          background: #fff1f2;
          color: #dc2626;
          font-size: 8px;
          font-weight: 900;
          white-space: nowrap;
        }

        .support-section-header {
          align-items: flex-end;
        }

        .support-section-header > div {
          min-width: 0;
        }

        .support-filter-panel {
          display: grid;
          grid-template-columns: minmax(260px, 1.8fr) 1fr 1fr 1fr auto;
          gap: 9px;
          align-items: center;
          margin: -5px 0 17px;
          padding: 11px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #f8fafc;
        }

        .support-search-wrap {
          min-width: 0;
          position: relative;
          display: flex;
          align-items: center;
        }

        .support-search-wrap > span {
          position: absolute;
          left: 11px;
          color: #94a3b8;
          font-size: 13px;
          pointer-events: none;
        }

        .support-search-wrap input,
        .support-filter-panel select {
          width: 100%;
          min-height: 38px;
          box-sizing: border-box;
          border: 1px solid #dbeafe;
          border-radius: 9px;
          background: #ffffff;
          color: #0f172a;
          font: inherit;
          font-size: 10px;
          outline: none;
        }

        .support-search-wrap input {
          padding: 0 11px 0 32px;
        }

        .support-filter-panel select {
          padding: 0 10px;
          cursor: pointer;
        }

        .support-search-wrap input:focus,
        .support-filter-panel select:focus {
          border-color: #60a5fa;
          box-shadow:
            0 0 0 3px rgba(96, 165, 250, 0.10);
        }

        .support-clear-filters {
          min-height: 38px;
          padding: 0 11px;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          background: #ffffff;
          color: #475569;
          font: inherit;
          font-size: 9px;
          font-weight: 850;
          cursor: pointer;
        }

        .support-clear-filters:hover {
          background: #f1f5f9;
        }

        .support-filter-empty {
          margin-top: 5px;
        }

        @media (max-width: 1050px) {
          .support-filter-panel {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .support-search-wrap {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 650px) {
          .support-filter-panel {
            grid-template-columns: 1fr;
          }

          .support-search-wrap {
            grid-column: auto;
          }

          .support-clear-filters {
            width: 100%;
          }
        }

        .admin-details-btn {
          min-height: 34px;
          padding: 0 10px;
          border: 1px solid #bae6fd;
          border-radius: 9px;
          background: #f0f9ff;
          color: #0369a1;
          font: inherit;
          font-size: 10px;
          font-weight: 850;
          cursor: pointer;
        }

        .admin-details-btn:hover {
          background: #e0f2fe;
          border-color: #7dd3fc;
        }

        .support-role-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 8px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #475569;
          font-size: 9px;
          font-weight: 850;
          text-transform: capitalize;
        }

        .admin-support-details-overlay {
          position: fixed;
          inset: 0;
          z-index: 109000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.62);
          backdrop-filter: blur(7px);
        }

        .admin-support-details-modal {
          position: relative;
          width: min(720px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          box-sizing: border-box;
          border: 1px solid #dbeafe;
          border-radius: 23px;
          background: #ffffff;
          box-shadow: 0 30px 90px rgba(15, 23, 42, 0.24);
        }

        .admin-support-details-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 10px;
          background: #f1f5f9;
          color: #475569;
          font-size: 22px;
          cursor: pointer;
        }

        .admin-support-details-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 13px;
          border-radius: 16px;
          background: #e0f2fe;
          font-size: 25px;
        }

        .admin-support-details-label {
          margin-bottom: 6px;
          color: #0284c7;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .admin-support-details-modal h2 {
          margin: 0 0 17px;
          color: #0f172a;
          font-size: 25px;
        }

        .admin-support-details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }

        .admin-support-details-grid > div {
          padding: 11px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
          background: #f8fafc;
        }

        .admin-support-details-grid span,
        .admin-support-record-grid span {
          display: block;
          margin-bottom: 4px;
          color: #94a3b8;
          font-size: 8px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: .55px;
        }

        .admin-support-details-grid strong {
          color: #0f172a;
          font-size: 11px;
          line-height: 1.45;
          word-break: break-word;
        }

        .admin-support-description-box {
          margin-bottom: 12px;
          padding: 13px;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          background: #f8fbff;
        }

        .admin-support-description-box > span {
          display: block;
          margin-bottom: 6px;
          color: #0369a1;
          font-size: 9px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: .6px;
        }

        .admin-support-description-box p {
          margin: 0;
          color: #334155;
          white-space: pre-wrap;
          font-size: 12px;
          line-height: 1.6;
        }

        .admin-support-record-box {
          margin-top: 12px;
          padding: 14px;
          border: 1px solid #bbf7d0;
          border-radius: 13px;
          background: #f0fdf4;
        }

        .admin-support-record-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 11px;
        }

        .admin-support-record-heading strong {
          color: #166534;
          font-size: 11px;
        }

        .admin-support-record-heading span {
          color: #64748b;
          font-size: 9px;
        }

        .admin-support-record-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .admin-support-record-grid > div {
          padding: 9px 10px;
          border: 1px solid #dcfce7;
          border-radius: 9px;
          background: #ffffff;
        }

        .admin-support-record-grid strong {
          color: #334155;
          font-size: 10px;
          line-height: 1.45;
          word-break: break-word;
        }

        .admin-support-record-grid .full-width {
          grid-column: 1 / -1;
        }

        .admin-support-no-record {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 12px;
          padding: 12px;
          border: 1px solid #fde68a;
          border-radius: 12px;
          background: #fffbeb;
        }

        .admin-support-no-record > span {
          font-size: 15px;
        }

        .admin-support-no-record strong {
          display: block;
          margin-bottom: 4px;
          color: #92400e;
          font-size: 11px;
        }

        .admin-support-no-record p {
          margin: 0;
          color: #a16207;
          font-size: 9px;
          line-height: 1.5;
        }

        .admin-support-details-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 18px;
        }

        @media (max-width: 650px) {
          .admin-support-details-grid,
          .admin-support-record-grid {
            grid-template-columns: 1fr;
          }

          .admin-support-record-grid .full-width {
            grid-column: auto;
          }

          .admin-support-details-modal {
            padding: 22px;
          }

          .admin-support-details-actions {
            flex-direction: column-reverse;
          }

          .admin-support-details-actions button {
            width: 100%;
          }
        }

        .admin-reply-overlay {
          position: fixed;
          inset: 0;
          z-index: 110000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.62);
          backdrop-filter: blur(7px);
        }

        .admin-reply-modal {
          position: relative;
          width: min(560px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          box-sizing: border-box;
          border: 1px solid #dbeafe;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 30px 90px rgba(15, 23, 42, 0.24);
        }

        .admin-reply-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 10px;
          background: #f1f5f9;
          color: #475569;
          font-size: 22px;
          cursor: pointer;
        }

        .admin-reply-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 13px;
          border-radius: 16px;
          background: #e0f2fe;
          font-size: 25px;
        }

        .admin-reply-label {
          margin-bottom: 6px;
          color: #0284c7;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .admin-reply-modal h2 {
          margin: 0 0 15px;
          color: #0f172a;
          font-size: 24px;
        }

        .admin-reply-problem {
          margin-bottom: 17px;
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }

        .admin-reply-problem span {
          display: block;
          margin-bottom: 6px;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .admin-reply-problem p {
          margin: 0;
          color: #334155;
          font-size: 12px;
          line-height: 1.6;
        }

        .admin-reply-field-label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 11px;
          font-weight: 850;
        }

        .admin-reply-modal textarea {
          width: 100%;
          min-height: 130px;
          box-sizing: border-box;
          resize: vertical;
          padding: 12px;
          border: 1px solid #dbeafe;
          border-radius: 11px;
          background: #f8fbff;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          font-size: 12px;
          line-height: 1.6;
        }

        .admin-reply-modal textarea:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.12);
        }

        .admin-reply-message {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 750;
        }

        .admin-reply-message.success {
          border: 1px solid #a7f3d0;
          background: #ecfdf5;
          color: #047857;
        }

        .admin-reply-message.error {
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        .admin-reply-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 18px;
        }

        .admin-reply-cancel,
        .admin-reply-send {
          min-height: 40px;
          padding: 0 15px;
          border-radius: 10px;
          font: inherit;
          font-size: 10px;
          font-weight: 850;
          cursor: pointer;
        }

        .admin-reply-cancel {
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
        }

        .admin-reply-send {
          border: 1px solid #0284c7;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          color: #ffffff;
          box-shadow: 0 7px 18px rgba(37, 99, 235, 0.16);
        }

        @media (max-width: 560px) {
          .admin-reply-modal {
            padding: 22px;
            border-radius: 18px;
          }

          .admin-reply-actions {
            flex-direction: column-reverse;
          }

          .admin-reply-cancel,
          .admin-reply-send {
            width: 100%;
          }
        }

      
        /* Bed reservation confirmation popup */
        .bed-success-popup {
          position: fixed;
          top: 20px;
          left: 50%;
          z-index: 120000;
          transform: translateX(-50%);
          width: min(540px, calc(100vw - 28px));
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px 14px;
          box-sizing: border-box;
          border: 1px solid #bbf7d0;
          border-radius: 15px;
          background: #ffffff;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
        }

        .bed-success-circle {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #22c55e;
          color: #ffffff;
          font-size: 24px;
          font-weight: 900;
          box-shadow: 0 7px 18px rgba(34, 197, 94, 0.28);
        }

        .bed-success-text {
          min-width: 0;
          flex: 1;
        }

        .bed-success-text strong,
        .bed-success-text span {
          display: block;
        }

        .bed-success-text strong {
          margin-bottom: 3px;
          color: #166534;
          font-size: 12px;
          font-weight: 900;
        }

        .bed-success-text span {
          color: #475569;
          font-size: 10px;
          line-height: 1.45;
        }

        .bed-success-close {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border: 0;
          border-radius: 8px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 18px;
          cursor: pointer;
        }

        .bed-success-close:hover {
          background: #dcfce7;
          color: #166534;
        }

        @media (max-width: 560px) {
          .bed-success-popup {
            top: 12px;
          }
        }

`}</style>

      <div className="admin-dashboard">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          🏥 Health<span>Care+</span>
        </div>

        <nav>
          <a
            className="active"
            href="/admin-dashboard"
          >
            🏠 Overview
          </a>

          <a href="#doctors">
            👨‍⚕️ Doctors
          </a>

          <a href="#patients">
            👥 Patients
          </a>

          <a href="#appointments">
            📅 Appointments
          </a>

          <a
            href="#bed-reservations"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🛏️ Bed Reservations</span>
            {pendingBedReservationCount > 0 && (
              <span
                style={{
                  minWidth: "20px",
                  height: "20px",
                  padding: "0 5px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "999px",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: 900,
                }}
              >
                {pendingBedReservationCount > 99
                  ? "99+"
                  : pendingBedReservationCount}
              </span>
            )}
          </a>

          <a
            href="#contact-messages"
            className="admin-support-sidebar-link"
          >
            <span>📩 Contact Messages</span>
            {newSupportRequestCount > 0 && (
              <span className="admin-support-sidebar-badge">
                {newSupportRequestCount > 99
                  ? "99+"
                  : newSupportRequestCount}
              </span>
            )}
          </a>

          <a
            href="#admin-report-list"
            onClick={() => {
              setTimeout(() => {
                document
                  .getElementById("admin-report-list")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }, 0);
            }}
          >
            📄 Medical Reports
          </a>
        </nav>


      </aside>

      {/* Main */}
      <main className="dashboard-main">

        <div className="dashboard-back-home-wrap">
          <a
            href="/"
            className="dashboard-back-home-btn"
          >
            ← Back to Home
          </a>
        </div>

        {/* Header */}
        <div className="dashboard-topbar">

          <div>
            <p>ADMIN PORTAL 👋</p>

            <h1>
              Welcome, {user?.name || "Admin"}
            </h1>
          </div>

          <div className="patient-profile">

            <div className="patient-avatar">
              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "A"}
            </div>

            <div>
              <strong>
                {user?.name || "Administrator"}
              </strong>

              <span>Administrator</span>
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
              👨‍⚕️
            </div>

            <span>Total Doctors</span>

            <h2>{stats.doctors}</h2>
          </motion.div>

          <motion.div
            className="dashboard-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="stat-icon">
              👥
            </div>

            <span>Total Patients</span>

            <h2>{stats.patients}</h2>
          </motion.div>

          <motion.div
            className="dashboard-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="stat-icon">
              📅
            </div>

            <span>Appointments</span>

            <h2>{stats.appointments}</h2>
          </motion.div>

          <motion.div
            className="dashboard-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="stat-icon">
              📄
            </div>

            <span>Medical Reports</span>

            <h2>{stats.reports}</h2>
          </motion.div>

        </div>

        {/* Appointments */}
        <section
          className="dashboard-section"
          id="appointments"
        >

          <div className="dashboard-section-header">
            <h2>Recent Appointments</h2>

            <span>
              {appointments.length} total
            </span>
          </div>

          {loading ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <div className="no-appointments">
              <div className="empty-icon">
                📅
              </div>

              <h3>No appointments found</h3>

              <p>
                There are no appointments in the system.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrap">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {appointments
                    .slice(0, 8)
                    .map((appointment) => (
                      <tr key={appointment.id}>

                        <td>
                          <strong>
                            {appointment.patient_name}
                          </strong>
                        </td>

                        <td>
                          {appointment.doctor_name}
                        </td>

                        <td>
                          {new Date(
                            appointment.appointment_date
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                        <td>
                          {appointment.appointment_time}
                        </td>

                        <td>
                          <span
                            className={
                              appointment.status ===
                              "Confirmed"
                                ? "confirmed"
                                : appointment.status ===
                                  "Cancelled"
                                ? "cancelled-status"
                                : "appointment-status"
                            }
                          >
                            {appointment.status}
                          </span>
                        </td>

                        <td>
  <div className="admin-appointment-actions">

    {appointment.status !== "Confirmed" &&
      appointment.status !== "Completed" &&
      appointment.status !== "Cancelled" && (
        <button
          className="admin-confirm-btn"
          onClick={() =>
            updateAppointmentStatus(
              appointment.id,
              "Confirmed"
            )
          }
        >
          Confirm
        </button>
      )}

    {appointment.status !== "Completed" &&
      appointment.status !== "Cancelled" && (
        <button
          className="admin-complete-btn"
          onClick={() =>
            updateAppointmentStatus(
              appointment.id,
              "Completed"
            )
          }
        >
          Complete
        </button>
      )}

    {appointment.status !== "Cancelled" &&
      appointment.status !== "Completed" && (
        <button
          className="admin-cancel-btn"
          onClick={() =>
            updateAppointmentStatus(
              appointment.id,
              "Cancelled"
            )
          }
        >
          Cancel
        </button>
      )}

  </div>
</td>

                      </tr>
                    ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* Doctors */}
        <section
          className="dashboard-section"
          id="doctors"
        >

          <div className="dashboard-section-header">
            <h2>Registered Doctors</h2>

            <span>
              {doctors.length} doctors
            </span>
          </div>

          <div className="admin-search-box">
            <input
              type="text"
              placeholder="Search doctor by name, mobile or email..."
              value={doctorSearch}
              onChange={(e) =>
                setDoctorSearch(e.target.value)
              }
            />
          </div>

          <div className="admin-table-wrap">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      No doctors found.
                    </td>
                  </tr>
                ) : (
                  doctors
                    .filter((doctor) => {
                      const search =
                        doctorSearch.trim().toLowerCase();

                      if (!search) return true;

                      return (
                        doctor.name
                          ?.toLowerCase()
                          .includes(search) ||
                        doctor.mobile
                          ?.toLowerCase()
                          .includes(search) ||
                        doctor.email
                          ?.toLowerCase()
                          .includes(search)
                      );
                    })
                    .map((doctor) => (
                      <tr key={doctor.id}>

                      <td>
                        <strong>
                          {doctor.name}
                        </strong>
                      </td>

                      <td>
                        {doctor.mobile}
                      </td>

                      <td>
                        {doctor.email}
                      </td>

                      <td>
                        <span
                          className={
                            doctor.status === "inactive"
                              ? "cancelled-status"
                              : "confirmed"
                          }
                        >
                          {doctor.status === "inactive"
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-status-btn"
                          onClick={() =>
                            updateUserStatus(
                              doctor.id,
                              doctor.status === "inactive"
                                ? "active"
                                : "inactive"
                            )
                          }
                        >
                          {doctor.status === "inactive"
                            ? "Activate"
                            : "Deactivate"}
                        </button>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* Patients */}
        <section
          className="dashboard-section"
          id="patients"
        >

          <div className="dashboard-section-header">
            <h2>Registered Patients</h2>

            <span>
              {patients.length} patients
            </span>
          </div>

          <div className="admin-search-box">
            <input
              type="text"
              placeholder="Search patient by name, mobile or email..."
              value={patientSearch}
              onChange={(e) =>
                setPatientSearch(e.target.value)
              }
            />
          </div>

          <div className="admin-table-wrap">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  patients
                    .filter((patient) => {
                      const search =
                        patientSearch.trim().toLowerCase();

                      if (!search) return true;

                      return (
                        patient.name
                          ?.toLowerCase()
                          .includes(search) ||
                        patient.mobile
                          ?.toLowerCase()
                          .includes(search) ||
                        patient.email
                          ?.toLowerCase()
                          .includes(search)
                      );
                    })
                    .map((patient) => (
                      <tr key={patient.id}>

                      <td>
                        <strong>
                          {patient.name}
                        </strong>
                      </td>

                      <td>
                        {patient.mobile}
                      </td>

                      <td>
                        {patient.email}
                      </td>

                      <td>
                        <span
                          className={
                            patient.status === "inactive"
                              ? "cancelled-status"
                              : "confirmed"
                          }
                        >
                          {patient.status === "inactive"
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-status-btn"
                          onClick={() =>
                            updateUserStatus(
                              patient.id,
                              patient.status === "inactive"
                                ? "active"
                                : "inactive"
                            )
                          }
                        >
                          {patient.status === "inactive"
                            ? "Activate"
                            : "Deactivate"}
                        </button>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* Bed Reservations */}
        <section
          className="dashboard-section"
          id="bed-reservations"
        >
          <div className="dashboard-section-header">
            <h2>Bed Reservations</h2>
            <span>
              {bedReservations.length} requests
            </span>
          </div>

          {bedLoading ? (
            <p>Loading bed reservations...</p>
          ) : bedReservations.length === 0 ? (
            <div className="no-appointments">
              <div className="empty-icon">🛏️</div>
              <h3>No bed reservation requests</h3>
              <p>
                Patient requests will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Department</th>
                    <th>Bed Type</th>
                    <th>Admission</th>
                    <th>Stay</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {bedReservations.map((reservation) => {
                    const status = String(
                      reservation.status || "Pending"
                    );

                    const busy =
                      bedActionLoading === reservation.id;

                    return (
                      <tr key={reservation.id}>
                        <td>
                          <strong>
                            {reservation.patient_name ||
                              `Patient #${reservation.patient_id}`}
                          </strong>
                          <div
                            style={{
                              marginTop: "3px",
                              color: "#94a3b8",
                              fontSize: "9px",
                            }}
                          >
                            BR-
                            {String(reservation.id).padStart(
                              4,
                              "0"
                            )}
                          </div>
                        </td>

                        <td>{reservation.department}</td>

                        <td>{reservation.bed_type}</td>

                        <td>
                          {reservation.admission_date
                            ? new Date(
                                reservation.admission_date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td>
                          {reservation.duration_days || 1} day
                          {Number(
                            reservation.duration_days
                          ) === 1
                            ? ""
                            : "s"}
                        </td>

                        <td>
                          <span
                            className={
                              ["Confirmed", "Paid"].includes(
                                status
                              )
                                ? "confirmed"
                                : status === "Cancelled"
                                ? "cancelled-status"
                                : "appointment-status"
                            }
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          {status === "Pending" && (
                            <button
                              type="button"
                              className="admin-details-btn"
                              disabled={busy}
                              onClick={() =>
                                checkBedAvailability(
                                  reservation
                                )
                              }
                            >
                              {busy
                                ? "Checking..."
                                : "Check Availability"}
                            </button>
                          )}

                          {status === "Waiting" && (
                            <span className="appointment-status">
                              Waiting List
                            </span>
                          )}

                          {status === "Payment Pending" && (
                            <span className="appointment-status">
                              Payment Pending
                            </span>
                          )}

                          {status === "Paid" && (
                            <span className="confirmed">
                              Paid ✓
                            </span>
                          )}

                          {status === "Cancelled" && (
                            <span className="cancelled-status">
                              Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Contact Messages */}
        <section
          className="dashboard-section"
          id="contact-messages"
        >
          <div className="dashboard-section-header support-section-header">
            <div>
              <div className="support-title-row">
                <h2>Contact Messages</h2>
                {newSupportRequestCount > 0 && (
                  <span className="admin-support-title-badge">
                    {newSupportRequestCount} New
                  </span>
                )}
              </div>

              <span>
                Showing {filteredContactMessages.length} of{" "}
                {contactMessages.length} messages
              </span>
            </div>
          </div>

          <div className="support-filter-panel">
            <div className="support-search-wrap">
              <span>🔍</span>
              <input
                type="text"
                value={supportSearch}
                onChange={(event) =>
                  setSupportSearch(
                    event.target.value
                  )
                }
                placeholder="Search name, email, phone, problem or reply..."
              />
            </div>

            <select
              value={supportIssueFilter}
              onChange={(event) =>
                setSupportIssueFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Issues
              </option>
              <option value="appointment / booking">
                Appointment / Booking
              </option>
              <option value="login">
                Login
              </option>
              <option value="payment">
                Payment
              </option>
              <option value="prescription">
                Prescription
              </option>
              <option value="medical report">
                Medical Report
              </option>
              <option value="profile">
                Profile
              </option>
              <option value="other">
                Other
              </option>
            </select>

            <select
              value={supportStatusFilter}
              onChange={(event) =>
                setSupportStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Status
              </option>
              <option value="new">
                New
              </option>
              <option value="read">
                Read
              </option>
              <option value="resolved">
                Resolved
              </option>
            </select>

            <select
              value={supportRoleFilter}
              onChange={(event) =>
                setSupportRoleFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Users
              </option>
              <option value="patient">
                Patient
              </option>
              <option value="doctor">
                Doctor
              </option>
              <option value="guest">
                Guest
              </option>
            </select>

            {(supportSearch ||
              supportIssueFilter !== "all" ||
              supportStatusFilter !== "all" ||
              supportRoleFilter !== "all") && (
              <button
                type="button"
                className="support-clear-filters"
                onClick={() => {
                  setSupportSearch("");
                  setSupportIssueFilter("all");
                  setSupportStatusFilter("all");
                  setSupportRoleFilter("all");
                }}
              >
                Clear
              </button>
            )}
          </div>

          {contactMessages.length === 0 ? (
            <div className="no-appointments">
              <div className="empty-icon">
                📩
              </div>

              <h3>No contact messages</h3>

              <p>
                Messages sent from the website contact
                form will appear here.
              </p>
            </div>
          ) : filteredContactMessages.length === 0 ? (
            <div className="no-appointments support-filter-empty">
              <div className="empty-icon">🔎</div>
              <h3>No matching support requests</h3>
              <p>
                Try another search term or clear the filters.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Role</th>
                    <th>Contact</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredContactMessages.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                      </td>

                      <td>
                        <span
                          className="support-role-badge"
                        >
                          {item.user_role
                            ? String(
                                item.user_role
                              )
                                .charAt(0)
                                .toUpperCase() +
                              String(
                                item.user_role
                              ).slice(1)
                            : "Guest"}
                        </span>
                      </td>

                      <td>
                        <div>{item.email}</div>
                        <div>{item.phone}</div>
                      </td>

                      <td>
                        <div
                          style={{
                            maxWidth: "330px",
                            whiteSpace: "normal",
                            lineHeight: 1.5,
                          }}
                        >
                          <div>{item.message}</div>

                          {item.admin_reply && (
                            <div
                              style={{
                                marginTop: "8px",
                                paddingTop: "8px",
                                borderTop:
                                  "1px solid #e2e8f0",
                                color: "#0369a1",
                                fontSize: "11px",
                              }}
                            >
                              <strong>Admin Reply:</strong>{" "}
                              {item.admin_reply}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        {new Date(
                          item.created_at
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td>
                        <span
                          className={
                            item.status === "Read" ||
                            item.status === "Resolved"
                              ? "confirmed"
                              : "appointment-status"
                          }
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-appointment-actions">
                          {item.status !== "Read" && (
                            <button
                              type="button"
                              className="admin-confirm-btn"
                              onClick={() =>
                                markContactMessageRead(
                                  item.id
                                )
                              }
                            >
                              Mark Read
                            </button>
                          )}

                          <button
                            type="button"
                            className="admin-details-btn"
                            onClick={() =>
                              openSupportDetails(item)
                            }
                          >
                            View Details
                          </button>

                          <button
                            type="button"
                            className="admin-confirm-btn"
                            onClick={() =>
                              openReplyPopup(item)
                            }
                          >
                            Reply
                          </button>

                          <button
                            type="button"
                            className="admin-cancel-btn"
                            onClick={() =>
                              deleteContactMessage(
                                item.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Medical Reports */}
        <section
          className="dashboard-section"
          id="reports"
        >

          <div className="dashboard-section-header">
            <h2>Medical Reports</h2>

            <span>
              {reports.length} reports
            </span>
          </div>

          {reports.length === 0 ? (

            <div className="no-appointments">
              <div className="empty-icon">
                📄
              </div>

              <h3>
                No medical reports found
              </h3>

              <p>
                Medical reports created by doctors
                will appear here.
              </p>
            </div>

          ) : (

            <div
              className="admin-table-wrap"
              id="admin-report-list"
            >

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Type</th>
                    <th>Doctor</th>
                    <th>Patient ID</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {reports.map((report) => (
                    <tr key={report.id}>

                      <td>
                        <strong>
                          {report.report_title}
                        </strong>
                      </td>

                      <td>
                        {report.report_type}
                      </td>

                      <td>
                        {report.doctor_name}
                      </td>

                      <td>
                        #{report.patient_id}
                      </td>

                      <td>
                        {new Date(
                          report.report_date
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      {selectedBedReservation && bedAvailability && (
        <div
          className="admin-support-details-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedBedReservation(null);
              setBedAvailability(null);
            }
          }}
        >
          <div
            className="admin-support-details-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="admin-support-details-close"
              onClick={() => {
                setSelectedBedReservation(null);
                setBedAvailability(null);
              }}
            >
              ×
            </button>

            <div className="admin-support-details-icon">
              🛏️
            </div>

            <p className="admin-support-details-label">
              BED AVAILABILITY
            </p>

            <h2>
              {selectedBedReservation.patient_name ||
                `Patient #${selectedBedReservation.patient_id}`}
            </h2>

            <div className="admin-support-details-grid">
              <div>
                <span>Department</span>
                <strong>
                  {selectedBedReservation.department}
                </strong>
              </div>

              <div>
                <span>Bed Type</span>
                <strong>
                  {selectedBedReservation.bed_type}
                </strong>
              </div>

              <div>
                <span>Admission Date</span>
                <strong>
                  {selectedBedReservation.admission_date}
                </strong>
              </div>

              <div>
                <span>Available Beds</span>
                <strong>
                  {bedAvailability.available_count || 0}
                </strong>
              </div>
            </div>

            {Number(
              bedAvailability.available_count || 0
            ) > 0 ? (
              <div className="admin-support-record-box">
                <div className="admin-support-record-heading">
                  <strong>✅ Beds Available</strong>
                </div>

                <div className="admin-support-record-grid">
                  {(bedAvailability.beds || []).map(
                    (bed) => (
                      <div key={bed.id}>
                        <span>Bed Number</span>
                        <strong>
                          {bed.bed_number}
                        </strong>
                      </div>
                    )
                  )}
                </div>

                <div className="admin-support-details-actions">
                  <button
                    type="button"
                    className="admin-reply-send"
                    disabled={
                      bedActionLoading ===
                      selectedBedReservation.id
                    }
                    onClick={() =>
                      updateBedReservationStatus(
                        selectedBedReservation,
                        "Payment Pending",
                        bedAvailability.beds?.[0]?.id ||
                          null
                      )
                    }
                  >
                    Confirm Reservation
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-support-no-record">
                <span>❌</span>

                <div>
                  <strong>No Bed Available</strong>

                  <p>
                    No matching bed is currently available.
                    Add this patient to the 24-hour waiting list.
                  </p>

                  <div className="admin-support-details-actions">
                    <button
                      type="button"
                      className="admin-cancel-btn"
                      disabled={
                        bedActionLoading ===
                        selectedBedReservation.id
                      }
                      onClick={() =>
                        updateBedReservationStatus(
                          selectedBedReservation,
                          "Waiting"
                        )
                      }
                    >
                      Add to Waiting List
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {detailsPopupOpen &&
        selectedSupportMessage && (
          <div
            className="admin-support-details-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeSupportDetails();
              }
            }}
          >
            <div
              className="admin-support-details-modal"
              role="dialog"
              aria-modal="true"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className="admin-support-details-close"
                onClick={closeSupportDetails}
              >
                ×
              </button>

              <div className="admin-support-details-icon">
                🔎
              </div>

              <div className="admin-support-details-label">
                SUPPORT REQUEST
              </div>

              <h2>Issue Details</h2>

              <div className="admin-support-details-grid">
                <div>
                  <span>Sender</span>
                  <strong>
                    {selectedSupportMessage.name}
                  </strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>
                    {selectedSupportMessage.user_role
                      ? String(
                          selectedSupportMessage.user_role
                        )
                          .charAt(0)
                          .toUpperCase() +
                        String(
                          selectedSupportMessage.user_role
                        ).slice(1)
                      : "Guest"}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {selectedSupportMessage.email}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {selectedSupportMessage.phone}
                  </strong>
                </div>

                <div>
                  <span>Issue Category</span>
                  <strong>
                    {
                      selectedSupportMessage
                        .parsed.issueType
                    }
                  </strong>
                </div>

                <div>
                  <span>Reference ID</span>
                  <strong>
                    {
                      selectedSupportMessage
                        .parsed.referenceId ||
                      "Not provided"
                    }
                  </strong>
                </div>
              </div>

              <div className="admin-support-description-box">
                <span>What went wrong?</span>
                <p>
                  {
                    selectedSupportMessage
                      .parsed.description
                  }
                </p>
              </div>

              {supportDetails?.record ? (
                <div className="admin-support-record-box">
                  <div className="admin-support-record-heading">
                    <strong>
                      {supportDetails.recordType} Found
                    </strong>
                    <span>
                      Database Record #{supportDetails.record.id}
                    </span>
                  </div>

                  {supportDetails.recordType ===
                    "Appointment" && (
                    <div className="admin-support-record-grid">
                      <div>
                        <span>Patient</span>
                        <strong>
                          {
                            supportDetails.record
                              .patient_name
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Doctor</span>
                        <strong>
                          {
                            supportDetails.record
                              .doctor_name
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Department</span>
                        <strong>
                          {
                            supportDetails.record
                              .department
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Date</span>
                        <strong>
                          {new Date(
                            supportDetails.record
                              .appointment_date
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Time</span>
                        <strong>
                          {
                            supportDetails.record
                              .appointment_time
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Status</span>
                        <strong>
                          {
                            supportDetails.record
                              .status
                          }
                        </strong>
                      </div>

                      <div className="full-width">
                        <span>Booking Reason</span>
                        <strong>
                          {
                            supportDetails.record
                              .reason ||
                            "Not provided"
                          }
                        </strong>
                      </div>
                    </div>
                  )}

                  {supportDetails.recordType ===
                    "Payment" && (
                    <div className="admin-support-record-grid">
                      <div>
                        <span>Transaction ID</span>
                        <strong>
                          {supportDetails.record
                            .transaction_id ||
                            "Not provided"}
                        </strong>
                      </div>

                      <div>
                        <span>Payment ID</span>
                        <strong>
                          #
                          {supportDetails.record.id}
                        </strong>
                      </div>

                      <div>
                        <span>Patient</span>
                        <strong>
                          {supportDetails.record
                            .patient_name ||
                            `#${supportDetails.record.patient_id}`}
                        </strong>
                      </div>

                      <div>
                        <span>Amount</span>
                        <strong>
                          ₹
                          {Number(
                            supportDetails.record.amount || 0
                          ).toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <div>
                        <span>Payment Method</span>
                        <strong>
                          {supportDetails.record
                            .payment_method ||
                            "Not provided"}
                        </strong>
                      </div>

                      <div>
                        <span>Status</span>
                        <strong>
                          {supportDetails.record.status ||
                            "Unknown"}
                        </strong>
                      </div>

                      <div>
                        <span>Payment Date</span>
                        <strong>
                          {supportDetails.record.payment_date
                            ? new Date(
                                supportDetails.record
                                  .payment_date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>Appointment ID</span>
                        <strong>
                          {supportDetails.record
                            .appointment_id
                            ? `#${supportDetails.record.appointment_id}`
                            : "Not linked"}
                        </strong>
                      </div>

                      <div>
                        <span>Doctor</span>
                        <strong>
                          {supportDetails.record
                            .doctor_name ||
                            "Not linked"}
                        </strong>
                      </div>

                      <div>
                        <span>Appointment Date</span>
                        <strong>
                          {supportDetails.record
                            .appointment_date
                            ? new Date(
                                supportDetails.record
                                  .appointment_date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "Not linked"}
                        </strong>
                      </div>

                      <div className="full-width">
                        <span>Appointment Time</span>
                        <strong>
                          {supportDetails.record
                            .appointment_time ||
                            "Not linked"}
                        </strong>
                      </div>
                    </div>
                  )}

                  {supportDetails.recordType ===
                    "Medical Report" && (
                    <div className="admin-support-record-grid">
                      <div>
                        <span>Report Title</span>
                        <strong>
                          {
                            supportDetails.record
                              .report_title
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Report Type</span>
                        <strong>
                          {
                            supportDetails.record
                              .report_type
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Doctor</span>
                        <strong>
                          {
                            supportDetails.record
                              .doctor_name
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Patient ID</span>
                        <strong>
                          #
                          {
                            supportDetails.record
                              .patient_id
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Date</span>
                        <strong>
                          {new Date(
                            supportDetails.record
                              .report_date
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div className="full-width">
                        <span>Summary</span>
                        <strong>
                          {
                            supportDetails.record
                              .summary ||
                            "No summary available."
                          }
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="admin-support-no-record">
                  <span>ℹ️</span>
                  <div>
                    <strong>
                      No matching database record found
                    </strong>
                    <p>
                      Ask the patient/doctor for the correct
                      Reference ID or Transaction ID, or review the issue description.
                    </p>
                  </div>
                </div>
              )}

              <div className="admin-support-details-actions">
                <button
                  type="button"
                  className="admin-reply-send"
                  onClick={() => {
                    const message =
                      selectedSupportMessage;
                    closeSupportDetails();
                    openReplyPopup(message);
                  }}
                >
                  💬 Reply
                </button>

                <button
                  type="button"
                  className="admin-reply-cancel"
                  onClick={closeSupportDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {replyPopupOpen && selectedMessage && (
        <div
          className="admin-reply-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !replySending
            ) {
              closeReplyPopup();
            }
          }}
        >
          <div
            className="admin-reply-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="admin-reply-close"
              onClick={closeReplyPopup}
              disabled={replySending}
            >
              ×
            </button>

            <div className="admin-reply-icon">💬</div>

            <div className="admin-reply-label">
              SUPPORT RESPONSE
            </div>

            <h2>
              Reply to {selectedMessage.name}
            </h2>

            <div className="admin-reply-problem">
              <span>Problem</span>
              <p>{selectedMessage.message}</p>
            </div>

            <label
              className="admin-reply-field-label"
              htmlFor="admin-reply-textarea"
            >
              Admin Reply
            </label>

            <textarea
              id="admin-reply-textarea"
              value={adminReply}
              onChange={(event) =>
                setAdminReply(event.target.value)
              }
              placeholder="Write the solution or response..."
              rows="6"
              disabled={replySending}
            />

            {replyMessage && (
              <div
                className={
                  replyMessage.includes("successfully")
                    ? "admin-reply-message success"
                    : "admin-reply-message error"
                }
              >
                {replyMessage}
              </div>
            )}

            <div className="admin-reply-actions">
              <button
                type="button"
                className="admin-reply-cancel"
                onClick={closeReplyPopup}
                disabled={replySending}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-reply-send"
                onClick={sendAdminReply}
                disabled={replySending}
              >
                {replySending
                  ? "Sending..."
                  : "✉️ Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  );
}

export default AdminDashboard;
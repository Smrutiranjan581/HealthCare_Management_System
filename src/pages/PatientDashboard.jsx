import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

function PatientDashboard() {
  const today = new Date().toISOString().split("T")[0];

  const [user, setUser] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);

  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);

  const [medicalReports, setMedicalReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const [payments, setPayments] = useState([]);
const [notifications, setNotifications] = useState([]);
const [loadingNotifications, setLoadingNotifications] = useState(true);

const [loadingPayments, setLoadingPayments] = useState(true);

  // Reschedule
  const [rescheduleAppointment, setRescheduleAppointment] =
    useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] =
    useState(false);

  // Payment
  const [paymentAppointment, setPaymentAppointment] =
    useState(null);
  const [paymentMethod, setPaymentMethod] =
    useState("Google Pay");
  const [transactionId, setTransactionId] =
    useState("");
  const [paymentLoading, setPaymentLoading] =
    useState(false);

  // Bed Reservation
  const [bedReservationOpen, setBedReservationOpen] =
    useState(false);
  const [bedDepartment, setBedDepartment] =
    useState("General Medicine");
  const [bedType, setBedType] =
    useState("General");
  const [bedAdmissionDate, setBedAdmissionDate] =
    useState("");
  const [bedDuration, setBedDuration] =
    useState("");
  const [bedReason, setBedReason] =
    useState("");
  const [bedReservationLoading, setBedReservationLoading] =
    useState(false);
  const [bedReservationMessage, setBedReservationMessage] =
    useState("");

  // Bed payment
  const [bedReservations, setBedReservations] =
    useState([]);
  const [loadingBedReservations, setLoadingBedReservations] =
    useState(true);
  const [bedPaymentReservation, setBedPaymentReservation] =
    useState(null);
  const [bedPaymentMethod, setBedPaymentMethod] =
    useState("Google Pay");
  const [bedTransactionId, setBedTransactionId] =
    useState("");
  const [bedPaymentLoading, setBedPaymentLoading] =
    useState(false);
  const [bedPaymentSuccess, setBedPaymentSuccess] =
    useState("");

  // Change password
  const [passwordModal, setPasswordModal] =
    useState(false);
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmNewPassword, setConfirmNewPassword] =
    useState("");
  const [passwordError, setPasswordError] =
    useState("");
  const [passwordSuccess, setPasswordSuccess] =
    useState("");
  const [changingPassword, setChangingPassword] =
    useState(false);

  // Prescription details
  const [selectedPrescription, setSelectedPrescription] =
    useState(null);



  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    const loggedInUser = JSON.parse(savedUser);

    setUser(loggedInUser);

    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `https://healthcare-management-system-cjhw.onrender.com/api/appointments/${loggedInUser.id}`
        );

        const data = await response.json();

        if (response.ok) {
          setAppointments(data);
        } else {
          console.error(
            "Failed to fetch appointments:",
            data
          );
        }
      } catch (error) {
        console.error("Appointment error:", error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    const fetchPrescriptions = async () => {
      try {
        const response = await fetch(
          `https://healthcare-management-system-cjhw.onrender.com/api/prescriptions/${loggedInUser.id}`
        );

        const data = await response.json();

        if (response.ok) {
          setPrescriptions(data);
        } else {
          console.error(
            "Failed to fetch prescriptions:",
            data
          );
        }
      } catch (error) {
        console.error(
          "Prescription fetch error:",
          error
        );
      } finally {
        setLoadingPrescriptions(false);
      }
    };

    const fetchMedicalReports = async () => {
      try {
        const response = await fetch(
          `https://healthcare-management-system-cjhw.onrender.com/api/medical-reports/${loggedInUser.id}`
        );

        const data = await response.json();

        if (response.ok) {
          setMedicalReports(data);
        } else {
          console.error(
            "Failed to fetch medical reports:",
            data
          );
        }
      } catch (error) {
        console.error(
          "Medical reports error:",
          error
        );
      } finally {
        setLoadingReports(false);
      }
    };

    fetchAppointments();
    fetchPrescriptions();
    fetchMedicalReports();

    const fetchPayments = async () => {
      setLoadingPayments(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 8000);

      try {
        const response = await fetch(
          `https://healthcare-management-system-cjhw.onrender.com/api/payments/${loggedInUser.id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Failed to fetch payments:",
            data
          );
          setPayments([]);
          return;
        }

        setPayments(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        if (error.name === "AbortError") {
          console.error(
            "Payments request timed out."
          );
        } else {
          console.error(
            "Payments fetch error:",
            error
          );
        }

        setPayments([]);
      } finally {
        clearTimeout(timeoutId);
        setLoadingPayments(false);
      }
    };

    fetchPayments();


    const fetchBedReservations = async () => {
      try {
        const response = await fetch(
          `https://healthcare-management-system-cjhw.onrender.com/api/bed-reservations/${loggedInUser.id}`
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
        console.error(
          "Bed reservations fetch error:",
          error
        );
        setBedReservations([]);
      } finally {
        setLoadingBedReservations(false);
      }
    };

    fetchBedReservations();

    const fetchNotifications = async () => {
  try {
    const response = await fetch(
      `https://healthcare-management-system-cjhw.onrender.com/api/notifications/${loggedInUser.id}`
    );

    const data = await response.json();

    if (response.ok) {
      setNotifications(
        Array.isArray(data) ? data : []
      );
    } else {
      console.error(
        "Failed to fetch notifications:",
        data
      );
    }
  } catch (error) {
    console.error(
      "Notifications fetch error:",
      error
    );
  } finally {
    setLoadingNotifications(false);
  }
};

fetchNotifications();

const handleWindowFocus = () => {
  fetchBedReservations();
};

window.addEventListener("focus", handleWindowFocus);

return () => {
  window.removeEventListener("focus", handleWindowFocus);
};
  }, []);


  const closeBedReservation = () => {
    if (bedReservationLoading) return;

    setBedReservationOpen(false);
    setBedReservationMessage("");
    setBedReason("");
    setBedAdmissionDate("");
    setBedDuration("");
    setBedDepartment("");
    setBedType("");
  };

  const submitBedReservation = async () => {
    if (!user?.id) {
      setBedReservationMessage(
        "User session not found. Please login again."
      );
      return;
    }

    if (!bedAdmissionDate) {
      setBedReservationMessage(
        "Please select an admission date."
      );
      return;
    }

    if (Number(bedDuration) < 1) {
      setBedReservationMessage(
        "Expected stay must be at least 1 day."
      );
      return;
    }

    if (!bedReason.trim()) {
      setBedReservationMessage(
        "Please enter the reason for admission."
      );
      return;
    }

    try {
      setBedReservationLoading(true);
      setBedReservationMessage("");

      const response = await fetch(
        "https://healthcare-management-system-cjhw.onrender.com/api/bed-reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: user.id,
            department: bedDepartment,
            bedType,
            admissionDate: bedAdmissionDate,
            durationDays: Number(bedDuration),
            reason: bedReason.trim(),
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
            "Unable to submit bed reservation request."
        );
      }

      setBedReservationMessage(
        "Bed reservation request submitted successfully. Please wait for admin confirmation."
      );

      setTimeout(() => {
        closeBedReservation();
      }, 1800);
    } catch (error) {
      console.error("Bed reservation error:", error);
      setBedReservationMessage(
        error.message ||
          "Unable to connect to server."
      );
    } finally {
      setBedReservationLoading(false);
    }
  };

  const openBedPayment = (reservation) => {
    setBedPaymentReservation(reservation);
    setBedPaymentMethod("Google Pay");
    setBedTransactionId("");
  };

  const closeBedPayment = () => {
    if (bedPaymentLoading) return;

    setBedPaymentReservation(null);
    setBedPaymentMethod("Google Pay");
    setBedTransactionId("");
  };

  const handleBedPayment = async () => {
    if (!bedPaymentReservation || !user?.id) {
      return;
    }

    const amount =
      Number(
        bedPaymentReservation.duration_days || 1
      ) * 1000;

    const transactionId =
      bedTransactionId.trim() ||
      `BED-TXN-${Date.now()}`;

    try {
      setBedPaymentLoading(true);

      const response = await fetch(
        "https://healthcare-management-system-cjhw.onrender.com/api/bed-reservations/payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: user.id,
            reservationId:
              bedPaymentReservation.id,
            amount,
            paymentMethod: bedPaymentMethod,
            transactionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to process bed payment."
        );
      }

      setBedReservations((current) =>
        current.map((item) =>
          Number(item.id) ===
          Number(bedPaymentReservation.id)
            ? {
                ...item,
                status: "Paid",
                payment_status: "Paid",
                transaction_id: transactionId,
              }
            : item
        )
      );

      closeBedPayment();

      setBedPaymentSuccess(
        data.message ||
          "Bed payment successful. Your reservation is secured."
      );

      window.setTimeout(() => {
        setBedPaymentSuccess("");
      }, 4200);
    } catch (error) {
      console.error(
        "Bed payment error:",
        error
      );

      alert(
        error.message ||
          "Unable to process bed payment."
      );
    } finally {
      setBedPaymentLoading(false);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://healthcare-management-system-cjhw.onrender.com/api/appointments/${appointmentId}/cancel`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to cancel appointment."
        );
        return;
      }

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: "Cancelled",
              }
            : appointment
        )
      );
    } catch (error) {
      console.error(
        "Cancel appointment error:",
        error
      );

      alert(
        "Unable to connect to server. Please make sure the backend is running."
      );
    }
  };

  // Open reschedule
  const openReschedule = (appointment) => {
    setRescheduleAppointment(appointment);
    setNewDate("");
    setNewTime("");
  };

  // Close reschedule
  const closeReschedule = () => {
    if (rescheduleLoading) return;

    setRescheduleAppointment(null);
    setNewDate("");
    setNewTime("");
  };

  // Save reschedule
  const saveReschedule = async () => {
    if (!newDate || !newTime) {
      alert("Please select both date and time.");
      return;
    }

    try {
      setRescheduleLoading(true);

      const response = await fetch(
        `https://healthcare-management-system-cjhw.onrender.com/api/appointments/${rescheduleAppointment.id}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentDate: newDate,
            appointmentTime: newTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to reschedule appointment."
        );
        return;
      }

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === rescheduleAppointment.id
            ? {
                ...appointment,
                appointment_date: newDate,
                appointment_time: newTime,
                status: "Pending",
              }
            : appointment
        )
      );

      closeReschedule();
    } catch (error) {
      console.error("Reschedule error:", error);

      alert(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Open payment modal
  const openPayment = (appointment) => {
    setPaymentAppointment(appointment);
    setPaymentMethod("Google Pay");
    setTransactionId("");
  };

  // Close payment modal
  const closePayment = () => {
    if (paymentLoading) return;

    setPaymentAppointment(null);
    setPaymentMethod("Google Pay");
    setTransactionId("");
  };

  // Complete payment
  const handlePayment = async () => {
    if (!paymentAppointment) return;

    const transaction =
      transactionId.trim() ||
      `TXN-HC-${Date.now()}`;

    try {
      setPaymentLoading(true);

      const response = await fetch(
        "https://healthcare-management-system-cjhw.onrender.com/api/payments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: user?.id,
            appointmentId: paymentAppointment.id,
            amount: 500,
            paymentMethod,
            transactionId: transaction,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to process payment."
        );
        return;
      }

      const newPayment = {
        id: data.paymentId,
        appointment_id: paymentAppointment.id,
        amount: 500,
        payment_method: paymentMethod,
        transaction_id: transaction,
        status: "Paid",
        payment_date: new Date().toISOString(),
      };

      setPayments((currentPayments) => [
        newPayment,
        ...currentPayments,
      ]);

      closePayment();

      alert(
        "Payment successful! Transaction ID: " +
          transaction
      );
    } catch (error) {
      console.error("Payment error:", error);

      alert(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // Download prescription PDF
  const downloadPrescriptionPDF = (prescription) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    doc.text(
      "HealthCare+",
      pageWidth / 2,
      20,
      { align: "center" }
    );

    doc.setFontSize(14);
    doc.text(
      "MEDICAL PRESCRIPTION",
      pageWidth / 2,
      30,
      { align: "center" }
    );

    doc.setLineWidth(0.5);
    doc.line(20, 36, pageWidth - 20, 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(
      `Prescription ID: HC-P${prescription.id}`,
      20,
      48
    );

    doc.text(
      `Doctor: ${prescription.doctor_name}`,
      20,
      58
    );

    doc.text(
      `Date: ${new Date(
        prescription.created_at
      ).toLocaleDateString("en-IN")}`,
      20,
      68
    );

    doc.setFont("helvetica", "bold");

    doc.text("Diagnosis", 20, 84);

    doc.setFont("helvetica", "normal");

    doc.text(
      prescription.diagnosis || "Not specified",
      20,
      94
    );

    doc.setFont("helvetica", "bold");

    doc.text("Medicine Details", 20, 112);

    doc.setFont("helvetica", "normal");

    doc.text(
      `Medicine: ${prescription.medicine_name}`,
      25,
      124
    );

    doc.text(
      `Dosage: ${
        prescription.dosage || "Not specified"
      }`,
      25,
      134
    );

    doc.text(
      `Frequency: ${
        prescription.frequency || "Not specified"
      }`,
      25,
      144
    );

    doc.text(
      `Duration: ${
        prescription.duration || "Not specified"
      }`,
      25,
      154
    );

    doc.setFont("helvetica", "bold");

    doc.text("Instructions", 20, 174);

    doc.setFont("helvetica", "normal");

    const instructions =
      prescription.instructions ||
      "No special instructions provided.";

    const wrappedInstructions =
      doc.splitTextToSize(
        instructions,
        pageWidth - 40
      );

    doc.text(
      wrappedInstructions,
      20,
      184
    );

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);

    doc.text(
      "This prescription is generated from the HealthCare+ management system.",
      pageWidth / 2,
      275,
      { align: "center" }
    );

    doc.save(
      `HealthCare-Prescription-${prescription.id}.pdf`
    );
  };

  // Download professional payment receipt PDF
  const downloadPaymentReceiptPDF = (payment) => {
    const doc = new jsPDF();

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const appointment = appointments.find(
      (item) =>
        Number(item.id) ===
        Number(payment.appointment_id)
    );

    const receiptNumber =
      `HC-PAY-${String(payment.id).padStart(6, "0")}`;

    const paymentDate = new Date(
      payment.payment_date
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const appointmentDate = appointment
      ? new Date(
          appointment.appointment_date
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

    const status =
      String(payment.status || "").toUpperCase();

    // Header
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, pageWidth, 44, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);

    doc.text(
      "HealthCare+",
      20,
      20
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
      "Secure Healthcare Management System",
      20,
      30
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);

    doc.text(
      "PAYMENT RECEIPT",
      pageWidth - 20,
      20,
      { align: "right" }
    );

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Receipt No: ${receiptNumber}`,
      pageWidth - 20,
      30,
      { align: "right" }
    );

    // Receipt meta
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      `Payment Date: ${paymentDate}`,
      20,
      58
    );

    doc.text(
      `Transaction ID: ${
        payment.transaction_id ||
        `PAY-${payment.id}`
      }`,
      20,
      66
    );

    // Patient section
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(
      18,
      78,
      pageWidth - 36,
      48,
      4,
      4,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);

    doc.text(
      "PATIENT DETAILS",
      24,
      91
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      `Name: ${user?.name || "Patient"}`,
      24,
      103
    );

    doc.text(
      `Email: ${user?.email || "-"}`,
      24,
      112
    );

    doc.text(
      `Mobile: ${user?.mobile || "-"}`,
      pageWidth / 2,
      103
    );

    doc.text(
      `Patient ID: #${user?.id || "-"}`,
      pageWidth / 2,
      112
    );

    // Appointment section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text(
      "APPOINTMENT DETAILS",
      20,
      146
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      `Doctor: ${
        appointment?.doctor_name || "-"
      }`,
      20,
      158
    );

    doc.text(
      `Department: ${
        appointment?.department || "-"
      }`,
      20,
      167
    );

    doc.text(
      `Appointment Date: ${appointmentDate}`,
      20,
      176
    );

    doc.text(
      `Appointment Time: ${
        appointment?.appointment_time || "-"
      }`,
      pageWidth / 2,
      176
    );

    // Payment summary box
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(
      18,
      190,
      pageWidth - 36,
      38,
      4,
      4,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);

    doc.text(
      "DESCRIPTION",
      25,
      203
    );

    doc.text(
      "AMOUNT",
      pageWidth - 25,
      203,
      { align: "right" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      "Doctor Consultation",
      25,
      216
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);

    doc.text(
      `₹${Number(payment.amount).toLocaleString("en-IN")}.00`,
      pageWidth - 25,
      216,
      { align: "right" }
    );

    // Payment details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      `Payment Method: ${
        payment.payment_method || "-"
      }`,
      20,
      242
    );

    doc.text(
      `Status: ${status}`,
      pageWidth - 20,
      242,
      { align: "right" }
    );

    // Paid stamp
    if (status === "PAID") {
      doc.setDrawColor(16, 185, 129);
      doc.setTextColor(5, 150, 105);
      doc.setLineWidth(1);

      doc.roundedRect(
        pageWidth - 72,
        250,
        52,
        19,
        4,
        4,
        "S"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.text(
        "PAID",
        pageWidth - 46,
        262,
        { align: "center" }
      );
    }

    // Footer
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);

    doc.text(
      "This is a computer-generated receipt and does not require a signature.",
      pageWidth / 2,
      278,
      { align: "center" }
    );

    doc.text(
      "HealthCare+ • Secure Healthcare Management",
      pageWidth / 2,
      286,
      { align: "center" }
    );

    doc.save(
      `HealthCare-Payment-Receipt-${payment.id}.pdf`
    );
  };

  // Download medical report PDF
  const downloadMedicalReportPDF = (report) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    doc.text(
      "HealthCare+",
      pageWidth / 2,
      20,
      { align: "center" }
    );

    doc.setFontSize(14);

    doc.text(
      "MEDICAL REPORT",
      pageWidth / 2,
      30,
      { align: "center" }
    );

    doc.setLineWidth(0.5);
    doc.line(20, 36, pageWidth - 20, 36);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(
      `Report ID: HC-R${report.id}`,
      20,
      48
    );

    doc.text(
      `Doctor: ${report.doctor_name}`,
      20,
      58
    );

    doc.text(
      `Report Type: ${report.report_type}`,
      20,
      68
    );

    doc.text(
      `Report Title: ${report.report_title}`,
      20,
      78
    );

    doc.text(
      `Report Date: ${new Date(
        report.report_date
      ).toLocaleDateString("en-IN")}`,
      20,
      88
    );

    doc.setFont("helvetica", "bold");
    doc.text("Report Summary", 20, 108);

    doc.setFont("helvetica", "normal");

    const summary =
      report.summary ||
      "No report summary available.";

    const wrappedSummary =
      doc.splitTextToSize(
        summary,
        pageWidth - 40
      );

    doc.text(
      wrappedSummary,
      20,
      120
    );

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);

    doc.text(
      "This medical report is generated from the HealthCare+ management system.",
      pageWidth / 2,
      275,
      { align: "center" }
    );

    doc.save(
      `HealthCare-Medical-Report-${report.id}.pdf`
    );
  };

  return (
    <>
      {bedPaymentSuccess && (
        <motion.div
          initial={{
            opacity: 0,
            y: -28,
            scale: 0.94,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.28,
            ease: "easeOut",
          }}
          style={{
            position: "fixed",
            top: "22px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200000,
            width: "min(560px, calc(100vw - 28px))",
            display: "flex",
            alignItems: "center",
            gap: "13px",
            padding: "13px 14px 13px 13px",
            boxSizing: "border-box",
            border: "1px solid #bbf7d0",
            borderRadius: "17px",
            background: "rgba(255,255,255,.98)",
            boxShadow:
              "0 22px 55px rgba(15,23,42,.18), 0 5px 18px rgba(34,197,94,.10)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "47px",
              height: "47px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "4px solid #dcfce7",
              borderRadius: "50%",
              background: "#22c55e",
              color: "#fff",
              fontSize: "23px",
              fontWeight: 900,
              boxShadow:
                "0 8px 20px rgba(34,197,94,.26)",
            }}
          >
            ✓
          </div>

          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <div
              style={{
                marginBottom: "2px",
                color: "#166534",
                fontSize: "12px",
                fontWeight: 900,
              }}
            >
              Payment Successful
            </div>

            <div
              style={{
                color: "#475569",
                fontSize: "9px",
                lineHeight: 1.45,
              }}
            >
              {bedPaymentSuccess}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "5px",
                marginTop: "5px",
                color: "#15803d",
                fontSize: "7px",
                fontWeight: 800,
              }}
            >
              <span>✓ Reservation secured</span>
              <span>•</span>
              <span>Payment recorded</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBedPaymentSuccess("")}
            aria-label="Close payment success message"
            style={{
              width: "31px",
              height: "31px",
              flexShrink: 0,
              border: 0,
              borderRadius: "9px",
              background: "#f1f5f9",
              color: "#64748b",
              fontSize: "18px",
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </motion.div>
      )}

      <div className="patient-dashboard">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          🏥 Health<span>Care+</span>
        </div>

        <nav>
          <a
            className="active"
            href="/patient-dashboard"
          >
            🏠 Overview
          </a>

          <a href="#appointments">
            📅 My Appointments
          </a>

          <a href="#prescriptions">
            💊 Prescriptions
          </a>

          <a href="#reports">
            📄 Medical Reports
          </a>

          <a href="#payments">
            💳 Payments
          </a>

          <a
            href="#bed-reservation"
            onClick={(event) => {
              event.preventDefault();
              setBedReservationOpen(true);
              setBedReservationMessage("");
            }}
          >
            🛏️ Bed Reservation
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
              Welcome back,{" "}
              {user?.name || "Patient"}
            </h1>
          </div>

          <div className="patient-profile">

            <div className="patient-avatar">
              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "P"}
            </div>

            <div>
              <strong>
                {user?.name || "Patient User"}
              </strong>

              <span>
                {user?.role || "Patient"}
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
              Upcoming Appointments
            </span>

            <h2>
              {
                appointments.filter(
                  (item) =>
                    item.status !== "Cancelled" &&
                    item.status !== "Completed"
                ).length
              }
            </h2>
          </motion.div>

          <motion.div
            className="dashboard-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="stat-icon">
              💊
            </div>

            <span>
              Prescriptions
            </span>

            <h2>
              {prescriptions.length}
            </h2>
          </motion.div>

          <motion.div
            className="dashboard-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="stat-icon">
              📄
            </div>

            <span>
              Medical Reports
            </span>

            <h2>{medicalReports.length}</h2>
          </motion.div>

          <motion.div
            className="dashboard-stat-card"
            whileHover={{ y: -5 }}
          >
            <div className="stat-icon">
              💳
            </div>

            <span>Total Payments</span>
<h2>
  ₹
  {payments
    .filter(
      (payment) =>
        String(payment.status).toLowerCase() === "paid"
    )
    .reduce(
      (total, payment) => {
        const amount = Number(payment.amount);
        return total + (Number.isFinite(amount) ? amount : 0);
      },
      0
    )
    .toLocaleString("en-IN")}
</h2>
          </motion.div>

        </div>

        {/* My Appointments */}
        <section
          className="dashboard-section"
          id="appointments"
        >

          <div className="dashboard-section-header">

            <h2>My Appointments</h2>

            <a href="/appointment">
              Book New
            </a>

          </div>

          {loadingAppointments ? (

            <div className="appointment-loading">
              <div className="loading-spinner"></div>
              <p>Loading appointments...</p>
            </div>

          ) : appointments.length === 0 ? (

            <div className="no-appointments">

              <div className="empty-icon">
                📅
              </div>

              <h3>
                No appointments yet
              </h3>

              <p>
                Book an appointment to see it here.
              </p>

              <a href="/appointment">
                Book Appointment →
              </a>

            </div>

          ) : (

            <div className="appointments-list">

              {appointments.map(
                (appointment) => (

                  <motion.div
                    className="upcoming-appointment"
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
                  >

                    <div className="appointment-doctor">

                      <div className="dashboard-doctor-avatar">
                        👨‍⚕️
                      </div>

                      <div>
                        <h3>
                          {appointment.doctor_name}
                        </h3>

                        <p>
                          {appointment.department}
                        </p>
                      </div>

                    </div>

                    <div className="appointment-info">

                      <span>
                        📅{" "}
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
                      </span>

                      <span>
                        🕐{" "}
                        {appointment.appointment_time}
                      </span>

                      <div className="appointment-actions">

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

                        {appointment.status !==
                          "Cancelled" &&
                          appointment.status !==
                            "Completed" && (
                            <>
                              <motion.button
                                className="reschedule-btn"
                                whileHover={{
                                  scale: 1.04,
                                }}
                                whileTap={{
                                  scale: 0.96,
                                }}
                                onClick={() =>
                                  openReschedule(
                                    appointment
                                  )
                                }
                              >
                                Reschedule
                              </motion.button>

                              <motion.button
                                className="cancel-btn"
                                whileHover={{
                                  scale: 1.04,
                                }}
                                whileTap={{
                                  scale: 0.96,
                                }}
                                onClick={() =>
                                  cancelAppointment(
                                    appointment.id
                                  )
                                }
                              >
                                Cancel
                              </motion.button>

                              {payments.some(
                                (payment) =>
                                  Number(payment.appointment_id) ===
                                    Number(appointment.id) &&
                                  String(
                                    payment.status || ""
                                  ).toLowerCase() === "paid"
                              ) ? (
                                <span className="payment-paid-badge">
                                  ✅ Paid
                                </span>
                              ) : (
                                <motion.button
                                  className="pay-now-btn"
                                  whileHover={{
                                    scale: 1.04,
                                  }}
                                  whileTap={{
                                    scale: 0.96,
                                  }}
                                  onClick={() =>
                                    openPayment(
                                      appointment
                                    )
                                  }
                                >
                                  💳 Pay Now
                                </motion.button>
                              )}
                            </>
                          )}

                      </div>

                    </div>

                  </motion.div>
                )
              )}

            </div>
          )}

        </section>

        {/* My Prescriptions */}
        <section
          className="dashboard-section"
          id="prescriptions"
        >

          <div className="dashboard-section-header">
            <h2>My Prescriptions</h2>
          </div>

          {loadingPrescriptions ? (

            <div className="appointment-loading">
              <div className="loading-spinner"></div>
              <p>Loading prescriptions...</p>
            </div>

          ) : prescriptions.length === 0 ? (

            <div className="no-appointments">

              <div className="empty-icon">
                💊
              </div>

              <h3>
                No prescriptions yet
              </h3>

              <p>
                Prescriptions from your doctor
                will appear here.
              </p>

            </div>

          ) : (

            <div className="prescription-list">

              {prescriptions.map(
                (prescription) => (

                  <motion.div
                    className="prescription-item"
                    key={prescription.id}
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    whileHover={{
                      y: -3,
                    }}
                  >

                    <div className="prescription-icon">
                      💊
                    </div>

                    <div className="prescription-info">

                      <h3>
                        {prescription.medicine_name}
                      </h3>

                      <p>
                        {prescription.dosage ||
                          "Dosage not specified"}
                      </p>

                      <span>
                        {prescription.frequency ||
                          "Frequency not specified"}
                        {" • "}
                        {prescription.duration ||
                          "Duration not specified"}
                      </span>

                    </div>

                    <div className="prescription-doctor">

                      <strong>
                        {prescription.doctor_name}
                      </strong>

                      <span>
                        {prescription.diagnosis ||
                          "Medical prescription"}
                      </span>

                    </div>

                    <div className="prescription-buttons">

                      <button
                        className="view-prescription-btn"
                        onClick={() =>
                          setSelectedPrescription(
                            prescription
                          )
                        }
                      >
                        View Details
                      </button>

                      <button
                        className="download-prescription-btn"
                        onClick={() =>
                          downloadPrescriptionPDF(
                            prescription
                          )
                        }
                      >
                        ⬇️ Download PDF
                      </button>

                    </div>

                  </motion.div>
                )
              )}

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
          </div>

          {loadingReports ? (

            <div className="appointment-loading">
              <div className="loading-spinner"></div>
              <p>Loading medical reports...</p>
            </div>

          ) : medicalReports.length === 0 ? (

            <div className="no-appointments">

              <div className="empty-icon">
                📄
              </div>

              <h3>No medical reports yet</h3>

              <p>
                Reports uploaded by your doctor
                will appear here.
              </p>

            </div>

          ) : (

            <div className="medical-report-list">

              {medicalReports.map((report) => (

                <motion.div
                  className="medical-report-item"
                  key={report.id}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  whileHover={{
                    y: -3,
                  }}
                >

                  <div className="report-list-icon">
                    📄
                  </div>

                  <div className="report-list-info">

                    <h3>
                      {report.report_title}
                    </h3>

                    <p>
                      {report.report_type}
                    </p>

                    <span>
                      📅{" "}
                      {new Date(
                        report.report_date
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>

                  </div>

                  <div className="report-list-doctor">

                    <strong>
                      {report.doctor_name}
                    </strong>

                    <span>
                      {report.summary ||
                        "Medical report"}
                    </span>

                  </div>

                  <div className="report-card-actions">

                    <button
                      className="view-report-btn"
                      onClick={() => setSelectedReport(report)}
                    >
                      View Details
                    </button>

                    <button
                      className="download-report-btn"
                      onClick={() => downloadMedicalReportPDF(report)}
                    >
                      ⬇️ Download PDF
                    </button>

                  </div>

                </motion.div>

              ))}

            </div>

          )}

        </section>

        {/* Payments */}
<section
  className="dashboard-section"
  id="payments"
>
  <div className="dashboard-section-header">
    <h2>Payment History</h2>

    <span>
      {payments.length} payments
    </span>
  </div>

  {loadingPayments ? (

    <div className="appointment-loading">
      <div className="loading-spinner"></div>
      <p>Loading payments...</p>
    </div>

  ) : payments.length === 0 ? (

    <div className="no-appointments">

      <div className="empty-icon">
        💳
      </div>

      <h3>No payments yet</h3>

      <p>
        Your payment history will appear here.
      </p>

    </div>

  ) : (

    <div className="payment-list">

      {payments.map((payment) => (

        <motion.div
          className="payment-item"
          key={payment.id}
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
        >

          <div className="payment-icon">
            💳
          </div>

          <div className="payment-info">

            <h3>
              Consultation Payment
            </h3>

            <p>
              {payment.payment_method}
            </p>

            <span>
              Transaction ID:{" "}
              {payment.transaction_id ||
                `PAY-${payment.id}`}
            </span>

          </div>

          <div className="payment-right">

            <strong>
              ₹
              {Number(
                payment.amount
              ).toLocaleString("en-IN")}
            </strong>

            <span className="confirmed">
              {payment.status}
            </span>

            <small>
              {new Date(
                payment.payment_date
              ).toLocaleDateString(
                "en-IN"
              )}
            </small>

            <button
              className="download-payment-btn"
              onClick={() =>
                downloadPaymentReceiptPDF(
                  payment
                )
              }
            >
              🧾 Download Receipt
            </button>

          </div>

        </motion.div>

      ))}

    </div>

  )}

</section>

        {/* Bed Reservation */}
        <section
          className="dashboard-section"
          id="bed-reservation"
        >
          <div className="dashboard-section-header">
            <h2>Bed Reservation</h2>
            <span>Hospital admission request</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              padding: "20px",
              border: "1px solid #dbeafe",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, #f8fbff, #ffffff)",
              boxShadow:
                "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                background: "#e0f2fe",
                fontSize: "28px",
              }}
            >
              🛏️
            </div>

            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: "0 0 6px",
                  color: "#0f172a",
                  fontSize: "16px",
                }}
              >
                Reserve a Hospital Bed
              </h3>

              <p
                style={{
                  margin: "0 0 13px",
                  color: "#64748b",
                  fontSize: "11px",
                  lineHeight: 1.55,
                }}
              >
                Send a request. The admin will check the live
                database and confirm the reservation if a bed is
                available.
              </p>

              <button
                type="button"
                onClick={() => {
                  setBedReservationOpen(true);
                  setBedReservationMessage("");
                }}
                style={{
                  minHeight: "40px",
                  padding: "0 15px",
                  border: "0",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #0ea5e9, #2563eb)",
                  color: "#fff",
                  font: "inherit",
                  fontSize: "10px",
                  fontWeight: 850,
                  cursor: "pointer",
                  boxShadow:
                    "0 7px 18px rgba(37, 99, 235, .15)",
                }}
              >
                🛏️ Request Bed
              </button>
            </div>
          </div>
        </section>

        {/* My Bed Reservations */}
        <section
          className="dashboard-section"
          id="my-bed-reservations"
        >
          <div className="dashboard-section-header">
            <h2>My Bed Reservations</h2>
            <span>
              {bedReservations.length} requests
            </span>
          </div>

          {loadingBedReservations ? (
            <div className="appointment-loading">
              <div className="loading-spinner"></div>
              <p>Loading bed reservations...</p>
            </div>
          ) : bedReservations.length === 0 ? (
            <div className="no-appointments">
              <div className="empty-icon">🛏️</div>
              <h3>No bed reservations yet</h3>
              <p>
                Your bed requests and admin updates will appear here.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {bedReservations.map((reservation) => {
                const status = String(
                  reservation.status || "Pending"
                );
                const statusLower = status.toLowerCase();
                const isPaymentPending =
                  statusLower === "payment pending";
                const isPaid = statusLower === "paid";
                const isWaiting =
                  statusLower === "waiting";
                const isCancelled =
                  statusLower === "cancelled";

                const totalAmount =
                  Number(
                    reservation.duration_days || 1
                  ) * 1000;

                return (
                  <motion.div
                    key={reservation.id}
                    whileHover={{ y: -2 }}
                    style={{
                      padding: "18px",
                      border: "1px solid #dbeafe",
                      borderRadius: "16px",
                      background: "#ffffff",
                      boxShadow:
                        "0 7px 20px rgba(15,23,42,.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        marginBottom: "13px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#94a3b8",
                            fontSize: "8px",
                            fontWeight: 850,
                            textTransform: "uppercase",
                            letterSpacing: ".55px",
                          }}
                        >
                          Reservation ID
                        </div>
                        <h3
                          style={{
                            margin: "3px 0 0",
                            color: "#0f172a",
                            fontSize: "15px",
                          }}
                        >
                          BR-
                          {String(
                            reservation.id
                          ).padStart(4, "0")}
                        </h3>
                      </div>

                      <span
                        className={
                          isPaid
                            ? "confirmed"
                            : isCancelled
                            ? "cancelled-status"
                            : "appointment-status"
                        }
                      >
                        {status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3, minmax(0, 1fr))",
                        gap: "8px",
                      }}
                    >
                      {[
                        ["Department", reservation.department],
                        ["Bed Type", reservation.bed_type],
                        [
                          "Admission",
                          reservation.admission_date
                            ? new Date(
                                reservation.admission_date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-",
                        ],
                        [
                          "Stay",
                          `${reservation.duration_days || 1} day${
                            Number(
                              reservation.duration_days
                            ) === 1
                              ? ""
                              : "s"
                          }`,
                        ],
                        [
                          "Bed",
                          reservation.bed_number ||
                            "Not assigned",
                        ],
                        [
                          "Amount",
                          `₹${totalAmount.toLocaleString(
                            "en-IN"
                          )}`,
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          style={{
                            padding: "9px 10px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              marginBottom: "3px",
                              color: "#94a3b8",
                              fontSize: "8px",
                              fontWeight: 800,
                              textTransform: "uppercase",
                            }}
                          >
                            {label}
                          </span>

                          <strong
                            style={{
                              color: "#334155",
                              fontSize: "9px",
                              lineHeight: 1.45,
                            }}
                          >
                            {value || "-"}
                          </strong>
                        </div>
                      ))}
                    </div>

                    {isWaiting &&
                      reservation.expires_at && (
                        <div
                          style={{
                            marginTop: "10px",
                            padding: "10px 11px",
                            borderRadius: "10px",
                            border:
                              "1px solid #fde68a",
                            background: "#fffbeb",
                            color: "#a16207",
                            fontSize: "9px",
                            fontWeight: 750,
                          }}
                        >
                          ⏳ Waiting list is active until{" "}
                          {new Date(
                            reservation.expires_at
                          ).toLocaleString("en-IN")}
                        </div>
                      )}

                    {isPaymentPending && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          marginTop: "10px",
                          padding: "11px 12px",
                          border:
                            "1px solid #bae6fd",
                          borderRadius: "11px",
                          background: "#f0f9ff",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display: "block",
                              color: "#0c4a6e",
                              fontSize: "10px",
                            }}
                          >
                            ✅ Bed confirmed
                          </strong>
                          <span
                            style={{
                              color: "#475569",
                              fontSize: "9px",
                            }}
                          >
                            Complete payment to secure your
                            reservation.
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openBedPayment(
                              reservation
                            )
                          }
                          style={{
                            minHeight: "38px",
                            padding: "0 13px",
                            border: 0,
                            borderRadius: "9px",
                            background:
                              "linear-gradient(135deg,#0ea5e9,#2563eb)",
                            color: "#ffffff",
                            font: "inherit",
                            fontSize: "10px",
                            fontWeight: 850,
                            cursor: "pointer",
                          }}
                        >
                          💳 Pay Now
                        </button>
                      </div>
                    )}

                    {isPaid && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "10px 11px",
                          borderRadius: "10px",
                          border:
                            "1px solid #a7f3d0",
                          background: "#ecfdf5",
                          color: "#047857",
                          fontSize: "9px",
                          fontWeight: 750,
                        }}
                      >
                        ✅ Payment completed. Your bed reservation
                        is secured.
                      </div>
                    )}

                    {isCancelled && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "10px 11px",
                          borderRadius: "10px",
                          border:
                            "1px solid #fecaca",
                          background: "#fef2f2",
                          color: "#b91c1c",
                          fontSize: "9px",
                          fontWeight: 750,
                        }}
                      >
                        ❌ This reservation has been cancelled.
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Settings */}
        <section
          className="dashboard-section"
          id="settings"
          style={{ display: "none" }}
        >
          <div className="dashboard-section-header">
            <h2>Settings</h2>
            <span>Account Settings</span>
          </div>

          <div className="settings-card">
            <div className="settings-profile-icon">
              👤
            </div>

            <div className="settings-profile-info">
              <h3>Profile Information</h3>

              <div className="settings-grid">
                <div>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={user?.name || ""}
                    readOnly
                  />
                </div>

                <div>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                  />
                </div>

                <div>
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    value={user?.mobile || ""}
                    readOnly
                  />
                </div>

                <div>
                  <label>Account Type</label>
                  <input
                    type="text"
                    value="Patient"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="settings-security-card">
            <div>
              <h3>Security</h3>
              <p>
                Keep your HealthCare+ account secure.
              </p>
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

        {/* Notifications */}
<section
  className="dashboard-section"
  id="notifications"
  style={{ display: "none" }}
>
  <div className="dashboard-section-header">
    <h2>Notifications</h2>

    <span>
      {
        notifications.filter(
          (notification) =>
            !notification.is_read
        ).length
      } unread
    </span>
  </div>

  {loadingNotifications ? (
    <div className="appointment-loading">
      <div className="loading-spinner"></div>
      <p>Loading notifications...</p>
    </div>
  ) : notifications.length === 0 ? (
    <div className="no-appointments">
      <div className="empty-icon">🔔</div>

      <h3>No notifications</h3>

      <p>
        You are all caught up.
      </p>
    </div>
  ) : (
    <div className="notification-list">

      {notifications.map((notification) => (
        <motion.div
          key={notification.id}
          className={
            notification.is_read
              ? "notification-item read"
              : "notification-item unread"
          }
        >

          <div className="notification-icon">
            {notification.type === "appointment"
              ? "📅"
              : notification.type === "prescription"
              ? "💊"
              : notification.type === "report"
              ? "📄"
              : notification.type === "payment"
              ? "💳"
              : "🔔"}
          </div>

          <div className="notification-content">

            <h3>
              {notification.title}
            </h3>

            <p>
              {notification.message}
            </p>

            <small>
              {new Date(
                notification.created_at
              ).toLocaleDateString("en-IN")}
            </small>

          </div>

          {!notification.is_read && (
            <button
              className="mark-read-btn"
              onClick={async () => {
                try {
                  const response = await fetch(
                    `https://healthcare-management-system-cjhw.onrender.com/api/notifications/${notification.id}/read`,
                    {
                      method: "PUT",
                    }
                  );

                  if (response.ok) {
                    setNotifications((current) =>
                      current.map((item) =>
                        item.id === notification.id
                          ? {
                              ...item,
                              is_read: 1,
                            }
                          : item
                      )
                    );
                  }
                } catch (error) {
                  console.error(
                    "Mark read error:",
                    error
                  );
                }
              }}
            >
              Mark as Read
            </button>
          )}

        </motion.div>
      ))}

    </div>
  )}
</section>

      </main>

      {/* Bed Reservation Modal */}
      {bedReservationOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !bedReservationLoading
            ) {
              closeBedReservation();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            style={{
              position: "relative",
              width: "min(620px, calc(100vw - 32px))",
              maxHeight: "90vh",
              overflowY: "auto",
              boxSizing: "border-box",
              padding: "30px",
              border: "1px solid #dbeafe",
              borderRadius: "22px",
              background: "#ffffff",
              boxShadow:
                "0 30px 90px rgba(15, 23, 42, 0.24)",
            }}
          >
            <button
              type="button"
              className="modal-close"
              onClick={closeBedReservation}
              disabled={bedReservationLoading}
            >
              ×
            </button>

            <div
              style={{
                width: "58px",
                height: "58px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, #e0f2fe, #dbeafe)",
                fontSize: "27px",
              }}
            >
              🛏️
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "26px",
                lineHeight: 1.2,
                fontWeight: 850,
              }}
            >
              Bed Reservation
            </h2>

            <p
              style={{
                margin: "7px 0 22px",
                color: "#0284c7",
                fontSize: "13px",
                fontWeight: 750,
                lineHeight: 1.5,
              }}
            >
              Submit a request for admin verification.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="bed-department"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#334155",
                  fontSize: "10px",
                  fontWeight: 800,
                }}
              >
                Department
              </label>

              <select
                id="bed-department"
                value={bedDepartment}
                onChange={(event) =>
                  setBedDepartment(event.target.value)
                }
                disabled={bedReservationLoading}
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  background: "#f8fbff",
                  color: "#0f172a",
                  fontFamily: "inherit",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Department</option>
                <option>General Medicine</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Orthopedics</option>
                <option>Pediatrics</option>
                <option>Emergency</option>
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="bed-type"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#334155",
                  fontSize: "10px",
                  fontWeight: 800,
                }}
              >
                Bed Type
              </label>

              <select
                id="bed-type"
                value={bedType}
                onChange={(event) =>
                  setBedType(event.target.value)
                }
                disabled={bedReservationLoading}
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  background: "#f8fbff",
                  color: "#0f172a",
                  fontFamily: "inherit",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Bed Type</option>
                <option>General</option>
                <option>Semi-Private</option>
                <option>Private</option>
                <option>ICU</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr) minmax(0, 1fr)",
                gap: "14px",
                width: "100%",
                marginBottom: "16px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <label
                  htmlFor="bed-admission-date"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#334155",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                >
                  Admission Date
                </label>

                <input
                  id="bed-admission-date"
                  type="date"
                  min={today}
                  value={bedAdmissionDate}
                  onChange={(event) =>
                    setBedAdmissionDate(
                      event.target.value
                    )
                  }
                  disabled={bedReservationLoading}
                  style={{
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 13px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    background: "#f8fbff",
                    color: "#0f172a",
                    fontFamily: "inherit",
                    fontSize: "12px",
                  }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label
                  htmlFor="bed-duration"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#334155",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                >
                  Expected Stay
                </label>

                <select
                  id="bed-duration"
                  value={bedDuration}
                  onChange={(event) =>
                    setBedDuration(
                      event.target.value
                    )
                  }
                  disabled={bedReservationLoading}
                  style={{
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 13px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    background: "#f8fbff",
                    color: "#0f172a",
                    fontFamily: "inherit",
                    fontSize: "12px",
                  }}
                >
                  <option value="">Select Duration</option>
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="5">5 Days</option>
                  <option value="7">7 Days</option>
                  <option value="14">14 Days</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "2px" }}>
              <label
                htmlFor="bed-reason"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  color: "#334155",
                  fontSize: "10px",
                  fontWeight: 800,
                }}
              >
                Reason for Admission
              </label>

              <textarea
                id="bed-reason"
                rows="4"
                value={bedReason}
                onChange={(event) =>
                  setBedReason(event.target.value)
                }
                placeholder="Explain why you need hospital admission..."
                disabled={bedReservationLoading}
                style={{
                  display: "block",
                  width: "100%",
                  minHeight: "112px",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  background: "#f8fbff",
                  color: "#0f172a",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "9px",
                marginTop: "14px",
                padding: "11px 12px",
                border: "1px solid #dbeafe",
                borderRadius: "11px",
                background: "#f8fafc",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  fontSize: "14px",
                }}
              >
                ℹ️
              </span>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "9px",
                  lineHeight: 1.55,
                }}
              >
                This request is not confirmed immediately.
                Admin will check the database and either confirm
                the bed or place the request on the waiting list.
              </p>
            </div>

            {bedReservationMessage && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "11px 12px",
                  borderRadius: "10px",
                  background:
                    bedReservationMessage.includes(
                      "successfully"
                    )
                      ? "#ecfdf5"
                      : "#fef2f2",
                  color:
                    bedReservationMessage.includes(
                      "successfully"
                    )
                      ? "#047857"
                      : "#b91c1c",
                  border:
                    bedReservationMessage.includes(
                      "successfully"
                    )
                      ? "1px solid #a7f3d0"
                      : "1px solid #fecaca",
                  fontSize: "10px",
                  fontWeight: 750,
                  lineHeight: 1.5,
                }}
              >
                {bedReservationMessage}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr) minmax(0, 1fr)",
                gap: "12px",
                width: "100%",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={closeBedReservation}
                disabled={bedReservationLoading}
                style={{
                  width: "100%",
                  minHeight: "46px",
                  border: "1px solid #dbeafe",
                  borderRadius: "11px",
                  background: "#ffffff",
                  color: "#475569",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 850,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitBedReservation}
                disabled={bedReservationLoading}
                style={{
                  width: "100%",
                  minHeight: "46px",
                  border: "1px solid #0ea5e9",
                  borderRadius: "11px",
                  background:
                    "linear-gradient(135deg, #0ea5e9, #2563eb)",
                  color: "#ffffff",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 850,
                  cursor: "pointer",
                  boxShadow:
                    "0 8px 20px rgba(37, 99, 235, 0.16)",
                }}
              >
                {bedReservationLoading
                  ? "Submitting..."
                  : "Request Bed"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bed Reservation Payment Modal */}
      {bedPaymentReservation && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !bedPaymentLoading
            ) {
              closeBedPayment();
            }
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            style={{
              position: "relative",
              width: "min(540px, calc(100vw - 30px))",
              maxHeight: "90vh",
              overflowY: "auto",
              boxSizing: "border-box",
              padding: "28px",
              border: "1px solid #dbeafe",
              borderRadius: "20px",
              background: "#ffffff",
              boxShadow:
                "0 30px 90px rgba(15,23,42,.24)",
            }}
          >
            <button
              type="button"
              className="modal-close"
              onClick={closeBedPayment}
              disabled={bedPaymentLoading}
            >
              ×
            </button>

            <div
              style={{
                width: "56px",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
                borderRadius: "15px",
                background: "#e0f2fe",
                fontSize: "25px",
              }}
            >
              💳
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "24px",
              }}
            >
              Bed Reservation Payment
            </h2>

            <p
              className="modal-doctor"
              style={{
                marginTop: "7px",
              }}
            >
              BR-
              {String(
                bedPaymentReservation.id
              ).padStart(4, "0")}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "9px",
                margin: "18px 0",
              }}
            >
              <div
                style={{
                  padding: "10px 11px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "#f8fafc",
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: "3px",
                    color: "#94a3b8",
                    fontSize: "8px",
                    fontWeight: 800,
                  }}
                >
                  Bed
                </span>
                <strong>
                  {bedPaymentReservation.bed_number ||
                    "Assigned bed"}
                </strong>
              </div>

              <div
                style={{
                  padding: "10px 11px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "#f8fafc",
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: "3px",
                    color: "#94a3b8",
                    fontSize: "8px",
                    fontWeight: 800,
                  }}
                >
                  Total
                </span>
                <strong>
                  ₹
                  {(
                    Number(
                      bedPaymentReservation.duration_days ||
                        1
                    ) * 1000
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <label>Payment Method</label>

            <select
              value={bedPaymentMethod}
              onChange={(event) =>
                setBedPaymentMethod(
                  event.target.value
                )
              }
              disabled={bedPaymentLoading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 13px",
                border: "1px solid #dbeafe",
                borderRadius: "10px",
                background: "#f8fbff",
                font: "inherit",
                fontSize: "11px",
              }}
            >
              <option value="Google Pay">
                Google Pay
              </option>
              <option value="PhonePe">
                PhonePe
              </option>
              <option value="Paytm">
                Paytm
              </option>
              <option value="UPI">
                Other UPI
              </option>
              <option value="Card">
                Debit / Credit Card
              </option>
            </select>

            <label>Transaction ID</label>

            <input
              type="text"
              value={bedTransactionId}
              onChange={(event) =>
                setBedTransactionId(
                  event.target.value
                )
              }
              placeholder="Enter transaction ID (optional)"
              disabled={bedPaymentLoading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 13px",
                border: "1px solid #dbeafe",
                borderRadius: "10px",
                background: "#f8fbff",
                font: "inherit",
                fontSize: "11px",
              }}
            />

            <p
              style={{
                margin: "11px 0 0",
                padding: "10px 11px",
                borderRadius: "10px",
                background: "#f8fafc",
                color: "#64748b",
                fontSize: "9px",
                lineHeight: 1.5,
              }}
            >
              Demo payment: clicking Pay Now records the payment
              and marks this reservation as Paid.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={closeBedPayment}
                disabled={bedPaymentLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-reschedule"
                onClick={handleBedPayment}
                disabled={bedPaymentLoading}
              >
                {bedPaymentLoading
                  ? "Processing..."
                  : `Pay ₹${(
                      Number(
                        bedPaymentReservation
                          .duration_days || 1
                      ) * 1000
                    ).toLocaleString("en-IN")}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
              Update your HealthCare+ password securely.
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
                  setPasswordModal(false);
                  setPasswordError("");
                  setPasswordSuccess("");
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
                    setPasswordError("Enter your current password.");
                    return;
                  }

                  if (!passwordRegex.test(newPassword)) {
                    setPasswordError(
                      "Password must be 8+ characters with uppercase, lowercase, number and special character."
                    );
                    return;
                  }

                  if (newPassword !== confirmNewPassword) {
                    setPasswordError("New passwords do not match.");
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
                      `https://healthcare-management-system-cjhw.onrender.com/api/users/${user.id}/password`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
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
                        data.message || "Unable to change password."
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
                      "Change password error:",
                      error
                    );

                    setPasswordError(
                      error.message || "Unable to connect to server."
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

      {/* Payment Modal */}
      {paymentAppointment && (
        <div className="modal-overlay">

          <motion.div
            className="payment-modal"
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
              onClick={closePayment}
              disabled={paymentLoading}
            >
              ×
            </button>

            <div className="payment-modal-icon">
              💳
            </div>

            <h2>
              Complete Payment
            </h2>

            <p className="modal-doctor">
              {paymentAppointment.doctor_name}
            </p>

            <div className="payment-appointment-summary">
              <div>
                <span>Appointment</span>
                <strong>
                  {new Date(
                    paymentAppointment.appointment_date
                  ).toLocaleDateString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Time</span>
                <strong>
                  {paymentAppointment.appointment_time}
                </strong>
              </div>

              <div>
                <span>Amount</span>
                <strong>₹500</strong>
              </div>
            </div>

            <label>
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
              disabled={paymentLoading}
            >
              <option value="Google Pay">
                Google Pay
              </option>

              <option value="PhonePe">
                PhonePe
              </option>

              <option value="Paytm">
                Paytm
              </option>

              <option value="UPI">
                Other UPI
              </option>

              <option value="Card">
                Debit / Credit Card
              </option>
            </select>

            <label>
              Transaction ID
            </label>

            <input
              type="text"
              value={transactionId}
              onChange={(e) =>
                setTransactionId(e.target.value)
              }
              placeholder="Enter transaction ID (optional)"
              disabled={paymentLoading}
            />

            <p className="payment-note">
              Demo payment: ₹500 consultation fee.
              A transaction ID will be generated
              automatically if you leave it empty.
            </p>

            <div className="modal-actions">

              <button
                className="modal-cancel"
                onClick={closePayment}
                disabled={paymentLoading}
              >
                Cancel
              </button>

              <motion.button
                className="save-reschedule"
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={handlePayment}
                disabled={paymentLoading}
              >
                {paymentLoading
                  ? "Processing..."
                  : "Pay ₹500"}
              </motion.button>

            </div>

          </motion.div>

        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <div className="modal-overlay">

          <motion.div
            className="reschedule-modal"
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
              onClick={closeReschedule}
            >
              ×
            </button>

            <div className="modal-icon">
              📅
            </div>

            <h2>
              Reschedule Appointment
            </h2>

            <p className="modal-doctor">
              {rescheduleAppointment.doctor_name}
            </p>

            <label>
              New Date
            </label>

            <input
              type="date"
              min={today}
              value={newDate}
              onChange={(e) =>
                setNewDate(e.target.value)
              }
            />

            <label>
              New Time
            </label>

            <select
              value={newTime}
              onChange={(e) =>
                setNewTime(e.target.value)
              }
            >
              <option value="">
                Select Time
              </option>

              <option value="09:00 AM">
                09:00 AM
              </option>

              <option value="10:00 AM">
                10:00 AM
              </option>

              <option value="11:00 AM">
                11:00 AM
              </option>

              <option value="02:00 PM">
                02:00 PM
              </option>

              <option value="04:00 PM">
                04:00 PM
              </option>

              <option value="05:00 PM">
                05:00 PM
              </option>
            </select>

            <div className="modal-actions">

              <button
                className="modal-cancel"
                onClick={closeReschedule}
                disabled={rescheduleLoading}
              >
                Cancel
              </button>

              <motion.button
                className="save-reschedule"
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={saveReschedule}
                disabled={rescheduleLoading}
              >
                {rescheduleLoading
                  ? "Updating..."
                  : "Save Changes"}
              </motion.button>

            </div>

          </motion.div>
        </div>
      )}

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div className="modal-overlay">

          <motion.div
            className="prescription-modal"
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
                setSelectedPrescription(null)
              }
            >
              ×
            </button>

            <div className="prescription-modal-icon">
              💊
            </div>

            <h2>
              Prescription Details
            </h2>

            <p className="modal-doctor">
              {selectedPrescription.doctor_name}
            </p>

            <div className="prescription-detail-row">
              <span>Medicine</span>

              <strong>
                {selectedPrescription.medicine_name}
              </strong>
            </div>

            <div className="prescription-detail-row">
              <span>Dosage</span>

              <strong>
                {selectedPrescription.dosage ||
                  "Not specified"}
              </strong>
            </div>

            <div className="prescription-detail-row">
              <span>Frequency</span>

              <strong>
                {selectedPrescription.frequency ||
                  "Not specified"}
              </strong>
            </div>

            <div className="prescription-detail-row">
              <span>Duration</span>

              <strong>
                {selectedPrescription.duration ||
                  "Not specified"}
              </strong>
            </div>

            <div className="prescription-detail-row">
              <span>Diagnosis</span>

              <strong>
                {selectedPrescription.diagnosis ||
                  "Not specified"}
              </strong>
            </div>

            <div className="prescription-instructions">

              <span>
                Instructions
              </span>

              <p>
                {selectedPrescription.instructions ||
                  "No special instructions provided."}
              </p>

            </div>

            <div className="prescription-modal-actions">

              <button
                className="modal-cancel"
                onClick={() =>
                  window.print()
                }
              >
                🖨️ Print
              </button>

              <button
                className="save-reschedule"
                onClick={() =>
                  downloadPrescriptionPDF(
                    selectedPrescription
                  )
                }
              >
                ⬇️ Download PDF
              </button>

            </div>

          </motion.div>
        </div>
      )}

      {/* Medical Report Details Modal */}
{selectedReport && (
  <div className="modal-overlay">

    <motion.div
      className="report-details-modal"
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
        onClick={() => setSelectedReport(null)}
      >
        ×
      </button>

      <div className="report-modal-icon">
        📄
      </div>

      <h2>
        Medical Report
      </h2>

      <p className="modal-doctor">
        {selectedReport.report_title}
      </p>

      <div className="report-detail-row">
        <span>Report Type</span>

        <strong>
          {selectedReport.report_type}
        </strong>
      </div>

      <div className="report-detail-row">
        <span>Doctor</span>

        <strong>
          {selectedReport.doctor_name}
        </strong>
      </div>

      <div className="report-detail-row">
        <span>Report Date</span>

        <strong>
          {new Date(
            selectedReport.report_date
          ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </strong>
      </div>

      <div className="report-summary-box">

        <span>
          Report Summary
        </span>

        <p>
          {selectedReport.summary ||
            "No report summary available."}
        </p>

      </div>

      <div className="report-modal-actions">

        <button
          className="modal-cancel"
          onClick={() =>
            setSelectedReport(null)
          }
        >
          Close
        </button>

        <button
          className="modal-cancel"
          onClick={() =>
            window.print()
          }
        >
          🖨️ Print
        </button>

        <button
          className="save-reschedule"
          onClick={() =>
            downloadMedicalReportPDF(selectedReport)
          }
        >
          ⬇️ Download PDF
        </button>

      </div>

    </motion.div>

  </div>
)}

    </div>
    </>
  );
}

export default PatientDashboard;
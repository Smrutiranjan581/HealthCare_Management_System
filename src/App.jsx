import AdminDashboard from "./pages/AdminDashboard";
import CreateMedicalReport from "./pages/CreateMedicalReport";
import CreatePrescription from "./pages/CreatePrescription";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import { useSearchParams } from "react-router-dom";
import Appointment from "./pages/Appointment";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import "./index.css";

function Home() {
  const [selectedService, setSelectedService] =
    useState(null);

  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  const accountMenuRef = useRef(null);

  const [accountPopup, setAccountPopup] =
    useState(null);

  const [emergencyPopup, setEmergencyPopup] =
    useState(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    mobile: "",
    email: "",
    dateOfBirth: "",
    gender: "",
  });

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profilePhoto, setProfilePhoto] =
    useState("");

  const [profilePhotoPreview, setProfilePhotoPreview] =
    useState("");

  const [notifications, setNotifications] =
    useState([]);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [supportRequests, setSupportRequests] =
    useState([]);

  const [supportRequestsLoading, setSupportRequestsLoading] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmNewPassword, setConfirmNewPassword] =
    useState("");

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const openAccountPopup = async (type) => {
    setAccountMenuOpen(false);
    setAccountPopup(type);

    const savedUser = localStorage.getItem("user");

    if (!savedUser) return;

    try {
      const loggedInUser = JSON.parse(savedUser);

      setProfilePhoto(loggedInUser?.profile_photo || "");
      setProfilePhotoPreview(loggedInUser?.profile_photo || "");

      if (type === "settings") {
        setProfileForm({
          name: loggedInUser?.name || "",
          mobile: loggedInUser?.mobile || "",
          email: loggedInUser?.email || "",
          dateOfBirth:
            loggedInUser?.date_of_birth || "",
          gender: loggedInUser?.gender || "",
        });
        setProfileMessage("");
      }

      if (type === "notifications") {
        setNotificationsLoading(true);

        const response = await fetch(
          `https://healthcare-management-system-cjhw.onrender.com/api/notifications/${loggedInUser.id}?role=${encodeURIComponent(
            String(loggedInUser?.role || "patient").toLowerCase()
          )}`
        );

        const data = await response.json();

        if (response.ok) {
          setNotifications(
            Array.isArray(data) ? data : []
          );
        } else {
          setNotifications([]);
        }
      }

      if (type === "support") {
        setSupportRequestsLoading(true);

        const role = String(
          loggedInUser?.role || "patient"
        ).toLowerCase();

        try {
          const response = await fetch(
            `https://healthcare-management-system-cjhw.onrender.com/api/support-requests/${loggedInUser.id}?role=${encodeURIComponent(role)}`
          );

          const data = await response.json();

          setSupportRequests(
            response.ok && Array.isArray(data)
              ? data
              : []
          );
        } catch (supportError) {
          console.error(
            "Support requests error:",
            supportError
          );
          setSupportRequests([]);
        } finally {
          setSupportRequestsLoading(false);
        }
      }

      if (type === "change-password") {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setPasswordMessage("");
      }
    } catch (error) {
      console.error(
        "Account popup error:",
        error
      );

      if (type === "notifications") {
        setNotifications([]);
      }
    } finally {
      if (type === "notifications") {
        setNotificationsLoading(false);
      }
    }
  };

  useEffect(() => {
    const loadHomeNotifications = async () => {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return;

      try {
        const loggedInUser = JSON.parse(savedUser);
        if (!loggedInUser?.id) return;

        const response = await fetch(
          `https://healthcare-management-system-cjhw.onrender.com/api/notifications/${loggedInUser.id}?role=${encodeURIComponent(
            String(loggedInUser?.role || "patient").toLowerCase()
          )}`
        );

        if (!response.ok) return;

        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Home notification badge error:", error);
      }
    };

    loadHomeNotifications();
  }, []);

  const unreadNotificationCount =
    notifications.filter(
      (notification) => !notification.is_read
    ).length;

  const closeAccountPopup = () => {
    if (profileSaving || passwordSaving) return;

    setAccountPopup(null);
    setProfileMessage("");
    setPasswordMessage("");
  };

  const compressProfileImage = (dataUrl) =>
    new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 700;
        const scale = Math.min(
          1,
          maxSize / Math.max(image.width, image.height)
        );

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Unable to process profile photo."));
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      image.onerror = () =>
        reject(new Error("Unable to read profile photo."));

      image.src = dataUrl;
    });

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileMessage("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage("Please choose an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        setProfileMessage("Unable to read selected photo.");
        return;
      }

      setProfilePhoto(reader.result);
      setProfilePhotoPreview(reader.result);
      setProfileMessage("");
    };

    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = () => {
    setProfilePhoto("");
    setProfilePhotoPreview("");
    setProfileMessage("");
  };

  const saveProfileFromHome = async () => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return;

    try {
      const loggedInUser = JSON.parse(savedUser);

      if (!loggedInUser?.id) {
        setProfileMessage(
          "User session not found. Please login again."
        );
        return;
      }

      if (!profileForm.name.trim()) {
        setProfileMessage("Please enter your full name.");
        return;
      }

      if (!/^[0-9]{10}$/.test(profileForm.mobile.trim())) {
        setProfileMessage(
          "Mobile number must contain exactly 10 digits."
        );
        return;
      }

      if (!profileForm.email.trim()) {
        setProfileMessage(
          "Please enter your email address."
        );
        return;
      }

      setProfileSaving(true);
      setProfileMessage("");

      const finalProfilePhoto =
        profilePhoto
          ? await compressProfileImage(profilePhoto)
          : "";

      const response = await fetch(
        `https://healthcare-management-system-cjhw.onrender.com/api/users/${loggedInUser.id}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: profileForm.name.trim(),
            mobile: profileForm.mobile.trim(),
            email: profileForm.email.trim(),
            dateOfBirth:
              profileForm.dateOfBirth || null,
            gender: profileForm.gender || null,
            profilePhoto:
              finalProfilePhoto || null,
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
        ...loggedInUser,
        name: profileForm.name.trim(),
        mobile: profileForm.mobile.trim(),
        email: profileForm.email.trim(),
        date_of_birth:
          profileForm.dateOfBirth || null,
        gender: profileForm.gender || null,
      profile_photo:
        finalProfilePhoto || null,
      };

      setProfilePhoto(finalProfilePhoto || "");
      setProfilePhotoPreview(finalProfilePhoto || "");


      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Home profile update error:",
        error
      );

      setProfileMessage(
        error.message ||
          "Unable to connect to server."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const changePasswordFromHome = async () => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!currentPassword) {
      setPasswordMessage(
        "Enter your current password."
      );
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setPasswordMessage(
        "Password must be 8+ characters with uppercase, lowercase, number and special character."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage(
        "New passwords do not match."
      );
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordMessage(
        "New password must be different from current password."
      );
      return;
    }

    try {
      const loggedInUser = JSON.parse(savedUser);

      if (!loggedInUser?.id) {
        setPasswordMessage(
          "User session not found. Please login again."
        );
        return;
      }

      setPasswordSaving(true);
      setPasswordMessage("");

      const response = await fetch(
        `https://healthcare-management-system-cjhw.onrender.com/api/users/${loggedInUser.id}/password`,
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
          data.message ||
            "Unable to change password."
        );
      }

      setPasswordMessage(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error(
        "Home password change error:",
        error
      );

      setPasswordMessage(
        error.message ||
          "Unable to connect to server."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const markNotificationReadFromHome = async (
    notification
  ) => {
    if (notification.is_read) return;

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
              ? { ...item, is_read: 1 }
              : item
          )
        );
      }
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };

  const getDashboardPath = () => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      return "/login";
    }

    try {
      const loggedInUser =
        JSON.parse(savedUser);

      const role = String(
        loggedInUser?.role || ""
      ).toLowerCase();

      if (role === "patient") {
        return "/patient-dashboard";
      }

      if (role === "doctor") {
        return "/doctor-dashboard";
      }

      if (role === "admin") {
        return "/admin-dashboard";
      }

      return "/login";
    } catch (error) {
      console.error(
        "Dashboard navigation error:",
        error
      );

      return "/login";
    }
  };

  const isLoggedIn =
    Boolean(localStorage.getItem("user"));

  let currentUserRole = "";
  try {
    const savedUser =
      localStorage.getItem("user");
    const parsedUser = savedUser
      ? JSON.parse(savedUser)
      : null;

    currentUserRole = String(
      parsedUser?.role || ""
    ).toLowerCase();
  } catch {
    currentUserRole = "";
  }

  const isAdmin = currentUserRole === "admin";
  const isDoctor = currentUserRole === "doctor";

  return (
    <>
      <style>{`
        .contact-support-select,
        .contact-form input[name="referenceId"],
        .contact-form textarea[name="description"] {
          width: 100%;
          box-sizing: border-box;
          font: inherit;
        }

        .contact-support-select {
          padding: 13px 14px;
          border: 1px solid #dbeafe;
          border-radius: 10px;
          background: #f8fbff;
          color: #0f172a;
          outline: none;
          font-size: 13px;
          cursor: pointer;
        }

        .contact-support-select:focus,
        .contact-form input[name="referenceId"]:focus,
        .contact-form textarea[name="description"]:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.12);
        }

        .contact-support-hint {
          margin: -5px 0 2px;
          color: #94a3b8;
          font-size: 9px;
          line-height: 1.45;
        }

        .emergency-popup-overlay {
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

        .emergency-popup-card {
          position: relative;
          width: min(460px, 100%);
          box-sizing: border-box;
          padding: 30px;
          border: 1px solid #fecaca;
          border-radius: 24px;
          background: #ffffff;
          box-shadow: 0 30px 90px rgba(15, 23, 42, 0.24);
          animation: emergencyPopupIn 0.22s ease-out;
        }

        .emergency-popup-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 10px;
          background: #f8fafc;
          color: #475569;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }

        .emergency-popup-icon {
          width: 62px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          border-radius: 18px;
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          font-size: 29px;
        }

        .emergency-popup-label {
          margin-bottom: 7px;
          color: #dc2626;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.1px;
        }

        .emergency-popup-card h2 {
          margin: 0 0 9px;
          color: #0f172a;
          font-size: 25px;
          line-height: 1.25;
        }

        .emergency-popup-text {
          margin: 0 0 18px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.65;
        }

        .emergency-popup-contact-card {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 15px;
          padding: 12px;
          border: 1px solid #fee2e2;
          border-radius: 13px;
          background: #fff7f7;
        }

        .emergency-popup-contact-icon {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #ffffff;
          font-size: 15px;
        }

        .emergency-popup-contact-card strong,
        .emergency-popup-contact-card span {
          display: block;
        }

        .emergency-popup-contact-card strong {
          margin-bottom: 2px;
          color: #0f172a;
          font-size: 11px;
          font-weight: 850;
        }

        .emergency-popup-contact-card span {
          color: #94a3b8;
          font-size: 9px;
        }

        .emergency-popup-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .emergency-popup-primary,
        .emergency-popup-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 13px;
          border-radius: 11px;
          text-decoration: none !important;
          font-size: 11px;
          font-weight: 850;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .emergency-popup-primary {
          background: #dc2626;
          color: #ffffff;
          box-shadow: 0 8px 18px rgba(220, 38, 38, 0.18);
        }

        .emergency-popup-secondary {
          border: 1px solid #fecaca;
          background: #fff7f7;
          color: #b91c1c;
        }

        .emergency-popup-primary:hover,
        .emergency-popup-secondary:hover {
          transform: translateY(-1px);
        }

        .emergency-popup-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 15px;
          padding: 10px 11px;
          border-radius: 10px;
          background: #f8fafc;
        }

        .emergency-popup-note span {
          color: #16a34a;
          font-size: 13px;
          font-weight: 900;
        }

        .emergency-popup-note p {
          margin: 0;
          color: #64748b;
          font-size: 9px;
          line-height: 1.5;
        }

        .emergency-popup-done {
          width: 100%;
          min-height: 40px;
          margin-top: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          color: #475569;
          font: inherit;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .emergency-popup-done:hover {
          background: #f8fafc;
        }

        @keyframes emergencyPopupIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 560px) {
          .emergency-popup-actions {
            grid-template-columns: 1fr;
          }
        }

        .account-avatar-small,
        .account-avatar-large {
          overflow: hidden;
        }

        .account-avatar-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          border-radius: inherit;
        }

        .account-notification-menu-icon {
          position: relative;
        }

        .account-notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          border-radius: 999px;
          background: #ef4444;
          color: #ffffff;
          font-size: 8px;
          font-weight: 900;
          line-height: 1;
        }

        .account-profile-photo-area {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
          padding: 13px;
          border: 1px solid #dbeafe;
          border-radius: 14px;
          background: #f8fbff;
        }

        .account-profile-photo-preview {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 18px;
          background: linear-gradient(135deg, #dbeafe, #e0f2fe);
          color: #2563eb;
          font-size: 25px;
          font-weight: 900;
        }

        .account-profile-photo-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .account-profile-photo-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .account-photo-upload-btn,
        .account-photo-remove-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .account-photo-upload-btn {
          border: 1px solid #0ea5e9;
          background: #eff6ff;
          color: #0369a1;
        }

        .account-photo-remove-btn {
          border: 1px solid #fecaca;
          background: #fff1f2;
          color: #dc2626;
        }

        .account-profile-photo-actions small {
          flex-basis: 100%;
          color: #94a3b8;
          font-size: 9px;
        }

        .account-popup-unread-count {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin: -8px 0 16px;
          padding: 6px 9px;
          border-radius: 999px;
          background: #fff1f2;
          color: #dc2626;
          font-size: 9px;
          font-weight: 800;
        }

        .account-popup-unread-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
        }

        .account-help-section {
          margin: 8px 0 6px;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #f8fafc;
        }

        .account-help-title {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 6px 8px;
          color: #334155;
          font-size: 10px;
        }

        .account-help-title > span {
          width: 27px;
          height: 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #e0f2fe;
          font-size: 13px;
        }

        .account-help-contact {
          display: grid;
          grid-template-columns: 32px minmax(0, 1fr) auto;
          align-items: center;
          gap: 9px;
          padding: 8px 6px;
          border-radius: 10px;
          text-decoration: none !important;
          color: #334155;
          transition: background 0.18s ease, transform 0.18s ease;
        }

        .account-help-contact:hover {
          background: #ffffff;
          transform: translateX(2px);
        }

        .account-help-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #ffffff;
          font-size: 13px;
        }

        .account-help-contact div {
          min-width: 0;
        }

        .account-help-contact strong,
        .account-help-contact small {
          display: block;
        }

        .account-help-contact strong {
          margin-bottom: 2px;
          color: #0f172a;
          font-size: 10px;
          font-weight: 800;
        }

        .account-help-contact small {
          overflow: hidden;
          color: #64748b;
          font-size: 8px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .account-help-arrow {
          color: #94a3b8;
          font-size: 13px;
        }

        .account-help-contact:hover .account-help-arrow {
          color: #2563eb;
        }

        .account-popup-overlay {
          position: fixed;
          inset: 0;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.58);
          backdrop-filter: blur(7px);
        }

        .account-popup-card {
          position: relative;
          width: min(650px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          border: 1px solid #dbeafe;
          border-radius: 24px;
          background: #ffffff;
          box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22);
        }

        .account-popup-close {
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

        .account-popup-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          border-radius: 16px;
          background: linear-gradient(135deg, #e0f2fe, #dbeafe);
          font-size: 27px;
        }

        .account-popup-label {
          margin: 0 0 6px;
          color: #0284c7;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.1px;
        }

        .account-popup-card h2 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 26px;
        }

        .account-popup-text {
          margin: 0 0 20px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        .account-popup-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .account-popup-grid > div,
        .account-popup-password-fields > div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .account-popup-grid label,
        .account-popup-password-fields label {
          color: #334155;
          font-size: 11px;
          font-weight: 800;
        }

        .account-popup-grid input,
        .account-popup-grid select,
        .account-popup-password-fields input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px;
          border: 1px solid #dbeafe;
          border-radius: 10px;
          background: #f8fbff;
          color: #0f172a;
          outline: none;
          font: inherit;
          font-size: 12px;
        }

        .account-popup-grid input:focus,
        .account-popup-grid select:focus,
        .account-popup-password-fields input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.12);
        }

        .account-popup-message {
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
        }

        .account-popup-message.success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .account-popup-message.error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .account-popup-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .account-popup-cancel,
        .account-popup-primary {
          padding: 11px 16px;
          border-radius: 10px;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .account-popup-cancel {
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
        }

        .account-popup-primary {
          border: 1px solid #0ea5e9;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          color: #ffffff;
          box-shadow: 0 7px 18px rgba(37, 99, 235, 0.18);
        }

        .account-support-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 430px;
          overflow-y: auto;
        }

        .account-support-item {
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #ffffff;
        }

        .account-support-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 9px;
        }

        .account-support-item-top strong,
        .account-support-item-top small {
          display: block;
        }

        .account-support-item-top strong {
          color: #0f172a;
          font-size: 11px;
        }

        .account-support-item-top small {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 8px;
        }

        .account-support-status {
          display: inline-flex;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
        }

        .account-support-status.new {
          background: #fff7ed;
          color: #c2410c;
        }

        .account-support-status.read {
          background: #eff6ff;
          color: #2563eb;
        }

        .account-support-status.resolved {
          background: #ecfdf5;
          color: #047857;
        }

        .account-support-description {
          padding: 10px;
          border-radius: 10px;
          background: #f8fafc;
        }

        .account-support-description > span {
          display: block;
          margin-bottom: 5px;
          color: #94a3b8;
          font-size: 8px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: .55px;
        }

        .account-support-description p {
          margin: 0;
          color: #475569;
          white-space: pre-wrap;
          font-size: 10px;
          line-height: 1.55;
        }

        .account-support-reply {
          margin-top: 9px;
          padding: 10px;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          background: #f0fdf4;
        }

        .account-support-reply-head {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 5px;
        }

        .account-support-reply-head span {
          color: #16a34a;
          font-weight: 900;
        }

        .account-support-reply-head strong {
          color: #166534;
          font-size: 10px;
        }

        .account-support-reply p {
          margin: 0;
          color: #334155;
          font-size: 10px;
          line-height: 1.55;
          white-space: pre-wrap;
        }

        .account-support-waiting {
          margin-top: 9px;
          padding: 9px 10px;
          border-radius: 9px;
          background: #fffbeb;
          color: #a16207;
          font-size: 9px;
          font-weight: 700;
        }

        .account-support-created {
          display: block;
          margin-top: 8px;
          color: #94a3b8;
          font-size: 8px;
        }

        .account-notification-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 380px;
          overflow-y: auto;
        }

        .account-notification-item {
          position: relative;
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
        }

        .account-notification-item.unread {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .account-notification-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: #f1f5f9;
          font-size: 14px;
        }

        .account-notification-content {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .account-notification-content strong {
          color: #0f172a;
          font-size: 11px;
        }

        .account-notification-content span {
          color: #64748b;
          font-size: 10px;
          line-height: 1.45;
        }

        .account-notification-content small {
          color: #94a3b8;
          font-size: 9px;
        }

        .account-notification-dot {
          width: 7px;
          height: 7px;
          margin-left: auto;
          flex-shrink: 0;
          border-radius: 50%;
          background: #2563eb;
        }

        .account-notification-empty {
          min-height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px dashed #cbd5e1;
          border-radius: 14px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
        }

        .account-notification-empty div {
          font-size: 25px;
          margin-bottom: 4px;
        }

        .account-notification-empty strong {
          color: #334155;
          font-size: 12px;
        }

        .account-popup-password-fields {
          display: grid;
          gap: 13px;
        }

        .account-password-rules {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 12px;
        }

        .account-password-rules span {
          padding: 5px 8px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
        }

        .account-password-rules span.valid {
          background: #ecfdf5;
          color: #047857;
        }

        @media (max-width: 560px) {
          .account-profile-photo-area {
            align-items: flex-start;
          }

          .account-profile-photo-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .account-popup-card {
            padding: 22px;
            border-radius: 18px;
          }

          .account-popup-grid {
            grid-template-columns: 1fr;
          }

          .account-popup-actions {
            flex-direction: column-reverse;
          }

          .account-popup-cancel,
          .account-popup-primary {
            width: 100%;
          }
        }

        @keyframes servicePopupIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 560px) {
          .service-popup-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div className="app">

      {/* Navbar */}
      <motion.nav
        className="navbar"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="logo">
          🏥 Health<span>Care+</span>
        </div>

        <div className="nav-links">
          <a href="/">Home</a>
          <a href="#doctors">Doctors</a>
          <a href="#departments">Departments</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
        </div>

          

        {!isLoggedIn ? (
          <div className="auth-actions">
            <a
              href="/login"
              className="navbar-login-btn"
            >
              Login
            </a>

            <a
              href="/signup"
              className="navbar-signup-btn"
            >
              Sign Up
            </a>
          </div>
        ) : (
          <div
            className="account-menu-wrapper"
            ref={accountMenuRef}
          >
            <button
              type="button"
              className="account-menu-btn"
              onClick={() =>
                setAccountMenuOpen(
                  (current) => !current
                )
              }
              aria-expanded={accountMenuOpen}
            >
              <span className="account-avatar-small">
                {(() => {
                  try {
                    const saved = localStorage.getItem("user");
                    const loggedIn = saved ? JSON.parse(saved) : null;

                    return loggedIn?.profile_photo ? (
                      <img
                        src={loggedIn.profile_photo}
                        alt="Profile"
                        className="account-avatar-image"
                      />
                    ) : loggedIn?.name ? (
                      loggedIn.name.charAt(0).toUpperCase()
                    ) : (
                      "U"
                    );
                  } catch {
                    return "U";
                  }
                })()}
              </span>

              <span>My Account</span>
              <span className="account-chevron">
                {accountMenuOpen ? "▲" : "▼"}
              </span>
            </button>

            {accountMenuOpen && (
              <div className="account-dropdown">
                {(() => {
                  let accountUser = null;

                  try {
                    const saved =
                      localStorage.getItem("user");
                    accountUser = saved
                      ? JSON.parse(saved)
                      : null;
                  } catch {
                    accountUser = null;
                  }

                  const accountRole =
                    String(
                      accountUser?.role || "User"
                    )
                      .charAt(0)
                      .toUpperCase() +
                    String(
                      accountUser?.role || "User"
                    ).slice(1);

                  return (
                    <>
                      <div className="account-dropdown-header">
                        <div className="account-avatar-large">
                          {accountUser?.profile_photo ? (
                            <img
                              src={accountUser.profile_photo}
                              alt="Profile"
                              className="account-avatar-image"
                            />
                          ) : accountUser?.name ? (
                            accountUser.name.charAt(0).toUpperCase()
                          ) : (
                            "U"
                          )}
                        </div>

                        <div>
                          <strong>
                            {accountUser?.name ||
                              "User"}
                          </strong>

                          <span>
                            {accountUser?.email ||
                              ""}
                          </span>
                        </div>
                      </div>

                      <div className="account-dropdown-divider" />

                      <div className="account-menu-item role-item">
                        <span>👤</span>

                        <div>
                          <small>Role</small>
                          <strong>
                            {accountRole}
                          </strong>
                        </div>
                      </div>

                      <a
                        href={getDashboardPath()}
                        className="account-menu-item"
                        onClick={() =>
                          setAccountMenuOpen(false)
                        }
                      >
                        <span className="account-item-icon">
                          📊
                        </span>

                        <div>
                          <strong>Dashboard</strong>
                          <small>
                            Open your dashboard
                          </small>
                        </div>

                        <span className="account-item-arrow">
                          →
                        </span>
                      </a>

                      <button
                        type="button"
                        className="account-menu-item"
                        onClick={() =>
                          openAccountPopup("settings")
                        }
                      >
                        <span className="account-item-icon">
                          ⚙️
                        </span>

                        <div>
                          <strong>Settings</strong>
                          <small>
                            Update your account
                          </small>
                        </div>

                        <span className="account-item-arrow">
                          →
                        </span>
                      </button>

                      <button
                        type="button"
                        className="account-menu-item"
                        onClick={() =>
                          openAccountPopup("notifications")
                        }
                      >
                        <span className="account-item-icon account-notification-menu-icon">
                          🔔
                          {unreadNotificationCount > 0 && (
                            <span className="account-notification-badge">
                              {unreadNotificationCount > 99
                                ? "99+"
                                : unreadNotificationCount}
                            </span>
                          )}
                        </span>

                        <div>
                          <strong>Notifications</strong>
                          <small>
                            View your notifications
                          </small>
                        </div>

                        <span className="account-item-arrow">
                          →
                        </span>
                      </button>

                      {String(
                        accountUser?.role || ""
                      ).toLowerCase() !== "admin" && (
<button
                        type="button"
                        className="account-menu-item"
                        onClick={() =>
                          openAccountPopup("support")
                        }
                      >
                        <span className="account-item-icon">
                          🆘
                        </span>

                        <div>
                          <strong>My Support Requests</strong>
                          <small>
                            View problems and admin replies
                          </small>
                        </div>

                        <span className="account-item-arrow">
                          →
                        </span>
                      </button>
                      )}

                      <button
                        type="button"
                        className="account-menu-item"
                        onClick={() =>
                          openAccountPopup("change-password")
                        }
                      >
                        <span className="account-item-icon">
                          🔐
                        </span>

                        <div>
                          <strong>Change Password</strong>
                          <small>
                            Update your account password
                          </small>
                        </div>

                        <span className="account-item-arrow">
                          →
                        </span>
                      </button>

                      

                      {String(
                        accountUser?.role || ""
                      ).toLowerCase() !== "admin" && (
                        <div className="account-help-section">
                          <div className="account-help-title">
                            <span>🆘</span>
                            <strong>Help & Support</strong>
                          </div>

                          <a
                            href="tel:+912233445566"
                            className="account-help-contact"
                          >
                            <span className="account-help-icon">
                              📞
                            </span>

                            <div>
                              <strong>Contact Us</strong>
                              <small>+91 2233445566</small>
                            </div>

                            <span className="account-help-arrow">
                              →
                            </span>
                          </a>

                          <a
                            href="mailto:support@healthcareplus.com"
                            className="account-help-contact"
                          >
                            <span className="account-help-icon">
                              ✉️
                            </span>

                            <div>
                              <strong>Email Us</strong>
                              <small>support@healthcareplus.com</small>
                            </div>

                            <span className="account-help-arrow">
                              →
                            </span>
                          </a>
                        </div>
                      )}

                      <button
                        type="button"
                        className="account-menu-item account-logout-item"
                        onClick={() => {
                          localStorage.removeItem(
                            "token"
                          );

                          localStorage.removeItem(
                            "user"
                          );

                          setAccountMenuOpen(false);

                          window.location.href = "/";
                        }}
                      >
                        <span>↩</span>
                        <strong>Logout</strong>
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </motion.nav>

      {/* Hero */}
      <section className="hero">

        <motion.div
          className="hero-content"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          <p className="welcome">WELCOME TO HEALTHCARE+</p>

          <h1>
            Your Health Is Our
            <span> Priority.</span>
          </h1>

          <p className="hero-text">
            Experience quality healthcare with trusted doctors,
            advanced technology and compassionate care.
          </p>

          <div className="hero-buttons">
            {!isAdmin && !isDoctor && (
              <motion.a
                href="/signup"
                className="primary-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started →
              </motion.a>
            )}

            <motion.a
              href="#doctors"
              className="secondary-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Doctors
            </motion.a>
          </div>

          <div className="hero-stats">
            <div>
              <h2>50+</h2>
              <p>Expert Doctors</p>
            </div>

            <div>
              <h2>10K+</h2>
              <p>Happy Patients</p>
            </div>

            <div>
              <h2>24/7</h2>
              <p>Emergency Care</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <motion.div
            className="doctor-card"
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="doctor-icon">👨‍⚕️</div>
            <h2>Expert Healthcare</h2>
            <p>Professional doctors at your service</p>
          </motion.div>
        </motion.div>

      </section>

      {/* Departments */}
      <section className="departments" id="departments">

        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p>OUR SPECIALIZATIONS</p>
          <h2>Healthcare Departments</h2>
          <span>
            Expert care across multiple medical specialties.
          </span>
        </motion.div>

        <div className="department-grid">
          {[
            ["❤️", "Cardiology", "Heart and cardiovascular care"],
            ["🧠", "Neurology", "Brain and nervous system care"],
            ["🦴", "Orthopedics", "Bone, joint and muscle care"],
            ["👶", "Pediatrics", "Specialized care for children"],
            ["🦷", "Dental Care", "Complete oral and dental care"],
            ["👁️", "Ophthalmology", "Advanced eye care services"],
          ].map((dept, index) => (
            <motion.div
              className="department-card"
              key={dept[1]}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="department-icon">{dept[0]}</div>
              <h3>{dept[1]}</h3>
              <p>{dept[2]}</p>
              {!isAdmin && !isDoctor && (
                <motion.a
  href={
    isLoggedIn
      ? `/appointment?department=${encodeURIComponent(dept[1])}`
      : "/login"
  }
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  className="department-btn"
>
  📅 Book Appointment
</motion.a>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Doctors */}
            {!isDoctor && (
<section className="doctors-section" id="doctors">

        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p>MEET OUR SPECIALISTS</p>
          <h2>Our Expert Doctors</h2>
          <span>
            Experienced professionals dedicated to your health and well-being.
          </span>
        </motion.div>

        <div className="doctor-grid">
          {[
  {
    name: "Dr. Rahul Sharma",
    specialty: "Cardiologist",
    experience: "12+ Years Experience",
    rating: "4.9",
    image: "👨‍⚕️",
  },
  {
    name: "Dr. Priya Patel",
    specialty: "Neurologist",
    experience: "10+ Years Experience",
    rating: "4.8",
    image: "👩‍⚕️",
  },
  {
    name: "Dr. Arjun Mehta",
    specialty: "Orthopedic Surgeon",
    experience: "15+ Years Experience",
    rating: "4.9",
    image: "👨‍⚕️",
  },
  {
    name: "Dr. Sneha Das",
    specialty: "Pediatrician",
    experience: "9+ Years Experience",
    rating: "4.8",
    image: "👩‍⚕️",
  },
  {
    name: "Dr. Vikash Rao",
    specialty: "Dermatologist",
    experience: "11+ Years Experience",
    rating: "4.7",
    image: "👨‍⚕️",
  },
  {
    name: "Dr. Ananya Singh",
    specialty: "Ophthalmologist",
    experience: "13+ Years Experience",
    rating: "4.9",
    image: "👩‍⚕️",
  },
].map((doctor, index) => (
            <motion.div
              className="doctor-profile-card"
              key={doctor.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -10 }}
            >
              <div className="doctor-photo">
                <span>{doctor.image}</span>

                <div className="availability">
                  <span></span>
                  Available
                </div>
              </div>

              <div className="doctor-details">
                <div className="rating">
                  ⭐ {doctor.rating}
                </div>

                <h3>{doctor.name}</h3>

                <p className="specialty">
                  {doctor.specialty}
                </p>

                <p className="experience">
                  {doctor.experience}
                </p>

                {!isAdmin && !isDoctor && (
                  <motion.a
  href={
    isLoggedIn
      ? `/appointment?doctor=${encodeURIComponent(doctor.name)}`
      : "/login"
  }
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  className="doctor-btn"
>
  Book Appointment →
</motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="view-all-doctors">
          <button>View All Doctors →</button>
        </div>
      </section>
      )}

      {/* Services */}
      <section className="services-section" id="services">

        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p>OUR SERVICES</p>
          <h2>Complete Healthcare Solutions</h2>
          <span>
            Everything you need for a smarter, safer and easier healthcare experience.
          </span>
        </motion.div>

        <div className="services-grid">
          {[
            {
              icon: "📅",
              title: "Easy Appointment",
              text: "Book, reschedule or cancel appointments with just a few clicks.",
              description:
                "Find a suitable doctor, choose a convenient date and time, and manage your appointments from one secure healthcare platform.",
            },
            {
              icon: "💊",
              title: "Digital Prescription",
              text: "Access your prescriptions and medicine instructions anytime.",
              description:
                "View your doctor's medicines, dosage, frequency, duration and instructions from your patient dashboard.",
            },
            {
              icon: "🧪",
              title: "Lab Reports",
              text: "Securely view and download your medical and diagnostic reports.",
              description:
                "Review medical and diagnostic reports shared by your doctor and download a PDF copy whenever you need it.",
            },
            {
              icon: "🚑",
              title: "Emergency Care",
              text: "Quick access to emergency services and ambulance assistance.",
              description:
                "Get quick access to emergency calling options when urgent medical assistance is needed.",
            },
            {
              icon: "💳",
              title: "Secure Payments",
              text: "Manage consultation payments through a simple secure system.",
              description:
                "Complete consultation payments, view transaction details, check payment history and download professional receipts.",
            },
            {
              icon: "🔔",
              title: "Smart Notifications",
              text: "Get reminders and real-time updates about your healthcare.",
              description:
                "Receive important updates for appointments, prescriptions, medical reports and payments in one place.",
            },
          ].map((service, index) => (
            <motion.div
              className="service-card"
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <motion.div
                className="service-icon"
                whileHover={{ rotate: 8, scale: 1.08 }}
              >
                {service.icon}
              </motion.div>

              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <button
                type="button"
                className="service-learn-more-btn"
                onClick={() => setSelectedService(service)}
              >
                Learn More →
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-section" id="about">

        <motion.div
          className="why-content"
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="small-title">WHY CHOOSE US</p>

          <h2>
            Healthcare designed
            <span> around you.</span>
          </h2>

          <p className="why-text">
            We combine experienced doctors, modern technology and
            patient-focused care to make healthcare simple and accessible.
          </p>

          <div className="why-list">
            <div className="why-item">
              <div className="check">✓</div>
              <div>
                <h3>Experienced Doctors</h3>
                <p>Trusted specialists with years of medical experience.</p>
              </div>
            </div>

            <div className="why-item">
              <div className="check">✓</div>
              <div>
                <h3>24/7 Support</h3>
                <p>Healthcare assistance whenever you need it.</p>
              </div>
            </div>

            <div className="why-item">
              <div className="check">✓</div>
              <div>
                <h3>Patient First Approach</h3>
                <p>Your comfort, privacy and safety are our priorities.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="why-visual"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="health-circle"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🩺
          </motion.div>

          <div className="floating-card card-one">
            ❤️
            <div>
              <strong>Healthy Care</strong>
              <small>Patient focused</small>
            </div>
          </div>

          <div className="floating-card card-two">
            🛡️
            <div>
              <strong>Secure Data</strong>
              <small>Your privacy matters</small>
            </div>
          </div>
        </motion.div>
      </section>

      {selectedService && (
        <div
          onClick={() => setSelectedService(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(15, 23, 42, 0.62)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(520px, 100%)",
              background: "#ffffff",
              borderRadius: "24px",
              padding: "32px",
              boxSizing: "border-box",
              boxShadow: "0 30px 80px rgba(15, 23, 42, 0.28)",
              border: "1px solid #dbeafe",
              animation: "servicePopupIn 0.22s ease-out",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "38px",
                height: "38px",
                border: "none",
                borderRadius: "12px",
                background: "#f1f5f9",
                color: "#475569",
                fontSize: "22px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                background: "linear-gradient(135deg,#e0f2fe,#dbeafe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                marginBottom: "18px",
              }}
            >
              {selectedService.icon}
            </div>

            <div
              style={{
                color: "#0284c7",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "1px",
                marginBottom: "7px",
              }}
            >
              HEALTHCARE SERVICE
            </div>

            <h2
              style={{
                margin: "0 0 12px",
                color: "#0f172a",
                fontSize: "28px",
                lineHeight: 1.2,
              }}
            >
              {selectedService.title}
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#64748b",
                fontSize: "14px",
                lineHeight: 1.75,
              }}
            >
              {selectedService.description || selectedService.text}
            </p>

            <div
              className="service-popup-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                marginBottom: "22px",
              }}
            >
              {[
                ["✓", "Easy to access"],
                ["✓", "Patient focused"],
                ["✓", "Secure experience"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  style={{
                    padding: "12px 10px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#475569",
                    fontSize: "11px",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#10b981",
                      fontSize: "15px",
                      marginBottom: "4px",
                    }}
                  >
                    {icon}
                  </div>
                  {label}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              {selectedService.title === "Easy Appointment" ? (
                <a
                  href={isLoggedIn ? "/appointment" : "/login"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "11px 17px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  📅 Book Appointment
                </a>
              ) : selectedService.title === "Emergency Care" ? (
                <a
                  href="tel:108"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "11px 17px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg,#ef4444,#dc2626)",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  🚑 Call Ambulance
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  style={{
                    padding: "11px 17px",
                    border: "1px solid #bfdbfe",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency */}
      <section className="emergency-section">

        <motion.div
          className="emergency-content"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="emergency-badge">
            🚨 EMERGENCY CARE
          </div>

          <h2>Need Urgent Medical Assistance?</h2>

          <p>
            Our emergency care team is available 24/7 to provide
            immediate medical assistance when you need it most.
          </p>

          {!isAdmin && (
<div className="emergency-actions">
            {!isAdmin && (

            <motion.button
              type="button"
              className="emergency-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setEmergencyPopup("ambulance")
              }
              aria-label="Request ambulance"
            >
              🚑 Request Ambulance
            </motion.button>

            )}

            {!isAdmin && (


            <motion.button
              type="button"
              className="call-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setEmergencyPopup("call")
              }
              aria-label="Open emergency services"
            >
              📞 Call Emergency
            </motion.button>


            )}
          </div>
)}
        </motion.div>

        <motion.div
          className="emergency-icon"
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            🚑
          </motion.div>
        </motion.div>
      </section>

      {/* Contact */}
      <section className="contact-section">

        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p>GET IN TOUCH</p>
          <h2>Contact Our Healthcare Team</h2>
          <span>
            Have a question? Our support team is here to help you.
          </span>
        </motion.div>

        <div className="contact-wrapper">

          <motion.div className="contact-info">
            <h3>Let's Talk</h3>

            <p>
              Reach out to us for appointments, general questions,
              or healthcare assistance.
            </p>

            <div className="contact-item">
              <div>📍</div>
              <div>
                <strong>Address</strong>
                <span>123 Healthcare Avenue, Bhubaneswar, Odisha</span>
              </div>
            </div>

            <div className="contact-item">
              <div>📞</div>
              <div>
                <strong>Phone</strong>
                <span>+91 98765 43210</span>
              </div>
            </div>

            <div className="contact-item">
              <div>✉️</div>
              <div>
                <strong>Email</strong>
                <span>support@healthcareplus.com</span>
              </div>
            </div>
          </motion.div>

          {!isAdmin && (
          <motion.form
  className="contact-form"
  onSubmit={async (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    const formData = new FormData(form);

    let loggedInUser = null;

    try {
      const savedUser = localStorage.getItem("user");
      loggedInUser = savedUser ? JSON.parse(savedUser) : null;
    } catch {
      loggedInUser = null;
    }

    if (!loggedInUser) {
  window.location.href = "/login";
  return;
}

    const issueType = String(
      formData.get("issueType") || ""
    ).trim();

    const referenceId = String(
      formData.get("referenceId") || ""
    ).trim();

    const description = String(
      formData.get("description") || ""
    ).trim();

    const formattedMessage = [
      `Issue Category: ${issueType || "Other"}`,
      referenceId
        ? `Reference ID: ${referenceId}`
        : "Reference ID: Not provided",
      `Description: ${description}`,
    ].join("\n");

    const payload = {
      userId: loggedInUser?.id || null,
      userRole: String(loggedInUser?.role || "").toLowerCase(),
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      message: formattedMessage,
    };

    try {
      const response = await fetch(
        "https://healthcare-management-system-cjhw.onrender.com/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned:", text);

        throw new Error(
          "Backend server is not responding with JSON."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send message."
        );
      }

      const popup = document.getElementById(
        "contact-success-popup"
      );

      if (popup) {
        popup.classList.add("show");
      }

      form.reset();

    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      alert(
        error.message ||
          "Unable to connect to backend."
      );
    }
  }}
>
  <input
    type="text"
    name="name"
    placeholder="Your Name"
    required
  />

  <input
    type="email"
    name="email"
    placeholder="Your Email"
    required
  />

  <input
    type="text"
    name="phone"
    placeholder="Phone Number"
    required
  />

  <select
    name="issueType"
    required
    defaultValue=""
    className="contact-support-select"
  >
    <option value="" disabled>
      Select Issue Category
    </option>
    <option value="Appointment / Booking">
      Appointment / Booking
    </option>
    <option value="Login">
      Login
    </option>
    <option value="Payment">
      Payment
    </option>
    <option value="Prescription">
      Prescription
    </option>
    <option value="Medical Report">
      Medical Report
    </option>
    <option value="Profile">
      Profile
    </option>
    <option value="Other">
      Other
    </option>
  </select>

  <input
    type="text"
    name="referenceId"
    placeholder="Reference ID (Appointment / Payment / Report ID)"
  />

  <textarea
    name="description"
    rows="5"
    placeholder="Describe your exact problem..."
    required
  />

  <p className="contact-support-hint">
    Add the relevant ID when available so our support team can
    identify the exact record faster.
  </p>

  <motion.button
    type="submit"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    Send Message →
  </motion.button>
</motion.form>
          )}

        </div>
      </section>

      {/* Contact Success Popup */}
      <div
        className="contact-success-popup"
        id="contact-success-popup"
        onClick={(event) => {
          if (
            event.target === event.currentTarget
          ) {
            event.currentTarget.classList.remove("show");
          }
        }}
      >
        <div className="contact-success-card">
          <button
            type="button"
            className="contact-success-close"
            onClick={() => {
              const popup = document.getElementById(
                "contact-success-popup"
              );

              if (popup) {
                popup.classList.remove("show");
              }
            }}
            aria-label="Close"
          >
            ×
          </button>

          <div className="contact-success-icon">
            ✓
          </div>

          <p className="contact-success-label">
            MESSAGE SENT SUCCESSFULLY
          </p>

          <h2>Thank You!</h2>

          <p className="contact-success-text">
            Your message has been received successfully.
            Our HealthCare+ support team will contact you
            as soon as possible.
          </p>

          <button
            type="button"
            className="contact-success-btn"
            onClick={() => {
              const popup = document.getElementById(
                "contact-success-popup"
              );

              if (popup) {
                popup.classList.remove("show");
              }
            }}
          >
            ✓ Okay
          </button>
        </div>
      </div>

      {accountPopup && (
        <div
          className="account-popup-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !profileSaving &&
              !passwordSaving
            ) {
              closeAccountPopup();
            }
          }}
        >
          <div
            className="account-popup-card"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="account-popup-close"
              onClick={closeAccountPopup}
              disabled={
                profileSaving || passwordSaving
              }
            >
              ×
            </button>

            {accountPopup === "settings" && (
              <>
                <div className="account-popup-icon">
                  ⚙️
                </div>

                <p className="account-popup-label">
                  ACCOUNT SETTINGS
                </p>

                <h2>Update Your Profile</h2>

                <p className="account-popup-text">
                  Keep your personal information up to date.
                </p>

                <div className="account-profile-photo-area">
                  <div className="account-profile-photo-preview">
                    {profilePhotoPreview ? (
                      <img
                        src={profilePhotoPreview}
                        alt="Profile Preview"
                        className="account-profile-photo-image"
                      />
                    ) : (
                      (() => {
                        try {
                          const saved = localStorage.getItem("user");
                          const accountUser = saved
                            ? JSON.parse(saved)
                            : null;

                          return accountUser?.name
                            ? accountUser.name
                                .charAt(0)
                                .toUpperCase()
                            : "U";
                        } catch {
                          return "U";
                        }
                      })()
                    )}
                  </div>

                  <div className="account-profile-photo-actions">
                    <label className="account-photo-upload-btn">
                      📷 Add Photo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleProfilePhotoChange}
                        hidden
                      />
                    </label>

                    {profilePhotoPreview && (
                      <button
                        type="button"
                        className="account-photo-remove-btn"
                        onClick={removeProfilePhoto}
                      >
                        Remove
                      </button>
                    )}

                    <small>JPG, PNG or WEBP • Max 5MB</small>
                  </div>
                </div>

                <div className="account-popup-grid">
                  <div>
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label>Mobile Number</label>
                    <input
                      type="text"
                      value={profileForm.mobile}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          mobile: event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        }))
                      }
                      maxLength="10"
                    />
                  </div>

                  <div>
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          dateOfBirth:
                            event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label>Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          gender: event.target.value,
                        }))
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
                  </div>
                </div>

                {profileMessage && (
                  <div
                    className={
                      profileMessage.includes(
                        "successfully"
                      )
                        ? "account-popup-message success"
                        : "account-popup-message error"
                    }
                  >
                    {profileMessage}
                  </div>
                )}

                <div className="account-popup-actions">
                  <button
                    type="button"
                    className="account-popup-cancel"
                    onClick={closeAccountPopup}
                    disabled={profileSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="account-popup-primary"
                    onClick={saveProfileFromHome}
                    disabled={profileSaving}
                  >
                    {profileSaving
                      ? "Saving..."
                      : "💾 Save Changes"}
                  </button>
                </div>
              </>
            )}

            {accountPopup === "support" && (
                      <>
                        <div className="account-popup-icon">
                          🆘
                        </div>

                        <p className="account-popup-label">
                          SUPPORT CENTER
                        </p>

                        <h2>My Support Requests</h2>

                        <p className="account-popup-text">
                          Track your reported problems and see
                          admin responses here.
                        </p>

                        {supportRequestsLoading ? (
                          <div className="account-notification-empty">
                            <div>⏳</div>
                            <strong>
                              Loading support requests...
                            </strong>
                          </div>
                        ) : supportRequests.length === 0 ? (
                          <div className="account-notification-empty">
                            <div>🆘</div>
                            <strong>No support requests yet</strong>
                            <span>
                              Your submitted problems will appear here.
                            </span>
                          </div>
                        ) : (
                          <div className="account-support-list">
                            {supportRequests.map((request) => {
                              const raw = String(
                                request.message || ""
                              );

                              const issue =
                                raw.match(
                                  /Issue Category:\s*(.+?)(?:\n|$)/i
                                )?.[1]?.trim() ||
                                "Other";

                              const reference =
                                raw.match(
                                  /Reference ID:\s*(.+?)(?:\n|$)/i
                                )?.[1]?.trim() ||
                                "";

                              const description =
                                raw.match(
                                  /Description:\s*([\s\S]*)/i
                                )?.[1]?.trim() ||
                                raw;

                              const status =
                                String(
                                  request.status || "New"
                                ).toLowerCase();

                              return (
                                <div
                                  key={request.id}
                                  className="account-support-item"
                                >
                                  <div className="account-support-item-top">
                                    <div>
                                      <strong>{issue}</strong>
                                      {reference && (
                                        <small>
                                          Reference: {reference}
                                        </small>
                                      )}
                                    </div>

                                    <span
                                      className={`account-support-status ${
                                        status === "resolved"
                                          ? "resolved"
                                          : status === "read"
                                          ? "read"
                                          : "new"
                                      }`}
                                    >
                                      {status === "resolved"
                                        ? "Resolved"
                                        : status === "read"
                                        ? "Read"
                                        : "New"}
                                    </span>
                                  </div>

                                  <div className="account-support-description">
                                    <span>Your Problem</span>
                                    <p>{description}</p>
                                  </div>

                                  {request.admin_reply ? (
                                    <div className="account-support-reply">
                                      <div className="account-support-reply-head">
                                        <span>✓</span>
                                        <strong>Admin Reply</strong>
                                      </div>
                                      <p>
                                        {request.admin_reply}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="account-support-waiting">
                                      ⏳ Waiting for admin response
                                    </div>
                                  )}

                                  <small className="account-support-created">
                                    Submitted{" "}
                                    {request.created_at
                                      ? new Date(
                                          request.created_at
                                        ).toLocaleDateString(
                                          "en-IN",
                                          {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          }
                                        )
                                      : ""}
                                  </small>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}

                    {accountPopup === "notifications" && (
              <>
                <div className="account-popup-icon">
                  🔔
                </div>

                <p className="account-popup-label">
                  NOTIFICATIONS
                </p>

                <h2>Your Notifications</h2>

                <p className="account-popup-text">
                  Appointment, prescription, report and payment updates.
                </p>

                <div className="account-popup-unread-count">
                  <span className="account-popup-unread-dot"></span>
                  {unreadNotificationCount} unread notification{
                    unreadNotificationCount === 1 ? "" : "s"
                  }
                </div>

                {notificationsLoading ? (
                  <div className="account-notification-empty">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="account-notification-empty">
                    <div>🔔</div>
                    <strong>No notifications</strong>
                    <span>
                      You are all caught up.
                    </span>
                  </div>
                ) : (
                  <div className="account-notification-list">
                    {notifications.map(
                      (notification) => (
                        <button
                          type="button"
                          key={notification.id}
                          className={
                            notification.is_read
                              ? "account-notification-item read"
                              : "account-notification-item unread"
                          }
                          onClick={() =>
                            markNotificationReadFromHome(
                              notification
                            )
                          }
                        >
                          <span className="account-notification-icon">
                            {notification.type ===
                            "appointment"
                              ? "📅"
                              : notification.type ===
                                "prescription"
                              ? "💊"
                              : notification.type ===
                                "report"
                              ? "📄"
                              : notification.type ===
                                "payment"
                              ? "💳"
                              : "🔔"}
                          </span>

                          <span className="account-notification-content">
                            <strong>
                              {notification.title}
                            </strong>

                            <span>
                              {notification.message}
                            </span>

                            <small>
                              {new Date(
                                notification.created_at
                              ).toLocaleDateString(
                                "en-IN"
                              )}
                            </small>
                          </span>

                          {!notification.is_read && (
                            <span className="account-notification-dot" />
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}

                <div className="account-popup-actions">
                  <button
                    type="button"
                    className="account-popup-primary"
                    onClick={closeAccountPopup}
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {accountPopup === "change-password" && (
              <>
                <div className="account-popup-icon">
                  🔐
                </div>

                <p className="account-popup-label">
                  ACCOUNT SECURITY
                </p>

                <h2>Change Password</h2>

                <p className="account-popup-text">
                  Update your HealthCare+ password securely.
                </p>

                <div className="account-popup-password-fields">
                  <div>
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => {
                        setCurrentPassword(
                          event.target.value
                        );
                        setPasswordMessage("");
                      }}
                      placeholder="Enter current password"
                      autoComplete="current-password"
                    />
                  </div>

                  <div>
                    <label>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(
                          event.target.value
                        );
                        setPasswordMessage("");
                      }}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div>
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(event) => {
                        setConfirmNewPassword(
                          event.target.value
                        );
                        setPasswordMessage("");
                      }}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="account-password-rules">
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
                    {/[@$!%*?&#]/.test(newPassword) ? "✓" : "○"} Special
                  </span>
                </div>

                {passwordMessage && (
                  <div
                    className={
                      passwordMessage.includes(
                        "successfully"
                      )
                        ? "account-popup-message success"
                        : "account-popup-message error"
                    }
                  >
                    {passwordMessage}
                  </div>
                )}

                <div className="account-popup-actions">
                  <button
                    type="button"
                    className="account-popup-cancel"
                    onClick={closeAccountPopup}
                    disabled={passwordSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="account-popup-primary"
                    onClick={changePasswordFromHome}
                    disabled={passwordSaving}
                  >
                    {passwordSaving
                      ? "Updating..."
                      : "🔐 Change Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {emergencyPopup && (
        <div
          className="emergency-popup-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEmergencyPopup(null);
            }
          }}
        >
          <div
            className="emergency-popup-card"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="emergency-popup-close"
              onClick={() =>
                setEmergencyPopup(null)
              }
              aria-label="Close"
            >
              ×
            </button>

            <div className="emergency-popup-icon">
              {emergencyPopup === "ambulance"
                ? "🚑"
                : "📞"}
            </div>

            <div className="emergency-popup-label">
              EMERGENCY SUPPORT
            </div>

            <h2>
              {emergencyPopup === "ambulance"
                ? "Request an Ambulance"
                : "Emergency Assistance"}
            </h2>

            <p className="emergency-popup-text">
              {emergencyPopup === "ambulance"
                ? "For urgent medical assistance, choose an emergency number below."
                : "Choose the appropriate emergency service for immediate assistance."}
            </p>

            <div className="emergency-popup-contact-card">
              <div className="emergency-popup-contact-icon">
                🚨
              </div>

              <div>
                <strong>Emergency Helpline</strong>
                <span>Available 24/7</span>
              </div>
            </div>

            <div className="emergency-popup-actions">
              <a
                href="tel:108"
                className="emergency-popup-primary"
              >
                🚑 Call 108
              </a>

              <a
                href="tel:112"
                className="emergency-popup-secondary"
              >
                📞 Call 112
              </a>
            </div>

            <div className="emergency-popup-note">
              <span>✓</span>
              <p>
                Please provide your exact location
                and describe the emergency clearly.
              </p>
            </div>

            <button
              type="button"
              className="emergency-popup-done"
              onClick={() =>
                setEmergencyPopup(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">

        <div className="footer-main">

          <div className="footer-about">
            <div className="logo">
              🏥 Health<span>Care+</span>
            </div>

            <p>
              Making quality healthcare accessible, simple
              and patient-focused through modern technology.
            </p>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>
            <a href="/">Home</a>
            <a href="#doctors">Doctors</a>
            <a href="#departments">Departments</a>
            <a href="#services">Services</a>
          </div>

          <div className="footer-column">
            <h3>For Patients</h3>
            <a href="/signup">Create Account</a>
            <a href="/login">Login</a>
            <a href="#">Medical Reports</a>
            <a href="#">Prescriptions</a>
          </div>

          <div className="footer-column">
            <h3>Support</h3>
            <a href="#">Help Center</a>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2026 HealthCare+. All rights reserved.</p>

          <div>
            <span>Facebook</span>
            <span>Instagram</span>
            <span>LinkedIn</span>
          </div>
        </div>

      </footer>

      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/create-prescription" element={<CreatePrescription />} />
        <Route path="/create-medical-report" element={<CreateMedicalReport />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { useState } from "react";
import { motion } from "framer-motion";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const mobileRegex = /^[0-9]{10}$/;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!mobileRegex.test(form.mobile)) {
      setError(
        "Mobile number must contain exactly 10 digits."
      );
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.role) {
      setError("Please select an account type.");
      return;
    }

    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must be 8+ characters with uppercase, lowercase, number and special character."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://healthcare-management-system-cjhw.onrender.com/api/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            mobile: form.mobile,
            email: form.email.trim(),
            role: form.role,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Signup failed."
        );
        return;
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setForm({
        name: "",
        mobile: "",
        email: "",
        role: "patient",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);

    } catch (error) {
      console.error("Signup error:", error);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Left Side */}
      <motion.div
        className="auth-visual"
        initial={{
          opacity: 0,
          x: -50,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.7,
        }}
      >
        <div className="auth-brand">
          🏥 Health<span>Care+</span>
        </div>

        <h1>
          Start your
          <br />
          health journey.
        </h1>

        <p>
          Create your account and access modern
          healthcare services in one place.
        </p>

        <div className="auth-feature">
          <span>✓</span>
          Book doctor appointments
        </div>

        <div className="auth-feature">
          <span>✓</span>
          Access prescriptions & reports
        </div>

        <div className="auth-feature">
          <span>✓</span>
          Manage your health securely
        </div>
      </motion.div>

      {/* Signup Card */}
      <motion.div
        className="auth-card signup-card"
        initial={{
          opacity: 0,
          x: 50,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.7,
        }}
      >
        <h2>Create Account</h2>

        <p className="auth-subtitle">
          Join HealthCare+ today
        </p>

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <label>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          {/* Mobile */}
          <label>
            Mobile Number
          </label>

          <input
            type="tel"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="Enter 10-digit mobile number"
            inputMode="numeric"
            maxLength="10"
            pattern="[0-9]{10}"
            required
          />

          {/* Email */}
          <label>
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          {/* Account Type */}
          <label>
            Account Type
          </label>

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="Select Account Type">
              Select Account Type
            </option>

            <option value="patient">
              Patient
            </option>

            <option value="doctor">
              Doctor
            </option>

          </select>

          {/* Password */}
          <label>
            Password
          </label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
          />

          {/* Confirm Password */}
          <label>
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />

          {/* Password Hint */}
          <small className="field-note">
            Password must contain 8+ characters,
            uppercase, lowercase, number and special
            character.
          </small>

          {/* Error */}
          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <p className="form-success">
              {success}
            </p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            className="auth-btn"
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account →"}
          </motion.button>

        </form>

        <p className="auth-bottom">
          Already have an account?{" "}
          <a href="/login">
            Login
          </a>
        </p>

      </motion.div>

    </div>
  );
}

export default Signup;
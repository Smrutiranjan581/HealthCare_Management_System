import { useState } from "react";
import { motion } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://healthcare-management-system-cjhw.onrender.com/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Invalid email or password."
        );
        return;
      }

      // Check login response
      if (!data.token || !data.user) {
        setError("Invalid server response.");
        return;
      }

      // Save JWT token
      localStorage.setItem(
        "token",
        data.token
      );

      // Normalize user role
      const loggedInUser = {
        ...data.user,
        role: String(
          data.user.role || "patient"
        ).toLowerCase(),
      };

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      // =========================
      // ROLE BASED REDIRECT
      // =========================

      if (loggedInUser.role === "patient") {
        window.location.href =
          "/";
        return;
      }

      if (loggedInUser.role === "doctor") {
        window.location.href =
          "/";
        return;
      }

      if (loggedInUser.role === "admin") {
        window.location.href =
          "/";
        return;
      }

      // Unknown role
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setError(
        `Unknown account role: ${data.user.role}`
      );

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

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
          Your health,
          <br />
          in your hands.
        </h1>

        <p>
          Manage appointments, prescriptions and
          medical records from one secure platform.
        </p>

        <div className="auth-feature">
          <span>✓</span>
          Secure healthcare management
        </div>

        <div className="auth-feature">
          <span>✓</span>
          Trusted medical professionals
        </div>

        <div className="auth-feature">
          <span>✓</span>
          Available anytime, anywhere
        </div>
      </motion.div>

      {/* Login Card */}
      <motion.div
        className="auth-card"
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

        <h2>Welcome Back</h2>

        <p className="auth-subtitle">
          Login to your HealthCare+ account
        </p>

        <form onSubmit={handleLogin}>

          {/* Email */}
          <label>
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />

          {/* Password */}
          <label>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {/* Options */}
          <div className="auth-options">

            <label className="remember">
              <input
                type="checkbox"
              />
              Remember me
            </label>

            <a href="#">
              Forgot Password?
            </a>

          </div>

          {/* Error */}
          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          {/* Login Button */}
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
              ? "Logging in..."
              : "Login →"}
          </motion.button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <a
          href="/signup"
          className="demo-btn"
          style={{
            display: "flex",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          Create New Account
        </a>

        <p className="auth-bottom">
          Don't have an account?{" "}
          <a href="/signup">
            Sign Up
          </a>
        </p>

      </motion.div>

    </div>
  );
}

export default Login;
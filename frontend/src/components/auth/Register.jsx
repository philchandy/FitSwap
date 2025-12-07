import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    skills: [],
    wantedSkills: [],
    goals: [],
  });
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const availableSkills = [
    "Weightlifting",
    "Cardio",
    "Yoga",
    "Boxing",
    "Running",
    "Swimming",
    "Cycling",
    "CrossFit",
    "Pilates",
    "Rock Climbing",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillToggle = (skill, type) => {
    const currentSkills = formData[type];
    if (currentSkills.includes(skill)) {
      setFormData({
        ...formData,
        [type]: currentSkills.filter((s) => s !== skill),
      });
    } else {
      setFormData({
        ...formData,
        [type]: [...currentSkills, skill],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      skills: formData.skills,
      wantedSkills: formData.wantedSkills,
      goals: formData.goals.filter((goal) => goal.trim() !== ""),
    };

    const result = await register(userData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo-container">
        <h1 className="auth-logo">
          FITSW<img src="/logo.svg" alt="" className="logo-inline" />P
        </h1>
        <p className="auth-logo-subtitle">Track Solo. Train Together.</p>
      </div>
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon-container">
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <h2 className="auth-title">Join FitSwap</h2>
          <p className="auth-subtitle">Start your fitness journey with us</p>
        </div>

        {error && <div className="auth-error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="auth-form-group">
                <label htmlFor="name" className="auth-form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  className="auth-form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="auth-form-group">
                <label htmlFor="email" className="auth-form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  className="auth-form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="auth-form-group">
                <label htmlFor="password" className="auth-form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="auth-form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="auth-form-group">
                <label htmlFor="confirmPassword" className="auth-form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="auth-form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
            </div>
          </div>

          <div className="auth-skills-section">
            <div className="auth-skills-title">
              <div className="auth-skills-icon">
                <i className="bi bi-trophy"></i>
              </div>
              Skills I can teach:
            </div>
            <div className="auth-skills-grid">
              {availableSkills.map((skill) => (
                <div key={skill} className="auth-checkbox-item">
                  <input
                    className="auth-checkbox-input"
                    type="checkbox"
                    id={`skill-${skill}`}
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill, "skills")}
                  />
                  <label
                    className="auth-checkbox-label"
                    htmlFor={`skill-${skill}`}
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-skills-section">
            <div className="auth-skills-title">
              <div className="auth-skills-icon">
                <i className="bi bi-star"></i>
              </div>
              Skills I want to learn:
            </div>
            <div className="auth-skills-grid">
              {availableSkills.map((skill) => (
                <div key={skill} className="auth-checkbox-item">
                  <input
                    className="auth-checkbox-input"
                    type="checkbox"
                    id={`wanted-${skill}`}
                    checked={formData.wantedSkills.includes(skill)}
                    onChange={() => handleSkillToggle(skill, "wantedSkills")}
                  />
                  <label
                    className="auth-checkbox-label"
                    htmlFor={`wanted-${skill}`}
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-footer-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

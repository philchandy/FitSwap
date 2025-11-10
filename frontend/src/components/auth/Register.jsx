import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

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
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Join FitSwap</h2>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Skills I can teach:</label>
                <div className="row">
                  {availableSkills.map((skill) => (
                    <div key={skill} className="col-md-4 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`skill-${skill}`}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill, "skills")}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`skill-${skill}`}
                        >
                          {skill}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Skills I want to learn:</label>
                <div className="row">
                  {availableSkills.map((skill) => (
                    <div key={skill} className="col-md-4 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`wanted-${skill}`}
                          checked={formData.wantedSkills.includes(skill)}
                          onChange={() =>
                            handleSkillToggle(skill, "wantedSkills")
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`wanted-${skill}`}
                        >
                          {skill}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-3">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-decoration-none">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

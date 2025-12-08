import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/Profile.css";

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    skills: user?.skills || [],
    wantedSkills: user?.wantedSkills || [],
    goals: user?.goals || [],
  });
  const [message, setMessage] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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

  const handleGoalAdd = () => {
    if (newGoal.trim()) {
      setFormData({
        ...formData,
        goals: [...formData.goals, newGoal.trim()],
      });
      setNewGoal("");
    }
  };

  const handleGoalDelete = (index) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index),
    });
  };

  useEffect(() => {
    if (showEditModal && modalRef.current) {
      modalRef.current.focus();
    }
  }, [showEditModal]);

  const openEditModal = () => {
    setFormData({
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      skills: user?.skills || [],
      wantedSkills: user?.wantedSkills || [],
      goals: user?.goals || [],
    });
    setMessage("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const result = await updateProfile(user._id, formData);

    if (result.success) {
      setShowEditModal(false);
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <>
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-popup-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h3>Profile Updated Successfully!</h3>
            <p>Your profile information has been saved.</p>
          </div>
        </div>
      )}

      <div className="profile-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="profile-title">My Profile</h2>
          <button className="profile-edit-btn" onClick={openEditModal}>
            <i className="bi bi-pencil me-2"></i>
            Edit Profile
          </button>
        </div>
        <hr className="chart-divider" />

        <div className="profile-card">
          <div className="profile-section">
            <div className="profile-section-title">
              <div className="profile-section-icon">
                <i className="bi bi-person"></i>
              </div>
              Basic Information
            </div>
            <div className="profile-section-content">
              <div className="profile-info-row">
                <div className="profile-info-label">Name:</div>
                <div className="profile-info-value">{user.name}</div>
              </div>
              <div className="profile-info-row">
                <div className="profile-info-label">Email:</div>
                <div className="profile-info-value">{user.email}</div>
              </div>
              {user.location && (
                <div className="profile-info-row">
                  <div className="profile-info-label">Location:</div>
                  <div className="profile-info-value">
                    <i className="bi bi-geo-alt me-1"></i>
                    {user.location}
                  </div>
                </div>
              )}
              {user.bio && (
                <div className="profile-info-row">
                  <div className="profile-info-label">Bio:</div>
                  <div className="profile-info-value">{user.bio}</div>
                </div>
              )}
            </div>
          </div>

          {user.skills && user.skills.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">
                <div className="profile-section-icon">
                  <i className="bi bi-trophy"></i>
                </div>
                Skills I Can Teach
              </div>
              <div className="profile-section-content">
                {user.skills.map((skill) => (
                  <span key={skill} className="profile-skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.wantedSkills && user.wantedSkills.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">
                <div className="profile-section-icon">
                  <i className="bi bi-star"></i>
                </div>
                Skills I Want to Learn
              </div>
              <div className="profile-section-content">
                {user.wantedSkills.map((skill) => (
                  <span key={skill} className="profile-skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.goals && user.goals.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">
                <div className="profile-section-icon">
                  <i className="bi bi-bullseye"></i>
                </div>
                Fitness Goals
              </div>
              <div className="profile-section-content">
                {user.goals.map((goal, index) => (
                  <span key={index} className="profile-skill-badge">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {showEditModal && (
          <>
            <div
              className="profile-form-overlay"
              onClick={closeEditModal}
            ></div>
            <div className="profile-form-modal" ref={modalRef} tabIndex={-1}>
              <div className="profile-form-header">
                <h3 className="profile-form-title">Edit Profile</h3>
                <button
                  className="profile-form-close"
                  onClick={closeEditModal}
                  aria-label="Close modal"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="profile-form-body">
                {message && (
                  <div className="profile-success-message">{message}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="profile-form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      className="profile-form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="bio" className="profile-form-label">
                      Bio
                    </label>
                    <textarea
                      className="profile-form-control profile-form-textarea"
                      id="bio"
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="location" className="profile-form-label">
                      Location
                    </label>
                    <input
                      type="text"
                      className="profile-form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, State"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="profile-form-label">
                      Skills I can teach:
                    </label>
                    <div className="profile-skills-grid">
                      {availableSkills.map((skill) => (
                        <div key={skill} className="profile-checkbox-item">
                          <input
                            className="profile-checkbox-input"
                            type="checkbox"
                            id={`skill-${skill}`}
                            checked={formData.skills.includes(skill)}
                            onChange={() => handleSkillToggle(skill, "skills")}
                          />
                          <label
                            className="profile-checkbox-label"
                            htmlFor={`skill-${skill}`}
                          >
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="profile-form-label">
                      Skills I want to learn:
                    </label>
                    <div className="profile-skills-grid">
                      {availableSkills.map((skill) => (
                        <div key={skill} className="profile-checkbox-item">
                          <input
                            className="profile-checkbox-input"
                            type="checkbox"
                            id={`wanted-${skill}`}
                            checked={formData.wantedSkills.includes(skill)}
                            onChange={() =>
                              handleSkillToggle(skill, "wantedSkills")
                            }
                          />
                          <label
                            className="profile-checkbox-label"
                            htmlFor={`wanted-${skill}`}
                          >
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="profile-form-label">Fitness Goals:</label>
                    <div className="profile-goal-input-group">
                      <input
                        type="text"
                        className="profile-form-control profile-goal-input"
                        placeholder="Add a new goal..."
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleGoalAdd();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="profile-goal-add-btn"
                        onClick={handleGoalAdd}
                        disabled={!newGoal.trim()}
                      >
                        Add Goal
                      </button>
                    </div>
                    {formData.goals.length > 0 && (
                      <div className="profile-goals-list">
                        {formData.goals.map((goal, index) => (
                          <div key={index} className="profile-goal-badge">
                            <span className="profile-goal-text">{goal}</span>
                            <button
                              type="button"
                              className="profile-goal-delete"
                              onClick={() => handleGoalDelete(index)}
                              aria-label="Delete goal"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-cancel-btn"
                      onClick={closeEditModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="profile-submit-btn"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Profile;

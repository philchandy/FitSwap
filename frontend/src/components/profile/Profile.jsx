import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [editing, setEditing] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const result = await updateProfile(user._id, formData);

    if (result.success) {
      setMessage("Profile updated successfully!");
      setEditing(false);
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>My Profile</h2>
              <button
                className="btn btn-outline-primary"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {message && (
              <div
                className={`alert ${message.includes("Error") ? "alert-danger" : "alert-success"}`}
              >
                {message}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
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

                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">
                    Bio
                  </label>
                  <textarea
                    className="form-control"
                    id="bio"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State"
                  />
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

                <div className="mb-3">
                  <label className="form-label">Fitness Goals:</label>
                  <div className="mb-2">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add a new goal..."
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={handleGoalAdd}
                        disabled={!newGoal.trim()}
                      >
                        Add Goal
                      </button>
                    </div>
                  </div>
                  {formData.goals.length > 0 && (
                    <div className="mt-2">
                      {formData.goals.map((goal, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-center mb-2"
                        >
                          <span className="badge bg-success me-2 flex-grow-1 text-start">
                            {goal}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleGoalDelete(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            ) : (
              <div>
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <strong>Name:</strong>
                  </div>
                  <div className="col-sm-9">{user.name}</div>
                </div>

                <div className="row mb-3">
                  <div className="col-sm-3">
                    <strong>Email:</strong>
                  </div>
                  <div className="col-sm-9">{user.email}</div>
                </div>

                {user.bio && (
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Bio:</strong>
                    </div>
                    <div className="col-sm-9">{user.bio}</div>
                  </div>
                )}

                {user.location && (
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Location:</strong>
                    </div>
                    <div className="col-sm-9">{user.location}</div>
                  </div>
                )}

                {user.skills && user.skills.length > 0 && (
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Skills I teach:</strong>
                    </div>
                    <div className="col-sm-9">
                      {user.skills.map((skill) => (
                        <span key={skill} className="badge bg-secondary me-2">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.wantedSkills && user.wantedSkills.length > 0 && (
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Want to learn:</strong>
                    </div>
                    <div className="col-sm-9">
                      {user.wantedSkills.map((skill) => (
                        <span key={skill} className="badge bg-secondary me-2">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.goals && user.goals.length > 0 && (
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Fitness Goals:</strong>
                    </div>
                    <div className="col-sm-9">
                      {user.goals.map((goal, index) => (
                        <div
                          key={index}
                          className="badge bg-secondary me-2 mb-2"
                        >
                          {goal}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

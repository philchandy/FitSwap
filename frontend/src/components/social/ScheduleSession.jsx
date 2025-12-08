import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ScheduleSession = () => {
  const { userId } = useParams(); //user id of trainee
  const { user } = useAuth();
  const navigate = useNavigate();

  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    skill: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const fetchTargetUser = async () => {
      try {
        const response = await fetch(`/api/discover/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setTargetUser(userData);

          //check for common skills
          const commonSkills =
            userData.skills?.filter((skill) =>
              user.wantedSkills?.includes(skill)
            ) || [];

          if (commonSkills.length > 0) {
            setFormData((prev) => ({
              ...prev,
              skill: commonSkills[0],
              title: `${commonSkills[0]} Training Session`,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (userId) {
      fetchTargetUser();
    }
  }, [userId, user.wantedSkills]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    console.log("Form submitted");

    try {
      const sessionData = {
        trainerId: userId,
        traineeId: user._id, //curr user
        ...formData,
      };

      console.log("Session data:", sessionData);

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        console.log("Session created successfully, showing popup");
        setShowSuccessPopup(true);
        console.log("showSuccessPopup set to true");
        setTimeout(() => {
          navigate("/sessions");
        }, 2000);
      } else {
        const data = await response.json();
        console.log("Error response:", data);
        setMessage(`Error: ${data.error}`);
        setLoading(false);
      }
    } catch (err) {
      console.error("Catch block error:", err);
      setMessage("Error scheduling session");
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to schedule a session.</div>;
  }

  if (!targetUser) {
    return <div>Loading user information...</div>;
  }

  return (
    <>
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-popup-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h3>Session Scheduled Successfully!</h3>
            <p>Redirecting to your sessions...</p>
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title">
                Schedule Session with {targetUser.name}
              </h2>

              <div className="alert alert-info mb-4">
                <div className="row">
                  <div className="col-md-6">
                    <strong>Skills they can teach:</strong>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {targetUser.skills?.map((skill) => (
                        <span key={skill} className="badge bg-primary">
                          {skill}
                        </span>
                      )) || <span>No skills listed</span>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong>Skills they want to learn:</strong>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {targetUser.wantedSkills?.map((skill) => (
                        <span key={skill} className="badge bg-secondary">
                          {skill}
                        </span>
                      )) || <span>No skills listed</span>}
                    </div>
                  </div>
                </div>
              </div>

              {message && (
                <div
                  className={`alert ${message.includes("Error") ? "alert-danger" : "alert-success"}`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="title" className="form-label">
                      Session Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Weightlifting Basics"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="skill" className="form-label">
                      Skill Focus
                    </label>
                    <select
                      className="form-select"
                      id="skill"
                      name="skill"
                      value={formData.skill}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a skill</option>
                      {targetUser.skills?.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="date" className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="startTime" className="form-label">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="endTime" className="form-label">
                      End Time
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
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
                    placeholder="Gym name, park, online, etc."
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">
                    Additional Notes
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special requests or additional information..."
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Scheduling..." : "Schedule Session"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/discover")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleSession;

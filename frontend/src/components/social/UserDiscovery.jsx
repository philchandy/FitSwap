import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import "../../styles/UserDiscovery.css";

const UserDiscovery = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    skill: "",
    location: "",
  });
  const [activeTab, setActiveTab] = useState("discover"); //set to discover or matches
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    title: "",
    skill: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [matchesPage, setMatchesPage] = useState(1);
  const usersPerPage = 9;
  const matchesPerPage = 9;

  //pagination
  const totalUsersPages = Math.ceil(users.length / usersPerPage);
  const startUsersIndex = (usersPage - 1) * usersPerPage;
  const paginatedUsers = users.slice(
    startUsersIndex,
    startUsersIndex + usersPerPage
  );

  // matches pagination
  const totalMatchesPages = Math.ceil(matches.length / matchesPerPage);
  const startMatchesIndex = (matchesPage - 1) * matchesPerPage;
  const paginatedMatches = matches.slice(
    startMatchesIndex,
    startMatchesIndex + matchesPerPage
  );

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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter.skill) params.append("skill", filter.skill);
        if (filter.location) params.append("location", filter.location);

        const response = await fetch(
          `/api/discover/discover/${user._id}?${params}`
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/discover/matches/${user._id}`);
        if (response.ok) {
          const data = await response.json();
          setMatches(data);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      if (activeTab === "discover") {
        fetchUsers();
      } else {
        fetchMatches();
      }
    }
  }, [user, filter, activeTab]);

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
    setUsersPage(1);
  };

  const clearFilters = () => {
    setFilter({ skill: "", location: "" });
    setUsersPage(1);
  };

  const openScheduleModal = (targetUser) => {
    setSelectedUser(targetUser);
    setShowScheduleModal(true);
    setScheduleMessage("");

    const commonSkills =
      targetUser.skills?.filter((skill) =>
        user.wantedSkills?.includes(skill)
      ) || [];

    if (commonSkills.length > 0) {
      setSessionForm({
        title: `${commonSkills[0]} Training Session`,
        skill: commonSkills[0],
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        notes: "",
      });
    } else {
      setSessionForm({
        title: "",
        skill: targetUser.skills?.[0] || "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        notes: "",
      });
    }
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedUser(null);
    setSessionForm({
      title: "",
      skill: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      notes: "",
    });
    setScheduleMessage("");
  };

  const handleSessionFormChange = (e) => {
    setSessionForm({
      ...sessionForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleMessage("");

    try {
      const sessionData = {
        trainerId: selectedUser._id,
        traineeId: user._id,
        ...sessionForm,
      };

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        setScheduleMessage("Session scheduled successfully!");
        setTimeout(() => {
          closeScheduleModal();
        }, 2000);
      } else {
        const data = await response.json();
        setScheduleMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setScheduleMessage("Error scheduling session");
      console.error("Error:", err);
    }
  };

  if (!user) {
    return <div>Please log in to discover other users.</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Find Workout Partners</h2>

        <div className="chart-filters discovery-tabs">
          <button
            className={`chart-filter-btn ${activeTab === "discover" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("discover");
              setUsersPage(1);
            }}
          >
            Discover Users
          </button>
          <button
            className={`chart-filter-btn ${activeTab === "matches" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("matches");
              setMatchesPage(1);
            }}
          >
            My Matches
          </button>
        </div>
      </div>
      <hr className="chart-divider" />

      {activeTab === "discover" && (
        <div className="discovery-filters">
          <h5 className="discovery-filters-title">Filters</h5>
          <div className="row">
            <div className="col-md-4">
              <label htmlFor="skill" className="form-label">
                Skill
              </label>
              <select
                className="form-select"
                id="skill"
                name="skill"
                value={filter.skill}
                onChange={handleFilterChange}
              >
                <option value="">All Skills</option>
                {availableSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="location" className="form-label">
                Location
              </label>
              <input
                type="text"
                className="form-control"
                id="location"
                name="location"
                value={filter.location}
                onChange={handleFilterChange}
                placeholder="City, State"
              />
            </div>

            <div className="col-md-4 d-flex align-items-end">
              <button className="chart-filter-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="row">
        {activeTab === "discover" ? (
          users.length === 0 && !loading ? (
            <div className="col-12">
              <div className="discovery-empty-state">
                <h4>No users found</h4>
                <p>Try adjusting your filters or check back later!</p>
              </div>
            </div>
          ) : (
            paginatedUsers.map((userItem) => (
              <UserCard
                key={userItem._id}
                user={userItem}
                onSchedule={openScheduleModal}
              />
            ))
          )
        ) : matches.length === 0 && !loading ? (
          <div className="col-12">
            <div className="discovery-empty-state">
              <h4>No matches found</h4>
              <p>
                Update your skills and wanted skills in your profile to find
                better matches!
              </p>
              <Link to="/profile" className="chart-filter-btn active">
                Update Profile
              </Link>
            </div>
          </div>
        ) : (
          paginatedMatches.map((match) => (
            <MatchCard
              key={match._id}
              match={match}
              onSchedule={openScheduleModal}
            />
          ))
        )}
      </div>

      {activeTab === "discover" && users.length > 0 && totalUsersPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <button
            className="chart-filter-btn"
            onClick={() => setUsersPage(1)}
            disabled={usersPage === 1}
          >
            First
          </button>
          <button
            className="chart-filter-btn"
            onClick={() => setUsersPage(usersPage - 1)}
            disabled={usersPage === 1}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          {(() => {
            const maxButtons = 5;
            let startPage = Math.max(1, usersPage - Math.floor(maxButtons / 2));
            let endPage = Math.min(totalUsersPages, startPage + maxButtons - 1);
            if (endPage - startPage + 1 < maxButtons) {
              startPage = Math.max(1, endPage - maxButtons + 1);
            }
            return Array.from(
              { length: endPage - startPage + 1 },
              (_, i) => startPage + i
            ).map((page) => (
              <button
                key={page}
                className={`chart-filter-btn ${page === usersPage ? "active" : ""}`}
                onClick={() => setUsersPage(page)}
              >
                {page}
              </button>
            ));
          })()}
          <button
            className="chart-filter-btn"
            onClick={() => setUsersPage(usersPage + 1)}
            disabled={usersPage === totalUsersPages}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
          <button
            className="chart-filter-btn"
            onClick={() => setUsersPage(totalUsersPages)}
            disabled={usersPage === totalUsersPages}
          >
            Last
          </button>
        </div>
      )}

      {activeTab === "matches" &&
        matches.length > 0 &&
        totalMatchesPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
            <button
              className="chart-filter-btn"
              onClick={() => setMatchesPage(1)}
              disabled={matchesPage === 1}
            >
              First
            </button>
            <button
              className="chart-filter-btn"
              onClick={() => setMatchesPage(matchesPage - 1)}
              disabled={matchesPage === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            {(() => {
              const maxButtons = 5;
              let startPage = Math.max(
                1,
                matchesPage - Math.floor(maxButtons / 2)
              );
              let endPage = Math.min(
                totalMatchesPages,
                startPage + maxButtons - 1
              );
              if (endPage - startPage + 1 < maxButtons) {
                startPage = Math.max(1, endPage - maxButtons + 1);
              }
              return Array.from(
                { length: endPage - startPage + 1 },
                (_, i) => startPage + i
              ).map((page) => (
                <button
                  key={page}
                  className={`chart-filter-btn ${page === matchesPage ? "active" : ""}`}
                  onClick={() => setMatchesPage(page)}
                >
                  {page}
                </button>
              ));
            })()}
            <button
              className="chart-filter-btn"
              onClick={() => setMatchesPage(matchesPage + 1)}
              disabled={matchesPage === totalMatchesPages}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            <button
              className="chart-filter-btn"
              onClick={() => setMatchesPage(totalMatchesPages)}
              disabled={matchesPage === totalMatchesPages}
            >
              Last
            </button>
          </div>
        )}

      {showScheduleModal && selectedUser && (
        <>
          <div
            className="workout-form-overlay"
            onClick={closeScheduleModal}
          ></div>
          <div className="workout-form-modal">
            <div className="workout-form-header">
              <h3 className="workout-form-title">
                Schedule Session with {selectedUser.name}
              </h3>
              <button
                className="workout-form-close"
                onClick={closeScheduleModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ padding: "2rem" }}>
              <div className="mb-3">
                <div className="row">
                  <div className="col-md-6">
                    <strong>Skills they can teach:</strong>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {selectedUser.skills?.map((skill) => (
                        <span key={skill} className="discovery-skill-badge">
                          {skill}
                        </span>
                      )) || <span>No skills listed</span>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong>Skills they want to learn:</strong>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {selectedUser.wantedSkills?.map((skill) => (
                        <span key={skill} className="discovery-skill-badge">
                          {skill}
                        </span>
                      )) || <span>No skills listed</span>}
                    </div>
                  </div>
                </div>
              </div>

              {scheduleMessage && (
                <div
                  className={`alert ${scheduleMessage.includes("Error") ? "alert-danger" : "alert-success"}`}
                >
                  {scheduleMessage}
                </div>
              )}

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
                    value={sessionForm.title}
                    onChange={handleSessionFormChange}
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
                    value={sessionForm.skill}
                    onChange={handleSessionFormChange}
                    required
                  >
                    <option value="">Select a skill</option>
                    {selectedUser.skills?.map((skill) => (
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
                    value={sessionForm.date}
                    onChange={handleSessionFormChange}
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
                    value={sessionForm.startTime}
                    onChange={handleSessionFormChange}
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
                    value={sessionForm.endTime}
                    onChange={handleSessionFormChange}
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
                  value={sessionForm.location}
                  onChange={handleSessionFormChange}
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
                  value={sessionForm.notes}
                  onChange={handleSessionFormChange}
                  placeholder="Any special requests or additional information..."
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  Schedule Session
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeScheduleModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

const UserCard = ({ user, onSchedule }) => {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="discovery-card">
        <div className="discovery-card-header">
          <h5 className="discovery-card-title">{user.name}</h5>
        </div>

        <div className="discovery-card-body">
          {user.location && (
            <div className="discovery-stats">
              <div className="discovery-stat-item">
                <div className="discovery-stat-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div className="discovery-stat-content">
                  <div className="discovery-stat-label">Location</div>
                  <div className="discovery-stat-value">{user.location}</div>
                </div>
              </div>
            </div>
          )}

          {user.bio && <div className="discovery-bio">{user.bio}</div>}

          {user.skills && user.skills.length > 0 && (
            <div className="discovery-skills">
              <div className="discovery-skills-label">Skills</div>
              <div className="discovery-skills-list">
                {user.skills.map((skill) => (
                  <span key={skill} className="discovery-skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.wantedSkills && user.wantedSkills.length > 0 && (
            <div className="discovery-skills">
              <div className="discovery-skills-label">Wants to Learn</div>
              <div className="discovery-skills-list">
                {user.wantedSkills.map((skill) => (
                  <span key={skill} className="discovery-skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="discovery-action">
            <button
              onClick={() => onSchedule(user)}
              className="chart-filter-btn active"
            >
              Schedule Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchCard = ({ match, onSchedule }) => {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="discovery-card">
        <div className="discovery-card-header">
          <h5 className="discovery-card-title">{match.name}</h5>
          <span className="match-score-badge">
            <i className="bi bi-star-fill"></i>
            {match.matchScore}
          </span>
        </div>

        <div className="discovery-card-body">
          {match.location && (
            <div className="discovery-stats">
              <div className="discovery-stat-item">
                <div className="discovery-stat-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div className="discovery-stat-content">
                  <div className="discovery-stat-label">Location</div>
                  <div className="discovery-stat-value">{match.location}</div>
                </div>
              </div>
            </div>
          )}

          {match.canTeachMe && match.canTeachMe.length > 0 && (
            <div className="discovery-skills">
              <div className="discovery-skills-label">Can Teach You</div>
              <div className="discovery-skills-list">
                {match.canTeachMe.map((skill) => (
                  <span key={skill} className="discovery-skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {match.canLearnFromMe && match.canLearnFromMe.length > 0 && (
            <div className="discovery-skills">
              <div className="discovery-skills-label">You Can Teach</div>
              <div className="discovery-skills-list">
                {match.canLearnFromMe.map((skill) => (
                  <span key={skill} className="discovery-skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="discovery-action">
            <button
              onClick={() => onSchedule(match)}
              className="chart-filter-btn active"
            >
              Schedule Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDiscovery;

import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import FormField, { SelectField, TextAreaField } from "../components/FormField.jsx";
import Loading from "../components/Loading.jsx";

const ClientProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [clientProfile, setClientProfile] = useState({
    fullName: "",
    company: "",
    profilePhotoUrl: ""
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [clientProfileOpen, setClientProfileOpen] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProject, setReviewProject] = useState(null);
  const [reviewFormState, setReviewFormState] = useState({
    rating: 5,
    comment: ""
  });
  const [reviewErrors, setReviewErrors] = useState({});
  
  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsRes, profileRes] = await Promise.all([
        api.get("/clients/me/projects"),
        api.get("/clients/me")
      ]);
      setProjects(projectsRes.data);
      setClientProfile({
        fullName: profileRes.data.fullName || "",
        company: profileRes.data.company || "",
        profilePhotoUrl: profileRes.data.profilePhotoUrl || ""
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    const handler = () => setClientProfileOpen(true);
    window.addEventListener("open-client-profile", handler);
    return () => window.removeEventListener("open-client-profile", handler);
  }, []);
  
  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileMessage("");
    try {
      const response = await api.put("/clients/me", clientProfile);
      setClientProfile({
        fullName: response.data.fullName || "",
        company: response.data.company || "",
        profilePhotoUrl: response.data.profilePhotoUrl || ""
      });
      setProfileMessage("Profile updated.");
      setProfileEditing(false);
      window.dispatchEvent(new Event("skillhive-profile-updated"));
    } catch (err) {
      setProfileMessage(err.response?.data?.error || "Could not update profile.");
    }
  };

  const openReviewModal = (project) => {
    setReviewProject(project);
    setReviewFormState({ rating: 5, comment: "" });
    setReviewErrors({});
    setReviewModalOpen(true);
  };

  const submitLocalReview = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!reviewFormState.comment.trim()) {
      errors.comment = "Review comment is required.";
    }
    setReviewErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setMessage("");
    try {
      await api.post(`/clients/me/projects/${reviewProject?.id}/complete`, {
        rating: Number(reviewFormState.rating || 5),
        comment: reviewFormState.comment
      });
      setMessage("Project marked as completed.");
      await loadData();
      window.dispatchEvent(new Event("skillhive-ratings-updated"));
      setReviewModalOpen(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "Could not complete project.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-6">
        <h2 className="font-display text-3xl font-semibold">Your Projects</h2>
        <p className="text-sm text-ink/60">
          Track project status and mark work as completed.
        </p>
      </div>

      {loading ? (
        <Loading label="Loading dashboard..." />
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <div className="glass-card rounded-3xl border border-white/60 p-6 shadow-soft">
              <h3 className="font-display text-xl font-semibold">Your projects</h3>
              <div className="mt-4 space-y-3 text-sm text-ink/70">
                {projects.length === 0 && <p>No projects yet.</p>}
                {projects.map((project) => (
                  <div key={project.id} className="rounded-2xl bg-white/70 p-4">
                    <p className="font-semibold">{project.title}</p>
                    <p className="text-xs text-ink/60">{project.status}</p>
                    <p className="text-xs text-ink/70">
                      Freelancer: {project.freelancer?.fullName || "Assigned"}
                    </p>
                    {project.description && (
                      <p className="text-xs text-ink/70">
                        Description: {project.description}
                      </p>
                    )}
                    {project.duration && (
                      <p className="text-xs text-ink/70">
                        Duration: {project.duration}
                      </p>
                    )}
                    {project.salary && (
                      <p className="text-xs text-ink/70">
                        Salary offered: {project.salary}
                      </p>
                    )}
                    {project.status !== "COMPLETED" && (
                      <div className="mt-3">
                        <button
                          onClick={() => openReviewModal(project)}
                          className="rounded-full bg-honey px-3 py-1 text-xs text-ink"
                        >
                          Mark as complete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {message && <p className="mt-6 text-sm text-emerald-600">{message}</p>}
        </>
      )}
      {clientProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-2xl font-semibold">Client profile</h3>
                <button
                  type="button"
                  onClick={() => setProfileEditing(true)}
                  className="rounded-full border border-ink/20 px-2 py-1 text-xs text-ink/60 hover:border-ink/40"
                >
                  Edit ✎
                </button>
              </div>
              <button
                onClick={() => {
                  setClientProfileOpen(false);
                  setProfileEditing(false);
                }}
                className="rounded-full border border-ink/20 px-3 py-1 text-sm text-ink"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleProfileSave} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Full name"
                  value={clientProfile.fullName}
                  disabled={!profileEditing}
                  onChange={(event) =>
                    setClientProfile({ ...clientProfile, fullName: event.target.value })
                  }
                />
                <FormField
                  label="Company"
                  value={clientProfile.company}
                  disabled={!profileEditing}
                  onChange={(event) =>
                    setClientProfile({ ...clientProfile, company: event.target.value })
                  }
                />
              </div>
              <label className="flex flex-col gap-2 text-sm font-medium text-ink/80">
                Profile photo
                <input
                  type="file"
                  accept="image/*"
                  disabled={!profileEditing}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setClientProfile((prev) => ({
                        ...prev,
                        profilePhotoUrl: reader.result
                      }));
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-ink shadow-sm outline-none transition focus:border-sky"
                />
              </label>
              {profileMessage && (
                <p className="text-sm text-emerald-600">{profileMessage}</p>
              )}
              {profileEditing && (
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileEditing(false)}
                    className="rounded-full border border-ink/20 px-4 py-2 text-ink"
                  >
                    Cancel
                  </button>
                  <button className="rounded-full bg-honey px-6 py-2 text-ink">
                    Save profile
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Leave a review</h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="rounded-full border border-ink/20 px-3 py-1 text-sm text-ink"
              >
                Close
              </button>
            </div>
            <form onSubmit={submitLocalReview} className="mt-4 space-y-4">
              <SelectField
                label="Rating"
                value={reviewFormState.rating}
                onChange={(event) =>
                  setReviewFormState({
                    ...reviewFormState,
                    rating: Number(event.target.value)
                  })
                }
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} ★
                  </option>
                ))}
              </SelectField>
              <TextAreaField
                label="Review comment"
                value={reviewFormState.comment}
                onChange={(event) =>
                  setReviewFormState({ ...reviewFormState, comment: event.target.value })
                }
              />
              {reviewErrors.comment && (
                <p className="text-xs text-red-600">{reviewErrors.comment}</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="rounded-full border border-ink/20 px-4 py-2 text-ink"
                >
                  Cancel
                </button>
                <button className="rounded-full bg-honey px-6 py-2 text-ink">
                  Submit review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ClientProjects;

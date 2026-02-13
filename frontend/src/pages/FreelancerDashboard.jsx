import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import FormField, { TextAreaField } from "../components/FormField.jsx";
import Loading from "../components/Loading.jsx";

const FreelancerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    bio: "",
    skills: "",
    categoryNames: [],
    whatsapp: "",
    contactEmail: "",
    profilePhotoUrl: ""
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, projectsRes, reviewsRes, categoriesRes] = await Promise.all([
        api.get("/freelancers/me"),
        api.get("/freelancers/me/projects"),
        api.get("/freelancers/me/reviews"),
        api.get("/categories")
      ]);
      setProfile(profileRes.data);
      setProjects(projectsRes.data);
      setReviews(reviewsRes.data);
      setCategories(categoriesRes.data);
      setProfileForm({
        fullName: profileRes.data.fullName || "",
        bio: profileRes.data.bio || "",
        skills: profileRes.data.skills || "",
        categoryNames: profileRes.data.categories || [],
        whatsapp: profileRes.data.whatsapp || "",
        contactEmail: profileRes.data.contactEmail || "",
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
    const handler = () => loadData();
    window.addEventListener("skillhive-ratings-updated", handler);
    return () => window.removeEventListener("skillhive-ratings-updated", handler);
  }, []);

  useEffect(() => {
    const handler = () => setProfileModalOpen(true);
    window.addEventListener("open-freelancer-profile", handler);
    return () => window.removeEventListener("open-freelancer-profile", handler);
  }, []);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await api.put("/freelancers/me", {
        ...profileForm,
        categoryNames: profileForm.categoryNames
      });
      setProfile(response.data);
      setMessage("Profile updated.");
      setProfileEditing(false);
      window.dispatchEvent(new Event("skillhive-profile-updated"));
    } catch (err) {
      setMessage(err.response?.data?.error || "Could not update profile.");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <Loading label="Loading dashboard..." />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">Freelancer Dashboard</h2>
        <p className="text-sm text-ink/60">
          Manage your profile and incoming projects.
        </p>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-[1fr_1fr]">
        <div
          id="requests"
          className="glass-card rounded-3xl border border-white/60 p-6 shadow-soft"
        >
          <h3 className="font-display text-xl font-semibold">Projects</h3>
          <div className="mt-4 space-y-3 text-sm text-ink/70">
            {projects.length === 0 && (
              <div className="rounded-2xl bg-white/70 p-4 text-sm text-ink/70">
                No projects yet.
              </div>
            )}
            {projects.map((project) => (
              <div key={project.id} className="rounded-2xl bg-white/70 p-4">
                <p className="text-base font-semibold">{project.title}</p>
                <span
                  className={`mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    project.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {project.status === "COMPLETED" ? "COMPLETED" : "ACTIVE"}
                </span>
                <p className="mt-2 text-sm text-ink/80">
                  Client:{" "}
                  {project.client?.fullName || "Client"}
                </p>
                <p className="text-sm text-ink/80">
                  Type needed:{" "}
                  {project.serviceName || "Not specified"}
                </p>
                <p className="text-sm text-ink/80">
                  Project description: {project.description || "No description yet."}
                </p>
                <p className="text-sm text-ink/80">
                  Duration:{" "}
                  {project.deadline || project.duration || "Not specified"}
                </p>
                <p className="text-sm text-ink/80">
                  Salary offered:{" "}
                  {project.salary ? `$${project.salary}` : "Not specified"}
                </p>
                
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-3xl border border-white/60 p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold">Reviews</h3>
          <div className="mt-4 space-y-3 text-sm text-ink/70">
            {reviews.length === 0 && (
              <div className="rounded-2xl bg-white/70 p-4 text-sm text-ink/70">
                No reviews yet.
              </div>
            )}
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-white/70 p-4">
                <p className="font-semibold">
                  {review.clientName || review.client?.fullName || review.client || "Client"}
                </p>
                <p className="text-sm text-amber-500">
                  {"★".repeat(review.rating)}
                </p>
                <p className="text-xs text-ink/60">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {message && <p className="mt-6 text-sm text-emerald-600">{message}</p>}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 py-2 sm:px-4">
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-soft sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-2">
                <h3 className="font-display text-xl font-semibold leading-tight sm:text-2xl">
                  Freelancer profile
                </h3>
                <span className="pt-1 text-sm font-semibold text-amber-500">
                  {(profile?.averageRating ?? 0).toFixed(1)} ★
                </span>
                <button
                  type="button"
                  onClick={() => setProfileEditing(true)}
                  className="ml-1 rounded-full border border-ink/20 px-2 py-1 text-xs text-ink/60 hover:border-ink/40"
                >
                  Edit ✎
                </button>
              </div>
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  setProfileEditing(false);
                }}
                className="self-end rounded-full border border-ink/20 px-3 py-1 text-sm text-ink sm:self-auto"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleProfileSave} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Full name"
                  value={profileForm.fullName}
                  disabled={!profileEditing}
                  onChange={(event) =>
                    setProfileForm({ ...profileForm, fullName: event.target.value })
                  }
                />
                <div className="flex flex-col gap-2 text-sm font-medium text-ink/80">
                  <span>Category</span>
                  <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-ink md:grid-cols-2 md:p-4">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          disabled={!profileEditing}
                          checked={profileForm.categoryNames.includes(cat.name)}
                          onChange={(event) => {
                            if (!profileEditing) return;
                            if (event.target.checked) {
                              setProfileForm((prev) => ({
                                ...prev,
                                categoryNames: [...prev.categoryNames, cat.name]
                              }));
                            } else {
                              setProfileForm((prev) => ({
                                ...prev,
                                categoryNames: prev.categoryNames.filter(
                                  (name) => name !== cat.name
                                )
                              }));
                            }
                          }}
                        />
                        {cat.name}
                      </label>
                    ))}
                    {categories.length === 0 && (
                      <span className="text-xs text-ink/60">No categories found.</span>
                    )}
                  </div>
                  <span className="text-xs text-ink/60">
                    Selected: {profileForm.categoryNames.join(", ") || "None"}
                  </span>
                </div>
              </div>
              <FormField
                label="Skills"
                value={profileForm.skills}
                disabled={!profileEditing}
                onChange={(event) =>
                  setProfileForm({ ...profileForm, skills: event.target.value })
                }
              />
              <TextAreaField
                label="Bio"
                value={profileForm.bio}
                disabled={!profileEditing}
                onChange={(event) =>
                  setProfileForm({ ...profileForm, bio: event.target.value })
                }
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="WhatsApp"
                  value={profileForm.whatsapp}
                  disabled={!profileEditing}
                  onChange={(event) =>
                    setProfileForm({ ...profileForm, whatsapp: event.target.value })
                  }
                />
                <FormField
                  label="Contact email"
                  type="email"
                  value={profileForm.contactEmail}
                  disabled={!profileEditing}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      contactEmail: event.target.value
                    })
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
                      setProfileForm((prev) => ({
                        ...prev,
                        profilePhotoUrl: reader.result
                      }));
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-ink shadow-sm outline-none transition focus:border-sky"
                />
              </label>
              {message && (
                <p className="text-sm text-emerald-600">{message}</p>
              )}
              {profileEditing && (
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
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
    </main>
  );
};

export default FreelancerDashboard;

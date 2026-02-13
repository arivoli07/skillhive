import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import FreelancerCard from "../components/FreelancerCard.jsx";
import FormField, { SelectField, TextAreaField } from "../components/FormField.jsx";
import Loading from "../components/Loading.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ClientFreelancers = () => {
  const { auth } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    rating: "",
    skill: "",
    search: ""
  });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [clientProfile, setClientProfile] = useState({
    fullName: "",
    company: "",
    profilePhotoUrl: ""
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [freelancerDetails, setFreelancerDetails] = useState(null);
  const [freelancerLoading, setFreelancerLoading] = useState(false);
  const [clientProfileOpen, setClientProfileOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    type: "",
    description: "",
    duration: "",
    salary: ""
  });
  const [requestErrors, setRequestErrors] = useState({});
  
  const filteredFreelancers = useMemo(() => {
    return freelancers.filter((freelancer) => {
      const categoryMatch =
        !filters.category ||
        (freelancer.categories || []).some(
          (cat) => cat.toLowerCase() === filters.category.toLowerCase()
        );
      const ratingMatch =
        !filters.rating || freelancer.averageRating >= Number(filters.rating);
      const skillMatch =
        !filters.skill ||
        freelancer.skills?.toLowerCase().includes(filters.skill.toLowerCase());
      const searchMatch =
        !filters.search ||
        freelancer.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        freelancer.skills?.toLowerCase().includes(filters.search.toLowerCase()) ||
        (freelancer.categories || [])
          .join(", ")
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      return categoryMatch && ratingMatch && skillMatch && searchMatch;
    });
  }, [freelancers, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [freelancersRes, categoriesRes] = await Promise.all([
        api.get("/freelancers"),
        api.get("/categories")
      ]);
      setFreelancers(freelancersRes.data);
      setCategories(categoriesRes.data);

      if (auth?.token) {
        const profileRes = await api.get("/clients/me");
        setClientProfile({
          fullName: profileRes.data.fullName || "",
          company: profileRes.data.company || "",
          profilePhotoUrl: profileRes.data.profilePhotoUrl || ""
        });
      } else {
        setClientProfile({
          fullName: "",
          company: "",
          profilePhotoUrl: ""
        });
      }
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
    const handler = () => loadData();
    window.addEventListener("skillhive-profile-updated", handler);
    return () => window.removeEventListener("skillhive-profile-updated", handler);
  }, []);
  
  useEffect(() => {
    const handler = () => setClientProfileOpen(true);
    window.addEventListener("open-client-profile", handler);
    return () => window.removeEventListener("open-client-profile", handler);
  }, []);
  
  const applyFilters = async () => {
    try {
      const response = await api.get("/freelancers");
      setFreelancers(response.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const openFreelancerProfile = async (freelancer) => {
    setSelected(freelancer);
    setFreelancerLoading(true);
    setProfileModalOpen(true);
    try {
      const response = await api.get(`/freelancers/${freelancer.id}`);
      setFreelancerDetails(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFreelancerLoading(false);
    }
  };

  const openRequestModal = () => {
    const categoryLabel =
      (freelancerDetails?.categories || selected?.categories || []).join(", ");
    const defaultType = categoryLabel || "Service";
    const defaultDescription = categoryLabel
      ? `Requested services: ${categoryLabel}`
      : "";
    setRequestForm({
      type: defaultType,
      description: defaultDescription,
      duration: "",
      salary: ""
    });
    setRequestErrors({});
    setRequestModalOpen(true);
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!requestForm.type.trim()) errors.type = "Service type is required.";
    if (!requestForm.description.trim())
      errors.description = "Project description is required.";
    if (!requestForm.duration.trim()) errors.duration = "Duration is required.";
    if (!requestForm.salary.trim()) errors.salary = "Salary is required.";
    if (!selected?.id && !freelancerDetails?.id) errors.type = "Select a freelancer.";
    setRequestErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await api.post("/clients/me/requests", {
        freelancerId: freelancerDetails?.id || selected?.id,
        type: requestForm.type || "Service",
        description: requestForm.description || "New project request",
        duration: requestForm.duration,
        salary: requestForm.salary
      });
      setMessage("Request sent to freelancer.");
      setProfileModalOpen(false);
      setRequestModalOpen(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "Could not send request.");
    }
  };
  
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">Find Freelancers</h2>
        <p className="text-sm text-ink/60">
          Browse talent and send project requests.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <SelectField
          label="Category"
          value={filters.category}
          onChange={(event) => setFilters({ ...filters, category: event.target.value })}
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Min Rating"
          value={filters.rating}
          onChange={(event) => setFilters({ ...filters, rating: event.target.value })}
        >
          <option value="">Any</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} ★
            </option>
          ))}
        </SelectField>
        <FormField
          label="Skill"
          placeholder="e.g. UI, Node, Algebra"
          value={filters.skill}
          onChange={(event) => setFilters({ ...filters, skill: event.target.value })}
        />
        <FormField
          label="Search"
          placeholder="Search by name"
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
        />
        <button
          onClick={applyFilters}
          className="w-full rounded-full bg-honey px-4 py-2 text-sm text-ink"
        >
          Apply Filters
        </button>
      </div>

      {loading ? (
        <Loading label="Loading dashboard..." />
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2">
            {filteredFreelancers.map((freelancer) => (
              <button
                key={freelancer.id}
                className={`text-left transition ${
                  selected?.id === freelancer.id ? "ring-2 ring-sky/50" : ""
                }`}
                onClick={() => openFreelancerProfile(freelancer)}
              >
                <FreelancerCard
                  freelancer={freelancer}
                  onViewProfile={() => openFreelancerProfile(freelancer)}
                />
              </button>
            ))}
          </section>

          {message && <p className="mt-6 text-sm text-emerald-600">{message}</p>}
        </>
      )}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Freelancer Profile</h3>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="rounded-full border border-ink/20 px-3 py-1 text-sm text-ink"
              >
                Close
              </button>
            </div>
            {freelancerLoading && (
              <p className="mt-4 text-sm text-ink/60">Loading profile...</p>
            )}
            {!freelancerLoading && (freelancerDetails || selected) && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-200">
                    {(freelancerDetails?.profilePhotoUrl || selected?.profilePhotoUrl) ? (
                      <img
                        src={freelancerDetails?.profilePhotoUrl || selected?.profilePhotoUrl}
                        alt={freelancerDetails?.fullName || selected?.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-ink/60">
                        {freelancerDetails?.fullName?.[0] ||
                          selected?.fullName?.[0] ||
                          "F"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {freelancerDetails?.fullName || selected?.fullName}
                    </p>
                    <p className="text-sm text-ink/60">
                      {(freelancerDetails?.categories || selected?.categories || [])
                        .join(", ") || "Not specified"}
                    </p>
                    <p className="text-sm text-amber-500">
                      {(freelancerDetails?.averageRating ??
                        selected?.averageRating ??
                        0
                      ).toFixed(1)}{" "}
                      ★
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold">Category</p>
                    <p className="mt-2 text-sm text-ink/70">
                      {(freelancerDetails?.categories || selected?.categories || [])
                        .join(", ") || "Not specified"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold">Completed Projects</p>
                    <p className="mt-2 text-3xl font-semibold text-ink">
                      {(freelancerDetails?.reviews || []).length}
                    </p>
                    <p className="text-xs text-ink/60">Based on reviews submitted.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold">Reviews</p>
                  <div className="mt-2 space-y-2 text-sm text-ink/70">
                    {(freelancerDetails?.reviews || []).map((review) => (
                      <div key={review.id} className="rounded-xl bg-slate-50 p-3">
                        <p className="font-semibold">{review.clientName}</p>
                        <p className="text-xs text-amber-500">{review.rating} ★</p>
                        <p className="text-xs text-ink/60">{review.comment}</p>
                      </div>
                    ))}
                    {(!freelancerDetails?.reviews ||
                      freelancerDetails.reviews.length === 0) && (
                      <p>No reviews yet.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={openRequestModal}
                    className="rounded-full bg-honey px-5 py-2 text-ink"
                  >
                    Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Send Request</h3>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="rounded-full border border-ink/20 px-3 py-1 text-sm text-ink"
              >
                Close
              </button>
            </div>
            <form onSubmit={submitRequest} className="mt-4 space-y-4">
              <FormField
                label="Service type"
                value={requestForm.type}
                onChange={(event) =>
                  setRequestForm({ ...requestForm, type: event.target.value })
                }
              />
              {requestErrors.type && (
                <p className="text-xs text-red-600">{requestErrors.type}</p>
              )}
              <TextAreaField
                label="Project description"
                value={requestForm.description}
                onChange={(event) =>
                  setRequestForm({ ...requestForm, description: event.target.value })
                }
              />
              {requestErrors.description && (
                <p className="text-xs text-red-600">{requestErrors.description}</p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Duration"
                  placeholder="e.g. 2 weeks"
                  value={requestForm.duration}
                  onChange={(event) =>
                    setRequestForm({ ...requestForm, duration: event.target.value })
                  }
                />
                {requestErrors.duration && (
                  <p className="text-xs text-red-600">{requestErrors.duration}</p>
                )}
                <FormField
                  label="Salary offered"
                  placeholder="e.g. $1,200"
                  value={requestForm.salary}
                  onChange={(event) =>
                    setRequestForm({ ...requestForm, salary: event.target.value })
                  }
                />
                {requestErrors.salary && (
                  <p className="text-xs text-red-600">{requestErrors.salary}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="rounded-full border border-ink/20 px-4 py-2 text-ink"
                >
                  Cancel
                </button>
                <button className="rounded-full bg-honey px-6 py-2 text-ink">
                  Send request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ClientFreelancers;

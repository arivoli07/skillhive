import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import Loading from "../components/Loading.jsx";

const FreelancerProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/freelancers/${id}`);
        setProfile(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <Loading label="Loading profile..." />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <p className="text-sm text-ink/60">Freelancer not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <section className="glass-card rounded-3xl border border-white/60 p-8 shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-slate-200">
            {profile.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt={profile.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-300 text-2xl text-ink/60">
                {profile.fullName?.[0] ?? "F"}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold">{profile.fullName}</h2>
            <p className="text-sm text-ink/60">{profile.category}</p>
            <p className="mt-2 text-sm text-ink/70">{profile.bio}</p>
            <p className="mt-2 text-sm text-ink/70">Skills: {profile.skills}</p>
            <p className="mt-2 text-sm text-amber-500">
              {profile.averageRating?.toFixed(1)} ★ average rating
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-3xl border border-white/60 p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold">Services</h3>
          <div className="mt-4 space-y-3 text-sm text-ink/70">
            {profile.services?.length === 0 && <p>No services listed yet.</p>}
            {profile.services?.map((service) => (
              <div key={service.id} className="rounded-2xl bg-white/70 p-4">
                <p className="font-semibold">{service.title}</p>
                <p className="text-xs text-ink/60">{service.category}</p>
                <p className="text-xs text-ink/60">{service.description}</p>
                {service.price && <p className="text-xs text-ink/80">${service.price}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-3xl border border-white/60 p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold">Contact</h3>
          <div className="mt-4 space-y-2 text-sm text-ink/70">
            <p>WhatsApp: {profile.whatsapp || "Not provided"}</p>
            <p>Email: {profile.contactEmail || "Not provided"}</p>
          </div>
          <div className="mt-6">
            <h4 className="font-display text-lg font-semibold">Reviews</h4>
            <div className="mt-3 space-y-3 text-sm text-ink/70">
              {profile.reviews?.length === 0 && <p>No reviews yet.</p>}
              {profile.reviews?.map((review) => (
                <div key={review.id} className="rounded-2xl bg-white/70 p-4">
                  <p className="font-semibold">{review.clientName}</p>
                  <p className="text-xs text-amber-500">{review.rating} ★</p>
                  <p className="text-xs text-ink/60">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FreelancerProfile;

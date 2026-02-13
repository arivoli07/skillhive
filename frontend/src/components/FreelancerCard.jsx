import React from "react";

const FreelancerCard = ({ freelancer, onViewProfile }) => {
  return (
    <div className="glass-card rounded-2xl border border-white/60 p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-200">
          {freelancer.profilePhotoUrl ? (
            <img
              src={freelancer.profilePhotoUrl}
              alt={freelancer.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-300 text-xs uppercase text-ink/60">
              {freelancer.fullName?.[0] ?? "F"}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-display text-lg font-semibold">{freelancer.fullName}</p>
          <p className="text-sm text-ink/60">
            {(freelancer.categories || []).join(", ") || "Generalist"}
          </p>
          <p className="mt-2 text-sm text-ink/70">
            Skills: {freelancer.skills || "Not listed yet"}
          </p>
        </div>
        <div className="text-right text-sm font-semibold text-amber-500">
          {freelancer.averageRating?.toFixed(1) ?? "0.0"} ★
        </div>
      </div>
      {onViewProfile && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onViewProfile();
          }}
          className="mt-4 inline-flex items-center text-sm font-semibold text-sky hover:text-sky/80"
        >
          View Profile →
        </button>
      )}
    </div>
  );
};

export default FreelancerCard;

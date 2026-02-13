import React from "react";

const FormField = ({ label, error, ...props }) => {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink/80">
      {label}
      <input
        {...props}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-ink shadow-sm outline-none transition focus:border-sky"
      />
      {error && <span className="text-xs text-ember">{error}</span>}
    </label>
  );
};

export const TextAreaField = ({ label, error, ...props }) => {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink/80">
      {label}
      <textarea
        {...props}
        className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-ink shadow-sm outline-none transition focus:border-sky"
      />
      {error && <span className="text-xs text-ember">{error}</span>}
    </label>
  );
};

export const SelectField = ({ label, error, children, ...props }) => {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink/80">
      {label}
      <select
        {...props}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-ink shadow-sm outline-none transition focus:border-sky"
      >
        {children}
      </select>
      {error && <span className="text-xs text-ember">{error}</span>}
    </label>
  );
};

export default FormField;

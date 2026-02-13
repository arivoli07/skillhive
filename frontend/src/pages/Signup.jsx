import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import FormField, { SelectField, TextAreaField } from "../components/FormField.jsx";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("CLIENT");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    clientType: "Individual",
    companyName: "",
    bio: "",
    skills: "",
    categories: [],
    whatsapp: "",
    contactEmail: "",
    profilePhotoFile: null,
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint =
        role === "CLIENT" ? "/auth/register/client" : "/auth/register/freelancer";
      const payload =
        role === "CLIENT"
          ? {
              fullName: form.fullName,
              company: form.clientType === "Company" ? form.companyName : "Individual",
              profilePhotoUrl: form.profilePhotoFile || "",
              email: form.email,
              password: form.password
            }
          : {
              fullName: form.fullName,
              bio: form.bio,
              skills: form.skills,
              categoryNames: form.categories,
              whatsapp: form.whatsapp,
              contactEmail: form.contactEmail,
              profilePhotoUrl: form.profilePhotoFile || "",
              email: form.email,
              password: form.password
            };
      const response = await api.post(endpoint, payload);
      login(response.data);
      try {
        if (role === "FREELANCER") {
          await api.get("/freelancers/me");
        } else {
          await api.get("/clients/me");
        }
        window.dispatchEvent(new Event("skillhive-profile-updated"));
      } catch (err) {
        console.error(err);
      }
      navigate(role === "CLIENT" ? "/client/freelancers" : "/freelancer");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <h2 className="font-display text-3xl font-semibold">Create your account</h2>
        <p className="text-sm text-ink/60">Choose your role to get started.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {["CLIENT", "FREELANCER"].map((type) => (
          <button
            key={type}
            onClick={() => setRole(type)}
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              role === type
                ? "bg-honey text-ink"
                : "border border-propolis/30 text-propolis"
            }`}
            type="button"
          >
            Sign up as {type === "CLIENT" ? "Client" : "Freelancer"}
          </button>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="glass-card space-y-4 rounded-3xl border border-white/20 bg-[#111827]/95 p-8 text-[#F9FAFB] shadow-soft"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Full name"
            required
            value={form.fullName}
            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          />
          {role === "CLIENT" && (
            <SelectField
              label="Client type"
              value={form.clientType}
              onChange={(event) =>
                setForm({ ...form, clientType: event.target.value, companyName: "" })
              }
            >
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </SelectField>
          )}
          {role === "CLIENT" && form.clientType === "Company" && (
            <FormField
              label="Company name"
              value={form.companyName}
              onChange={(event) => setForm({ ...form, companyName: event.target.value })}
            />
          )}
          {role === "CLIENT" && (
            <div className="md:col-span-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-ink/80">
                Profile photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm((prev) => ({ ...prev, profilePhotoFile: reader.result }));
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-ink shadow-sm outline-none transition focus:border-sky"
                />
              </label>
            </div>
          )}
          {role === "FREELANCER" && (
            <div className="md:col-span-2">
              <div className="flex flex-col gap-2 text-sm font-medium text-ink/80">
                <span>Categories</span>
                <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-ink md:grid-cols-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.categories.includes(cat.name)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setForm({ ...form, categories: [...form.categories, cat.name] });
                          } else {
                            setForm({
                              ...form,
                              categories: form.categories.filter((item) => item !== cat.name)
                            });
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
              </div>
            </div>
          )}
          {role === "FREELANCER" && (
            <FormField
              label="Skills"
              placeholder="Comma separated"
              value={form.skills}
              onChange={(event) => setForm({ ...form, skills: event.target.value })}
            />
          )}
        </div>
        {role === "FREELANCER" && (
          <div className="md:col-span-2">
            <TextAreaField
              label="Bio"
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
            />
          </div>
        )}
        {role === "FREELANCER" && (
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(event) => setForm({ ...form, whatsapp: event.target.value })}
            />
            <FormField
              label="Contact email"
              value={form.contactEmail}
              onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
            />
          </div>
        )}
        {role === "FREELANCER" && (
          <div className="md:col-span-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-ink/80">
              Profile photo
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setForm((prev) => ({ ...prev, profilePhotoFile: reader.result }));
                  };
                  reader.readAsDataURL(file);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-ink shadow-sm outline-none transition focus:border-sky"
              />
            </label>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <FormField
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        {error && <p className="text-sm text-ember">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-full bg-honey px-6 py-3 text-ink hover:bg-pollen"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </main>
  );
};

export default Signup;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import FormField from "../components/FormField.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", form);
      login(response.data);
      navigate(
        response.data.role === "CLIENT" ? "/client/freelancers" : "/freelancer"
      );
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16">
      <div>
        <h2 className="font-display text-3xl font-semibold">Welcome back</h2>
        <p className="text-sm text-ink/60">Log in to manage your projects.</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="glass-card space-y-4 rounded-3xl border border-white/20 bg-[#111827]/95 p-8 text-[#F9FAFB] shadow-soft"
      >
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
        {error && <p className="text-sm text-ember">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-full bg-honey px-6 py-3 text-ink hover:bg-pollen"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
};

export default Login;

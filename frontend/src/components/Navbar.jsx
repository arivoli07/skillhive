import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth) {
        setProfile(null);
        return;
      }
      try {
        if (auth.role === "FREELANCER") {
          const response = await api.get("/freelancers/me");
          setProfile(response.data);
        } else if (auth.role === "CLIENT") {
          const response = await api.get("/clients/me");
          setProfile(response.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
    const handler = () => loadProfile();
    window.addEventListener("skillhive-profile-updated", handler);
    return () => window.removeEventListener("skillhive-profile-updated", handler);
  }, [auth]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const openFreelancerProfile = () => {
    setShowProfile(false);
    setMobileMenuOpen(false);
    navigate("/freelancer");
    window.dispatchEvent(new CustomEvent("open-freelancer-profile"));
  };

  const openClientProfile = () => {
    setShowProfile(false);
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent("open-client-profile"));
  };

  const linkBase = "text-[#F9FAFB]/80 hover:text-[#FFFFFF]";
  const pillBase =
    "rounded-full border border-white/40 px-4 py-2 text-white/80 hover:border-white/70";

  const mobileLinkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm ${
      isActive ? "bg-white text-[#1A1A1A]" : "text-white/85 hover:bg-white/10"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-[#111111] bg-[#1A1A1A]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link to="/" className="flex items-center font-display text-3xl font-bold leading-none">
          <span aria-label="Skillhive">
            <span className="text-[#F9FAFB]">Skill</span>
            <span className="text-honey">hive</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="rounded-full border border-white/30 p-2 text-white md:hidden"
        >
          <span className="block h-0.5 w-5 bg-white"></span>
          <span className="mt-1 block h-0.5 w-5 bg-white"></span>
          <span className="mt-1 block h-0.5 w-5 bg-white"></span>
        </button>

        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
          {!auth && (
            <>
              <NavLink className={linkBase} to="/login">
                Login
              </NavLink>
              <NavLink
                className="rounded-full bg-[#F9FAFB] px-4 py-2 text-[#1A1A1A] hover:bg-[#E5E7EB]"
                to="/signup"
              >
                Get Started
              </NavLink>
            </>
          )}
          {auth && auth.role === "FREELANCER" && (
            <>
              <div className="relative">
                <button
                  onClick={openFreelancerProfile}
                  className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/10"
                >
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-white/10">
                    {profile?.profilePhotoUrl ? (
                      <img
                        src={profile.profilePhotoUrl}
                        alt={profile.fullName || "Profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-white/70">
                        {profile?.fullName?.[0] ?? "U"}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-white/80">
                    {profile?.fullName || "User"}
                  </span>
                </button>
                {showProfile && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 bg-[#111827] p-4 text-white shadow-soft">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-white/10">
                        {profile?.profilePhotoUrl ? (
                          <img
                            src={profile.profilePhotoUrl}
                            alt={profile.fullName || "Profile"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
                            {profile?.fullName?.[0] ?? "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {profile?.fullName || "User"}
                        </p>
                        <p className="text-xs text-white/60">
                          {(profile?.categories || []).join(", ") || "Not specified"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfile(false);
                          navigate("/freelancer");
                        }}
                        className="ml-auto rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white/40"
                        title="Edit profile"
                      >
                        Edit ✎
                      </button>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-white/70">
                      <p>
                        <span className="text-white/50">Email:</span>{" "}
                        {profile?.contactEmail || "Not provided"}
                      </p>
                      <p>
                        <span className="text-white/50">WhatsApp:</span>{" "}
                        {profile?.whatsapp || "Not provided"}
                      </p>
                      <p>
                        <span className="text-white/50">Skills:</span>{" "}
                        {profile?.skills || "Not listed"}
                      </p>
                      <p>
                        <span className="text-white/50">Bio:</span>{" "}
                        {profile?.bio || "Not provided"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <NavLink
                to="/freelancer"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-full bg-white px-3 py-1 text-[#1A1A1A]"
                    : linkBase
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "rounded-full bg-white px-3 py-1 text-[#1A1A1A]"
                    : linkBase
                }
                to="/requests"
              >
                Requests
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#F9FAFB]/40 px-4 py-2 text-[#F9FAFB] hover:border-[#F9FAFB]/70"
              >
                Logout
              </button>
            </>
          )}
          {auth && auth.role === "CLIENT" && (
            <>
              <div className="relative">
                <button
                  onClick={openClientProfile}
                  className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/10"
                >
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-white/10">
                    {profile?.profilePhotoUrl ? (
                      <img
                        src={profile.profilePhotoUrl}
                        alt={profile.fullName || "Profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-white/70">
                        {profile?.fullName?.[0] ?? "U"}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-white/80">
                    {profile?.fullName || "User"}
                  </span>
                </button>
              </div>
              <NavLink
                to="/client/freelancers"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-full bg-white px-4 py-2 text-[#1A1A1A]"
                    : pillBase
                }
              >
                Freelancers
              </NavLink>
              <NavLink
                to="/client/projects"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-full bg-white px-4 py-2 text-[#1A1A1A]"
                    : pillBase
                }
              >
                Projects
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#F9FAFB]/40 px-4 py-2 text-[#F9FAFB] hover:border-[#F9FAFB]/70"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#1A1A1A] px-4 py-3 md:hidden">
          {!auth && (
            <div className="grid gap-2">
              <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>
                Login
              </NavLink>
              <NavLink to="/signup" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>
                Get Started
              </NavLink>
            </div>
          )}

          {auth && auth.role === "FREELANCER" && (
            <div className="grid gap-2">
              <button
                type="button"
                onClick={openFreelancerProfile}
                className="rounded-xl border border-white/20 px-3 py-2 text-left text-sm text-white/85"
              >
                Profile: {profile?.fullName || "User"}
              </button>
              <NavLink to="/freelancer" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/requests" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass}>
                Requests
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/25 px-3 py-2 text-left text-sm text-white"
              >
                Logout
              </button>
            </div>
          )}

          {auth && auth.role === "CLIENT" && (
            <div className="grid gap-2">
              <button
                type="button"
                onClick={openClientProfile}
                className="rounded-xl border border-white/20 px-3 py-2 text-left text-sm text-white/85"
              >
                Profile: {profile?.fullName || "User"}
              </button>
              <NavLink
                to="/client/freelancers"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass}
              >
                Freelancers
              </NavLink>
              <NavLink
                to="/client/projects"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass}
              >
                Projects
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/25 px-3 py-2 text-left text-sm text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

import React from "react";

const About = () => {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="glass-card gradient-ring rounded-3xl border border-[#E9D39A] bg-gradient-to-br from-white/85 to-[#F2DEB2] p-10 shadow-soft">
        <h2 className="font-display text-3xl font-semibold">About Skillhive</h2>
        <p className="mt-4 text-ink/70">
          Skillhive is a curated marketplace where clients and freelancers meet with clarity.
          We keep the experience lightweight, transparent, and focused on real outcomes.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            [
              "For clients",
              "Review rich profiles, filter by skills, and hire talent that fits your timeline."
            ],
            [
              "For freelancers",
              "Showcase your services, manage projects, and grow your reputation with reviews."
            ]
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-[#E9D39A] bg-gradient-to-br from-white/80 to-[#F2DEB2] p-6"
            >
              <p className="font-display text-lg font-semibold">{title}</p>
              <p className="mt-2 text-sm text-ink/60">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default About;

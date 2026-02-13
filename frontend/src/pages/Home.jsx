import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ink/50">
            Freelancer marketplace
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            Build projects with vetted creatives, or turn your skills into a thriving freelance
            career.
          </h1>
          <p className="mt-4 text-lg text-ink/70">
            Skillhive makes it simple to hire specialists or showcase your services with
            transparency and speed.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="rounded-full bg-honey px-6 py-3 text-ink shadow-soft hover:bg-pollen"
            >
              Join Skillhive
            </Link>
          </div>
        </div>
        <div className="glass-card gradient-ring rounded-3xl border border-white/60 p-6 shadow-soft">
          <div className="space-y-4">
            {[
              ["Design sprint", "Brand identity + landing page"],
              ["Code build", "React + Spring Boot MVP"],
              ["Learning coach", "1:1 tutoring sessions"]
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-sm text-ink/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl bg-white/70 p-8 shadow-soft md:grid-cols-3">
        {[
          ["Client-first filters", "Find talent by category, rating, or skills instantly."],
          ["Trusted profiles", "Freelancers highlight services, reviews, and direct contact."],
          ["Project clarity", "Track status from pending to completion in one place."]
        ].map(([title, desc]) => (
          <div
            key={title}
            className="space-y-2 rounded-2xl border border-white/70 bg-gradient-to-br from-white/80 to-sky-50/60 p-4"
          >
            <p className="font-display text-lg font-semibold">{title}</p>
            <p className="text-sm text-ink/70">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
};

export default Home;

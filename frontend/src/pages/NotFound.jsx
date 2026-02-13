import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-6 py-16 text-center">
      <h2 className="font-display text-4xl font-semibold">Page not found</h2>
      <p className="text-sm text-ink/60">The page you are looking for does not exist.</p>
      <Link className="rounded-full bg-honey px-6 py-3 text-ink" to="/">
        Go home
      </Link>
    </main>
  );
};

export default NotFound;

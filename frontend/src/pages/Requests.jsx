import React, { useEffect, useState } from "react";
import api from "../services/api.js";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadRequests = () => {
    setLoading(true);
    api
      .get("/freelancers/me/requests")
      .then((response) => {
        setRequests(response.data || []);
      })
      .catch((err) => {
        console.error(err);
        setMessage(err.response?.data?.error || "Could not load requests.");
        setRequests([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDecline = (id) => {
    setMessage("");
    api
      .post(`/freelancers/me/requests/${id}/decline`)
      .then(() => {
        setRequests((prev) => prev.filter((req) => req.id !== id));
      })
      .catch((err) => {
        setMessage(err.response?.data?.error || "Could not decline request.");
      });
  };

  const handleAccept = (request) => {
    setMessage("");
    api
      .post(`/freelancers/me/requests/${request.id}/accept`)
      .then(() => {
        setRequests((prev) => prev.filter((req) => req.id !== request.id));
      })
      .catch((err) => {
        setMessage(err.response?.data?.error || "Could not accept request.");
      });
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-6">
        <h2 className="font-display text-3xl font-semibold">Requests</h2>
        <p className="text-sm text-ink/60">
          Incoming client requests with project details.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        {loading && (
          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 text-sm text-ink/60">
            Loading requests...
          </div>
        )}
        {!loading &&
          requests.map((req) => (
            <div
              key={req.id}
              className="glass-card rounded-3xl border border-white/60 p-6 shadow-soft"
            >
              <p className="text-sm text-ink/60">Client</p>
              <p className="text-lg font-semibold">{req.clientName}</p>
              <div className="mt-3 space-y-2 text-sm text-ink/70">
                <p>
                  <span className="text-ink/50">Type needed:</span> {req.type}
                </p>
                <p>
                  <span className="text-ink/50">Project description:</span>{" "}
                  {req.description}
                </p>
                <p>
                  <span className="text-ink/50">Duration:</span> {req.duration}
                </p>
                <p>
                  <span className="text-ink/50">Salary offered:</span> {req.salary}
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  className="rounded-full bg-honey px-4 py-2 text-sm text-ink"
                  onClick={() => handleAccept(req)}
                >
                  Accept
                </button>
                <button
                  className="rounded-full border border-propolis/30 px-4 py-2 text-sm text-propolis"
                  onClick={() => handleDecline(req.id)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        {!loading && requests.length === 0 && (
          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 text-sm text-ink/60">
            No pending requests.
          </div>
        )}
      </section>
      {message && <p className="mt-6 text-sm text-ember">{message}</p>}
    </main>
  );
};

export default Requests;

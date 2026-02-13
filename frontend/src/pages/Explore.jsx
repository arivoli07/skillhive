import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import FreelancerCard from "../components/FreelancerCard.jsx";
import Loading from "../components/Loading.jsx";
import FormField, { SelectField } from "../components/FormField.jsx";

const Explore = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    rating: "",
    skill: "",
    search: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [freelancersRes, categoriesRes] = await Promise.all([
          api.get("/freelancers"),
          api.get("/categories")
        ]);
        setFreelancers(freelancersRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return freelancers.filter((freelancer) => {
      const categoryMatch =
        !filters.category ||
        (freelancer.categories || []).some(
          (cat) => cat.toLowerCase() === filters.category.toLowerCase()
        );
      const ratingMatch =
        !filters.rating || freelancer.averageRating >= Number(filters.rating);
      const skillMatch =
        !filters.skill ||
        freelancer.skills?.toLowerCase().includes(filters.skill.toLowerCase());
      const searchMatch =
        !filters.search ||
        freelancer.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        freelancer.skills?.toLowerCase().includes(filters.search.toLowerCase()) ||
        (freelancer.categories || [])
          .join(", ")
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      return categoryMatch && ratingMatch && skillMatch && searchMatch;
    });
  }, [freelancers, filters]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold">Explore Freelancers</h2>
          <p className="text-sm text-ink/60">
            Filter by category, rating, or skill to find the right match.
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <SelectField
          label="Category"
          value={filters.category}
          onChange={(event) => setFilters({ ...filters, category: event.target.value })}
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Min Rating"
          value={filters.rating}
          onChange={(event) => setFilters({ ...filters, rating: event.target.value })}
        >
          <option value="">Any</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} ★
            </option>
          ))}
        </SelectField>
        <FormField
          label="Skill"
          placeholder="e.g. Figma, Spring, UI"
          value={filters.skill}
          onChange={(event) => setFilters({ ...filters, skill: event.target.value })}
        />
        <FormField
          label="Search"
          placeholder="Search by name or skill"
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
        />
      </div>

      {loading ? (
        <Loading label="Loading freelancers..." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-white/60 bg-white/60 p-6 text-sm text-ink/60">
              No freelancers match the current filters.
            </div>
          )}
          {filtered.map((freelancer) => (
            <FreelancerCard key={freelancer.id} freelancer={freelancer} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Explore;

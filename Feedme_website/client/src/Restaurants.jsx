import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./App.css";

export default function Restaurants() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const q = (params.get("q") || "").trim();
  const [search, setSearch] = useState(q);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // keep input synced when URL changes
  useEffect(() => setSearch(q), [q]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // If your backend URL is different, change this:
        const res = await fetch("/api/restaurants");
        const data = await res.json();
        setRestaurants(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q) return restaurants;
    const needle = q.toLowerCase();
    return restaurants.filter((r) => {
      const name = (r.name || r.restaurant_name || "").toLowerCase();
      const city = (r.city || "").toLowerCase();
      const cuisine = (r.cuisine || r.category || "").toLowerCase();
      return name.includes(needle) || city.includes(needle) || cuisine.includes(needle);
    });
  }, [restaurants, q]);

  const onSubmit = (e) => {
    e.preventDefault();
    const next = search.trim();
    if (next) setParams({ q: next });
    else setParams({});
  };

  return (
    <div className="lm-shell">
      {/* TOP BAR */}
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>

        <form className="lm-topsearchForm" onSubmit={onSubmit}>
          <input
            className="lm-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants"
            aria-label="Search restaurants"
          />
        </form>

        <div className="lm-user">Fred Smith</div>
      </header>

      <div className="lm-body">
        {/* SIDEBAR */}
        <aside className="lm-sidebar">
          <div className="lm-deal">
            <strong>New Deals Alert</strong>
            <p>Check the latest coastal updates</p>
          </div>

          <nav className="lm-nav">
            <Link to="/restaurants" className="lm-navItem">
              Explore Restaurants
            </Link>
            <Link to="/saved" className="lm-navItem">
              Saved Restaurants
            </Link>
            <Link to="/orders" className="lm-navItem">
              Order History
            </Link>
            <Link to="/settings" className="lm-navItem">
              Settings
            </Link>
          </nav>

          <div className="lm-spacer" />

          <button
            className="lm-signout"
            onClick={() => alert("Hook this up to auth later")}
          >
            Sign Out
          </button>
        </aside>

        {/* MAIN */}
        <main className="lm-main">
          <div className="lm-resultsHeader">
            <h2 className="lm-resultsTitle">
              {q ? `Results for "${q}"` : "Explore Restaurants"}
            </h2>
          </div>

          {loading ? (
            <div className="lm-empty">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="lm-empty">
              No results {q ? <>for <b>"{q}"</b></> : null}.
            </div>
          ) : (
            <div
              className={
                filtered.length === 1 ? "lm-resultsGrid lm-resultsGridSingle" : "lm-resultsGrid"
              }
            >
              {filtered.map((r, idx) => (
                <div className="lm-resultCard" key={r.id ?? r.restaurant_id ?? idx}>
                  <img
                    className="lm-resultImg"
                    src={
                      r.image_url ||
                      r.image ||
                      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=60"
                    }
                    alt={r.name || r.restaurant_name || "Restaurant"}
                  />

                  <div className="lm-resultBody">
                    <div className="lm-resultName">{r.name || r.restaurant_name || "Restaurant"}</div>

                    <div className="lm-resultMeta">
                      <span className="lm-star" aria-hidden="true">
                        ★
                      </span>
                      <span className="lm-rating">
                        {(Number(r.rating) || 4.6).toFixed(1)}
                      </span>
                      <span className="lm-submeta">
                        {r.reviews ? `(${r.reviews} reviews)` : "(2,156 reviews)"}
                      </span>
                    </div>

                    {/* Change this to your menu route later: /restaurants/:id */}
                    <button
                      className="lm-orderBtnWide"
                      onClick={() => navigate("/restaurants")}
                    >
                      Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
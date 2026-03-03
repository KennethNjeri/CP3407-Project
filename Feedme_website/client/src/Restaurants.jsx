import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./App.css";

export default function Restaurants() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const q = (params.get("q") || "").trim();
  const page = Number(params.get("page") || 1);

  const [search, setSearch] = useState(q);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Keep input synced when URL changes
  useEffect(() => {
    setSearch(q);
  }, [q]);

  // Fetch restaurants whenever search or page changes
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams();
        if (q) query.append("q", q);
        query.append("page", page);
        query.append("limit", 20);

        const res = await fetch(`/api/restaurants?${query.toString()}`);
        const data = await res.json();

        setRestaurants(data.restaurants || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [q, page]);

  // Handle search submit
  const onSubmit = (e) => {
    e.preventDefault();
    const next = search.trim();

    if (next) {
      setParams({ q: next, page: 1 });
    } else {
      setParams({});
    }
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

        {/* MAIN CONTENT */}
        <main className="lm-main">
          <div className="lm-resultsHeader">
            <h2 className="lm-resultsTitle">
              {q ? `Results for "${q}"` : "Explore Restaurants"}
            </h2>
          </div>

          {loading ? (
            <div className="lm-empty">Loading…</div>
          ) : restaurants.length === 0 ? (
            <div className="lm-empty">
              No results {q ? <>for <b>"{q}"</b></> : null}.
            </div>
          ) : (
            <>
              <div
                className={
                  restaurants.length === 1
                    ? "lm-resultsGrid lm-resultsGridSingle"
                    : "lm-resultsGrid"
                }
              >
                {restaurants.map((r, idx) => (
                  <div
                    className="lm-resultCard"
                    key={r.id ?? r.restaurant_id ?? idx}
                  >
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
                      <div className="lm-resultName">
                        {r.name || r.restaurant_name || "Restaurant"}
                      </div>

                      <div className="lm-resultMeta">
                        <span className="lm-star">★</span>
                        <span className="lm-rating">
                          {(Number(r.rating) || 4.6).toFixed(1)}
                        </span>
                        <span className="lm-submeta">
                          {r.reviews
                            ? ` (${r.reviews} reviews)`
                            : " (2,156 reviews)"}
                        </span>
                      </div>

                      <button
                        className="lm-orderBtnWide"
                        onClick={() =>
                          navigate(`/restaurants/${r.id ?? r.restaurant_id}`)
                        }
                      >
                        Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="lm-pagination">
                <button
                  disabled={page <= 1}
                  onClick={() =>
                    setParams({
                      q,
                      page: page - 1,
                    })
                  }
                >
                  Previous
                </button>

                <span className="lm-pageInfo">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setParams({
                      q,
                      page: page + 1,
                    })
                  }
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
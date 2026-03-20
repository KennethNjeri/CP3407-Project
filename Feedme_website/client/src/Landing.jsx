import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import { useUser } from "./UserContext";
import UserMenu from "./UserMenu";



export default function Landing() {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [featuredError, setFeaturedError] = useState("");

    useEffect(() => {
      const loadFeaturedRestaurants = async () => {
        try {
          setLoadingFeatured(true);
          setFeaturedError("");

          const res = await fetch("/api/restaurants?limit=4");

          if (!res.ok) {
            throw new Error("Failed to load featured restaurants");
          }

          const data = await res.json();
          setFeaturedRestaurants(data.restaurants || []);
        } catch (err) {
          console.error(err);
          setFeaturedRestaurants([]);
          setFeaturedError("Could not load featured restaurants.");
        } finally {
          setLoadingFeatured(false);
        }
      };

      loadFeaturedRestaurants();
    }, []);

    return (
        <div className="lm-shell">
            {/* TOP BAR */}
            <header className="lm-topbar">
                <Link to="/" className="lm-brandLink">FeedMe</Link>

                <form
                    className="lm-topsearchForm"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const value = e.target.search.value.trim();
                        if (value) {
                            navigate(`/restaurants?q=${encodeURIComponent(value)}&page=1`);
                        } else {
                            navigate("/restaurants");
                        }
                    }}
                >
                    <input
                        name="search"
                        className="lm-search"
                        placeholder="Search restaurants, cuisines, or dishes"
                    />
                </form>

                <div className="lm-topbarRight">
                    <CartDropdown />
                    <UserMenu />
                </div>
            </header>

            <div className="lm-body">
                {/* SIDEBAR */}
                <aside className="lm-sidebar">
                    <div className="lm-deal">
                        <strong>New Deals Alert</strong>
                        <p>Check the latest updates</p>
                    </div>

                    <nav>
                        <Link to="/restaurants" className="lm-navItem">
                            Explore Restaurants
                        </Link>
                        <Link to="/saved" className="lm-navItem">Saved Restaurants</Link>
                        <Link to="/orders" className="lm-navItem">Order History</Link>
                        <Link to="/settings" className="lm-navItem">Settings</Link>
                    </nav>

                    <button
                      className="lm-signout"
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                    >
                      Sign Out
                    </button>
                </aside>

                {/* MAIN CONTENT */}
                <main className="lm-main">
                    {/* HERO */}
                    <section className="lm-hero">
                        <div className="lm-heroText">
                            <h1>Food that flies to your door</h1>
                            <p>
                                Order from hundreds of local restaurants.
                                <br/>
                                Real-time tracking and lightning-fast delivery.
                            </p>

                            <div className="lm-heroForm">
                                <input placeholder="Enter your delivery address"/>
                                <Link to="/restaurants">
                                    <button>Find Food</button>
                                </Link>
                            </div>
                        </div>

                        <img
                            className="lm-heroImage"
                            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1"
                            alt="delivery"
                        />
                    </section>

                    {/* RESTAURANT SECTION */}
                    <h2>Featured Restaurants</h2>

                    {loadingFeatured ? (
                      <div className="lm-empty">Loading featured restaurants...</div>
                    ) : featuredError ? (
                      <div className="lm-empty">{featuredError}</div>
                    ) : featuredRestaurants.length === 0 ? (
                      <div className="lm-empty">No featured restaurants available right now.</div>
                    ) : (
                      <div className="lm-cardRow">
                        {featuredRestaurants.map((restaurant) => (
                          <div key={restaurant.id} className="lm-card">
                            <img
                              src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=60"
                              alt={restaurant.name || "Restaurant"}
                            />

                            <h3>{restaurant.name || "Restaurant"}</h3>

                            <p>
                              ⭐ {(Number(restaurant.score) || 0).toFixed(1)}
                              {restaurant.ratings ? ` (${restaurant.ratings} ratings)` : ""}
                            </p>

                            <p>{restaurant.category || "Restaurant"}</p>

                            <button
                              className="lm-orderBtn"
                              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                            >
                              Order
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </main>
            </div>
        </div>
    );
}

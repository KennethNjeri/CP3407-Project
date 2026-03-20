import React from "react";
import {Link} from "react-router-dom";
import "./App.css";
import {useCart} from "./Cart";
import CartDropdown from "./CartDropdown";

export default function Landing() {
    return (
        <div className="lm-shell">
            {/* TOP BAR */}
            <header className="lm-topbar">
                <Link to="/" className="lm-brandLink">FeedMe</Link>

                <input
                    className="lm-search"
                    placeholder="Search restaurants"
                />

                <div className="lm-topbarRight">
                    <CartDropdown />
                    <div className="lm-user">Fred Smith</div>
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
                        <div className="lm-navItem">Saved Restaurants</div>
                        <Link to="/orders" className="lm-navItem">Order History</Link>
                        <div className="lm-navItem">Settings</div>
                    </nav>

                    <button className="lm-signout">Sign Out</button>
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
                    <h2>Recommended for You</h2>

                    <div className="lm-cardRow">
                        {[1, 2, 3, 4].map((id) => (
                            <div key={id} className="lm-card">
                                <img
                                    src="https://images.unsplash.com/photo-1550547660-d9450f859349"
                                    alt="food"
                                />
                                <h3>Restaurant {id}</h3>
                                <p>⭐ 4.{id} • 2km</p>

                                <Link to="/restaurants">
                                    <button className="lm-orderBtn">Order</button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

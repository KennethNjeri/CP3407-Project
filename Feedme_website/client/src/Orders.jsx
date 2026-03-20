import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { useUser } from "./UserContext";

export default function Orders() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const { user, logout } = useUser();

  // Dummy data for now
  const orders = useMemo(
    () => [
      {
        id: "4233732",
        restaurant: "Noodle house",
        items: "Pad Thai",
        status: "delivered",
        icon: "🍜",
        date: "2026-03-02",
      },
      {
        id: "726472836",
        restaurant: "KFC",
        items: "3 Piece box, 26 nuggets",
        status: "active",
        icon: "🍗",
        date: "2026-03-03",
      },
      {
        id: "38475829",
        restaurant: "Pizza Hut",
        items: "Margherita Pizza • Garlic bread",
        status: "delivered",
        icon: "🍕",
        date: "2026-02-26",
      },
      {
        id: "34857834",
        restaurant: "Burrito bar",
        items: "Beef burrito, Nachos",
        status: "delivered",
        icon: "🌯",
        date: "2026-02-20",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = orders;

    if (tab !== "all") {
      list = list.filter((o) => o.status === tab);
    }

    if (q) {
      list = list.filter((o) => {
        return (
          o.restaurant.toLowerCase().includes(q) ||
          o.items.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
        );
      });
    }

    list = [...list].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sort === "newest" ? db - da : da - db;
    });

    return list;
  }, [orders, tab, search, sort]);

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>

        <input className="lm-search" placeholder="" readOnly />

        <div className="lm-user">{user.name}</div>
      </header>

      <div className="lm-body">
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
            <Link to="/orders" className="lm-navItem lm-navItemActive">
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

        <main className="lm-main">
          <section className="lm-ordersHeaderCard">
            <div>
              <h1 className="lm-ordersTitle">Past Orders</h1>
              <p className="lm-ordersSub">
                Track, reorder, and review past deliveries
              </p>
            </div>

            <div className="lm-ordersControls">
              <div className="lm-ordersSearchWrap">
                <span className="lm-ordersSearchIcon" aria-hidden="true">
                  🔎
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders"
                />
              </div>

              <select
                className="lm-ordersSelect"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </section>

          <div className="lm-ordersTabs">
            <button
              className={`lm-tab ${tab === "all" ? "lm-tabActive" : ""}`}
              onClick={() => setTab("all")}
            >
              All Orders
            </button>
            <button
              className={`lm-tab ${tab === "delivered" ? "lm-tabActive" : ""}`}
              onClick={() => setTab("delivered")}
            >
              Delivered
            </button>
            <button
              className={`lm-tab ${tab === "active" ? "lm-tabActive" : ""}`}
              onClick={() => setTab("active")}
            >
              Active
            </button>
          </div>

          <div className="lm-ordersList">
            {filtered.length === 0 ? (
              <div className="lm-empty">No orders match that.</div>
            ) : (
              filtered.map((o) => (
                <div key={o.id} className="lm-orderRow">
                  <div className="lm-orderLeft">
                    <div className="lm-orderIcon" aria-hidden="true">
                      {o.icon}
                    </div>

                    <div className="lm-orderText">
                      <div className="lm-orderName">{o.restaurant}</div>
                      <div className="lm-orderMeta">Order {o.id}</div>
                      <div className="lm-orderItems">{o.items}</div>
                    </div>
                  </div>

                  <button
                    className="lm-reorderBtn"
                    onClick={() => alert(`Reorder from ${o.restaurant} (TODO)`)}
                  >
                    Reorder
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
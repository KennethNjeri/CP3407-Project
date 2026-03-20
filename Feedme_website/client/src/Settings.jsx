import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import UserMenu from "./UserMenu";
import { useUser } from "./UserContext";

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>

        <div className="lm-topsearchForm">
          <input
            className="lm-search"
            placeholder="Search restaurants, cuisines, or dishes"
            readOnly
          />
        </div>

        <div className="lm-topbarRight">
          <CartDropdown />
          <UserMenu />
        </div>
      </header>

      <div className="lm-body">
        <aside className="lm-sidebar">
          <div className="lm-deal">
            <strong>Account Settings</strong>
            <p>Manage your profile and account details.</p>
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
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign Out
          </button>
        </aside>

        <main className="lm-main">
          <div className="orders-headerCard">
            <div>
              <h1 className="orders-title">Settings</h1>
              <p className="orders-subtitle">
                View your account information and app preferences
              </p>
            </div>
          </div>

          {!user.isLoggedIn ? (
            <div className="checkout-formCard">
              <h2>Guest Account</h2>
              <p>
                You are currently browsing as a guest. Login or register to save
                your account details and personalise your experience.
              </p>

              <div className="checkout-authRow">
                <Link to="/login" className="checkout-linkBtn">
                  Login
                </Link>
                <Link to="/register" className="checkout-linkBtn">
                  Register
                </Link>
              </div>
            </div>
          ) : (
            <div className="checkout-formCard">
              <h2>Profile Information</h2>

              <div className="settings-infoRow">
                <span className="settings-label">First Name</span>
                <span className="settings-value">{user.firstName || "-"}</span>
              </div>

              <div className="settings-infoRow">
                <span className="settings-label">Last Name</span>
                <span className="settings-value">{user.lastName || "-"}</span>
              </div>

              <div className="settings-infoRow">
                <span className="settings-label">Email</span>
                <span className="settings-value">{user.email || "-"}</span>
              </div>

              <div className="settings-infoRow">
                <span className="settings-label">Role</span>
                <span className="settings-value">{user.role || "customer"}</span>
              </div>

              <div className="settings-infoRow">
                <span className="settings-label">Account Type</span>
                <span className="settings-value">Registered User</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
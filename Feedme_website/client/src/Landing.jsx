import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing">
      <h1>Welcome to Our Website!</h1>
      <p>Explore our restaurants:</p>

      <Link to="/restaurants">
        <button>Go to Restaurants</button>
      </Link>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10; // restaurants per page

  useEffect(() => {
    fetchRestaurants(page);
  }, [page]);

  const fetchRestaurants = async (pageNumber) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/restaurants?page=${pageNumber}&limit=${limit}`
      );

      setRestaurants(res.data.restaurants);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  return (
    <div className="App">
      <h1>Restaurants</h1>

      <ul className="restaurant-list">
        {restaurants.map((r) => (
          <li key={r.id}>
            <strong>{r.name}</strong> – {r.category}
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>

        <span> Page {page} of {totalPages} </span>

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      <br />

      <Link to="/">
        <button>Back to Home</button>
      </Link>
    </div>
  );
}
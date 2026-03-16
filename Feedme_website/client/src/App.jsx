import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Restaurants from "./Restaurants";
import Orders from "./Orders";
import RestaurantMenu from "./RestaurantMenu";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/restaurants/:id" element={<RestaurantMenu />} />
      </Routes>
    </Router>
  );
}

export default App;
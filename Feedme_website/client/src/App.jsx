import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Restaurants from "./Restaurants";
import Orders from "./Orders";
import RestaurantMenu from "./RestaurantMenu";
import { CartProvider } from "./Cart";
import "./App.css";

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/restaurants/:id" element={<RestaurantMenu />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
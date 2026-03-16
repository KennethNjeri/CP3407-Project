import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "./Cart";
import "./App.css";

export default function RestaurantMenu() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    cart,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
  } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const r = await fetch(`/api/restaurants/${id}`);
        if (!r.ok) {
          throw new Error("Failed to load restaurant");
        }
        const restaurantData = await r.json();

        const m = await fetch(`/api/restaurants/${id}/menu`);
        if (!m.ok) {
          throw new Error("Failed to load menu");
        }
        const menuData = await m.json();

        setRestaurant(restaurantData);
        setMenu(menuData);
      } catch (err) {
        console.error(err);
        setError("Could not load restaurant details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="lm-empty">Loading...</div>;
  if (error) return <div className="lm-empty">{error}</div>;
  if (!restaurant) return <div className="lm-empty">Restaurant not found.</div>;

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>
      </header>

      <main className="lm-main">
        <div className="lm-restaurantHeader">
          <h1>{restaurant.name}</h1>
          <p>{restaurant.category}</p>
          {restaurant.full_address && <p>{restaurant.full_address}</p>}
        </div>

        <div className="lm-contentWrap">
          <div className="lm-menuGrid">
            {menu.length === 0 ? (
              <div className="lm-empty">No menu items found.</div>
            ) : (
              menu.map((item) => (
                <div className="lm-menuCard" key={item.id}>
                  <div className="lm-menuTitle">{item.name}</div>

                  <div className="lm-menuDesc">{item.description}</div>

                  <div className="lm-menuBottom">
                    <span className="lm-menuPrice">
                      ${Number(item.price || 0).toFixed(2)}
                    </span>

                    <button
                      className="lm-addBtn"
                      onClick={() => addToCart(item)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="lm-cart">
            <h2>Your Cart</h2>
            <p>{totalItems} item{totalItems !== 1 ? "s" : ""}</p>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                <div className="lm-cartList">
                  {cart.map((item) => (
                    <div className="lm-cartItem" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <div>Qty: {item.quantity}</div>
                      </div>

                      <div>${(item.price * item.quantity).toFixed(2)}</div>

                      <div className="lm-cartActions">
                        <button onClick={() => addToCart(item)}>+</button>
                        <button onClick={() => decreaseQuantity(item.id)}>-</button>
                        <button onClick={() => removeFromCart(item.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                <hr />

                <div className="lm-cartSummary">
                  <strong>Subtotal:</strong>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>

                <button
                  className="lm-checkoutBtn"
                  onClick={() => alert("Checkout functionality coming later")}
                >
                  Checkout
                </button>

                <button
                  className="lm-checkoutBtn"
                  onClick={clearCart}
                  style={{ marginTop: "10px" }}
                >
                  Clear Cart
                </button>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./Cart";
import "./App.css";

export default function CartDropdown() {
  const cartRef = useRef(null);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  const {
    cart,
    addToCart,
    decreaseQuantity,
    clearCart,
    totalItems,
    subtotal,
  } = useCart();

  useEffect(() => {
    function handleClickOutside(e) {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="cart-nav" ref={cartRef}>
      <button
        className="cart-nav-btn"
        onClick={() => setCartOpen((prev) => !prev)}
      >
        Cart ({totalItems})
      </button>

      {cartOpen && (
        <div className="cart-dropdown">
          <h2>Your Cart</h2>
          <p>
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <div className="cart-list">
                {cart.map((item, index) => (
                  <div
                    className="cart-item"
                    key={`${item.id}-${item.restaurant}-${index}`}
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <div className="cart-restaurant">{item.restaurant}</div>
                      <div>Qty: {item.quantity}</div>
                    </div>

                    <div>${(item.price * item.quantity).toFixed(2)}</div>

                    <div className="cart-actions">
                      <button onClick={() => addToCart(item)}>+</button>
                      <button
                        onClick={() =>
                          decreaseQuantity(item.id, item.restaurant)
                        }
                      >
                        -
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <hr />

              <div className="cart-summary">
                <strong>Subtotal:</strong>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>

              <button
                className="cart-clear-btn"
                onClick={() => {
                  if (window.confirm("Clear cart?")) {
                    clearCart();
                  }
                }}
              >
                Clear Cart
              </button>

              <button
                className="cart-checkout-btn"
                onClick={() => {
                  setCartOpen(false);
                  navigate("/checkout");
                }}
              >
                Checkout
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import "./App.css";

export default function RestaurantMenu() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const r = await fetch(`/api/restaurants/${id}`);
      const restaurantData = await r.json();

      const m = await fetch(`/api/restaurants/${id}/menu`);
      const menuData = await m.json();

      setRestaurant(restaurantData);
      setMenu(menuData);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
  function handleClickOutside(e) {
    if (cartRef.current && !cartRef.current.contains(e.target)) {
      setCartOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  function addToCart(item) {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [
        ...prevCart,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: 1,
        },
      ];
    });
  }

  function decreaseQuantity(itemId) {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  if (loading) return <div className="lm-empty">Loading...</div>;

  return (
    <div className="lm-shell">
<header className="rm-topbar">
  <Link to="/" className="rm-brandLink">FeedMe</Link>

  <div className="rm-navSpacer" />

  <div className="rm-cartNav" ref={cartRef}>
    <button
      className="rm-cartNavBtn"
      onClick={() => setCartOpen((prev) => !prev)}
    >
      Cart ({totalItems})
    </button>

    {cartOpen && (
      <div className="rm-cartDropdown">
        <h2>Your Cart</h2>
        <p>{totalItems} item{totalItems !== 1 ? "s" : ""}</p>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="rm-cartList">
              {cart.map((item) => (
                <div className="rm-cartItem" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <div>Qty: {item.quantity}</div>
                  </div>

                  <div>${(item.price * item.quantity).toFixed(2)}</div>

                  <div className="rm-cartActions">
                    <button onClick={() => addToCart(item)}>+</button>
                    <button onClick={() => decreaseQuantity(item.id)}>-</button>
                  </div>
                </div>
              ))}
            </div>

            <hr />

            <div className="rm-cartSummary">
              <strong>Subtotal:</strong>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>

            <button
              className="rm-checkoutBtn"
              onClick={() => {
                setCart([]);
                setCartOpen(false);
                alert("Order placed!");
              }}
            >
              Checkout
            </button>
          </>
        )}
      </div>
    )}
  </div>

  <div className="rm-user">Fred Smith</div>
</header>
      <main className="lm-main">
        <div className="lm-restaurantHeader">
          <h1>{restaurant.name}</h1>
          <p>{restaurant.category}</p>
        </div>

        <div className="lm-contentWrap">
          <div className="lm-menuGrid">
            {menu.map((item) => (
              <div className="lm-menuCard" key={item.id}>
                <div className="lm-menuTitle">
                  {item.name}
                </div>

                <div className="lm-menuDesc">
                  {item.description}
                </div>

                <div className="lm-menuBottom">
                  <span className="lm-menuPrice">
                    ${Number(item.price).toFixed(2)}
                  </span>

                  <button
                    className="lm-addBtn"
                    onClick={() => addToCart(item)}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

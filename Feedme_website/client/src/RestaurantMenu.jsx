import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "./Cart";
import CartDropdown from "./CartDropdown";
import "./App.css";

export default function RestaurantMenu() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      const r = await fetch(`/api/restaurants/${id}`);
      const restaurantData = await r.json();

      const m = await fetch(`/api/restaurants/${id}/menu`);
      const menuData = await m.json();

      setRestaurant(restaurantData);
      setMenu(menuData);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) return <div className="lm-empty">Loading...</div>;

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>

        <div className="lm-navSpacer" />

        <CartDropdown />

        <div className="lm-user">Fred Smith</div>
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
                <div className="lm-menuTitle">{item.name}</div>

                <div className="lm-menuDesc">{item.description}</div>

                <div className="lm-menuBottom">
                  <span className="lm-menuPrice">
                    ${Number(item.price).toFixed(2)}
                  </span>

                  <button
                    className="lm-addBtn"
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        restaurant: restaurant.name,
                      })
                    }
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

import { useState, useEffect } from "react";
import styles from '../styles/Shop.module.css';
import stylesHeader from '../styles/Header.module.css';
import config from '../../config/config';
import Link from "next/link";
import { useRouter } from "next/router";

export default function Shop() {
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", searchQuery: "" });
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alreadyInCart, setAlreadyInCart] = useState({});
  const router = useRouter();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: 6,
        minPrice: filters.minPrice || 0,
        maxPrice: filters.maxPrice || 9999999999,
        search: filters.searchQuery || ""
      });
      const response = await fetch(`${config.SERVER_URL}/api/products.js?${query.toString()}`);
      const data = await response.json();

      if (currentPage > data.totalPages && data.totalPages > 0) {
        setCurrentPage(1);
      }

      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
    const loadCart = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch(`${config.SERVER_URL}/api/cart.js`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setCart(data.cart || []);
          const initialAlreadyInCart = {};
          (data.cart || []).forEach(item => {
            initialAlreadyInCart[item.productId] = true;
          });
          setAlreadyInCart(initialAlreadyInCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };

    loadCart();
    loadProducts();
  }, [currentPage, filters]);

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Токен отсутствует в localStorage");
    }
    
    if (token) {
      try {
        const response = await fetch(`${config.SERVER_URL}/api/cart.js`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ productId })
        });

        if (response.ok) {
          const data = await response.json();

          if (data.status === "+") {
            setCart(data.cart);
          }
          else if (data.status === "-") {
            setCart(data.cart);
            setAlreadyInCart(prev => ({
              ...prev,
              [productId]: true
            }));
          }
        } else {
          console.error('Failed to add product to cart');
        }
      } catch (error) {
        console.error('Error adding product to cart:', error);
      }
    } else {
      console.error('User not authenticated');
    }
  };

  const handleResetFilter = () => {
    setFilters({ minPrice: "", maxPrice: "", searchQuery: "" });
    setError("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    router.push("/");
  };

  return (
    <div className={styles.shopContainer}>
      <header className={stylesHeader.shopHeader}>
        <div className={stylesHeader.logoText}>
          <img
            src="/images/logo.png"
            alt="Logo"
            className={stylesHeader.logo}
          />
          Shopy
        </div>
        <nav className={stylesHeader.navButtons}>
          <button
            className={`${stylesHeader.navItem} ${stylesHeader.activeTab}`}>
            Marketplace
          </button>
          <Link href="/components/yourProducts">
            <button className={`${stylesHeader.navItem}`}>
              Your Products
            </button>
          </Link>
        </nav>
        <div className={stylesHeader.userActions}>
          <Link href="/components/shoppingCart">
            <div className={stylesHeader.cart}>
              <img
                src="/images/cart.png"
                alt="Cart"
                className={stylesHeader.cartLogo}
              />
              {cart.length > 0 && (
                <div className={stylesHeader.cartCounter}>
                  {cart.length}
                </div>
              )}
            </div>
          </Link>

          <button onClick={handleLogout} className={stylesHeader.logout}>
            <img
              src="/images/logout.png"
              alt="Logout"
              className={stylesHeader.logoutLogo}
            />
          </button>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.filtersHeader}>
            <h2>Filters</h2>
            <button onClick={handleResetFilter}>✖ Reset All</button>
          </div>
          <div className={styles.filterSection}>
            <label>Price:</label>
            <div className={styles.priceRange}>
              <input
                type="text"
                placeholder="From: $0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <input
                type="text"
                placeholder="To: $1500"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </aside>

        <main className={styles.productList}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search products"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className={styles.searchInput}
            />
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div className={styles.resultsAndSort}>
                <span>{products.length} results</span>
              </div>

              <div className={styles.productsGrid}>
                {products.map((product) => (
                  <div key={product._id} className={styles.productCard}>
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                    <h3>{product.name}</h3>
                    <div className={styles.priceContainer}>
                      <span className={styles.priceLabel}>Price:</span>
                      <span className={styles.price}>${product.price}</span>
                    </div>
                    {alreadyInCart[product._id] ? (
                      <div className={styles.alreadyInCartMessage}>The product has already been added to the cart</div>
                    ) : (
                      <button onClick={() => handleAddToCart(product._id)} className={styles.addToCart}>Add to cart</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      <div className={styles.pagination}>
        <button onClick={() => handlePageChange(currentPage - 1)}>{"<"}</button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)}>{">"}</button>
      </div>
    </div>
  );
}
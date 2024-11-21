import { useState, useEffect } from "react";
import styles from '../styles/YourProducts.module.css';
import stylesHeader from '../styles/Header.module.css';
import Link from "next/link";
import config from '../../config/config';
import { useRouter } from "next/router";

export default function YourProducts() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
    const loadProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch(`${config.SERVER_URL}/api/my-products.js`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
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
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    loadCart();
    loadProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    router.push("/");
  };

  const handleDelete = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("No token found");
        return;
    }

    try {
        const productResponse = await fetch(`${config.SERVER_URL}/api/products.js`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId }),
        });

        if (productResponse.status === 404) {
            console.warn(`Product with ID ${productId} not found in products.`);
        } else if (!productResponse.ok) {
            const errorData = await productResponse.json();
            console.error("Error deleting product:", errorData.error || "Unknown error");
            throw new Error("Failed to delete the product from products");
        } else {
            console.log(`Product has been deleted from products.`);
        }

        const userResponse = await fetch(`${config.SERVER_URL}/api/my-products.js`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId }),
        });

        if (userResponse.status === 404) {
            console.warn(`Product with ID ${productId} not found in myProducts.`);
        } else if (!userResponse.ok) {
            const errorData = await userResponse.json();
            console.error("Error deleting product from myProducts:", errorData.error || "Unknown error");
            throw new Error("Failed to delete the product from myProducts");
        } else {
            console.log(`Product with has been deleted from myProducts.`);
        }

        setProducts((prevProducts) => prevProducts.filter((product) => product.productId !== productId));
    } catch (error) {
        console.error("Error deleting product:", error.message || error);
    }
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
          <Link href="/components/shop">
            <button
              className={`${stylesHeader.navItem}`}>
              Marketplace
            </button>
          </Link>
          <button className={`${stylesHeader.navItem} ${stylesHeader.activeTab}`}>
            Your Products
          </button>
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

      <div className={styles.cartHeader}>
        <button className={styles.historyButton}>Your Products</button>
      </div>

      <div className={styles.productGrid}>
        <div className={styles.createProductCard}>
          <Link href="/components/createProduct">
            <button className={styles.addProductButton}>+ Add New Product</button>
          </Link>
        </div>

        {products.map((product) => (
          <div key={product._id} className={styles.productCard}>
            <div className={styles.imageWrapper}>
              <img src={product.image} alt={product.name} className={styles.productImage} />
              {!product.isSold && <span className={styles.saleLabel}>On Sale</span>}
              {product.isSold && <span className={styles.soldLabel}>Sold</span>}
              <img
                src="/images/trash.png"
                alt="Delete"
                className={styles.deleteIcon}
                onClick={() => handleDelete(product.productId)}
              />
            </div>
            <h3>{product.name}</h3>
            <div className={styles.priceContainer}>
              <span className={styles.priceLabel}>Price:</span>
              <span className={styles.price}>${product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
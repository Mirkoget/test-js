import { useState, useEffect } from "react";
import styles from '../styles/History.module.css';
import stylesHeader from '../styles/Header.module.css';
import config from '../../config/config';
import Link from "next/link";
import { useRouter } from "next/router";

const History = () => {
    const [cart, setCart] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
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
                }
            } catch (error) {
                console.error('Error loading cart:', error);
            }
        };

        loadCart();
    }, []);

    const [history, setHistory] = useState([]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await fetch(`${config.SERVER_URL}/api/history.js`, {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    });
                    const data = await response.json();
                    setHistory(data.history || []);
                }
            } catch (error) {
                console.error('Error loading purchase history:', error);
            }
        };

        loadHistory();
    }, []);

    const formatDate = (dateString) => {
        return dateString.replace(/\//g, ".");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("cart");
        router.push("/");
    };

    return (
        <div className={styles.cartContainer}>
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
                                className={`${stylesHeader.cartLogo} ${stylesHeader.cartLogoActive}`}
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
                <Link href="/components/shoppingCart">
                    <button className={styles.historyButton}>My Cart</button>
                </Link>
                <button className={`${styles.historyButton} ${styles.active}`}>History</button>
            </div>

            {history.length === 0 ? (
                <div className={styles.emptyCart}>
                    <img
                        src="/images/empty-cart.png"
                        alt="Empty Cart"
                        className={styles.emptyCartImage}
                    />
                    <p className={styles.emptyCartText}>
                        <span>Oops, there's nothing here yet!</span> <br />
                        You haven't made any purchases yet. Go to the marketplace and make purchases.
                    </p>
                    <Link href="/components/shop">
                        <button className={styles.goToMarketplaceButton}>Go to Marketplace</button>
                    </Link>
                </div>
            ) : (
                <div className={styles.cartContent}>
                    <table className={styles.cartTable}>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Unit Price</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => (
                                <tr key={item._id}>
                                    <td className={styles.cartItemCell}>
                                        <img src={item.image} alt={item ? item.name : 'Product'} className={styles.cartItemImage} />
                                        <span className={styles.cartItemName}>{item ? item.name : 'Unknown Product'}</span>
                                    </td>
                                    <td>${item.price}</td>
                                    <td>{formatDate(item.purchaseDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default History;
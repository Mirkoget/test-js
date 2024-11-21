import { useState, useEffect } from "react";
import styles from '../styles/Failed.module.css';
import stylesHeader from '../styles/Header.module.css';
import config from '../../config/config';
import Link from "next/link";
import { useRouter } from "next/router";

export default function ShoppingCart() {
    const [cart, setCart] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');

        if (token) {
            localStorage.setItem("token", token);
        } else {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) {
                router.push("/auth/login");
                return;
            }
        }

        const loadCart = async () => {
            try {
                const currentToken = token || localStorage.getItem("token");
                if (currentToken) {
                    const response = await fetch(`${config.SERVER_URL}/api/cart.js`, {
                        headers: {
                            "Authorization": `Bearer ${currentToken}`,
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
    }, [router.query]);

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

            <div className={styles.emptyCart}>
                <img
                    src="/images/failed.png"
                    alt="Empty Cart"
                    className={styles.emptyCartImage}
                />
                <p className={styles.emptyCartText}>
                    <span>Payment Failed</span>
                    <br />
                    <br />
                    Sorry, your payment failed.
                    <br />
                    Would you like to try again?
                </p>
                <Link href="/components/shoppingCart">
                    <button className={styles.goToMarketplaceButton}>Back to Cart</button>
                </Link>
            </div>
        </div>
    );
}

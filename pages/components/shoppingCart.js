import { useState, useEffect } from "react";
import styles from '../styles/ShoppingCart.module.css';
import stylesHeader from '../styles/Header.module.css';
import Link from "next/link";
import jwt_decode from "jwt-decode";
import config from "../../config/config";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";

export default function ShoppingCart() {
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
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
                    calculateTotal(data.cart || []);
                }
            } catch (error) {
                console.error('Error loading cart:', error);
            }
        };

        loadCart();
    }, [router]);

    const handleCheckout = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Токен отсутствует");
                return;
            }

            const decodedToken = jwt_decode(token);
            const userId = decodedToken.userId;

            const simplifiedCart = cart.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity
            }));

            const requestBody = {
                cart: simplifiedCart,
                totalPrice,
                userId
            };

            const response = await fetch(`${config.SERVER_URL}/api/createCheckoutSession.js`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const session = await response.json();

            if (!session.id) {
                console.error("Не удалось получить sessionId от сервера");
                return;
            }

            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

            if (error) {
                console.error("Ошибка при редиректе на Stripe Checkout:", error);
            }
        } catch (error) {
            console.error("Ошибка при создании сеанса:", error);
        }
    };


    const calculateTotal = (cartItems) => {
        let total = 0;
        cartItems.forEach(item => {
            const price = item.productId?.price || 0;
            const quantity = item.quantity || 1;
            total += price * quantity;
        });
        setTotalPrice(total);
    };

    const handleRemove = async (cartItemId) => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                await fetch(`${config.SERVER_URL}/api/cart.js`, {
                    method: 'DELETE',
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ cartItemId }),
                });
                const updatedCart = cart.filter(item => item._id !== cartItemId);
                setCart(updatedCart);
                calculateTotal(updatedCart);
            } catch (error) {
                console.error('Error removing item:', error);
            }
        }
    };
    

    const handleQuantityChange = (cartItemId, operation) => {
        const updatedCart = cart.map(item => {
            if (item._id === cartItemId) {
                let updatedQuantity = item.quantity || 1;
                if (operation === 'increase') {
                    updatedQuantity = Math.min(updatedQuantity + 1, 99999);
                } else if (operation === 'decrease') {
                    updatedQuantity = Math.max(updatedQuantity - 1, 1);
                }
                return { ...item, quantity: updatedQuantity };
            }
            return item;
        });

        setCart(updatedCart);
        calculateTotal(updatedCart);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    return (
        <div className={styles.cartContainer}>
            <header className={stylesHeader.shopHeader}>
                <div className={stylesHeader.logoText}>
                    <img src="/images/logo.png" alt="Logo" className={stylesHeader.logo} />
                    Shopy
                </div>
                <nav className={stylesHeader.navButtons}>
                    <Link href="/components/shop">
                        <button className={stylesHeader.navItem}>Marketplace</button>
                    </Link>
                    <Link href="/components/yourProducts">
                        <button className={stylesHeader.navItem}>Your Products</button>
                    </Link>
                </nav>
                <div className={stylesHeader.userActions}>
                    <Link href="/components/shoppingCart">
                        <div className={stylesHeader.cart}>
                            <img src="/images/cart.png" alt="Cart" className={`${stylesHeader.cartLogo} ${stylesHeader.cartLogoActive}`} />
                            {cart.length > 0 && (
                                <div className={stylesHeader.cartCounter}>{cart.length}</div>
                            )}
                        </div>
                    </Link>
                    <button onClick={handleLogout} className={stylesHeader.logout}>
                        <img src="/images/logout.png" alt="Logout" className={stylesHeader.logoutLogo} />
                    </button>
                </div>
            </header>

            <div className={styles.cartHeader}>
                <button className={`${styles.historyButton} ${styles.active}`}>My Cart</button>
                <Link href="/components/history">
                    <button className={styles.historyButton}>History</button>
                </Link>
            </div>

            {cart.length === 0 ? (
                <div className={styles.emptyCart}>
                    <img src="/images/empty-cart.png" alt="Empty Cart" className={styles.emptyCartImage} />
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
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item) => (
                                <tr key={item._id}>
                                    <td className={styles.cartItemCell}>
                                        <img src={item.productId.image} alt={item.productId.name} className={styles.cartItemImage} />
                                        <span className={styles.cartItemName}>{item.productId.name}</span>
                                    </td>
                                    <td>${item.productId.price}</td>
                                    <td>
                                        <button onClick={() => handleQuantityChange(item._id, 'decrease')} className={styles.quantityButton}>−</button>
                                        <span>{item.quantity || 1}</span>
                                        <button onClick={() => handleQuantityChange(item._id, 'increase')} className={styles.quantityButton}>+</button>
                                    </td>
                                    <td>
                                        <button onClick={() => handleRemove(item._id)} className={styles.removeButton}>✖ Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className={styles.summarySection}>
                        <h3>Summary</h3>
                        <p>Total price: ${totalPrice.toFixed(2)}</p>
                        <button className={styles.checkoutButton} onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

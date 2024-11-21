import { useState, useEffect } from "react";
import styles from '../styles/CreateProduct.module.css';
import stylesHeader from '../styles/Header.module.css';
import config from '../../config/config';
import Link from "next/link";
import { useRouter } from "next/router";

export default function CreateProduct() {
    const [cart, setCart] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [error, setError] = useState("");
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                setError("Please upload an image in PNG or JPG format.");
                setImageFile(null);
                setImageUrl("");
                return;
            } else {
                setError("");
            }

            const objectUrl = URL.createObjectURL(file);
            setImageFile(file);
            setImageUrl(objectUrl);
        }
    };

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ml_default");

        try {
            const response = await fetch(`${config.API_CLOUDINARY}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Не удалось загрузить изображение на Cloudinary");
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error("Ошибка при загрузке на Cloudinary:", error);
            throw error;
        }
    };

    const handleCreateProduct = async () => {
        let uploadedImageUrl = imageUrl;
    
        if (imageFile) {
            try {
                console.log("Загружаем изображение на Cloudinary...");
                uploadedImageUrl = await uploadImageToCloudinary(imageFile);
            } catch (error) {
                console.error("Ошибка загрузки изображения:", error);
                return;
            }
        }
    
        try {
            const token = localStorage.getItem("token");
    
            if (token) {
                const productData = { name, price, image: uploadedImageUrl || "/images/defaultImg.png" };
    
                const response = await fetch(`${config.SERVER_URL}/api/create-product.js`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(productData),
                });
    
                const data = await response.json();
                if (data.product) {
                    setName("");
                    setPrice("");
                    setImageFile(null);
                    setImageUrl("");
                } else {
                    console.error(data.error);
                }
            } else {
                alert("Please log in first.");
            }
        } catch (error) {
            console.error('Ошибка при создании продукта:', error);
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
                    <Link href="/components/shop">
                        <button
                            className={`${stylesHeader.navItem}`}>
                            Marketplace
                        </button>
                    </Link>
                    <Link href="/components/yourProducts">
                        <button className={`${stylesHeader.navItem} ${stylesHeader.activeTab}`}>
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

            <div className={styles.cartHeader}>
                <button className={styles.historyButton} onClick={handleCreateProduct}>Create new product</button>
            </div>

            <div className={styles.productForm}>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <div className={styles.imageUpload}>
                    <img
                        src={imageUrl || "/images/defaultImg.png"}
                        alt="Product Preview"
                        className={styles.productImage}
                    />
                    <label htmlFor="fileUpload" className={styles.uploadButton}>
                        Select Image
                    </label>
                    <input
                        id="fileUpload"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleImageUpload}
                        className={styles.hiddenInput}
                    />
                </div>

                <div className={styles.fieldContainer}>
                    <label htmlFor="productName">Product Name</label>
                    <input
                        id="productName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter title of the product"
                    />
                </div>

                <div className={styles.fieldContainer}>
                    <label htmlFor="productPrice">Price</label>
                    <input
                        id="productPrice"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter price of the product"
                    />
                </div>

                <button
                    onClick={handleCreateProduct}
                    className={styles.addProductButton}
                >
                    Upload Product
                </button>
            </div>
        </div>
    );
}
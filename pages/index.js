import { useState } from "react";
import config from '../config/config';
import Link from "next/link";
import { useRouter } from "next/router";
import styles from '../pages/styles/Index.module.css';

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await fetch(`${config.SERVER_URL}/api/register.js`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ошибка регистрации");
            }

            const data = await response.json();
            setSuccess(data.message);
            localStorage.setItem("token", data.token);
            router.push("/auth/login");
        } catch (error) {
            setError("Произошла ошибка: " + error.message);
        }
    };

    const isPasswordLengthValid = password.length >= 8;
    const isPasswordNumberValid = /[0-9]/.test(password);
    const isPasswordLetterCaseValid = /[a-z]/.test(password) && /[A-Z]/.test(password);

    return (
        <div className={styles.signupPage}>
            <div className={styles.leftSection}>
                <div className={styles.logoAndTitle}>
                    <img src="/images/logo.png" alt="Logo" className={styles.logo} />
                    <span className={styles.title}>Shopy</span>
                </div>
                <div className={styles.largeImage}>
                    <img src="/images/large-image.png" alt="Large" className={styles.largeImage} />
                </div>
                <div className={styles.textBottom}>
                    <p className={styles.boldText}>Sell and buy products super quickly!</p>
                    <p>Save your time, we take care of all the processing.</p>
                    <div className={styles.userInfo}>
                        <img src="/images/user-icon.png" alt="User Icon" className={styles.userIcon} />
                        <span>+100 <strong>users</strong> from all over the world</span>
                    </div>
                </div>
            </div>

            <div className={styles.formContainer}>
                <h1>Sign Up</h1>
                <form onSubmit={handleSignup} className={styles.signupForm}>
                    <div className={styles.inputWrapper}>
                        <label htmlFor="email" className={styles.inputLabel}>Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.signupInput}
                        />
                    </div>

                    <div className={styles.inputWrapper}>
                        <label htmlFor="password" className={styles.inputLabel}>Password</label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={styles.signupInput}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.togglePassword}
                            >
                                <img
                                    src={showPassword ? "/images/eye-open.png" : "/images/eye-closed.png"}
                                    alt={showPassword ? "Hide" : "Show"}
                                    className={styles.eyeIcon}
                                />
                            </button>
                        </div>
                    </div>

                    <div className={styles.passwordRequirements}>
                        <div>
                            <img
                                src={isPasswordLengthValid ? "/images/checkmark.png" : "/images/failed.png"}
                                alt="Requirement"
                                className={styles.checkmark}
                                style={{ width: "15px", height: "15px" }}
                            />
                            <span>Must be at least 8 characters</span>
                        </div>
                        <div>
                            <img
                                src={isPasswordNumberValid ? "/images/checkmark.png" : "/images/failed.png"}
                                alt="Requirement"
                                className={styles.checkmark}
                                style={{ width: "15px", height: "15px" }}
                            />
                            <span>Must contain at least 1 number</span>
                        </div>
                        <div>
                            <img
                                src={isPasswordLetterCaseValid ? "/images/checkmark.png" : "/images/failed.png"}
                                alt="Requirement"
                                className={styles.checkmark}
                                style={{ width: "15px", height: "15px" }}
                            />
                            <span>Must contain lower and uppercase letters</span>
                        </div>
                    </div>

                    <button type="submit" disabled={!isPasswordLengthValid || !isPasswordNumberValid || !isPasswordLetterCaseValid} className={styles.signupButton}>Create Account</button>
                </form>

                {error && <p className={styles.errorMessage}>{error}</p>}
                {success && <p className={styles.successMessage}>{success}</p>}
                <p>
                    Have an account? <Link href="/auth/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
}

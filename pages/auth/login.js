import { useState } from "react";
import { useRouter } from "next/router";
import config from '../../config/config';
import styles from '../styles/Index.module.css';
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${config.SERVER_URL}/api/login.js`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      const { token } = await response.json();
      localStorage.setItem("token", token);
      router.push("/components/shop");
    } catch (error) {
      setError(error.message);
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
        <h1>Sign In</h1>
        <form onSubmit={handleLogin} className={styles.signupForm}>
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

          <button type="submit" disabled={!isPasswordLengthValid || !isPasswordNumberValid || !isPasswordLetterCaseValid} className={styles.signupButton}>Log in</button>
        </form>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}
        <p>
          Don't have an account? <Link href="/">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
"use client";

import Image from "next/image";
import styles from "../page.module.css";

export function Navbar({ isMenuOpen, setIsMenuOpen }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <div className={styles.logo}>
          <Image
            src="/navbar-logo.png"
            alt="N0D3 Logo"
            width={120}
            height={40}
            priority
          />
        </div>
        <div className={styles.navActions}>
          <a href="#" className={styles.signupBtn}>
            SIGN UP
          </a>
          <div
            className={`${styles.hamburger} ${isMenuOpen ? styles.active : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { MenuOverlay } from "./components/MenuOverlay";
import { ParticleText } from "./components/ParticleText";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

  return (
    <div className={styles.container}>
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
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
              className={`${styles.hamburger} ${
                isMenuOpen ? styles.active : ""
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <section className={styles.heroSection}>
          <ParticleText />
        </section>
        <section className={styles.communitySection}></section>
        <section className={styles.toolsSection}></section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>Aspire. Awaken. Amplify.</div>
          <div className={styles.footerLinks}>
            <a href="#">DISCORD</a>
            <a href="#">X.COM</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

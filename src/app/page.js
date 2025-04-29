"use client";

import styles from "./page.module.css";
import { useState } from "react";
import { MenuOverlay } from "./components/MenuOverlay";
import { ParticleText } from "./components/ParticleText";
import { Carousel } from "./components/Carousel";
import { Navbar } from "./components/Navbar";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles.container}>
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className={styles.mainContent}>
        <Carousel>
          <div className={styles.heroSection}>
            <ParticleText />
            <div className={styles.scrollIndicator}>
              <div className={styles.scrollArrow}></div>
            </div>
          </div>
          <div className={styles.communitySection}>
            <h1>Community Section</h1>
          </div>
          <div className={styles.toolsSection}>
            <h1>Tools Section</h1>
          </div>
        </Carousel>
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

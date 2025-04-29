"use client";

import styles from "../page.module.css";

export function SlideIndicator({ currentSection, totalSections }) {
  const sections = ["HERO", "COMMUNITY", "TOOLS"];

  return (
    <div className={styles.slideIndicator}>
      {sections.map((section, index) => (
        <div
          key={section}
          className={`${styles.indicatorItem} ${
            currentSection === index ? styles.active : ""
          }`}
        >
          <div className={styles.indicatorLine}></div>
          <div className={styles.indicatorText}>
            {section}
            <span className={styles.indicatorNumber}>0{index + 1}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

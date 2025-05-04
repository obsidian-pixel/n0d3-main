"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "../page.module.css";

export function SlideIndicator({
  currentSection,
  totalSections,
  onSectionChange,
}) {
  const sections = ["N0D3", "COMMUNITY", "TOOLS"];
  const [prevSection, setPrevSection] = useState(currentSection);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleItemClick = useCallback(
    (index) => {
      if (currentSection !== index) {
        onSectionChange(index);
      }
    },
    [currentSection, onSectionChange]
  );

  const handleKeyPress = useCallback(
    (e, index) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleItemClick(index);
      }
    },
    [handleItemClick]
  );

  useEffect(() => {
    if (currentSection !== prevSection) {
      setIsTransitioning(true);
      setPrevSection(currentSection);
      const timer = setTimeout(() => setIsTransitioning(false), 800); // Match Carousel's transition time
      return () => clearTimeout(timer);
    }
  }, [currentSection, prevSection]);

  return (
    <div
      className={styles.slideIndicator}
      role="navigation"
      aria-label="Section Navigation"
    >
      {sections.map((section, index) => (
        <div
          key={section}
          className={`${styles.indicatorItem} ${
            currentSection === index ? styles.active : ""
          } ${
            isTransitioning && currentSection === index ? styles.animating : ""
          }`}
          onClick={() => handleItemClick(index)}
          onKeyDown={(e) => handleKeyPress(e, index)}
          role="button"
          tabIndex={0}
          aria-label={`Go to ${section} section`}
          aria-current={currentSection === index ? "true" : "false"}
          style={{
            "--transition-delay": `${index * 0.1}s`,
            "--item-index": index,
          }}
        >
          <div className={styles.indicatorText}>
            {section}
            <span className={styles.indicatorNumber}>0{index + 1}</span>
          </div>
          <div className={styles.indicatorLine}></div>
        </div>
      ))}
    </div>
  );
}

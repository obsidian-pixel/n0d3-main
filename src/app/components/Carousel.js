"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";
import { SlideIndicator } from "./SlideIndicator";

export function Carousel({ children }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling) return;

      setIsScrolling(true);
      if (e.deltaY > 0 && currentSection < children.length - 1) {
        setCurrentSection((prev) => prev + 1);
      } else if (e.deltaY < 0 && currentSection > 0) {
        setCurrentSection((prev) => prev - 1);
      }

      setTimeout(() => setIsScrolling(false), 1000);
    };

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentSection, children.length, isScrolling]);

  return (
    <>
      <SlideIndicator
        currentSection={currentSection}
        totalSections={children.length}
      />
      <div className={styles.carousel}>
        <div
          className={styles.carouselTrack}
          style={{
            transform: `translateY(-${currentSection * 100}vh)`,
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "../page.module.css";
import { SlideIndicator } from "./SlideIndicator";

export function Carousel({ children, isMenuOpen }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const handleSectionChange = useCallback(
    (sectionIndex) => {
      if (isScrolling || isMenuOpen || sectionIndex === currentSection) return;

      setIsScrolling(true);
      setCurrentSection(sectionIndex);
      setTimeout(() => setIsScrolling(false), 800);
    },
    [isScrolling, isMenuOpen, currentSection]
  );

  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling || isMenuOpen) return;

      setIsScrolling(true);
      if (e.deltaY > 0 && currentSection < children.length - 1) {
        setCurrentSection((prev) => prev + 1);
      } else if (e.deltaY < 0 && currentSection > 0) {
        setCurrentSection((prev) => prev - 1);
      }
      setTimeout(() => setIsScrolling(false), 800);
    };

    const handleTouchStart = (e) => {
      setTouchStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
      if (!touchStart || isScrolling || isMenuOpen) return;

      const touchEnd = e.touches[0].clientY;
      const diff = touchStart - touchEnd;

      if (Math.abs(diff) > 50) {
        setIsScrolling(true);
        if (diff > 0 && currentSection < children.length - 1) {
          setCurrentSection((prev) => prev + 1);
        } else if (diff < 0 && currentSection > 0) {
          setCurrentSection((prev) => prev - 1);
        }
        setTouchStart(null);
        setTimeout(() => setIsScrolling(false), 800);
      }
    };

    const handleKeyDown = (e) => {
      if (isScrolling || isMenuOpen) return;

      if (
        (e.key === "ArrowDown" || e.key === "PageDown") &&
        currentSection < children.length - 1
      ) {
        setIsScrolling(true);
        setCurrentSection((prev) => prev + 1);
      } else if (
        (e.key === "ArrowUp" || e.key === "PageUp") &&
        currentSection > 0
      ) {
        setIsScrolling(true);
        setCurrentSection((prev) => prev - 1);
      } else {
        return;
      }
      setTimeout(() => setIsScrolling(false), 800);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSection, children.length, isScrolling, isMenuOpen, touchStart]);

  return (
    <div className={styles.carousel}>
      <div
        className={styles.carouselTrack}
        style={{
          transform: `translateY(-${currentSection * 100}vh)`,
          transition: "transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)",
        }}
      >
        {children}
      </div>
      <SlideIndicator
        currentSection={currentSection}
        totalSections={children.length}
        onSectionChange={handleSectionChange}
      />
    </div>
  );
}

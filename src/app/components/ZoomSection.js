"use client";

import { useEffect, useRef } from "react";
import styles from "../page.module.css";

export function ZoomSection({ children, className }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.zoomActive);
          } else {
            entry.target.classList.remove(styles.zoomActive);
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: "0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.zoomSection} ${className || ""}`}
    >
      {children}
    </section>
  );
}

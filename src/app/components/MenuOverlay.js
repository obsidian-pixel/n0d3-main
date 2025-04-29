"use client";

import styles from "../page.module.css";

export function MenuOverlay({ isOpen, onClose }) {
  const menuSections = {
    LEARN: [
      "Frontend Development",
      "Backend Development",
      "UI/UX Design",
      "DevOps",
      "View All Courses",
    ],
    BUILD: [
      "Component Library",
      "Code Playground",
      "CSS Generator",
      "Glassmorphism",
      "View All Tools",
    ],
    COMMUNITY: [
      "Discussion Forum",
      "Project Showcase",
      "Code Reviews",
      "Events & Meetups",
      "View All",
    ],
    RESOURCES: [
      "Documentation",
      "Tutorials",
      "Blog Posts",
      "Premium Content",
      "View All Resources",
    ],
  };

  return (
    <div className={`${styles.menuOverlay} ${isOpen ? styles.active : ""}`}>
      <div className={styles.menuContent}>
        <nav className={styles.menuNav}>
          {Object.entries(menuSections).map(
            ([section, items], sectionIndex) => (
              <div
                key={section}
                className={`${styles.menuSection} ${
                  isOpen ? styles.active : ""
                }`}
                style={{ animationDelay: `${sectionIndex * 0.1}s` }}
              >
                <h2 className={styles.menuSectionTitle}>{section}</h2>
                <div className={styles.menuItems}>
                  {items.map((item, itemIndex) => (
                    <a
                      key={item}
                      href="#"
                      className={`${styles.menuItem} ${
                        isOpen ? styles.active : ""
                      }`}
                      style={{
                        animationDelay: `${
                          sectionIndex * 0.1 + itemIndex * 0.05
                        }s`,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                      }}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            )
          )}
        </nav>
      </div>
    </div>
  );
}

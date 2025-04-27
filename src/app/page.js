"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";

function ParticleText() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let frame = 0;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.origX = x;
        this.origY = y;
        this.dx = 0;
        this.dy = 0;
        this.size = 2;
        this.z = 0;
        this.originalZ = (Math.random() - 0.5) * 100;
        this.rotationX = 0;
        this.rotationY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.hoverRadius = 0;
        this.hoverIntensity = 0;
        this.isHovering = false;
      }

      rotate() {
        // Simple 3D rotation
        const dx = this.origX - canvas.width / 2;
        const dy = this.origY - canvas.height / 2;
        const dz = this.originalZ;

        // Apply rotation around Y axis
        const cosY = Math.cos(this.rotationY);
        const sinY = Math.sin(this.rotationY);
        const rotatedX = dx * cosY + dz * sinY;
        const rotatedZ = -dx * sinY + dz * cosY;

        // Apply rotation around X axis
        const cosX = Math.cos(this.rotationX);
        const sinX = Math.sin(this.rotationX);
        const rotatedY = dy * cosX - rotatedZ * sinX;

        this.x = rotatedX + canvas.width / 2;
        this.y = rotatedY + canvas.height / 2;
        this.z = rotatedZ;
      }

      draw() {
        const scale = (this.z + 1000) / 1000;
        ctx.moveTo(this.x + this.size * scale, this.y);
        ctx.arc(this.x, this.y, this.size * scale, 0, Math.PI * 2);
      }

      update() {
        if (this.hoverIntensity > 0) {
          this.dx += (Math.random() - 0.5) * 0.8;
          this.dy += (Math.random() - 0.5) * 0.8;

          // Fast clamp
          this.dx = this.dx < -8 ? -8 : this.dx > 8 ? 8 : this.dx;
          this.dy = this.dy < -8 ? -8 : this.dy > 8 ? 8 : this.dy;

          this.x += this.dx;
          this.y += this.dy;

          // Fast boundary check
          const dx = this.x - this.mouseX;
          const dy = this.y - this.mouseY;
          if (dx * dx + dy * dy > this.hoverRadius * this.hoverRadius) {
            const angle = Math.atan2(dy, dx);
            this.x = this.mouseX + Math.cos(angle) * this.hoverRadius;
            this.y = this.mouseY + Math.sin(angle) * this.hoverRadius;
            this.dx *= -0.6;
            this.dy *= -0.6;
          }
        } else {
          // Apply 3D rotation
          this.rotationX = (this.mouseY - canvas.height / 2) * -0.0008;
          this.rotationY = (this.mouseX - canvas.width / 2) * 0.0009;
          this.rotate();

          // Slow down current velocity
          this.dx *= 1;
          this.dy *= 1;

          // Very gentle return to original position
          const dx = (this.origX - this.x) * 0.1;
          const dy = (this.origY - this.y) * 0.1;
          this.x += dx;
          this.y += dy;
        }
      }
    }

    const createParticles = () => {
      particles = [];
      const img = new window.Image();
      img.src = "/navbar-logo.png";

      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate position to center image
        const scale = 3; // Adjust scale of logo
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        const x = (canvas.width - imgWidth) / 2;
        const y = (canvas.height - imgHeight) / 2;

        // Draw and sample image
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Sample pixels for particles
        for (let y = 0; y < canvas.height; y += 6) {
          // Reduced spacing for more detail
          for (let x = 0; x < canvas.width; x += 6) {
            const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
            const alpha = imageData.data[index + 3];

            if (alpha > 128) {
              // Reduced threshold to catch more of the image
              particles.push(new Particle(x, y));
            }
          }
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.98)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Batch render all particles
      ctx.beginPath();
      ctx.shadowBlur = 35;
      ctx.shadowColor = "cyan";
      ctx.fillStyle = "cyan";

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Single fill call for all particles
      ctx.fill();

      frame = requestAnimationFrame(animate);
    };

    // Move mouse tracking to window level
    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const hoverRadius = 200;

      particles.forEach((particle) => {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < hoverRadius) {
          particle.hoverIntensity = 1 - distance / hoverRadius;
          particle.isHovering = true;
        } else {
          particle.hoverIntensity = 0;
          particle.isHovering = false;
        }
        particle.mouseX = mouseX;
        particle.mouseY = mouseY;
        particle.hoverRadius = hoverRadius;
      });
    };

    createParticles();
    animate();
    // Change event listener to window
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove); // Update cleanup
    };
  }, []);
  return <canvas ref={canvasRef} className={styles.particleCanvas} />;
}

function MenuOverlay({ isOpen }) {
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
      <ParticleText />
      <MenuOverlay isOpen={isMenuOpen} />
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

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>Learn. Build. Share.</div>
          <div className={styles.footerLinks}>
            <a href="#">DISCORD</a>
            <a href="#">X.COM</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

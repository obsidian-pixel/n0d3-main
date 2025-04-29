"use client";

import { useEffect, useRef } from "react";
import styles from "../page.module.css";

export function ParticleText() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let arrowParticles = [];
    let frame = 0;

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
        const dx = this.origX - canvas.width / 2;
        const dy = this.origY - canvas.height / 2;
        const dz = this.originalZ;

        const cosY = Math.cos(this.rotationY);
        const sinY = Math.sin(this.rotationY);
        const rotatedX = dx * cosY + dz * sinY;
        const rotatedZ = -dx * sinY + dz * cosY;

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

          this.dx = this.dx < -8 ? -8 : this.dx > 8 ? 8 : this.dx;
          this.dy = this.dy < -8 ? -8 : this.dy > 8 ? 8 : this.dy;

          this.x += this.dx;
          this.y += this.dy;

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
          this.rotationX = (this.mouseY - canvas.height / 2) * -0.0008;
          this.rotationY = (this.mouseX - canvas.width / 2) * 0.0009;
          this.rotate();

          const dx = (this.origX - this.x) * 0.1;
          const dy = (this.origY - this.y) * 0.1;
          this.x += dx;
          this.y += dy;
        }
      }
    }

    class ArrowParticle extends Particle {
      constructor(x, y) {
        super(x, y);
        this.baseY = y;
        this.amplitude = 1;
        this.speed = 0.5;
        this.phase = Math.random() * Math.PI * 5;
      }

      update() {
        super.update();
        if (!this.isHovering) {
          this.y = this.baseY + Math.sin(this.phase) * this.amplitude;
          this.phase += this.speed;
        }
      }
    }

    const createParticles = () => {
      particles = [];
      arrowParticles = [];
      const img = new window.Image();
      img.src = "/navbar-logo.png";

      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scale = 3;
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        const x = (canvas.width - imgWidth) / 2;
        const y = (canvas.height - imgHeight) / 2 - 50;

        ctx.drawImage(img, x, y, imgWidth, imgHeight);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < canvas.height; y += 6) {
          for (let x = 0; x < canvas.width; x += 6) {
            const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
            const alpha = imageData.data[index + 3];

            if (alpha > 128) {
              particles.push(new Particle(x, y));
            }
          }
        }

        // Create arrow particles
        const arrowWidth = 40;
        const arrowHeight = 40;
        const centerX = canvas.width / 2;
        const centerY = canvas.height - 150;

        for (let y = 0; y < arrowHeight; y += 3) {
          for (let x = 0; x < arrowWidth; x += 3) {
            const relX = x - arrowWidth / 2;
            const relY = y - arrowHeight / 2;

            if (Math.abs(relX) <= (arrowHeight - y) / 2) {
              arrowParticles.push(
                new ArrowParticle(centerX + relX, centerY + relY)
              );
            }
          }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.98)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.shadowBlur = 35;
      ctx.shadowColor = "cyan";
      ctx.fillStyle = "cyan";

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      arrowParticles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      ctx.fill();
      frame = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const hoverRadius = 150;

      [...particles, ...arrowParticles].forEach((particle) => {
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
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.particleCanvas} />;
}

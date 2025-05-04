"use client";

import { useEffect, useRef } from "react";
import styles from "../page.module.css";

export function ParticleText() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let frame = 0;
    let gyroEnabled = false;

    // Add gyroscope state with significantly increased sensitivity
    let gyroRotationX = 0;
    let gyroRotationY = 0;
    const MAX_GYRO_ANGLE = Math.PI / 3; // Increased to 60 degrees max tilt

    const calculateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxScaleWidth = (vw * 0.7) / 120; // Reduced from 0.9 to 0.7
      const maxScaleHeight = (vh * 0.7) / 40; // Reduced from 0.9 to 0.7

      // Extra small screens
      if (vw <= 360) {
        return Math.min(maxScaleHeight * 0.25, 0.8); // Much smaller scale
      }
      // Small screens (mobile)
      if (vw <= 480) {
        return Math.min(maxScaleHeight * 0.3, 1.0); // Much smaller scale
      }
      // Medium screens (tablet)
      if (vw <= 768) {
        return Math.min(maxScaleHeight * 0.4, 1.2); // Reduced scale
      }
      // Large screens
      return Math.min(maxScaleWidth, 2.5); // Slightly reduced max scale
    };

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
        this.explosionSpeed = Math.random() * 2 + 1;
        this.friction = 0.95;
        this.gravity = 0.2;
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
          // Calculate distance from mouse
          const dx = this.x - this.mouseX;
          const dy = this.y - this.mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Add randomized explosion velocity, scaled by hover intensity and contained within radius
          if (distance < this.hoverRadius) {
            this.dx +=
              (Math.random() - 0.5) * this.explosionSpeed * this.hoverIntensity;
            this.dy +=
              (Math.random() - 0.5) * this.explosionSpeed * this.hoverIntensity;

            // Apply velocity limits
            const maxSpeed = 8 * this.hoverIntensity;
            this.dx = Math.min(Math.max(this.dx, -maxSpeed), maxSpeed);
            this.dy = Math.min(Math.max(this.dy, -maxSpeed), maxSpeed);

            // Apply friction
            this.dx *= this.friction;
            this.dy *= this.friction;

            // Update position
            this.x += this.dx;
            this.y += this.dy;

            // Contain particles within hover radius
            const newDx = this.x - this.mouseX;
            const newDy = this.y - this.mouseY;
            const newDistance = Math.sqrt(newDx * newDx + newDy * newDy);

            if (newDistance > this.hoverRadius) {
              const angle = Math.atan2(newDy, newDx);
              this.x = this.mouseX + Math.cos(angle) * this.hoverRadius;
              this.y = this.mouseY + Math.sin(angle) * this.hoverRadius;

              // Bounce effect
              const normalX = Math.cos(angle);
              const normalY = Math.sin(angle);
              const dot = this.dx * normalX + this.dy * normalY;
              this.dx = this.dx - 2 * dot * normalX;
              this.dy = this.dy - 2 * dot * normalY;
              this.dx *= 0.5; // Reduce bounce velocity
              this.dy *= 0.5;
            }
          }
        } else {
          // Normal non-hover behavior
          this.rotationX =
            (this.mouseY - canvas.height / 2) * -0.0008 +
            (gyroEnabled ? gyroRotationX * 1.5 : 0);
          this.rotationY =
            (this.mouseX - canvas.width / 2) * 0.0009 +
            (gyroEnabled ? gyroRotationY * 1.5 : 0);
          this.rotate();

          // Smooth return to original position
          const dx = (this.origX - this.x) * 0.08;
          const dy = (this.origY - this.y) * 0.08;
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

        const scale = calculateScale();
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;

        const isMobile = window.innerWidth <= 768;
        // Adjust vertical offset for better centering
        const verticalOffset = isMobile ? canvas.height * 0.1 : 50; // Changed from -0.05 to 0.1

        const x = (canvas.width - imgWidth) / 2;
        const y = (canvas.height - imgHeight) / 2 - verticalOffset;

        const offscreenCanvas = document.createElement("canvas");
        const offscreenCtx = offscreenCanvas.getContext("2d");
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;

        if (isMobile) {
          offscreenCtx.save();
          offscreenCtx.translate(x + imgWidth / 2, y + imgHeight / 2);
          offscreenCtx.rotate(Math.PI / 2);
          offscreenCtx.drawImage(
            img,
            -imgWidth / 2,
            -imgHeight / 2,
            imgWidth,
            imgHeight
          );
          offscreenCtx.restore();
        } else {
          offscreenCtx.drawImage(img, x, y, imgWidth, imgHeight);
        }

        const imageData = offscreenCtx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const spacing =
          window.innerWidth <= 360
            ? 2
            : window.innerWidth <= 480
            ? 2.5
            : window.innerWidth <= 768
            ? 3
            : 6;

        for (let y = 0; y < canvas.height; y += spacing) {
          for (let x = 0; x < canvas.width; x += spacing) {
            const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
            const alpha = imageData.data[index + 3];

            if (alpha > 128) {
              const particle = new Particle(x, y);
              // Smaller particles for mobile
              particle.size =
                window.innerWidth <= 360
                  ? 0.8
                  : window.innerWidth <= 480
                  ? 1
                  : window.innerWidth <= 768
                  ? 1.2
                  : 2;
              particles.push(particle);
            }
          }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
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

      ctx.fill();
      frame = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const hoverRadius = 180; // Increased from 150

      particles.forEach((particle) => {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < hoverRadius) {
          particle.hoverIntensity = Math.pow(1 - distance / hoverRadius, 2); // Quadratic falloff
          particle.isHovering = true;
        } else {
          particle.hoverIntensity *= 0.95; // Smooth transition out
          if (particle.hoverIntensity < 0.01) {
            particle.hoverIntensity = 0;
            particle.isHovering = false;
          }
        }
        particle.mouseX = mouseX;
        particle.mouseY = mouseY;
        particle.hoverRadius = hoverRadius;
      });
    };

    const handleDeviceOrientation = (event) => {
      if (!event.gamma || !event.beta) return;

      // Convert degrees to radians and normalize with increased multiplier
      gyroRotationX = -((event.beta * Math.PI) / 180) * 0.4; // Increased from 0.25 to 0.4
      gyroRotationY = ((event.gamma * Math.PI) / 180) * 0.4; // Increased from 0.25 to 0.4

      // Clamp values to new max angle
      gyroRotationX = Math.max(
        Math.min(gyroRotationX, MAX_GYRO_ANGLE),
        -MAX_GYRO_ANGLE
      );
      gyroRotationY = Math.max(
        Math.min(gyroRotationY, MAX_GYRO_ANGLE),
        -MAX_GYRO_ANGLE
      );
    };

    const requestGyroPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === "granted") {
            window.addEventListener(
              "deviceorientation",
              handleDeviceOrientation
            );
            gyroEnabled = true;
          }
        } catch (error) {
          console.log("Gyroscope permission denied");
        }
      } else if (window.DeviceOrientationEvent) {
        // For non-iOS devices that support deviceorientation
        window.addEventListener("deviceorientation", handleDeviceOrientation);
        gyroEnabled = true;
      }
    };

    // Request gyroscope permission on mobile devices
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      requestGyroPermission();
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (gyroEnabled) {
        window.removeEventListener(
          "deviceorientation",
          handleDeviceOrientation
        );
      }
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.particleCanvas} />;
}

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
    let gyroEnabled = false;

    // Add gyroscope state with increased sensitivity
    let gyroRotationX = 0;
    let gyroRotationY = 0;
    const MAX_GYRO_ANGLE = Math.PI / 4; // Increased to 45 degrees max tilt

    const calculateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxScaleWidth = (vw * 0.9) / 120;
      const maxScaleHeight = (vh * 0.9) / 40;

      // Small screens (mobile)
      if (vw <= 480) {
        return Math.min(maxScaleHeight * 0.6, 1.5);
      }
      // Medium screens (tablet)
      if (vw <= 768) {
        return Math.min(maxScaleHeight * 0.7, 1.8);
      }
      // Large screens
      return Math.min(maxScaleWidth, 3);
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
          // Combine mouse and gyroscope rotation
          this.rotationX =
            (this.mouseY - canvas.height / 2) * -0.0008 +
            (gyroEnabled ? gyroRotationX : 0);
          this.rotationY =
            (this.mouseX - canvas.width / 2) * 0.0009 +
            (gyroEnabled ? gyroRotationY : 0);
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

        const scale = calculateScale();
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;

        const isMobile = window.innerWidth <= 768;
        const verticalOffset = isMobile ? 100 : 50;

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
          window.innerWidth <= 480 ? 3 : window.innerWidth <= 768 ? 4 : 6;

        for (let y = 0; y < canvas.height; y += spacing) {
          for (let x = 0; x < canvas.width; x += spacing) {
            const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
            const alpha = imageData.data[index + 3];

            if (alpha > 128) {
              const particle = new Particle(x, y);
              // Adjust particle size based on screen width
              particle.size =
                window.innerWidth <= 480
                  ? 1.2
                  : window.innerWidth <= 768
                  ? 1.5
                  : 2;
              particles.push(particle);
            }
          }
        }

        // Adjust arrow particles for different screen sizes
        const arrowScale =
          window.innerWidth <= 480 ? 0.5 : window.innerWidth <= 768 ? 0.7 : 1;
        const arrowWidth = 40 * arrowScale;
        const arrowHeight = 40 * arrowScale;
        const centerX = canvas.width / 2;
        const centerY = canvas.height - (isMobile ? 100 : 150);
        const arrowSpacing =
          window.innerWidth <= 480 ? 1.5 : window.innerWidth <= 768 ? 2 : 3;

        for (let y = 0; y < arrowHeight; y += arrowSpacing) {
          for (let x = 0; x < arrowWidth; x += arrowSpacing) {
            const relX = x - arrowWidth / 2;
            const relY = y - arrowHeight / 2;

            if (Math.abs(relX) <= (arrowHeight - y) / 2) {
              const particle = new ArrowParticle(
                centerX + relX,
                centerY + relY
              );
              particle.size = isMobile ? 1.5 : 2;
              particle.amplitude = isMobile ? 0.7 : 1;
              arrowParticles.push(particle);
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

    const handleDeviceOrientation = (event) => {
      if (!event.gamma || !event.beta) return;

      // Convert degrees to radians and normalize with increased multiplier
      gyroRotationX = -((event.beta * Math.PI) / 180) * 0.25; // Increased from 0.1 to 0.25
      gyroRotationY = ((event.gamma * Math.PI) / 180) * 0.25; // Increased from 0.1 to 0.25

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

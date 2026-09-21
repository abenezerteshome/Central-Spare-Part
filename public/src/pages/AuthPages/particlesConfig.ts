// src/pages/AuthPages/particlesConfig.ts
import type { ISourceOptions } from 'tsparticles-engine';

export const particlesOptions: ISourceOptions = {
  background: {
    color: {
      value: 'transparent', // Make background transparent so the CSS background is visible
    },
  },
  fpsLimit: 120, // Lower this if you experience performance issues
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'repulse', // Pushes particles away from the cursor
      },
      resize: true,
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: '#ffffff', // Particle color
    },
    links: {
      color: '#ffffff', // Line color between particles
      distance: 150,
      enable: true,
      opacity: 0.2,
      width: 1,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'bounce', // Particles bounce off the edges
      },
      random: false,
      speed: 2, // Movement speed
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80, // Number of particles
    },
    opacity: {
      value: 0.2, // Particle opacity
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 1, max: 5 },
    },
  },
  detectRetina: true,
};
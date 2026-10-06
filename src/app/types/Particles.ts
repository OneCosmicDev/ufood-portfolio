export const ParticlesOpts: any = {
    fpsLimit: 120,
    detectRetina: true,
    autoPlay: true,
    interactivity: {
        events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" },
            resize: true,
        },
        modes: {
            push: { quantity: 3 },
            repulse: { distance: 120, duration: 0.4 },
        },
    },
    particles: {
        bounce: {
            horizontal: { random: false, value: 1 },
            vertical: { random: false, value: 1 },
        },
        collisions: { enable: false, mode: "bounce", overlap: { enable: true, retries: 0 } },
        color: {
            value: "#0099cc",
        },
        move: {
            enable: true,
            random: true,
            speed: 0.7,
            direction: "none",
            outModes: { default: "out" },
            straight: false,
        },
        number: {
            density: { enable: true, width: 1920, height: 1080 },
            value: 90,
        },
        opacity: {
            value: { min: 0.15, max: 0.5 },
            random: { enable: true, minimumValue: 0.15 },
            animation: { enable: true, speed: 2, sync: false, startValue: "random", minimumValue: 0.15 },
        },
        shape: { type: "circle" },
        size: {
            value: { min: 1, max: 3.5 },
            random: { enable: true, minimumValue: 1 },
            animation: { enable: false },
        },
        links: {
            enable: true,
            distance: 150,
            color: { value: "#666666" },
            opacity: 0.25,
            width: 1,
        },
        zIndex: { value: 0 },
    },
};

export const ParticleOptsMenu: any = {
    fpsLimit: 120,
    detectRetina: true,
    autoPlay: true,
    interactivity: {
        events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" },
            resize: true,
        },
        modes: {
            push: { quantity: 2 },
            repulse: { distance: 100, duration: 0.35 },
        },
    },
    particles: {
        color: { value: "#0099cc" },
        move: {
            enable: true,
            speed: 1,
            random: true,
            outModes: { default: "out" },
        },
        number: {
            density: { enable: true, width: 1920, height: 1080 },
            value: 60,
        },
        opacity: {
            value: { min: 0.1, max: 0.4 },
            random: { enable: true, minimumValue: 0.1 },
            animation: { enable: true, speed: 3, sync: false, startValue: "random", minimumValue: 0.1 },
        },
        shape: { type: "circle" },
        size: {
            value: { min: 0.8, max: 3 },
            random: { enable: true, minimumValue: 0.8 },
        },
        links: {
            enable: true,
            distance: 130,
            color: { value: "#666666" },
            opacity: 0.2,
            width: 0.8,
        },
        zIndex: { value: 0 },
    },
};

export const ParticlesOptsDark: any = {
    fpsLimit: 120,
    detectRetina: true,
    autoPlay: true,
    interactivity: {
        events: {
            onHover: {
                enable: true,
                mode: "repulse",
            },
            onClick: {
                enable: true,
                mode: "push",
            },
            resize: true,
        },
        modes: {
            push: {
                quantity: 3,
            },
            repulse: {
                distance: 120,
                duration: 0.4,
            },
        },
    },
    particles: {
        bounce: {
            horizontal: {random: false, value: 1},
            vertical: {random: false, value: 1},
        },
        collisions: {
            enable: false,
            mode: "bounce",
            overlap: {enable: true, retries: 0},
        },
        color: {
            value: "#3cc5ff",
            animation: {
                h: {enable: false, count: 0, offset: 0, speed: 1, decay: 0, sync: true},
                s: {enable: false, count: 0, offset: 0, speed: 1, decay: 0, sync: true},
                l: {enable: false, count: 0, offset: 0, speed: 1, decay: 0, sync: true},
            },
        },
        move: {
            angle: {offset: 0, value: 90},
            attract: {enable: false, distance: 200, rotate: {x: 600, y: 600}},
            decay: 0,
            direction: "none",
            drift: 0,
            enable: true,
            gravity: {enable: false, acceleration: 9.81, inverse: false, maxSpeed: 50},
            outModes: {default: "out"},
            random: true,
            speed: 0.6,
            straight: false,
            vibrate: false,
        },
        number: {
            density: {enable: true, width: 1920, height: 1080},
            value: 80,
        },
        opacity: {
            random: {enable: true, minimumValue: 0.15},
            value: {min: 0.12, max: 0.6},
            animation: {enable: true, speed: 2, sync: false, startValue: "random", minimumValue: 0.12},
        },
        shape: {
            type: "circle",
            options: {},
        },
        size: {
            random: {enable: true, minimumValue: 1},
            value: {min: 1, max: 4},
            animation: {enable: false, speed: 4, sync: false},
        },
        stroke: {width: 0},
        zIndex: {value: 0, opacityRate: 1, sizeRate: 1, velocityRate: 1},
        links: {
            enable: true,
            distance: 160,
            color: {value: "#3cc5ff"},
            opacity: 0.12,
            width: 1,
            blink: false,
            warp: false,
        },
        twinkle: {
            particles: {enable: false},
            lines: {enable: false},
        },
        reduceDuplicates: false,
    },
};

export const ParticleOptsMenuDark: any = {
    fpsLimit: 120,
    detectRetina: true,
    autoPlay: true,
    interactivity: {
        events: {
            onHover: {
                enable: true,
                mode: "repulse",
            },
            onClick: {
                enable: true,
                mode: "push",
            },
            resize: true,
        },
        modes: {
            push: {quantity: 2},
            repulse: {distance: 100, duration: 0.35},
        },
    },
    particles: {
        bounce: {
            horizontal: {random: false, value: 1},
            vertical: {random: false, value: 1},
        },
        color: {
            value: "#3cc5ff",
        },
        move: {
            enable: true,
            random: false,
            speed: 1.2,
            outModes: {default: "out"},
            straight: false,
        },
        number: {
            density: {enable: true, width: 1920, height: 1080},
            value: 50,
        },
        opacity: {
            value: {min: 0.08, max: 0.45},
            random: {enable: true, minimumValue: 0.08},
            animation: {enable: true, speed: 3, sync: false, startValue: "random", minimumValue: 0.08},
        },
        shape: {type: "circle"},
        size: {
            random: {enable: true, minimumValue: 0.8},
            value: {min: 0.6, max: 3},
            animation: {enable: false},
        },
        links: {
            enable: true,
            distance: 140,
            color: {value: "#3cc5ff"},
            opacity: 0.10,
            width: 0.9,
        },
        reduceDuplicates: false,
    },
};

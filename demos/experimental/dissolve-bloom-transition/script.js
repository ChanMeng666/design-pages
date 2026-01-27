import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';

// Configuration
const CONFIG = {
    duration: 2.0,
    ease: "power2.inOut",
    bloomStrength: 0.5,  // Further reduced
    bloomRadius: 0.2,    // Sharper bloom
    bloomThreshold: 0.9, // Higher threshold
    burnColor: new THREE.Color(2.0, 1.0, 0.5) // Gold
};

// State
const state = {
    progress: 0,
    isTransitioning: false,
    direction: 1 // 1: img1 -> img2, -1: img2 -> img1
};

// Scene Setup
const canvas = document.querySelector('#c');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 0.9;

// Shader Material
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform sampler2D uNoiseTexture;
    uniform float uProgress;
    uniform float uAspect;
    uniform float uImageAspect;
    uniform vec3 uBurnColor;
    
    varying vec2 vUv;

    vec2 getCoverUv(vec2 uv, float screenAspect, float imgAspect) {
        float rs = screenAspect;
        float ri = imgAspect;
        // If rs > ri (Screen Wider), we map Screen X to Image X (1:1), and Screen Y to a SUBSET of Image Y.
        // Ratio should be < 1.0 for the cropped dimension.
        // rs > ri : RatioX = 1.0, RatioY = ri / rs.
        // rs < ri : RatioX = rs / ri, RatioY = 1.0.
        
        vec2 ratio = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
        
        // Map uv around center (0.5)
        return (uv - 0.5) * ratio + 0.5;
    }
    
    void main() {
        vec2 uv = getCoverUv(vUv, uAspect, uImageAspect);
        
        vec4 t1 = texture2D(uTexture1, uv);
        vec4 t2 = texture2D(uTexture2, uv);
        float noise = texture2D(uNoiseTexture, uv).r;

        float p = uProgress;
        float edgeWidth = 0.04;
        
        // Dissolve Mask
        float mask = smoothstep(p - edgeWidth, p, noise);
        
        // Burn Edge
        float burnIntensity = 1.0 - smoothstep(0.0, edgeWidth, abs(noise - p));
        burnIntensity = pow(burnIntensity, 8.0); // Sharper burn
        
        vec4 finalColor = mix(t2, t1, mask);
        
        // Add burn
        vec3 burn = uBurnColor * burnIntensity;
        finalColor.rgb += burn;

        gl_FragColor = finalColor;
    }
`;

// Uniforms
const uniforms = {
    uTexture1: { value: null },
    uTexture2: { value: null },
    uNoiseTexture: { value: null },
    uProgress: { value: 0 },
    uAspect: { value: window.innerWidth / window.innerHeight },
    uImageAspect: { value: 1.0 },
    uBurnColor: { value: CONFIG.burnColor }
};

// Mesh
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: false
    })
);
scene.add(plane);

// Post-Processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    CONFIG.bloomStrength,
    CONFIG.bloomRadius,
    CONFIG.bloomThreshold
);
composer.addPass(bloomPass);

// Load Assets
const loader = new THREE.TextureLoader();
const loadingEl = document.getElementById('loading');
let assetsLoaded = 0;

function checkLoad() {
    assetsLoaded++;
    if (assetsLoaded === 3) {
        loadingEl.style.display = 'none';
        initInteraction();
        animate();
    }
}

// Helper to load texture
function loadTex(url, isNoise = false) {
    loader.load(url, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        checkLoad();
    });
    return loader.load(url);
}

uniforms.uTexture1.value = loadTex('assets/image1.png');
uniforms.uTexture2.value = loadTex('assets/image2.png');
uniforms.uNoiseTexture.value = loadTex('assets/noise.png', true);

// Animation
function animate() {
    requestAnimationFrame(animate);
    composer.render();
}

// Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uAspect.value = window.innerWidth / window.innerHeight;
});

// Interaction
function initInteraction() {
    window.addEventListener('click', () => {
        if (state.isTransitioning) return;
        state.isTransitioning = true;

        const target = state.direction === 1 ? 1 : 0;

        gsap.to(uniforms.uProgress, {
            value: target,
            duration: CONFIG.duration,
            ease: CONFIG.ease,
            onComplete: () => {
                state.isTransitioning = false;
                state.direction *= -1;
            }
        });
    });
}

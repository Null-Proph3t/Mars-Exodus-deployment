import * as THREE from 'three';
import { initScrollController } from "./scrollController.js";
import { getState } from "./stateManager.js";

initScrollController((progress) => {
  const state = getState(progress);

  updateUI(state, progress);
  update3D(state, progress);
});
document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. UI SETUP AND ANIMATION
  // ==========================================
  const progressBar = document.getElementById('journey-progress-bar');
  const phaseLabel = document.getElementById('journey-phase-label');
  const scenes = document.querySelectorAll('.journey-scene');

  // Generate city skyline
  const skyline = document.getElementById('city-skyline');
  if (skyline) {
    for (let i = 0; i < 40; i++) {
      const b = document.createElement('div');
      b.className = 'building';
      const h = Math.random() * 80 + 20;
      const w = Math.random() * 15 + 10;
      b.style.height = h + 'px';
      b.style.width = w + 'px';
      skyline.appendChild(b);
    }
  }

  // Generate space stars (UI layer) - Reduced DOM elements for heavy optimization
  const spaceStarsEl = document.getElementById('space-stars');
  if (spaceStarsEl) {
    for (let i = 0; i < 20; i++) { /* Reduced from 100 to 20 for layout performance */
      const star = document.createElement('div');
      star.className = 'space-star';
      const size = Math.random() * 2 + 0.5;
      star.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        opacity: ${Math.random() * 0.8 + 0.2};
        animation: twinkle ${Math.random() * 4 + 2}s ease-in-out ${Math.random() * 3}s infinite;
      `;
      spaceStarsEl.appendChild(star);
    }
  }

  // Prep checklist animation
  const prepChecklist = document.getElementById('prep-checklist');
  if (prepChecklist && window.IntersectionObserver) {
    const prepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.prep-item');
          items.forEach((item, i) => {
            const delay = parseInt(item.dataset.delay) || i * 200;
            setTimeout(() => {
              item.classList.add('animate-in');
              setTimeout(() => item.classList.add('checked'), 300);
            }, delay);
          });
          prepObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    prepObserver.observe(prepChecklist);
  }

  // UI Space text reveal
  const spaceTexts = document.querySelectorAll('.space-text[data-reveal]');
  if (window.IntersectionObserver) {
    const spaceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.4 });
    spaceTexts.forEach(t => spaceObserver.observe(t));
  }

  // ==========================================
  // 2. THREE.JS SCENE SETUP
  // ==========================================
  const canvas = document.getElementById('three-canvas');
  if (!canvas) {
    console.error("Three.js canvas not found.");
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05030a, 0.002); // Deep space fog

  // Camera positioned slightly below and angled upward
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0, -6, 25);

  // Lighting
  const envLight = new THREE.HemisphereLight(0xffffff, 0x222233, 1.2);
scene.add(envLight);
  const ambientLight = new THREE.AmbientLight(0x202030, 0.6); // Soft fill
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xfff0ee, 2.0); // Main sun
  directionalLight.position.set(15, 20, 15);
  scene.add(directionalLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0); // Ensure model visibility
  scene.add(hemiLight);

  const engineLight = new THREE.PointLight(0xff6b35, 0, 100); // Point light at engine base
  scene.add(engineLight);

  // Background Star Field (Particle system)
  const starGeo = new THREE.BufferGeometry();
  const starCount = 4000;
  const starPos = new Float32Array(starCount * 3);
  for(let i=0; i<starCount*3; i++) {
    starPos[i] = (Math.random() - 0.5) * 1000;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xcccccc, size: 0.7, transparent: true, opacity: 0.6 });
  const starPoints = new THREE.Points(starGeo, starMat);
  scene.add(starPoints);

  // ==========================================
  // 3. MARS IMPLEMENTATION
  // ==========================================
  const textureLoader = new THREE.TextureLoader();
  const marsGroup = new THREE.Group();
  
  textureLoader.load('assets/mars_texture.jpg', (texture) => {
    const marsGeo = new THREE.SphereGeometry(140, 64, 64); // Slightly larger
    const marsMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7, // Lowered for more specular pop
      metalness: 0.2,
      emissive: 0xaa4422, // Stronger red-orange emissive
      emissiveIntensity: 0.6 // Much higher for texture vibrancy in the dark
    });
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsGroup.add(marsMesh);

    // Atmospheric Glow (transparent slightly larger sphere)
    const glowGeo = new THREE.SphereGeometry(145, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff4422,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    marsGroup.add(glowMesh);
  });
  
  // Position Mars offset in the deep background originally
  marsGroup.position.set(-80, 450, -600); 
  scene.add(marsGroup);
  
  // Dedicated highlight for Mars to make it pop like the 2D version
  const marsLight = new THREE.PointLight(0xffccaa, 4.0, 1000); // Increased intensity
  marsLight.position.set(0, 500, -200); 
  scene.add(marsLight);

  // ==========================================
  // 4. ROCKET MODEL & ENGINE FLAME
  // ==========================================
  let rocketGroup = new THREE.Group();
  scene.add(rocketGroup);

  let flameGroup = new THREE.Group();
  rocketGroup.add(flameGroup);

  // Use Procedural Generation Instead of Heavy External GLTF Model
  // This eliminates the massive network load time.
  const proceduralRocket = new THREE.Group();
  
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2, envMapIntensity: 1.5 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.3 });
  
  // Main Fuselage
  const fuselageMesh = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 30, 32), hullMat);
  fuselageMesh.position.y = 15;
  proceduralRocket.add(fuselageMesh);

  // Nose Cone
  const noseMesh = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 32), darkMat);
  noseMesh.position.y = 34;
  proceduralRocket.add(noseMesh);

  // Engine Bell
  const engineMesh = new THREE.Mesh(new THREE.CylinderGeometry(2, 3.5, 4, 32), darkMat);
  engineMesh.position.y = -2;
  proceduralRocket.add(engineMesh);

  // Fins
  for (let i = 0; i < 4; i++) {
    const finMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 4), hullMat);
    finMesh.position.y = 3;
    const angle = (i * Math.PI) / 2;
    finMesh.position.x = Math.cos(angle) * 4;
    finMesh.position.z = Math.sin(angle) * 4;
    finMesh.rotation.y = -angle;
    // Angle fins slightly
    finMesh.rotation.x = (angle === Math.PI/2 || angle === -Math.PI/2) ? 0.2 : 0;
    finMesh.rotation.z = (angle === 0 || angle === Math.PI) ? 0.2 : 0;
    
    // Correcting explicit rotation mapping
    if (i === 0) finMesh.rotation.z = -0.2; // +x
    if (i === 1) finMesh.rotation.x = 0.2;  // +z
    if (i === 2) finMesh.rotation.z = 0.2;  // -x
    if (i === 3) finMesh.rotation.x = -0.2; // -z

    proceduralRocket.add(finMesh);
  }
  
  // Adjust to match the previous GLTF scale roughly
  proceduralRocket.scale.setScalar(1.2);
  proceduralRocket.position.y = -10;
  rocketGroup.add(proceduralRocket);

  // Flame structure (Layered Cones)
  function createFlameCone(scale, color, opacity) {
    const geo = new THREE.ConeGeometry(scale * 1.0, scale * 10, 16);
    geo.translate(0, -scale * 5, 0); // Origin at top
    const mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    return new THREE.Mesh(geo, mat);
  }

  // Three layers of flame
  const flameCore = createFlameCone(0.5, 0xffffff, 0.9);
  const flameMid = createFlameCone(0.8, 0xffcc00, 0.6);
  const flameOuter = createFlameCone(1.2, 0xff4444, 0.3);
  
  flameGroup.add(flameCore, flameMid, flameOuter);
  // Position flame at the tail of the rocket (adjusted for larger rocket scale)
  flameGroup.position.set(0, -22, 0); 
  flameGroup.visible = false;
  
  // Attach Light to the engine
  engineLight.position.set(0, -22, 0);
  rocketGroup.add(engineLight);

  // ==========================================
  // 5. SCROLL-BASED ANIMATION (RENDER LOOP)
  // ==========================================
  let clock = new THREE.Clock();
  
  function onScrollUIUpdate(progress) {
    // Update progress bar
    if (progressBar) progressBar.style.width = (progress * 100) + '%';

    // Update Phase label
    let currentPhase = '';
    scenes.forEach(sceneEl => {
      const rect = sceneEl.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5 && rect.bottom > 0) {
        currentPhase = sceneEl.dataset.phase || '';
      }
    });

    if (phaseLabel) {
      if (currentPhase) {
        phaseLabel.textContent = currentPhase;
        phaseLabel.classList.add('visible');
      } else {
        phaseLabel.classList.remove('visible');
      }
    }

    // Parallax logic for HTML UI elements in Deep Space scene
    const spaceScene = document.querySelector('.scene-space');
    if (spaceScene) {
      const rect = spaceScene.getBoundingClientRect();
      const spaceProgress = -rect.top / spaceScene.offsetHeight;
      const nebulas = spaceScene.querySelectorAll('.parallax-nebula');
      nebulas.forEach((n, i) => {
        const speed = (i + 1) * 30;
        n.style.transform = `translateY(${spaceProgress * speed}px)`;
      });
      const floats = spaceScene.querySelectorAll('.floating-element');
      floats.forEach((f, i) => {
        const speed = (i + 1) * 15;
        f.style.transform = `translateY(${spaceProgress * speed}px)`;
      });
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    
    // Only render/process if canvas is visible or page is active
    if (document.hidden) return;

    const time = clock.getElapsedTime();
    const scrollY = window.scrollY;
    // Safely calculate document scrollable height
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const rawProgress = docHeight > 0 ? scrollY / docHeight : 0;
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    // Fire UI updates
    onScrollUIUpdate(progress);

    // 1. Slow rotation for Mars
    if (marsGroup) {
      marsGroup.rotation.y = time * 0.03;
    }

    // 2. Journey 3 Stages Logic:
    // We map progress [0, 1] to the journey stages.
    // Stage 1 (Idle): 0% to 15% - Waiting at spaceport
    // Stage 2 (Ignition): 15% to 25% - Engine fires, camera shakes, rocket jitters
    // Stage 3 (Lift-off): 25% to 100% - Rocket flies up, camera follows into space
    
    if (progress < 0.15) {
      // Stage 1: Idle
      rocketGroup.visible = true;
      flameGroup.visible = false;
      engineLight.intensity = 0;
      rocketGroup.position.set(0, 0, 0);
      rocketGroup.quaternion.identity(); // reset rotation
      
      // Stationary camera
      camera.position.x += (0 - camera.position.x) * 0.1;
      camera.position.y += (-15 - camera.position.y) * 0.1; // lower to look up at massive rocket
      camera.position.z += (35 - camera.position.z) * 0.1;
    } 
    else if (progress < 0.25) {
      let ignProgress = (progress - 0.15) / 0.10; // 0 to 1
      // let flicker = Math.random() * 0.2 + 0.8;
      const shake = (Math.random() - 0.5) * 0.3;
camera.position.x += shake;
camera.position.y += shake;
      
      // Ignition thruster effect (lower visibility/flicker)
      
      // Ignition thruster effect (improved flame behavior)
flameGroup.visible = true;

const flicker = Math.random() * 0.25 + 0.75;
const pulse = Math.sin(time * 20) * 0.1 + 1;

flameGroup.scale.set(
  (0.5 + ignProgress * 0.5) * flicker,
  ignProgress * pulse * flicker,
  (0.5 + ignProgress * 0.5) * flicker
);

// subtle turbulence
flameGroup.rotation.z = Math.sin(time * 15) * 0.03;
flameGroup.rotation.x = Math.cos(time * 12) * 0.02;

engineLight.intensity = ignProgress * 180 * flicker;
      
      // Micro jitter for rocket
      rocketGroup.position.x = (Math.random() - 0.5) * ignProgress * 0.1;
      rocketGroup.position.z = (Math.random() - 0.5) * ignProgress * 0.1;
      rocketGroup.position.y = 0;
      rocketGroup.quaternion.identity(); // maintain straight up during ignition
      
      // Camera shake based heavily on ignition
      camera.position.x = (Math.random() - 0.5) * ignProgress * 0.5;
      camera.position.y = -15 + (Math.random() - 0.5) * ignProgress * 0.5;
      camera.position.z += (35 - camera.position.z) * 0.1; // Smooth Z recovery from deep space
    } 
    else {
      // Stage 3: Liftoff & Deep Space
      flameGroup.visible = true;
      let flicker = Math.random() * 0.1 + 0.9; // Stable burn
      
      // Parabolic path towards Mars landing zone
      let liftProgress = (progress - 0.25) / 0.75; // 0 to 1
      let liftY = Math.pow(liftProgress, 0.8) * 440; // Rises quickly initially
      let liftX = Math.pow(liftProgress, 2.0) * -80; // Curves along X later
      let liftZ = Math.pow(liftProgress, 2.0) * -360; // Curves along Z later
      
      rocketGroup.position.set(liftX, liftY, liftZ);
      
      // SYNC: Adjust Mars to "Approach" aggressively during Scene 6 (Mars Approach portion)
      // Scene 6 is roughly at 0.75 to 0.90 of global progress
      let approachFactor = Math.min(Math.max((progress - 0.6) / 0.35, 0), 1);
      let marsTargetY = 450 - (Math.pow(approachFactor, 3.0) * 120);
      const marsApproachPos = new THREE.Vector3(
        -80 * (1 - approachFactor), // Direct center as we arrive
        marsTargetY, 
        -600 + (approachFactor * 250) // Bring it much closer (z: -350)
      );
      marsGroup.position.copy(marsApproachPos);
      
      // Calculate Tangent vector for realistic pitch rotation
      let dY = 0.8 * 440 * Math.pow(Math.max(liftProgress, 0.001), -0.2);
      let dX = 2.0 * -80 * liftProgress;
      let dZ = 2.0 * -360 * liftProgress;
      
      let dir = new THREE.Vector3(dX, dY, dZ).normalize();
      // Point the Y-axis (native "up" of rocket) along the flight tangent direction
      rocketGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      
      // Scale down flames very slightly as we enter space to simulate vacuum plume expansion
      flameGroup.scale.set(1 + liftProgress * 0.5, flicker, 1 + liftProgress * 0.5);
      engineLight.intensity = 150 * flicker;

      // Camera Follow Logic (lagging)
      let targetCamX = liftX * 0.5;
      let targetCamY = -15 + (liftY * 0.7); // Camera trails behind vertically
      let targetCamZ = 35 + liftZ + (liftProgress * 150); // Closer follow for "Approach" merger
      
      camera.position.x += (targetCamX - camera.position.x) * 0.05; // Follow X curve
      camera.position.y += (targetCamY - camera.position.y) * 0.05; // Smooth Damping
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;
      
      // If we are reaching the end, keep camera Z capped so Mars stays massive behind UI
      if (progress > 0.95) {
        camera.position.z += (liftZ + 100 - camera.position.z) * 0.1;
      }
      
      // Disappear at the very end (Arrival at Mars)
      if (progress > 0.98) {
        rocketGroup.visible = false;
        engineLight.intensity = 0;
      } else {
        rocketGroup.visible = true;
      }
    }

    // Camera always looks slightly above rocket center
    const lookTarget = new THREE.Vector3(
      rocketGroup.position.x, 
      rocketGroup.position.y + 10, // aim higher to encompass size
      rocketGroup.position.z
    );
    // Smooth camera follow (lag system)
const desiredPosition = new THREE.Vector3(
  rocketGroup.position.x * 0.5,
  rocketGroup.position.y * 0.7 - 10,
  rocketGroup.position.z + 40
);

// Smooth position movement
camera.position.lerp(desiredPosition, 0.05);

// Smooth look target
cameraTarget.lerp(
  new THREE.Vector3(
    rocketGroup.position.x,
    rocketGroup.position.y + 10,
    rocketGroup.position.z
  ),
  0.1
);

camera.lookAt(cameraTarget);

    renderer.render(scene, camera);
    // subtle star movement (parallax illusion)
starPoints.rotation.y += 0.0002;
starPoints.rotation.x += 0.0001;
  }
  
  // Start loop
  const cameraTarget = new THREE.Vector3();
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
function updateUI(state, progress) {
  const label = document.getElementById("journey-phase-label");
  if (!label) return;

  switch (state) {
    case "EARTH":
      label.textContent = "Earth";
      break;

    case "PREP":
      label.textContent = "Preparation";
      break;

    case "IGNITION":
      label.textContent = "Ignition";
      break;

    case "SPACE":
      label.textContent = "Deep Space";
      break;

    case "MARS":
      label.textContent = "Mars Approach";
      break;
  }
}

function update3D(state, progress) {
  if (!rocket) return; // rocket must be loaded earlier

  switch (state) {
    case "EARTH":
      rocket.position.y = 0;
      break;

    case "IGNITION":
      rocket.position.y = progress * 5;
      break;

    case "SPACE":
      rocket.position.y = progress * 10;
      break;

    case "MARS":
      rocket.position.y = progress * 15;
      break;
  }
}
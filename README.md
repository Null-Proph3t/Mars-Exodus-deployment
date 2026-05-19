# 🚀 Mars Exodus — Humanity's Next Frontier

Welcome to **Mars Exodus**, a premium, cinematic web-based experience designed to showcase the future of interplanetary travel. This project provides a comprehensive and immersive platform for users to explore Mars missions, choose their spacecraft, and experience a fully simulated journey from Earth to our growing Martian colonies. It features robust user authentication, a dynamic multi-step booking wizard, and interactive 3D elements that push the boundaries of modern web design.

---

## 🏗️ Project Architecture & File Structure

The project employs a **Modular Vanilla Web Stack**, specifically chosen to maintain high performance, rich aesthetics, and smooth interactivity without the overhead of heavy JavaScript frameworks.

### 📁 Root Directory Layout
- **`/` (Root)**: Contains all the core HTML pages for each section of the experience (e.g., `index.html`, `journey.html`, `booking.html`).
- **`/css`**: A highly modularized stylesheet directory. It includes a `global.css` for the overarching design system (colors, typography, variables), alongside page-specific CSS files to keep styling isolated and manageable.
- **`/js`**: Contains logic modules for state management, 3D rendering (`Three.js`), form validations, and complex UI interactions.
- **`/assets`**: The centralized repository for all project media, including high-resolution textures, background images, and 3D models.

---

## 💎 Core Features in Detail

The Mars Exodus platform is divided into several meticulously crafted modules, each serving a crucial role in the user's journey.

### 1. 🌌 The Landing Page (`index.html`)
The gateway to the Mars Exodus experience, designed to immediately captivate the user.
- **Hero Section**: Features a stunning, full-bleed visual intro with a pulse-dot launch window indicator, orbital gradients, and glassmorphic UI overlays.
- **Live Mission Stats**: Animated data counters dynamically display total passengers registered, successful missions, and current safety records.
- **Core Vision & Navigation**: Provides a high-level overview of the company's goal to make Mars accessible using Plasma Ion Drives, serving as the central hub linking to all other platform features.

### 2. 🛰️ Immersive Journey (`journey.html`)
A cinematic, scroll-driven 3D experience powered by **Three.js**. This page visually simulates the entire transit process.
- **Interactive Simulation**: As the user scrolls down the page, a 3D rocket model is seamlessly animated. It ignites, launches from the launchpad, breaks through the atmosphere, enters deep space, and ultimately aligns for a Mars approach.
- **Staged Phases**: The animation is broken down into distinct stages: Earth Departure → Launch Prep → Ignition → Atmosphere Exit → Deep Space Transit → Mars Approach → Colony Landing.
- **Parallax Integration**: Blends HTML-based typography and UI elements with the 3D WebGL canvas to create a massive sense of scale and depth.

### 3. 🛸 The Fleet (`fleet.html`)
A detailed catalog breaking down the three distinct classes of interplanetary travel available to users.
- **Pathfinder Class (Economy)**: Priced at $250,000. Features essential transit parameters with shared modular cabins and basic life support systems.
- **Voyager Class (Business)**: Priced at $750,000. Offers enhanced comfort with private cabins, advanced VR recreation suites, and priority boarding.
- **Sovereign Class (Elite)**: Priced at $2,500,000. The pinnacle of luxury and safety, featuring military-grade radiation shielding, expansive private suites, zero-g spas, and personal AI assistants.

### 4. 📝 Multi-Step Booking Wizard (`booking.html` & `payment.html`)
A robust, state-managed booking flow that mimics a real-world complex transactional system.
- **Step 1: Passenger Details**: Captures personal information, emergency contacts, and vital medical history required for spaceflight.
- **Step 2: Travel Class**: Allows users to select their desired vessel (Pathfinder, Voyager, Sovereign) and schedule a mission date based on planetary alignment windows.
- **Step 3: Add-ons & Customization**: Users can purchase extra cargo weight, pre-flight zero-g training, or specialized research access.
- **Step 4: Review & Payment**: A final dynamic summary calculates the total cost before securely transitioning the user to the `payment.html` portal to finalize their ticket.

### 5. 🔐 User Authentication (`login.html` & `signup.html`)
Secure access portals for aspiring Martians.
- **Registration**: Allows users to create a Mars Exodus account, immediately saving their credentials to local storage for persistent sessions.
- **Login**: A sleek, secure-feeling login form with form validation and error handling that grants access to the personalized user dashboard.

### 6. 🎛️ User Dashboard (`dashboard.html`)
A personalized hub available only to authenticated users.
- **Ticket Management**: Displays current bookings, seat assignments, and countdowns to launch.
- **Flight Status**: Real-time mock data regarding spacecraft readiness and weather conditions at the launch site.
- **Profile Configuration**: Allows users to update their details and review their medical clearance status.

### 7. 🌍 Mission & Vision (`mission.html` & `inspiration.html`)
Deep dives into the lore and goals of the Mars Exodus corporation.
- **Colony Details**: Explores the architecture of the Martian domes, terraforming efforts, and daily life on the Red Planet.
- **Inspiration Gallery**: A highly visual grid showcasing concept art, blueprints, and the overarching aesthetic vision of the endeavor.

---

## 🛠️ Technology Stack & Methodologies

| Technology | Implementation & Usage |
| :--- | :--- |
| **HTML5** | Semantic, accessible structure for all pages. Heavy use of data attributes for state tracking. |
| **CSS3** | Modern, responsive design system. Utilizes CSS Variables for easy theming, CSS Grid/Flexbox for layout, and complex `@keyframes` for micro-interactions and ambient animations. |
| **JavaScript (ES6+)** | Handles all core logic, complex DOM manipulation, multi-step form tracking, and routing-like behavior across the static files. |
| **Three.js** | Drives the high-performance WebGL 3D rendering on the Journey page, handling lighting, materials, and scroll-linked camera/object animation. |
| **LocalStorage API** | Implements persistent state management. A custom `MarsState` utility tracks user sessions, authentication status, and in-progress booking drafts across different HTML pages. |

---

## 💻 Major Code Snippets

### 🎨 Global Design System (`global.css`)
Our highly organized CSS variables allow for a consistent cyberpunk-meets-aerospace aesthetic across the entire application.

```css
:root {
  /* Core Color Palette */
  --color-bg-deep:       #050508;
  --color-primary:       #00d4ff;
  --color-accent:        #ff6b35;
  --color-text-main:     #e0e0e0;
  
  /* Typography Tokens */
  --font-display: 'Orbitron', sans-serif;
  --font-body:    'Inter', sans-serif;
  
  /* Animation & Effects */
  --transition-base:   300ms cubic-bezier(0.4, 0, 0.2, 1);
  --shadow-glow: 0 0 30px rgba(0, 212, 255, 0.3);
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### 🧠 State Management Controller (`js/global.js`)
Since this is a vanilla multi-page application, state is persisted utilizing the browser's `localStorage` wrapped in a clean, reusable utility module.

```javascript
const MarsState = {
  get(key, fallback = null) {
    const data = localStorage.getItem(`mars_${key}`);
    return data ? JSON.parse(data) : fallback;
  },
  set(key, value) {
    localStorage.setItem(`mars_${key}`, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(`mars_${key}`);
  },
  isLoggedIn() {
    return !!this.get('session');
  }
};
// Example usage: MarsState.set('booking_draft', currentBookingData);
```

### 🚀 Three.js Scroll-Linked Animation (`js/journey.js`)
The 3D journey syncs the rocket's position, rotation, and particle effects (flames/smoke) directly to the user's scroll depth.

```javascript
// Calculate normalized scroll progress (0.0 to 1.0)
const progress = scrollY / (document.body.scrollHeight - window.innerHeight);

// Animation State Machine based on scroll depth
if (progress < 0.15) {
    // Stage 1: Idle at spaceport, camera pans slowly
    rocketGroup.position.set(0, 0, 0);
    flameGroup.visible = false;
} else if (progress < 0.25) {
    // Stage 2: Ignition & extreme camera shake
    const shake = (Math.random() - 0.5) * 0.3;
    camera.position.x += shake;
    flameGroup.visible = true; // Ignite thrusters
} else {
    // Stage 3: Liftoff & orbital trajectory interpolation
    let liftProgress = (progress - 0.25) / 0.75;
    let liftY = Math.pow(liftProgress, 0.8) * 440; // Easing curve for velocity
    rocketGroup.position.set(liftX, liftY, liftZ);
}
```

---

## 🚀 Getting Started (Installation & Setup)

Because Mars Exodus is built on a vanilla stack, getting it running locally is incredibly straightforward without needing complex build steps.

1. **Clone the Repository**:
   Download the project files to your local machine.
2. **Verify Assets**:
   Ensure all media files (like `Mars.jpg`, `img1.jpg`, etc.) are correctly located in the root directory or the `/assets` folder as referenced in the HTML/CSS.
3. **Launch the Application**:
   Since it uses standard HTML, you can open `index.html` directly in any modern web browser.
   *Note: For the best experience and to avoid any CORS issues with Three.js texture loading, it is highly recommended to serve the directory via a local web server (e.g., using VS Code Live Server, or running `npx serve .` in the terminal).*
4. **Explore**:
   Navigate via the main menu to experience the 3D journey, or click "Book Now" to thoroughly test the state-managed booking and payment flow.

---

*“To ensure the survival of humanity, we must reach for the stars. And Mars is our very first step.”*  
**✦ Mars Exodus Corporation — 2026**

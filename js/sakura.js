(function () {
  // Inject necessary CSS styles for petals
  const style = document.createElement('style');
  style.textContent = `
    .sakura-petal {
      position: fixed;
      top: -10px;
      width: 20px;
      height: 20px;
      background: pink;
      background: radial-gradient(circle, rgba(255,192,203,0.8) 0%, rgba(255,192,203,0.5) 100%);
      pointer-events: none;
      border-radius: 50% 50% 50% 50%;
      opacity: 0.8;
      transform: rotate(45deg);
      animation: fall linear, sway ease-in-out;
      z-index: 99999; /* 最高层级 */
    }

    @keyframes fall {
      to {
        transform: translateY(100vh) rotate(45deg);
      }
    }

    @keyframes sway {
      0% { transform: translateX(0) rotate(45deg); }
      25% { transform: translateX(20px) rotate(50deg); }
      50% { transform: translateX(0) rotate(45deg); }
      75% { transform: translateX(-20px) rotate(40deg); }
      100% { transform: translateX(0) rotate(45deg); }
    }
  `;
  document.head.appendChild(style);

  // Function to create a single sakura petal
  function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('sakura-petal');

    // Randomize size
    const size = Math.random() * 10 + 10; 
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;

    // Randomize initial position
    const viewportWidth = window.innerWidth;
    petal.style.left = `${Math.random() * viewportWidth}px`;

    // Randomize animation duration
    const fallDuration = Math.random() * 5 + 5; 
    petal.style.animationDuration = `${fallDuration}s, ${fallDuration / 2}s`;

    // Randomize opacity
    petal.style.opacity = Math.random() * 0.5 + 0.5;

    // Append to body
    document.body.appendChild(petal);

    // Remove petal when animation ends
    petal.addEventListener('animationend', () => {
      petal.remove();
    });
  }

  // Function to spawn petals periodically
  function spawnPetals() {
    createPetal();
    setTimeout(spawnPetals, 300);
  }

  // Start spawning petals
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', spawnPetals);
  } else {
    spawnPetals();
  }
})();

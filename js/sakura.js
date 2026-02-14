Below is the complete implementation of `sakura.js` as a standalone JavaScript file. This script injects the necessary CSS styles, creates and animates falling sakura petals, and ensures that petals are removed from the DOM once they reach the bottom to prevent memory leaks.

### `my-garden/js/sakura.js`

```javascript
// sakura.js

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
      z-index: 9999;
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
    const size = Math.random() * 10 + 10; // 10px to 20px
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;

    // Randomize initial position
    const viewportWidth = window.innerWidth;
    petal.style.left = `${Math.random() * viewportWidth}px`;

    // Randomize animation duration
    const fallDuration = Math.random() * 5 + 5; // 5s to 10s
    petal.style.animationDuration = `${fallDuration}s, ${fallDuration / 2}s`;

    // Randomize opacity
    petal.style.opacity = Math.random() * 0.5 + 0.5; // 0.5 to 1

    // Append to body
    document.body.appendChild(petal);

    // Remove petal when animation ends to prevent memory leaks
    petal.addEventListener('animationend', () => {
      petal.remove();
    });
  }

  // Function to spawn petals periodically
  function spawnPetals() {
    createPetal();
    // Spawn a new petal every 300ms
    setTimeout(spawnPetals, 300);
  }

  // Start spawning petals after the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', spawnPetals);
  } else {
    spawnPetals();
  }

  // Optional: Adjust spawn rate on window resize
  window.addEventListener('resize', () => {
    // You can adjust spawn rate or petal properties here if needed
  });
})();
```

### Explanation:

1. **CSS Injection**:
   - A `<style>` element is created and appended to the `<head>` of the document.
   - The CSS defines the appearance and animation of the sakura petals:
     - **Positioning**: Fixed to the viewport, starting just above the top.
     - **Appearance**: Pink color with a radial gradient for depth, semi-transparent, and rotated to give a natural tilt.
     - **Animation**: 
       - `fall` moves the petal from the top to the bottom of the viewport.
       - `sway` adds a swaying motion to simulate natural petal movement.

2. **Petal Creation**:
   - The `createPetal` function creates a new `<div>` element, assigns the `sakura-petal` class, and applies randomized styles:
     - **Size**: Varies between 10px and 20px.
     - **Position**: Randomly placed horizontally across the viewport.
     - **Animation Duration**: Randomly between 5 to 10 seconds for the fall and half that for the sway.
     - **Opacity**: Randomly between 0.5 and 1 for variety in petal visibility.

3. **Spawning Petals**:
   - The `spawnPetals` function creates a new petal and schedules the next spawn every 300 milliseconds.
   - This ensures a continuous stream of falling petals.

4. **Memory Management**:
   - Each petal listens for the `animationend` event, which triggers when the animation completes.
   - Once the animation ends, the petal is removed from the DOM to prevent memory leaks.

5. **Initialization**:
   - The script waits for the DOM to be fully loaded before starting the petal spawning to ensure that the styles are applied correctly.
   - If the DOM is already loaded, it starts immediately; otherwise, it waits for the `DOMContentLoaded` event.

6. **Responsive Behavior**:
   - An event listener on the `resize` event is included (currently empty) for any potential adjustments needed when the window size changes.

### Usage:

1. **Include the Script**:
   - Place the `sakura.js` file in your project's `my-garden/js/` directory.
   - Include the script in your HTML file:
     ```html
     <!DOCTYPE html>
     <html lang="en">
     <head>
       <meta charset="UTF-8">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>My Garden</title>
       <!-- Other head elements -->
     </head>
     <body>
       <!-- Your content -->

       <script src="my-garden/js/sakura.js"></script>
     </body>
     </html>
     ```

2. **Customization**:
   - You can adjust the spawn rate by changing the timeout in the `spawnPetals` function.
   - Modify the CSS or JavaScript to change the appearance, size, or behavior of the petals as desired.

This implementation provides a lightweight, standalone solution for adding a beautiful sakura petal animation to your web projects without relying on external libraries.
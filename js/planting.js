// my-garden/js/planting.js

/**
 * Garden Planting System
 * Features:
 * 1. Click 'Plant' to add a seed.
 * 2. Click seed to 'Water' it.
 * 3. Three stages: Seed (🌱) -> Sprout (🌿) -> Flower (random 🌸/🌻/🌹).
 * 4. Save state to localStorage.
 */

const STORAGE_KEY = 'garden_plants';

class Garden {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.warn('Garden container not found:', containerSelector);
            return;
        }
        this.plants = this.loadState();
        this.init();
    }

    init() {
        // Clear existing static content if any
        this.container.innerHTML = ''; 

        // Create Controls
        const controls = document.createElement('div');
        controls.style.marginBottom = '20px';
        controls.style.textAlign = 'center';
        
        this.plantBtn = document.createElement('button');
        this.plantBtn.textContent = 'Plant a Seed 🌱';
        this.plantBtn.className = 'magic-switch'; // Reusing existing style class
        this.plantBtn.style.position = 'static'; // Reset absolute positioning
        this.plantBtn.style.fontSize = '1.2rem';
        this.plantBtn.style.padding = '10px 20px';
        this.plantBtn.style.background = 'var(--glass-bg)';
        this.plantBtn.style.border = '1px solid var(--accent)';
        this.plantBtn.style.borderRadius = '20px';
        this.plantBtn.style.cursor = 'pointer';
        
        this.plantBtn.addEventListener('click', () => this.addPlant());
        
        controls.appendChild(this.plantBtn);
        // Insert controls before the garden container
        this.container.parentNode.insertBefore(controls, this.container);

        this.render();
    }

    loadState() {
        const saved = localStorage.getItem(STORAGE_KEY);
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load garden state', e);
            return [];
        }
    }

    saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.plants));
    }

    addPlant() {
        const newPlant = {
            id: Date.now(),
            stage: 'seed', // seed, sprout, flower
            waterCount: 0,
            type: null
        };
        this.plants.push(newPlant);
        this.saveState();
        this.render();
    }

    waterPlant(plantId) {
        const plant = this.plants.find(p => p.id === plantId);
        if (!plant || plant.stage === 'flower') return;

        plant.waterCount++;

        // Growth Logic
        if (plant.stage === 'seed' && plant.waterCount >= 1) {
            plant.stage = 'sprout';
            plant.waterCount = 0;
        } else if (plant.stage === 'sprout' && plant.waterCount >= 2) {
            plant.stage = 'flower';
            const flowers = ['🌸', '🌻', '🌹', '🌷', '🌺'];
            plant.type = flowers[Math.floor(Math.random() * flowers.length)];
        }

        this.saveState();
        this.render();
    }

    getEmoji(plant) {
        switch (plant.stage) {
            case 'seed': return '🌱';
            case 'sprout': return '🌿';
            case 'flower': return plant.type;
            default: return '❓';
        }
    }

    render() {
        this.container.innerHTML = '';
        
        if (this.plants.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = 'Garden is empty. Plant a seed!';
            emptyMsg.style.width = '100%';
            emptyMsg.style.opacity = '0.6';
            this.container.appendChild(emptyMsg);
            return;
        }

        this.plants.forEach(plant => {
            const plantEl = document.createElement('div');
            plantEl.className = 'flower-item'; // Reusing existing class
            
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'flower-emoji';
            emojiSpan.textContent = this.getEmoji(plant);
            
            const tooltip = document.createElement('span');
            tooltip.className = 'flower-tooltip';
            tooltip.textContent = plant.stage === 'flower' ? 'Beautiful!' : `Water me! (${plant.waterCount})`;

            plantEl.appendChild(emojiSpan);
            plantEl.appendChild(tooltip);

            plantEl.onclick = () => this.waterPlant(plant.id);
            
            this.container.appendChild(plantEl);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Target the existing .garden div
    new Garden('.garden');
});

// Remove export for non-module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Garden;
}


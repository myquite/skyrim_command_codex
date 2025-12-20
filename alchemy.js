// SKYRIM ALCHEMY GUIDE - 16-BIT EDITION
// ========================================

let alchemyData = null;
let currentCategory = 'all';
let searchTerm = '';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('⚗️ Initializing Alchemy Guide...');
    init();
});

// Initialize application
async function init() {
    await loadAlchemyData();
    setupEventListeners();
    displayResults();
}

// Load JSON data
async function loadAlchemyData() {
    try {
        const response = await fetch('alchemy_data.json');
        alchemyData = await response.json();
        console.log('✓ Alchemy data loaded:', alchemyData);
    } catch (error) {
        console.error('✗ Error loading alchemy data:', error);
        showError('Failed to load alchemy database');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        displayResults();
    });

    // Category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            displayResults();
        });
    });
}

// Display results based on filters
function displayResults() {
    const resultsContainer = document.getElementById('results');
    const resultCountElement = document.getElementById('result-count');

    if (!alchemyData) {
        resultsContainer.innerHTML = '<div class="loading">⏳ LOADING ALCHEMY DATA...</div>';
        return;
    }

    if (currentCategory === 'recipes') {
        displayRecipes(resultsContainer, resultCountElement);
    } else {
        displayEffects(resultsContainer, resultCountElement);
    }
}

// Display effects with their ingredients
function displayEffects(resultsContainer, resultCountElement) {
    const results = [];

    // Filter effects by category and search
    Object.entries(alchemyData.effects).forEach(([key, effect]) => {
        // Filter by category
        if (currentCategory !== 'all' && effect.type !== currentCategory) {
            return;
        }

        // Filter by search
        const searchText = `${effect.name} ${effect.description}`.toLowerCase();
        if (searchTerm && !searchText.includes(searchTerm)) {
            return;
        }

        // Find all ingredients with this effect
        const ingredientsWithEffect = alchemyData.ingredients.filter(ing =>
            ing.effects.includes(key)
        );

        results.push({
            effect: effect,
            effectKey: key,
            ingredients: ingredientsWithEffect
        });
    });

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <p>NO EFFECTS FOUND</p>
                <p style="font-size: 0.6rem; margin-top: 1rem; opacity: 0.7;">
                    Try adjusting your search or category filter
                </p>
            </div>
        `;
        resultCountElement.textContent = '0';
        return;
    }

    resultsContainer.innerHTML = results.map(result => createEffectCard(result)).join('');
    resultCountElement.textContent = results.length;

    // Add click listeners to ingredient spans
    document.querySelectorAll('.ingredient-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const command = tag.dataset.command;
            copyToClipboard(command);
        });
    });
}

// Display recipes
function displayRecipes(resultsContainer, resultCountElement) {
    let recipes = alchemyData.recipes;

    // Filter by search
    if (searchTerm) {
        recipes = recipes.filter(recipe => {
            const searchText = `${recipe.name} ${recipe.ingredients.join(' ')} ${recipe.effects.join(' ')}`.toLowerCase();
            return searchText.includes(searchTerm);
        });
    }

    if (recipes.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <p>NO RECIPES FOUND</p>
                <p style="font-size: 0.6rem; margin-top: 1rem; opacity: 0.7;">
                    Try adjusting your search
                </p>
            </div>
        `;
        resultCountElement.textContent = '0';
        return;
    }

    resultsContainer.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
    resultCountElement.textContent = recipes.length;
}

// Create effect card HTML
function createEffectCard(result) {
    const { effect, effectKey, ingredients } = result;
    const typeColor = effect.type === 'beneficial' ? 'var(--success)' : '#ff4444';
    const typeIcon = effect.type === 'beneficial' ? '✨' : '☠️';

    const ingredientTags = ingredients.map(ing => {
        const command = `player.additem ${ing.id} 1`;
        return `<span class="ingredient-tag pixel-border" data-command="${escapeHtml(command)}" title="Click to copy spawn command">
            ${escapeHtml(ing.name)}
        </span>`;
    }).join('');

    return `
        <div class="effect-card pixel-border">
            <div class="card-header">
                <span class="effect-type" style="color: ${typeColor}">${typeIcon} ${effect.type.toUpperCase()}</span>
                <span class="ingredient-count">${ingredients.length} INGREDIENT${ingredients.length !== 1 ? 'S' : ''}</span>
            </div>
            <div class="effect-name">${escapeHtml(effect.name)}</div>
            <div class="effect-description">${escapeHtml(effect.description)}</div>
            <div class="ingredients-section">
                <div class="ingredients-label">INGREDIENTS:</div>
                <div class="ingredients-list">
                    ${ingredientTags || '<span style="opacity: 0.5">No ingredients found</span>'}
                </div>
            </div>
        </div>
    `;
}

// Create recipe card HTML
function createRecipeCard(recipe) {
    const effectsList = recipe.effects.map(effectKey => {
        const effect = alchemyData.effects[effectKey];
        return effect ? effect.name : effectKey;
    }).join(', ');

    const valueColors = {
        'very_high': 'var(--accent-gold)',
        'high': 'var(--success)',
        'medium': 'var(--accent-blue)',
        'low': 'var(--text-light)'
    };

    const valueColor = valueColors[recipe.value] || 'var(--text-light)';

    // Create commands for each ingredient
    const ingredientCommands = recipe.ingredients.map(ingName => {
        const ingredient = alchemyData.ingredients.find(i => i.name === ingName);
        if (ingredient) {
            return `<div class="recipe-command pixel-border" data-command="player.additem ${ingredient.id} 1">
                ${escapeHtml(ingName)} - player.additem ${ingredient.id} 1
            </div>`;
        }
        return '';
    }).join('');

    return `
        <div class="recipe-card pixel-border">
            <div class="card-header">
                <span class="recipe-value" style="color: ${valueColor}">💰 ${recipe.value.toUpperCase()} VALUE</span>
            </div>
            <div class="recipe-name">${escapeHtml(recipe.name)}</div>
            <div class="recipe-ingredients">
                <strong>INGREDIENTS:</strong> ${recipe.ingredients.map(i => escapeHtml(i)).join(' + ')}
            </div>
            <div class="recipe-effects">
                <strong>EFFECTS:</strong> ${escapeHtml(effectsList)}
            </div>
            <div class="recipe-commands-section">
                <div class="ingredients-label">SPAWN COMMANDS (Click to copy):</div>
                ${ingredientCommands}
            </div>
        </div>
    `;
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('COMMAND COPIED TO CLIPBOARD!');
        playSound();
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('COMMAND COPIED TO CLIPBOARD!');
            playSound();
        } catch (err) {
            showToast('COPY FAILED - TRY AGAIN');
        }
        document.body.removeChild(textArea);
    });
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = toast.querySelector('.toast-text');
    toastText.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Play 8-bit sound (visual feedback)
function playSound() {
    const toast = document.getElementById('toast');
    toast.style.animation = 'none';
    setTimeout(() => {
        toast.style.animation = '';
    }, 10);
}

// Show error message
function showError(message) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">⚠️</div>
            <p>ERROR: ${message}</p>
        </div>
    `;
}

// Utility: Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Focus search on '/' key
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search').focus();
    }

    // Clear search on Escape
    if (e.key === 'Escape') {
        document.getElementById('search').value = '';
        searchTerm = '';
        displayResults();
    }
});

// Add click handlers for recipe commands
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('recipe-command')) {
        const command = e.target.dataset.command;
        copyToClipboard(command);
    }
});

console.log('⚗️ Alchemy Guide Ready! Press [/] to search, [ESC] to clear');

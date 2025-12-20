// SKYRIM COMMAND CODEX - 16-BIT EDITION
// ========================================

let commandsData = null;
let currentCategory = 'all';
let searchTerm = '';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🐉 Initializing Command Codex...');
    init();
});

// Initialize application
async function init() {
    await loadCommandsData();
    setupEventListeners();
    displayCommands();
}

// Load JSON data
async function loadCommandsData() {
    try {
        const response = await fetch('skyrim_commands_and_items.json');
        commandsData = await response.json();
        console.log('✓ Commands loaded:', commandsData);
    } catch (error) {
        console.error('✗ Error loading commands:', error);
        showError('Failed to load commands database');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        displayCommands();
    });

    // Category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;

            if (currentCategory === 'builder') {
                showBuilder();
            } else {
                hideBuilder();
                displayCommands();
            }
        });
    });

    // Builder event listeners
    setupBuilderListeners();
}

// Setup builder-specific event listeners
function setupBuilderListeners() {
    const itemSelect = document.getElementById('item-select');
    const enchant1Category = document.getElementById('enchant1-category');
    const enchant1Select = document.getElementById('enchant1-select');
    const enchant2Category = document.getElementById('enchant2-category');
    const enchant2Select = document.getElementById('enchant2-select');
    const copyBtn = document.getElementById('copy-builder-command');

    if (itemSelect) {
        itemSelect.addEventListener('change', updateBuilder);
    }

    if (enchant1Category) {
        enchant1Category.addEventListener('change', () => {
            populateEnchantmentSelect(enchant1Category.value, enchant1Select);
        });
    }

    if (enchant1Select) {
        enchant1Select.addEventListener('change', updateBuilder);
    }

    if (enchant2Category) {
        enchant2Category.addEventListener('change', () => {
            populateEnchantmentSelect(enchant2Category.value, enchant2Select);
        });
    }

    if (enchant2Select) {
        enchant2Select.addEventListener('change', updateBuilder);
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const command = document.getElementById('builder-command').textContent;
            if (command && !command.includes('Select')) {
                copyToClipboard(command);
            }
        });
    }
}

// Show/hide builder
function showBuilder() {
    document.getElementById('builder-section').style.display = 'block';
    document.querySelector('main').style.display = 'none';
    initializeBuilder();
}

function hideBuilder() {
    document.getElementById('builder-section').style.display = 'none';
    document.querySelector('main').style.display = 'block';
}

// Initialize builder with data
function initializeBuilder() {
    if (!commandsData) return;

    // Populate item select
    const itemSelect = document.getElementById('item-select');
    itemSelect.innerHTML = '<option value="">Choose an item...</option>';

    if (commandsData.enchantable_items) {
        commandsData.enchantable_items.forEach(item => {
            const option = document.createElement('option');
            option.value = JSON.stringify(item);
            option.textContent = `${item.name} (${item.type})`;
            itemSelect.appendChild(option);
        });
    }
}

// Populate enchantment select based on category
function populateEnchantmentSelect(category, selectElement) {
    selectElement.innerHTML = '<option value="">Select enchantment...</option>';

    if (!category || !commandsData.magic_effects || !commandsData.magic_effects[category]) {
        selectElement.disabled = true;
        return;
    }

    selectElement.disabled = false;
    const enchantments = commandsData.magic_effects[category];

    enchantments.forEach(enchant => {
        const option = document.createElement('option');
        option.value = JSON.stringify(enchant);
        option.textContent = enchant.name;
        selectElement.appendChild(option);
    });

    updateBuilder();
}

// Update builder previews and command
function updateBuilder() {
    const itemSelect = document.getElementById('item-select');
    const enchant1Select = document.getElementById('enchant1-select');
    const enchant2Select = document.getElementById('enchant2-select');

    // Update item preview
    updateItemPreview(itemSelect.value);

    // Update enchantment previews
    updateEnchantPreview(enchant1Select.value, 'enchant1-preview');
    updateEnchantPreview(enchant2Select.value, 'enchant2-preview');

    // Generate command
    generateEnchantCommand();
}

// Update item preview
function updateItemPreview(itemJson) {
    const preview = document.getElementById('item-preview');

    if (!itemJson) {
        preview.innerHTML = '<div class="preview-empty">No item selected</div>';
        return;
    }

    const item = JSON.parse(itemJson);
    preview.innerHTML = `
        <div class="preview-name">${item.name}</div>
        <div class="preview-id">ID: ${item.id}</div>
        <div class="preview-desc">Type: ${item.type}</div>
    `;
}

// Update enchantment preview
function updateEnchantPreview(enchantJson, previewId) {
    const preview = document.getElementById(previewId);

    if (!enchantJson) {
        preview.innerHTML = '<div class="preview-empty">No enchantment selected</div>';
        return;
    }

    const enchant = JSON.parse(enchantJson);
    preview.innerHTML = `
        <div class="preview-name">${enchant.name}</div>
        <div class="preview-id">MGEF ID: ${enchant.id}</div>
        <div class="preview-desc">${enchant.description}</div>
    `;
}

// Generate enchantment command
function generateEnchantCommand() {
    const itemSelect = document.getElementById('item-select');
    const enchant1Select = document.getElementById('enchant1-select');
    const enchant2Select = document.getElementById('enchant2-select');
    const commandDiv = document.getElementById('builder-command');
    const copyBtn = document.getElementById('copy-builder-command');

    const itemValue = itemSelect.value;
    const enchant1Value = enchant1Select.value;

    if (!itemValue || !enchant1Value) {
        commandDiv.textContent = 'Select an item and at least one enchantment...';
        commandDiv.classList.add('empty');
        copyBtn.disabled = true;
        return;
    }

    const item = JSON.parse(itemValue);
    const enchant1 = JSON.parse(enchant1Value);
    const enchant2Value = enchant2Select.value;

    let command = `playerenchantobject ${item.id} ${enchant1.id}`;

    if (enchant2Value) {
        const enchant2 = JSON.parse(enchant2Value);
        command += ` ${enchant2.id}`;
    }

    commandDiv.textContent = command;
    commandDiv.classList.remove('empty');
    copyBtn.disabled = false;
}

// Display commands based on filters
function displayCommands() {
    const resultsContainer = document.getElementById('results');
    const resultCountElement = document.getElementById('result-count');

    if (!commandsData) {
        resultsContainer.innerHTML = '<div class="loading">⏳ LOADING ANCIENT SCROLLS...</div>';
        return;
    }

    const commands = filterCommands();

    if (commands.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <p>NO COMMANDS FOUND</p>
                <p style="font-size: 0.6rem; margin-top: 1rem; opacity: 0.7;">
                    Try adjusting your search or category filter
                </p>
            </div>
        `;
        resultCountElement.textContent = '0';
        return;
    }

    resultsContainer.innerHTML = commands.map(cmd => createCommandCard(cmd)).join('');
    resultCountElement.textContent = commands.length;

    // Add click listeners to cards
    document.querySelectorAll('.command-card').forEach(card => {
        card.addEventListener('click', () => {
            const command = card.dataset.command;
            copyToClipboard(command);
        });
    });
}

// Filter commands based on category and search
function filterCommands() {
    const allCommands = [];

    // Process different data structures
    if (currentCategory === 'all' || currentCategory === 'general_commands') {
        Object.entries(commandsData.general_commands || {}).forEach(([key, cmd]) => {
            allCommands.push({
                category: 'GENERAL',
                name: formatName(key),
                command: cmd.command,
                description: cmd.description,
                searchText: `${key} ${cmd.command} ${cmd.description}`.toLowerCase()
            });
        });
    }

    if (currentCategory === 'all' || currentCategory === 'player_commands') {
        Object.entries(commandsData.player_commands || {}).forEach(([key, cmd]) => {
            allCommands.push({
                category: 'PLAYER',
                name: formatName(key),
                command: cmd.command,
                description: cmd.description,
                searchText: `${key} ${cmd.command} ${cmd.description}`.toLowerCase()
            });
        });
    }

    if (currentCategory === 'all' || currentCategory === 'perks') {
        Object.entries(commandsData.perks || {}).forEach(([skillName, perks]) => {
            perks.forEach(perk => {
                allCommands.push({
                    category: 'PERK',
                    name: `${perk.name} (${formatName(skillName)})`,
                    command: perk.command,
                    description: perk.description,
                    id: perk.id,
                    searchText: `${perk.name} ${skillName} ${perk.command} ${perk.description}`.toLowerCase()
                });
            });
        });
    }

    if (currentCategory === 'all' || currentCategory === 'dragon_shouts') {
        Object.entries(commandsData.dragon_shouts || {}).forEach(([shoutName, words]) => {
            words.forEach((word, index) => {
                allCommands.push({
                    category: 'SHOUT',
                    name: `${formatName(shoutName)} - ${word.word}`,
                    command: word.command,
                    description: `Word ${index + 1}: "${word.word}" means ${word.translation}`,
                    id: word.id,
                    searchText: `${shoutName} ${word.word} ${word.translation} ${word.command}`.toLowerCase()
                });
            });
        });
    }

    if (currentCategory === 'all' || currentCategory === 'weapons') {
        // Unique weapons
        (commandsData.weapons?.unique || []).forEach(weapon => {
            allCommands.push({
                category: 'WEAPON',
                name: weapon.name,
                command: weapon.command,
                description: 'Unique Weapon',
                id: weapon.id,
                searchText: `${weapon.name} ${weapon.command} weapon`.toLowerCase()
            });
        });
        // Daedric weapons
        (commandsData.weapons?.daedric || []).forEach(weapon => {
            allCommands.push({
                category: 'WEAPON',
                name: weapon.name,
                command: weapon.command,
                description: 'Daedric Weapon',
                id: weapon.id,
                searchText: `${weapon.name} ${weapon.command} daedric weapon`.toLowerCase()
            });
        });
    }

    if (currentCategory === 'all' || currentCategory === 'armor') {
        // Dragonscale armor
        (commandsData.armor?.dragonscale_light || []).forEach(armor => {
            allCommands.push({
                category: 'ARMOR',
                name: armor.name,
                command: armor.command,
                description: 'Light Armor (Dragonscale)',
                id: armor.id,
                searchText: `${armor.name} ${armor.command} dragonscale armor`.toLowerCase()
            });
        });
        // Daedric armor
        (commandsData.armor?.daedric_heavy || []).forEach(armor => {
            allCommands.push({
                category: 'ARMOR',
                name: armor.name,
                command: armor.command,
                description: 'Heavy Armor (Daedric)',
                id: armor.id,
                searchText: `${armor.name} ${armor.command} daedric armor`.toLowerCase()
            });
        });
    }

    if (currentCategory === 'all' || currentCategory === 'spell_tomes') {
        (commandsData.spell_tomes || []).forEach(spell => {
            allCommands.push({
                category: 'SPELL',
                name: spell.name,
                command: spell.command,
                description: 'Spell Tome',
                id: spell.id,
                searchText: `${spell.name} ${spell.command} spell tome`.toLowerCase()
            });
        });
    }

    if (currentCategory === 'all' || currentCategory === 'items') {
        // Basic items
        Object.entries(commandsData.basic_items || {}).forEach(([key, item]) => {
            allCommands.push({
                category: 'ITEM',
                name: item.name,
                command: item.command,
                description: 'Basic Item',
                id: item.id,
                searchText: `${item.name} ${item.command}`.toLowerCase()
            });
        });

        // Jewelry
        (commandsData.jewelry || []).forEach(item => {
            allCommands.push({
                category: 'ITEM',
                name: item.name,
                command: item.command,
                description: 'Jewelry',
                id: item.id,
                searchText: `${item.name} ${item.command} jewelry`.toLowerCase()
            });
        });

        // Ingots
        (commandsData.ingots || []).forEach(item => {
            allCommands.push({
                category: 'ITEM',
                name: item.name,
                command: item.command,
                description: 'Ingot (Crafting Material)',
                id: item.id,
                searchText: `${item.name} ${item.command} ingot`.toLowerCase()
            });
        });

        // Soul Gems
        (commandsData.soul_gems || []).forEach(item => {
            allCommands.push({
                category: 'ITEM',
                name: item.name,
                command: item.command,
                description: 'Soul Gem',
                id: item.id,
                searchText: `${item.name} ${item.command} soul gem`.toLowerCase()
            });
        });

        // Crafting Parts
        (commandsData.crafting_parts || []).forEach(item => {
            allCommands.push({
                category: 'ITEM',
                name: item.name,
                command: item.command,
                description: 'Crafting Material',
                id: item.id,
                searchText: `${item.name} ${item.command} crafting`.toLowerCase()
            });
        });
    }

    // Filter by search term
    let filtered = allCommands;
    if (searchTerm) {
        filtered = allCommands.filter(cmd => cmd.searchText.includes(searchTerm));
    }

    return filtered;
}

// Create command card HTML
function createCommandCard(cmd) {
    return `
        <div class="command-card pixel-border" data-command="${escapeHtml(cmd.command)}">
            <div class="card-header">
                <span class="card-category">${escapeHtml(cmd.category)}</span>
                ${cmd.id ? `<span class="card-id">ID: ${escapeHtml(cmd.id)}</span>` : ''}
            </div>
            <div class="card-name">${escapeHtml(cmd.name)}</div>
            <div class="card-command">${escapeHtml(cmd.command)}</div>
            <div class="card-description">${escapeHtml(cmd.description)}</div>
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
    // Create a visual "sound" effect
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

// Utility: Format names
function formatName(str) {
    return str
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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
        displayCommands();
    }
});

console.log('⚔️ Command Codex Ready! Press [/] to search, [ESC] to clear');

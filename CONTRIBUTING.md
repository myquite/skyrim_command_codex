# Contributing to Skyrim Command Codex

Thank you for your interest in contributing! This guide will help you add new commands, items, and features to the Skyrim Command Codex.

## Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Make your changes** following the guidelines below
4. **Test locally** by opening `index.html` in your browser
5. **Submit a Pull Request** with a clear description

## How to Add New Content

### Adding Basic Items

To add items like potions, lockpicks, or gold, edit `skyrim_commands_and_items.json`:

```json
"basic_items": {
  "item_key": {
    "id": "item_id_from_skyrim",
    "command": "player.additem item_id_from_skyrim quantity",
    "name": "Display Name"
  }
}
```

**Example:**
```json
"extreme_magicka_potion": {
  "id": "39be6",
  "command": "player.additem 39be6 1",
  "name": "Extreme Magicka Potion"
}
```

### Adding Weapons

Add to the `weapons` section under either `unique` or `daedric`:

```json
"weapons": {
  "unique": [
    {
      "id": "weapon_id",
      "name": "Weapon Name",
      "command": "player.additem weapon_id 1"
    }
  ]
}
```

### Adding Armor

Add to the `armor` section under `dragonscale_light` or `daedric_heavy`:

```json
"armor": {
  "daedric_heavy": [
    {
      "id": "armor_id",
      "name": "Armor Piece Name",
      "command": "player.additem armor_id 1"
    }
  ]
}
```

### Adding Perks

Add to the appropriate skill tree in the `perks` section:

```json
"perks": {
  "skill_name": [
    {
      "id": "perk_id",
      "name": "Perk Name",
      "command": "player.addperk perk_id",
      "description": "What this perk does"
    }
  ]
}
```

### Adding Dragon Shouts

Add to the `dragon_shouts` section:

```json
"dragon_shouts": {
  "shout_name": [
    {
      "id": "word_id",
      "word": "Word Name",
      "translation": "English meaning",
      "command": "player.teachword word_id"
    }
  ]
}
```

### Adding Spell Tomes

Add to the `spell_tomes` array:

```json
"spell_tomes": [
  {
    "id": "spell_id",
    "name": "Spell Tome: Spell Name",
    "command": "player.additem spell_id 1"
  }
]
```

### Adding Commands

For general or player commands:

```json
"general_commands": {
  "command_key": {
    "command": "actual_console_command",
    "description": "What this command does"
  }
}
```

## Contributing to the Alchemy Guide

The Alchemy Guide uses `alchemy_data.json` to store ingredients, effects, and recipes.

### Adding Alchemy Effects

Effects are the magical properties that ingredients produce. Add to the `effects` section:

```json
"effects": {
  "effect_key": {
    "name": "Effect Name",
    "type": "beneficial",
    "description": "What this effect does"
  }
}
```

**Required fields:**
- `name`: Display name (e.g., "Restore Health")
- `type`: Either `"beneficial"` or `"harmful"`
- `description`: Brief explanation of the effect

**Example:**
```json
"fortify_stamina": {
  "name": "Fortify Stamina",
  "type": "beneficial",
  "description": "Increases maximum Stamina"
}
```

### Adding Ingredients

Ingredients are items that can be combined to create potions. Add to the `ingredients` array:

```json
{
  "name": "Ingredient Name",
  "id": "item_id_from_skyrim",
  "category": "plant",
  "effects": ["effect_key1", "effect_key2", "effect_key3", "effect_key4"]
}
```

**Required fields:**
- `name`: Display name exactly as it appears in-game
- `id`: Skyrim item ID (hex format)
- `category`: One of: `"plant"`, `"fungus"`, `"animal"`, `"special"`
- `effects`: Array of 4 effect keys (must match keys in `effects` section)

**Example:**
```json
{
  "name": "Blue Mountain Flower",
  "id": "0004da25",
  "category": "plant",
  "effects": ["restore_health", "fortify_conjuration", "fortify_health", "damage_magicka_regen"]
}
```

**Important:**
- Every ingredient must have exactly 4 effects
- Effect keys must exist in the `effects` section
- Order matters - list effects in the order they appear in-game

### Adding Recipes

Recipes show popular ingredient combinations. Add to the `recipes` array:

```json
{
  "name": "Potion Name",
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "effects": ["effect_key1", "effect_key2"],
  "value": "high"
}
```

**Required fields:**
- `name`: Descriptive potion name
- `ingredients`: Array of 2-3 ingredient names (must match names in `ingredients` array)
- `effects`: Array of shared effect keys between ingredients
- `value`: Potion value - `"very_high"`, `"high"`, `"medium"`, or `"low"`

**Example:**
```json
{
  "name": "Fortify Smithing Potion",
  "ingredients": ["Blisterwort", "Glowing Mushroom"],
  "effects": ["fortify_smithing"],
  "value": "high"
}
```

**Tips:**
- Only include recipes that work (shared effects between ingredients)
- Focus on useful/popular combinations
- Verify ingredients exist in the `ingredients` array

### Testing Alchemy Changes

1. Open `alchemy.html` in a web browser
2. Search for your new effect or ingredient
3. Switch between categories (Beneficial, Harmful, Recipes)
4. Verify:
   - Effects show correct ingredients
   - Ingredient tags are clickable and copy commands
   - Recipes display properly with correct spawn commands
5. Test console commands in-game to ensure IDs are correct

## JSON Formatting Rules

1. **Use lowercase with underscores** for keys: `extreme_magicka_potion`
2. **Include all required fields** (id, name/command, description where applicable)
3. **Verify IDs are correct** - test them in-game first
4. **Use proper JSON syntax** - watch for trailing commas, quotes, and brackets
5. **Order by usage frequency** - Place most commonly used items first (e.g., gold, lockpicks before rare potions)

## Testing Your Changes

1. Open `index.html` in a web browser
2. Use the search function to find your new item
3. Filter by category to verify it appears correctly
4. Click the command card to test copy functionality
5. Verify the command format is correct

## Validation Checklist

Before submitting a pull request:

- [ ] JSON file(s) are valid (use [JSONLint](https://jsonlint.com/) to check)
- [ ] All item IDs are verified and tested in-game
- [ ] Commands are properly formatted
- [ ] Names are spelled correctly and match in-game names
- [ ] Items/ingredients appear correctly on the website when tested locally
- [ ] No duplicate entries exist
- [ ] File is properly formatted with consistent indentation (2 spaces)

**For Alchemy Guide contributions:**
- [ ] Effect keys use lowercase with underscores
- [ ] All ingredients have exactly 4 effects
- [ ] Recipe ingredients exist in the ingredients array
- [ ] Effect keys referenced in ingredients/recipes exist in effects section
- [ ] Tested in `alchemy.html` to verify display and functionality

## Pull Request Guidelines

### PR Title Format
- `Add: [Item/Command Name]` for new content
- `Fix: [Description]` for bug fixes
- `Update: [Description]` for improvements

### PR Description Should Include
- What you added/changed
- How you tested it
- Screenshots (if UI changes)
- Source/verification for item IDs

**Example:**
```
Add: Extreme Magicka Potion

Added the Extreme Magicka Potion to basic_items.
- ID: 39be6
- Tested in-game on Skyrim Special Edition
- Appears correctly in ITEMS category
```

## Finding Item IDs

If you need to find item IDs:

1. **UESP Wiki**: https://en.uesp.net/wiki/Skyrim:Console
2. **In-game console**: Use `help "item name" 0` command
3. **Creation Kit**: Official Bethesda modding tool

## Code Style

- **Indentation**: 2 spaces (no tabs)
- **Line endings**: LF (Unix style)
- **Encoding**: UTF-8
- **Quotes**: Double quotes for JSON strings

## Need Help?

- Check existing entries in the JSON file for examples
- Review the [Skyrim Console Commands Wiki](https://en.uesp.net/wiki/Skyrim:Console)
- Open an issue if you have questions

## What We're Looking For

- **Accurate data**: Verified item IDs and commands
- **Complete information**: All fields filled out correctly
- **Popular items**: Commonly requested items and commands
- **Quality over quantity**: Well-tested entries are better than many untested ones

## What to Avoid

- Modded items (vanilla Skyrim only)
- Duplicate entries
- Unverified IDs
- Offensive or inappropriate content
- Breaking changes to existing functionality

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

Thank you for helping make Skyrim Command Codex better for everyone! 🐉⚔️

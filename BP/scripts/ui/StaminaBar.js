import { world, system } from "@minecraft/server";

// Stamina bar configuration
const STAMINA_MAX = 100;
const STAMINA_BAR_LENGTH = 10; // 10 bars, setiap bar 10% stamina
const STAMINA_PER_BAR = STAMINA_MAX / STAMINA_BAR_LENGTH; // 10% per bar

// Custom texture stamina icons
const STAMINA_TEXTURES = {
    FULL: "stamina_full",    // 10% stamina (hijau)
    HALF: "stamina_half",    // 5% stamina (kuning)
    EMPTY: "stamina_empty"   // 0% stamina (abu-abu)
};

// Function to get stamina icon based on stamina value
function getStaminaIcon(stamina, barIndex) {
    const barStartStamina = barIndex * STAMINA_PER_BAR;
    const staminaInBar = Math.max(0, Math.min(STAMINA_PER_BAR, stamina - barStartStamina));
    
    if (staminaInBar >= STAMINA_PER_BAR) {
        return STAMINA_TEXTURES.FULL; // 10% - Full bar
    } else if (staminaInBar >= STAMINA_PER_BAR / 2) {
        return STAMINA_TEXTURES.HALF; // 5% - Half bar
    } else {
        return STAMINA_TEXTURES.EMPTY; // 0% - Empty bar
    }
}

// Function to create stamina bar with custom textures
function createStaminaBar(stamina) {
    let bar = "";
    
    for (let i = 0; i < STAMINA_BAR_LENGTH; i++) {
        const icon = getStaminaIcon(stamina, i);
        bar += `§r${icon} `; // §r untuk reset color, space untuk spacing
    }
    
    return bar.trim();
}

// Function to get stamina color based on percentage
function getStaminaColor(stamina) {
    const percentage = (stamina / STAMINA_MAX) * 100;
    
    if (percentage >= 70) {
        return "§a"; // Hijau - stamina tinggi
    } else if (percentage >= 30) {
        return "§e"; // Kuning - stamina sedang
    } else {
        return "§c"; // Merah - stamina rendah
    }
}

// Function to show stamina bar to player
function showStaminaBar(player) {
    const stamina = player.getDynamicProperty("stamina") ?? STAMINA_MAX;
    const staminaBar = createStaminaBar(stamina);
    const staminaColor = getStaminaColor(stamina);
    const percentage = Math.round((stamina / STAMINA_MAX) * 100);
    
    // Create stamina bar text
    const staminaText = `${staminaColor}⚡ Stamina: ${staminaBar} §f${percentage}%`;
    
    try {
        // Show in action bar
        player.runCommandAsync(`titleraw @s actionbar {"rawtext":[{"text":"${staminaText}"}]}`);
    } catch (error) {
        // Fallback ke Unicode jika texture gagal
        console.warn(`Failed to show custom stamina bar, using fallback: ${error}`);
        showFallbackStaminaBar(player, stamina);
    }
}

// Fallback stamina bar menggunakan Unicode
function showFallbackStaminaBar(player, stamina) {
    const filled = Math.round((stamina / STAMINA_MAX) * STAMINA_BAR_LENGTH);
    const empty = STAMINA_BAR_LENGTH - filled;
    const staminaColor = getStaminaColor(stamina);
    const percentage = Math.round((stamina / STAMINA_MAX) * 100);
    
    const fallbackBar = `§a${"⚡".repeat(filled)}§7${"⚡".repeat(empty)}`;
    const staminaText = `${staminaColor}⚡ Stamina: ${fallbackBar} §f${percentage}%`;
    
    try {
        player.runCommandAsync(`titleraw @s actionbar {"rawtext":[{"text":"${staminaText}"}]}`);
    } catch (error) {
        console.warn(`Failed to show fallback stamina bar: ${error}`);
    }
}

// Function to show stamina bar to all players
function updateAllStaminaBars() {
    for (const player of world.getPlayers()) {
        showStaminaBar(player);
    }
}

// Initialize custom stamina bar system
function initializeCustomStaminaBar() {
    // Update stamina bar setiap 5 ticks (4 kali per detik)
    system.runInterval(() => {
        updateAllStaminaBars();
    }, 5);
}

// Export functions
export { 
    showStaminaBar, 
    updateAllStaminaBars, 
    initializeCustomStaminaBar,
    createStaminaBar,
    getStaminaColor,
    getStaminaIcon
}; 
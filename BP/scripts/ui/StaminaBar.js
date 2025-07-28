import { world, system } from "@minecraft/server";

// Konfigurasi stamina
const STAMINA_MAX = 100;
const STAMINA_BAR_LENGTH = 10;
const STAMINA_REGEN = 1; // per tick
const STAMINA_DRAIN = 2; // per aksi berat (misal: lari/lompat)

// Unicode privat untuk icon stamina
const ICON_KOSONG = "\uE001";
const ICON_PENUH = "\uE002";
const ICON_SEPARUH = "\uE003";

// Mendapatkan stamina pemain
function getStamina(player) {
    return player.getDynamicProperty("stamina") ?? STAMINA_MAX;
}

// Set stamina pemain
function setStamina(player, value) {
    player.setDynamicProperty("stamina", Math.max(0, Math.min(STAMINA_MAX, value)));
}

// Membuat bar stamina dengan icon custom
function createStaminaBar(stamina) {
    const perSlot = STAMINA_MAX / STAMINA_BAR_LENGTH;
    let bar = "";
    for (let i = 0; i < STAMINA_BAR_LENGTH; i++) {
        const slotValue = stamina - i * perSlot;
        if (slotValue >= perSlot) {
            bar += ICON_PENUH;
        } else if (slotValue > perSlot / 2) {
            bar += ICON_SEPARUH;
        } else {
            bar += ICON_KOSONG;
        }
    }
    return bar;
}

// Tampilkan stamina bar di atas hunger bar (subtitle)
function showStaminaBar(player) {
    const stamina = getStamina(player);
    const bar = createStaminaBar(stamina);
    const percent = Math.round((stamina / STAMINA_MAX) * 100);

    try {
        // Subtitle = tepat di atas hunger bar
        const subtitleText = `§fStamina: ${bar} §7${percent}%`;
        if (typeof player.runCommandAsync === "function") {
            player.runCommandAsync(`titleraw @s subtitle {"rawtext":[{"text":"${subtitleText}"}]}`).catch(() => {
                player.runCommand(`titleraw @s subtitle {"rawtext":[{"text":"${subtitleText}"}]}`);
            });
        } else if (typeof player.runCommand === "function") {
            player.runCommand(`titleraw @s subtitle {"rawtext":[{"text":"${subtitleText}"}]}`);
        }
    } catch (e) {
        console.warn("Failed to show stamina bar:", e);
    }
}

// Regenerasi stamina otomatis
function regenStamina(player) {
    const stamina = getStamina(player);
    if (stamina < STAMINA_MAX) {
        setStamina(player, stamina + STAMINA_REGEN);
    }
}

// Kurangi stamina (panggil saat aksi berat)
function drainStamina(player, amount = STAMINA_DRAIN) {
    const stamina = getStamina(player);
    setStamina(player, stamina - amount);
}

// Clear stamina bar (untuk pemain yang offline atau saat reset)
function clearStaminaBar(player) {
    try {
        if (typeof player.runCommandAsync === "function") {
            player.runCommandAsync(`titleraw @s subtitle {"rawtext":[{"text":""}]}`).catch(() => {
                player.runCommand(`titleraw @s subtitle {"rawtext":[{"text":""}]}`);
            });
        } else if (typeof player.runCommand === "function") {
            player.runCommand(`titleraw @s subtitle {"rawtext":[{"text":""}]}`);
        }
    } catch (e) {
        console.warn("Failed to clear stamina bar:", e);
    }
}

// Update stamina bar semua pemain
function updateAllStaminaBars() {
    for (const player of world.getPlayers()) {
        showStaminaBar(player);
        regenStamina(player);
    }
}

// Inisialisasi sistem stamina
function initializeStaminaSystem() {
    // Clear bar untuk semua pemain saat start
    for (const player of world.getPlayers()) {
        clearStaminaBar(player);
    }
    // Update bar stamina setiap 5 tick (4x per detik)
    system.runInterval(() => {
        updateAllStaminaBars();
    }, 5);
}

// Export fungsi
export {
    initializeStaminaSystem,
    drainStamina,
    getStamina,
    setStamina,
    clearStaminaBar
}; 
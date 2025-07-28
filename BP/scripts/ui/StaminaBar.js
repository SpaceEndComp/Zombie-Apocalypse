import { world, system } from "@minecraft/server";

// Konfigurasi stamina
const STAMINA_MAX = 100;
const STAMINA_BAR_LENGTH = 10;
const STAMINA_REGEN = 1; // per tick
const STAMINA_DRAIN = 2; // per aksi berat (misal: lari/lompat)
const USE_VANILLA_STYLE = true; // Set true untuk tampilan mirip vanilla

// Mendapatkan stamina pemain
function getStamina(player) {
    return player.getDynamicProperty("stamina") ?? STAMINA_MAX;
}

// Set stamina pemain
function setStamina(player, value) {
    player.setDynamicProperty("stamina", Math.max(0, Math.min(STAMINA_MAX, value)));
}

// Membuat bar stamina unicode yang mirip vanilla
function createStaminaBar(stamina) {
    const filled = Math.round((stamina / STAMINA_MAX) * STAMINA_BAR_LENGTH);
    const empty = STAMINA_BAR_LENGTH - filled;
    let color = "§a"; // hijau
    if (stamina < 30) color = "§c"; // merah
    else if (stamina < 70) color = "§e"; // kuning
    
    if (USE_VANILLA_STYLE) {
        return `${color}${"█".repeat(filled)}§7${"░".repeat(empty)}`;
    } else {
        return `${color}${"|".repeat(filled)}§7${".".repeat(empty)}`;
    }
}

// Tampilkan stamina bar di atas hunger bar (title)
function showStaminaBar(player) {
    const stamina = getStamina(player);
    const bar = createStaminaBar(stamina);
    const percent = Math.round((stamina / STAMINA_MAX) * 100);
    
    try {
        if (USE_VANILLA_STYLE) {
            // Tampilan mirip vanilla: title untuk label, subtitle untuk bar
            const titleText = `§fStamina`;
            const subtitleText = `${bar} §f${percent}%`;
            
            if (typeof player.runCommandAsync === "function") {
                player.runCommandAsync(`titleraw @s title {"rawtext":[{"text":"${titleText}"}]}`).catch(() => {
                    player.runCommand(`titleraw @s title {"rawtext":[{"text":"${titleText}"}]}`);
                });
                player.runCommandAsync(`titleraw @s subtitle {"rawtext":[{"text":"${subtitleText}"}]}`).catch(() => {
                    player.runCommand(`titleraw @s subtitle {"rawtext":[{"text":"${subtitleText}"}]}`);
                });
            } else if (typeof player.runCommand === "function") {
                player.runCommand(`titleraw @s title {"rawtext":[{"text":"${titleText}"}]}`);
                player.runCommand(`titleraw @s subtitle {"rawtext":[{"text":"${subtitleText}"}]}`);
            }
        } else {
            // Tampilan lama: semua dalam satu bar
            const text = `§fStamina: ${bar} §f${percent}%`;
            if (typeof player.runCommandAsync === "function") {
                player.runCommandAsync(`titleraw @s title {"rawtext":[{"text":"${text}"}]}`).catch(() => {
                    player.runCommand(`titleraw @s title {"rawtext":[{"text":"${text}"}]}`);
                });
            } else if (typeof player.runCommand === "function") {
                player.runCommand(`titleraw @s title {"rawtext":[{"text":"${text}"}]}`);
            }
        }
    } catch (e) {
        // Abaikan error jika command tidak berhasil
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
            player.runCommandAsync(`titleraw @s title {"rawtext":[{"text":""}]}`).catch(() => {
                player.runCommand(`titleraw @s title {"rawtext":[{"text":""}]}`);
            });
            player.runCommandAsync(`titleraw @s subtitle {"rawtext":[{"text":""}]}`).catch(() => {
                player.runCommand(`titleraw @s subtitle {"rawtext":[{"text":""}]}`);
            });
        } else if (typeof player.runCommand === "function") {
            player.runCommand(`titleraw @s title {"rawtext":[{"text":""}]}`);
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
    // Clear title untuk semua pemain saat start
    for (const player of world.getPlayers()) {
        clearStaminaBar(player);
    }
    
    // Subscribe ke player leave event untuk clear title
    world.afterEvents.playerLeave.subscribe((event) => {
        // Clear title saat player leave (gunakan playerName untuk tracking)
        const playerName = event.playerName;
        // Note: Tidak bisa clear title untuk player yang sudah offline
        // Title akan otomatis hilang saat player leave
    });
    
    system.runInterval(() => {
        updateAllStaminaBars();
    }, 5); // 4x per detik
}

// Export fungsi
export {
    initializeStaminaSystem,
    drainStamina,
    getStamina,
    setStamina,
    clearStaminaBar
}; 
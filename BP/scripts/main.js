import { dayLeveling } from "./DayLeveling";
import { world, EffectType, system } from "@minecraft/server";
import { showStatusUI } from "./ui/ShowStatusUI";
import { raycastShoot } from "./gun/logic_pistol";
import "./player/chat/chatLokal.js";
import { initializeHitDelaySystem } from "./item/meleHitDelays.js";
import "./item/crowbar_logic.js";
import { initializeCustomStaminaBar } from "./ui/StaminaBar.js";
import "./player/leveling/PlayerLeveling.js"

// memanggil
dayLeveling();
initializeHitDelaySystem();
initializeStaminaSystem(); // Inisialisasi sistem stamina baru

// Initialize the status UI
world.beforeEvents.chatSend.subscribe((msg) => {
    if (msg.message.toLowerCase() === "!status") {
        msg.cancel = true;
        showStatusUI(msg.sender);
    }
});

// Initialize the raycast shooting logic
world.beforeEvents.itemUse.subscribe((e) => {
    if (e.itemStack.typeId === "minecraft:carrot_on_a_stick") {
        raycastShoot(e.source);
    }
});


// --- Zombie Kill Tracker ---
const ZOMBIE_ID = "seza:zombie";
const PLAYER_KILL_PROP = "zombie_kill_count";

// Inisialisasi dynamic property untuk setiap pemain jika belum ada
function ensurePlayerKillProp(player) {
    if (player.getDynamicProperty(PLAYER_KILL_PROP) === undefined) {
        player.setDynamicProperty(PLAYER_KILL_PROP, 0);
    }
}

// Contoh: Kurangi stamina saat pemain melompat
world.afterEvents.entityJump.subscribe((event) => {
    const player = event.entity;
    if (player.typeId === "minecraft:player") {
        drainStamina(player, 5); // Kurangi stamina 5 setiap lompat
    }
});



import { dayLeveling } from "./DayLeveling";
import { world, EffectType, system } from "@minecraft/server";
import { showStatusUI } from "./ui/ShowStatusUI";
import { raycastShoot } from "./gun/logic_pistol";
// import { initializeFireFighterAxeLogic } from "./item/meleSystem";
import "./player/chat/chatLokal.js";
import { initializeHitDelaySystem } from "./item/meleHitDelays.js";
import "./item/crowbar_logic.js";
import { initializeCustomStaminaBar } from "./ui/StaminaBar.js";

// memanggil
dayLeveling();
initializeHitDelaySystem();
initializeCustomStaminaBar();

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

const PLAYER_STAMINA_PROP = "stamina";
const STAMINA_MAX = 100;
const STAMINA_MIN = 0;
const STAMINA_RECOVERY = 2; // per tick
const STAMINA_DRAIN = 1; // per tick jika lari

function ensurePlayerStaminaProp(player) {
    if (player.getDynamicProperty(PLAYER_STAMINA_PROP) === undefined) {
        player.setDynamicProperty(PLAYER_STAMINA_PROP, STAMINA_MAX);
    }
}

// Simpan posisi sebelumnya untuk deteksi movement
const lastPlayerPos = new Map();

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        ensurePlayerKillProp(player);
        ensurePlayerStaminaProp(player);

        // Ambil posisi sekarang
        const pos = player.location;
        const id = player.id ?? player.name;
        const last = lastPlayerPos.get(id);
        let moved = false;
        let speed = 0;
        if (last) {
            const dx = pos.x - last.x;
            const dy = pos.y - last.y;
            const dz = pos.z - last.z;
            speed = Math.sqrt(dx * dx + dy * dy + dz * dz);
            moved = speed > 0.01;
        }
        lastPlayerPos.set(id, { x: pos.x, y: pos.y, z: pos.z });

        // Deteksi lari (speed > 0.25), jalan (speed > 0.05), diam
        let stamina =
            player.getDynamicProperty(PLAYER_STAMINA_PROP) ?? STAMINA_MAX;
        if (speed > 0.25) {
            stamina -= STAMINA_DRAIN;
        } else {
            stamina += STAMINA_RECOVERY;
        }
        if (stamina > STAMINA_MAX) stamina = STAMINA_MAX;
        if (stamina < STAMINA_MIN) stamina = STAMINA_MIN;
        player.setDynamicProperty(PLAYER_STAMINA_PROP, stamina);

        // Tambahkan efek slowness jika stamina <= STAMINA_MIN, hilangkan jika >= 30
        if (stamina <= STAMINA_MIN) {
            player.addEffect("minecraft:slowness", 2, {
                amplifier: 5,
                showParticles: false,
            }); // 10 detik, amplifier 2
        } else if (stamina >= 70) {
            player.removeEffect("minecraft:slowness");
        }
    }
}, 5); // tiap tick



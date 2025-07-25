import { dayLeveling } from "./DayLeveling";
import { world, EffectType, system } from "@minecraft/server";
import { showStatusUI } from "./ui/ShowStatusUI";
import { dialogDay10 } from "./dialog/player";

// memanggil
dialogDay10();
dayLeveling();

// Initialize the status UI
world.beforeEvents.chatSend.subscribe((msg) => {
    if (msg.message.toLowerCase() === "!status") {
        msg.cancel = true;
        showStatusUI(msg.sender);
    }
});

// --- Zombie Kill Tracker ---
const ZOMBIE_ID = "za:zombie";
const PLAYER_KILL_PROP = "zombie_kill_count";

// Inisialisasi dynamic property untuk setiap pemain jika belum ada
function ensurePlayerKillProp(player) {
    if (player.getDynamicProperty(PLAYER_KILL_PROP) === undefined) {
        player.setDynamicProperty(PLAYER_KILL_PROP, 0);
    }
}

// Daftarkan komponen custom agar warning hilang
if (typeof world.registerComponent === "function") {
    world.registerComponent("za:is_weapon", {});
}

// --- Fire Axe Custom Logic (pakai entityHurt) ---
const FIRE_AXE_ID = "za:fire_axe";

if (world.beforeEvents && world.beforeEvents.entityHurt) {
    world.beforeEvents.entityHurt.subscribe((ev) => {
        const { hurtEntity, damageSource } = ev;
        const attacker = damageSource.damagingEntity;
        if (attacker?.typeId === "minecraft:player") {
            // Cek item di tangan pemain
            const inventory = attacker.getComponent("minecraft:inventory");
            const mainHand = inventory?.container?.getItem(
                attacker.selectedSlot
            );
            if (mainHand && mainHand.typeId === FIRE_AXE_ID) {
                // Terapkan efek khusus, misal slow
                hurtEntity.addEffect(EffectType.get("slowness"), 100, {
                    amplifier: 1,
                    showParticles: true,
                });
            }
        }
    });
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
            player.addEffect("minecraft:slowness", 10000, {
                amplifier: 5,
                showParticles: false,
            }); // 10 detik, amplifier 2
        } else if (stamina >= 70) {
            player.removeEffect("minecraft:slowness");
        }
    }
}, 1); // tiap tick

// Tampilkan bar stamina di action bar setiap detik
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const stamina =
            player.getDynamicProperty(PLAYER_STAMINA_PROP) ?? STAMINA_MAX;
        // Buat bar stamina visual
        const barLength = 20;
        const filled = Math.round((stamina / STAMINA_MAX) * barLength);
        const empty = barLength - filled;
        const bar = `§a${"|".repeat(filled)}§7${"|".repeat(empty)}`;
        const text = `§lStamina: ${bar} §f${parseInt(stamina)}`;
        // Kirim ke action bar (subtitle) dengan fallback
        if (typeof player.runCommandAsync === "function") {
            player.runCommandAsync(
                `titleraw @s actionbar {\"rawtext\":[{\"text\":\"${text}\"}]}`
            );
        } else if (typeof player.runCommand === "function") {
            player.runCommand(
                `titleraw @s actionbar {\"rawtext\":[{\"text\":\"${text}\"}]}`
            );
        } else {
            world.sendMessage(text);
        }
    }
}, 1); // setiap detik

if (world.afterEvents && world.afterEvents.entityDie) {
    world.afterEvents.entityDie.subscribe((ev) => {
        if (
            ev.deadEntity.typeId === ZOMBIE_ID &&
            ev.damageSource?.damagingEntity?.typeId === "minecraft:player"
        ) {
            const player = ev.damageSource.damagingEntity;
            const current = player.getDynamicProperty(PLAYER_KILL_PROP) ?? 0;
            player.setDynamicProperty(PLAYER_KILL_PROP, current + 1);
        }
    });
}

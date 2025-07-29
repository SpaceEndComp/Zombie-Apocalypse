import { world, system } from "@minecraft/server";

// The config for each item, sesuaikan dengan yang ada di main.js
let itemsConfig = {
    "seza:fire_fighter_axe": {
        cd: 0.5,
        dmg: 8
    },
    "seza:crowbar": {
        cd:0.3,
        dmg:6
    }
    // Tambahkan item lain di sini jika perlu
};
let playersItemCD = {}; // keep this empty, but dont remove this line

// Cleanup offline players from cooldown tracking
function cleanupOfflinePlayers() {
    const onlinePlayers = new Set();
    for (const player of world.getPlayers()) {
        onlinePlayers.add(player.nameTag || player.name || "Unknown");
    }
    // Remove offline players from cooldown tracking
    for (const playerName in playersItemCD) {
        if (!onlinePlayers.has(playerName)) {
            delete playersItemCD[playerName];
        }
    }
}

// Initialize hit delay system
function initializeHitDelaySystem() {
    // Cleanup offline players every 10 seconds
    system.runInterval(() => {
        cleanupOfflinePlayers();
    }, 200); // 10 seconds (200 ticks)

    if (
        world.afterEvents &&
        world.afterEvents.entityDie &&
        world.afterEvents.entityHitEntity
    ) {
        // Kill tracker untuk zombie id 'za:zombie'
        world.afterEvents.entityDie.subscribe((ev) => {
            if (
                ev.deadEntity.typeId === "za:zombie" &&
                ev.damageSource?.damagingEntity?.typeId === "minecraft:player"
            ) {
                const player = ev.damageSource.damagingEntity;
                const current = player.getDynamicProperty("zombie_kill_count") ?? 0;
                player.setDynamicProperty("zombie_kill_count", current + 1);
            }
        });

        // Sistem hit delay dan damage
        world.afterEvents.entityHitEntity.subscribe((event) => {
            let entityHit = event.hitEntity;
            let player = event.damagingEntity;

            if (player.typeId != "minecraft:player") return;

            let item = player.getComponent("equippable").getEquipment("Mainhand");
            if (!item || !Object.keys(itemsConfig).includes(item.typeId)) return;

            const itemConfig = itemsConfig[item.typeId];
            const playerName = player.nameTag || player.name || "Unknown";

            let currentTime = Date.now();
            let skip = false;

            // Cek apakah player sudah ada di cooldown
            if (!playersItemCD[playerName]) {
                playersItemCD[playerName] = currentTime;
                skip = true;
            }

            if (!skip) {
                let timeDiff = (currentTime - playersItemCD[playerName]) / 1000;
                if (timeDiff < itemConfig.cd) {
                    // Masih dalam cooldown, batalkan hit
                    event.cancel = true;
                    return;
                }
                playersItemCD[playerName] = currentTime;
            }

            // Play sound when hit is registered
            player.playSound("note.pling", { pitch: 0.7, volume: 0.2 });

            // Apply damage after cooldown delay
            system.runTimeout(() => {
                if (!entityHit || (typeof entityHit.isValid === "function" && !entityHit.isValid())) return;
                // Play damage sound
                player.playSound("note.pling", { pitch: 1.5, volume: 0.3 });
                // Apply custom damage
                entityHit.applyDamage(itemConfig.dmg, {
                    cause: "entityAttack",
                    damagingEntity: player
                });
            }, itemConfig.cd * 20); // Convert to ticks (20 ticks = 1 second)
        });
    }
}

// Export function untuk dipanggil dari main.js
export { initializeHitDelaySystem };

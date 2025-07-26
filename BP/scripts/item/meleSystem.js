import { world, EffectType, system } from "@minecraft/server";

// Fire Fighter Axe hit delay
const FIRE_AXE_ID = "za:fire_fighter_axe";
const DAMAGE_DELAY_TICKS = 10; // 0.5 detik (1 detik = 20 ticks)
const fireAxeCooldowns = new Map(); // Menyimpan waktu cooldown untuk setiap pemain
const FIRE_AXE_COOLDOWN_MS = 500; // 0.5 detik dalam milidetik

/**
 * Menginisialisasi logika kustom untuk Fire Axe,
 * termasuk damage delay dan efek pada target.
 */
export function initializeFireFighterAxeLogic() {
    if (world.beforeEvents && world.beforeEvents.entityHurt) {
        world.beforeEvents.entityHurt.subscribe((ev) => {
            const { hurtEntity, damageSource, damage } = ev;
            const attacker = damageSource.damagingEntity;

            // Cek jika penyerang adalah pemain
            if (attacker?.typeId === "minecraft:player") {
                const inventory = attacker.getComponent("minecraft:inventory");
                const mainHand = inventory?.container?.getItem(
                    attacker.selectedSlot
                );

                // Jika item di tangan adalah fire axe
                if (mainHand?.typeId === FIRE_AXE_ID) {
                    const now = Date.now();
                    const lastHitTime = fireAxeCooldowns.get(attacker.id) || 0;

                    // Cek apakah cooldown sudah lewat
                    if (now - lastHitTime < FIRE_AXE_COOLDOWN_MS) {
                        // Jika masih dalam cooldown, batalkan event damage sepenuhnya
                        ev.cancel = true;
                        return; // Hentikan eksekusi lebih lanjut
                    }

                    // Jika cooldown selesai, perbarui waktu hit dan jadwalkan damage
                    fireAxeCooldowns.set(attacker.id, now);

                    // 1. Batalkan damage instan untuk diterapkan nanti
                    ev.cancel = true;

                    // 2. Jadwalkan damage untuk diterapkan setelah delay
                    system.runTimeout(() => {
                        if (hurtEntity.isValid()) {
                            hurtEntity.applyDamage(damage, { damagingEntity: attacker });
                            hurtEntity.addEffect(EffectType.get("slowness"), 100, { amplifier: 1, showParticles: true });
                        }
                    }, DAMAGE_DELAY_TICKS);
                }
            }
        });
    }
}

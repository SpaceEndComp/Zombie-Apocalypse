import { world, system } from "@minecraft/server";
import { dialogDay10 } from "./player/dialog/player";
import { showStatusUI } from "./ui/ShowStatusUI";

export function dayLeveling() {
    let lastCheckDay = -1;
    const trigerredDays = new Set();

    system.runInterval(() => {
        try {
            let day = world.getDay();

            if (day < 1) day = 1;

            if (day !== lastCheckDay) {
                if (!trigerredDays.has(day)) {
                    world.sendMessage(
                        `§7[§l§aZombie Apocalypse§r§7] §l§cHari ke-${day} telah dimulai!`
                    );

                    if (day === 1) {
                        world.sendMessage(`§2Zombie tahap 1 muncul, hati hati`);
                    }

                    if (day === 10) {
                        world.sendMessage(
                            `§6Zombie tahap 2 berevolusi! Bersiaplah!`
                        );
                        for (const player of world.getPlayers()) {
                            dialogDay10(player);
                        }
                    }

                    if (day === 50) {
                        world.sendMessage(
                            `§cZombie tahap 3 telah muncul! AWAS, mereka brutal!`
                        );
                    }

                    if (day % 100 === 0) {
                        world.sendMessage(
                            "§4§lZOMBIE MUTANT TELAH MUNCUL!! BERSIAPLAH!!!"
                        );
                    }

                    trigerredDays.add(day);
                }
            }
        } catch (e) {
            world.sendMessage(`§l§cTerjadi kesalahan: ${e.message}`);
        }
    }, 20);
}

export function crazyNight() {
    system.runInterval(() => {
        const time = world.getTimeOfDay();
        const isNight = time >= 13000 || time <= 1000;

        for (const entity of world.getEntity()) {
            if (entity.typeId === "seza:zombie") {
                if (isNight) {
                    entity.addEffect("minecraft:speed", 999999, {
                        amplifier: 1,
                        showParticles: false,
                    });
                    entity.addEffect("minecraft:strength", 999999, {
                        amplifier: 3,
                        showParticles: false,
                    });
                } else {
                    entity.removeEffect("minecraft:speed");
                    entity.removeEffect("minecraft:strength");
                }
            }
        }
    });
}

import { world, system } from "@minecraft/server";
import { buffZombies, spawnMutantZombie } from "./mobs/zombie_buff_level";
// import { randomMob } from "./random_mob";

let lastCheckDay = -1;
const trigerredDays = new Set();

system.runInterval(() => {
    try {
        let day = world.getDay();

        if (day !== lastCheckDay) {
            if (!trigerredDays.has(day)) {
                world.sendMessage(
                    `§7[§l§aZombie Apocalypse§r§7] §l§cHari ke-${day} telah dimulai!`
                );

                if (day === 1) {
                    world.sendMessage(
                        `§2Zombie tahap 1 muncul. Belum terlalu berbahaya...`
                    );

                    buffZombies(1);
                }

                if (day === 10) {
                    world.sendMessage(
                        `§6Zombie tahap 2 berevolusi! Mereka lebih kuat sekarang!`
                    );

                    buffZombies(2);
                }

                if (day === 50) {
                    world.sendMessage(
                        `§cZombie tahap 3 telah muncul! AWAS, mereka brutal!`
                    );

                    buffZombies(3);
                }

                if (day % 100 === 0) {
                    world.sendMessage(
                        "§4§lZOMBIE MUTANT TELAH MUNCUL!! BERSIAPLAH!!!"
                    );

                    // randomMob();
                    spawnMutantZombie();
                }

                trigerredDays.add(day);
            }
        }
    } catch (e) {
        world.sendMessage(`§l§cTerjadi kesalahan: ${e.message}`);
    }
}, 20);

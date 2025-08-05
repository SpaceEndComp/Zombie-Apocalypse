import { world, system } from "@minecraft/server";

// Auto-execute function saat di-import
(function dayLeveling() {
    let lastCheckDay = -1;
    const trigerredDays = new Set();

    system.runInterval(() => {
        try {
            let day = world.getDay();

            if (day < 1) day = 1;

            if (day !== lastCheckDay) {
                // Update lastCheckDay
                lastCheckDay = day;
                
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
                        // Panggil dialog untuk semua pemain
                        const players = world.getPlayers();
                        if (players.length > 0) {
                            for (const player of players) {
                                try {
                                    // Menggunakan rawtext untuk support translasi
                                    player.runCommandAsync(
                                        `titleraw @s title {"rawtext":[
                                            {"text":"§e["},
                                            {"selector":"@s"},
                                            {"text":"§e]: "},
                                            {"translate":"dialog.day10.title"}
                                        ]}`
                                    );
                                } catch (playerError) {
                                    console.warn(`Error sending dialog to player ${player.name}: ${playerError.message}`);
                                }
                            }
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
                    
                    // Cleanup trigerredDays untuk mencegah memory leak
                    if (trigerredDays.size > 500) {
                        trigerredDays.clear();
                    }
                }
            }
        } catch (e) {
            console.error(`Error in dayLeveling: ${e.message}`);
            world.sendMessage(`§l§cTerjadi kesalahan dalam sistem hari: ${e.message}`);
        }
    }, 20);
})();

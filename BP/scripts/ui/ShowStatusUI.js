import { world } from "@minecraft/server";

export function showStatusUI(player) {
    let day = world.getDay();
    if (day < 1) day = 1;

    let stage = "Tahap 1 (Normal)";
    if (day >= 50) stage = "Tahap 3 (Ganas Brutal)";
    else if (day >= 10) stage = "Tahap 2 (Berbahaya)";

    const nextMutant = 100 - (day % 100);
    const killCount = player.getDynamicProperty("zombie_kill_count") ?? 0;

    const statusText = `§7Hari ke-: ${day}\n§7Tahap Zombie: ${stage}\n§7Hari sampai Zombie Mutant: ${nextMutant}\n§7Zombie dibunuh: ${killCount}`;

    player.sendMessage(statusText);
}

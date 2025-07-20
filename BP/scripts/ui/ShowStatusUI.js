import { world } from "@minecraft/server";
import { MessageFormResponse, MessageFormData } from "@minecraft/server-ui";

export function showStatusUI(player) {
    const day = world.getDay();

    let stage = "Tahap 1 (Normal)";
    if (day >= 50) stage = "Tahap 3 (Ganas Brutal)";
    else if (day >= 10) stage = "Tahap 2 (Berbahaya)";

    const nextMutant = 100 * Math.ceil(day / 100) - day;
    const killCount = player.getDynamicProperty("zombie_kill_count") ?? 0;

    const statusText = `§7Hari ke-: ${day}\n§7Tahap Zombie: ${stage}\n§7Hari sampai Zombie Mutant: ${nextMutant}\n§7Zombie dibunuh: ${killCount}`;

    const form = new MessageFormData()
        .title("§l§aStatus Zombie Apocalypse")
        .body(statusText)
        .button1("Tutup")
        .button2("OK");

    form.show(player)
        .then((formData /** @type {MessageFormResponse} */) => {
            if (formData.canceled || formData.selection === undefined) {
                return;
            }
            world.sendMessage(
                `§aKamu memilih tombol: ${
                    formData.selection === 0 ? "Tutup" : "OK"
                }`
            );
        })
        .catch((err) => {
            world.sendMessage(`§cGagal tampilkan status: ${err}`);
            return -1;
        });
}

import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

export function showStatusUI(player) {
    const day = world.getDay();

    let stage = "Tahap 1 (Normal)";
    if (day >= 50) stage = "Tahap 3 (Ganas Brutal)";
    else if (day >= 10) stage = "Tahap 2 (Berbahaya)";

    const nextMutant = 100 * Math.ceil(day / 100) - day;

    const stageOptions = [
        "Tahap 1 (Normal)",
        "Tahap 2 (Berbahaya)",
        "Tahap 3 (Ganas Brutal)",
    ];
    const stageIndex = stageOptions.indexOf(stage);

    const form = new ModalFormData()
        .title("§l§aStatus Zombie Apocalypse")
        .textField("§7Hari ke-", `${day}`)
        .dropdown(
            "§7Tahap Zombie:",
            stageOptions,
            stageIndex === -1 ? 0 : stageIndex
        )
        .textField("§7Hari sampai Zombie Mutant:", `${nextMutant}`);

    form.show(player).catch((err) => {
        world.sendMessage(`§cGagal tampilkan status: ${err}`);
    });
}

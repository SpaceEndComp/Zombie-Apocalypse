export function showStatusUI(player) {
    const day = world.getDay();
    let stage = "Normal";

    if (day >= 50) stage = "Tahap 3 (Ganas Brutal)";
    else if (day >= 10) stage = "Tahap 2 (Berbahaya)";
    else if (day >= 1) stage = "Tahap 1 (Normal)";

    const nextMutant = 100 * Math.ceil(day / 100) - day;

    const form = new ModalFormData()
        .title("§l§aStatus Zombie Apocalypse")
        .textField("§7Hari ke-", `${day}`, `${day}`)
        .dropdown("§7Tahap Zombie:", stage, stage)
        .textField(
            "§7Hari sampai Zombie Mutant:",
            `${nextMutant}`,
            `${nextMutant}`
        );

    form.show(player).catch((err) => {
        world.sendMessage(`§cGagal tampilkan status: ${err}`);
    });
}

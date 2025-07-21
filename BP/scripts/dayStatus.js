import { world} from "@minecraft/server";

// Fungsi untuk menentukan tingkat bahaya berdasarkan hari
function getDangerLevel(day) {
    if (day >= 1 && day <= 9) return "§aDamai";
    if (day >= 10 && day <= 49) return "§eWaspada";
    if (day >= 50 && day <= 100) return "§cBerbahaya";
    return "§8Tidak diketahui";
}

// Fungsi untuk mengirim hari saat player mengetik !days
export function registerDayStatusCommand() {
    world.beforeEvents.chatSend.subscribe((event, player) => {
        if (event.message.trim().toLowerCase() === "!days") {
            event.cancel = true;
            const day = world.getDay();
            const player = event.sender;
            const danger = getDangerLevel(day);
            player.sendMessage(`§aHari ke-${day} di dunia ini!\nTingkat bahaya: ${danger}`);
        }
    });
}
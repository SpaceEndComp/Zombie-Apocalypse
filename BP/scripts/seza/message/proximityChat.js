import { world } from "@minecraft/server";

// Fungsi untuk menghitung jarak antara dua posisi
function calculateDistance(pos1, pos2) {
    return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
    );
}

// Fungsi untuk mendapatkan warna berdasarkan jarak dan radius
function getColorByDistance(distance, maxRadius) {
    if (maxRadius === 40) {
        // Untuk chat !s (radius 40)
        if (distance <= 20) return "§f"; // Putih (normal)
        if (distance <= 30) return "§7"; // Abu-abu
        if (distance <= 40) return "§8"; // Hitam
    } else if (maxRadius === 20) {
        // Untuk chat normal (radius 20)
        if (distance <= 10) return "§f"; // Putih (normal)
        if (distance <= 15) return "§7"; // Abu-abu
        if (distance <= 20) return "§8"; // Hitam
    } else if (maxRadius === 5) {
        // Untuk chat !l (radius 5)
        if (distance <= 2) return "§f"; // Putih (normal)
        if (distance <= 3) return "§7"; // Abu-abu
        if (distance <= 5) return "§8"; // Hitam
    }
    return "§8"; // Default hitam
}

// Event listener untuk chat
world.beforeEvents.chatSend.subscribe((eventData) => {
    const player = eventData.sender;
    const message = eventData.message;
    const playerName = player.nameTag || player.name || "Unknown";
    
    // Cek apakah ini adalah chat dengan awalan !s (jarak jauh)
    if (message.startsWith("!s ")) {
        // Batalkan event chat default
        eventData.cancel = true;
        
        // Ambil pesan tanpa awalan !s
        const actualMessage = message.substring(3);
        
        // Dapatkan posisi pengirim
        const senderPos = player.location;
        
        // Kirim pesan ke semua player dalam radius 40 block
        for (const targetPlayer of world.getPlayers()) {
            const targetPos = targetPlayer.location;
            const distance = calculateDistance(senderPos, targetPos);
            
            // Jika dalam radius 40 block
            if (distance <= 40) {
                const color = getColorByDistance(distance, 40);
                const formattedMessage = `${color}[${Math.floor(distance)}m] ${playerName}: ${actualMessage}!`;
                targetPlayer.sendMessage(formattedMessage);
            }
        }
        
        return;
    }
    if (message.startsWith("!") && !message.startsWith("!s ") && !message.startsWith("!l ")) {
        return; // abaikan pesan dengan awalan ! untuk custom command
    }
    
    // Cek apakah ini adalah chat dengan awalan !l (jarak dekat)
    if (message.startsWith("!l ")) {
        // Batalkan event chat default
        eventData.cancel = true;
        
        // Ambil pesan tanpa awalan !l
        const actualMessage = message.substring(3);
        
        // Dapatkan posisi pengirim
        const senderPos = player.location;
        
        // Kirim pesan ke semua player dalam radius 5 block
        for (const targetPlayer of world.getPlayers()) {
            const targetPos = targetPlayer.location;
            const distance = calculateDistance(senderPos, targetPos);
            
            // Jika dalam radius 5 block
            if (distance <= 5) {
                const color = getColorByDistance(distance, 5);
                const formattedMessage = `${color}[${Math.floor(distance)}m] ${playerName}: ${actualMessage}`;
                targetPlayer.sendMessage(formattedMessage);
            }
        }
        
        return;
    }
    
    // Chat normal (tanpa awalan) - radius 20 block
    // Batalkan event chat default
    eventData.cancel = true;
    
    // Dapatkan posisi pengirim
    const senderPos = player.location;
    
    // Kirim pesan ke semua player dalam radius
    for (const targetPlayer of world.getPlayers()) {
        const targetPos = targetPlayer.location;
        const distance = calculateDistance(senderPos, targetPos);
        
        // Jika dalam radius 20 block
        if (distance <= 20) {
            const color = getColorByDistance(distance, 20);
            const formattedMessage = `${color}[${Math.floor(distance)}m] ${playerName}: ${message}`;
            targetPlayer.sendMessage(formattedMessage);
        }
    }
    
});

import { world, system } from "@minecraft/server";

// Daftar ability dan fitur per level
const levels = [
  {
    level: 10,
    effects: ["strength"],
    message: "Skill Upgraded! strength up!",
  },
  {
    level: 15,
    effects: ["strength", "resistance"],
    message: "Skill Upgraded! resistance up!",
  },
  {
    level: 20,
    effects: ["strength", "resistance", "regeneration"],
    message: "Skill Upgraded! can regeneration!",
  }
];

// Simpan level terakhir player
const playerLevelMap = new Map();

// Cleanup offline players
function cleanupOfflinePlayers() {
  const onlinePlayers = new Set();
  for (const player of world.getPlayers()) {
    onlinePlayers.add(player.id);
  }
  // Remove offline players from tracking
  for (const playerId of playerLevelMap.keys()) {
    if (!onlinePlayers.has(playerId)) {
      playerLevelMap.delete(playerId);
    }
  }
}

// Cleanup offline players every 10 seconds
system.runInterval(() => {
  cleanupOfflinePlayers();
}, 200); // 200 ticks = 10 seconds

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const currentLevel = player.level;
    const lastLevel = playerLevelMap.get(player.id) || 0;

    // Cek level tertinggi yang dicapai (dari tinggi ke rendah)
    let maxLevel = null;
    for (let i = levels.length - 1; i >= 0; i--) {
      if (currentLevel >= levels[i].level) {
        maxLevel = levels[i];
        break;
      }
    }

    // Cek level sebelumnya untuk menentukan efek apa yang perlu dihapus
    let lastMaxLevel = null;
    for (let i = levels.length - 1; i >= 0; i--) {
      if (lastLevel >= levels[i].level) {
        lastMaxLevel = levels[i];
        break;
      }
    }

    // Hapus efek lama yang tidak diperlukan
    if (lastMaxLevel && maxLevel) {
      // Hapus efek yang ada di level lama tapi tidak ada di level baru
      for (const effect of lastMaxLevel.effects) {
        if (!maxLevel.effects.includes(effect)) {
          try {
            player.removeEffect(effect);
          } catch (error) {
            // Ignore error if effect doesn't exist
          }
        }
      }
    } else if (lastMaxLevel && !maxLevel) {
      // Jika level turun di bawah threshold, hapus semua efek
      for (const effect of lastMaxLevel.effects) {
        try {
          player.removeEffect(effect);
        } catch (error) {
          // Ignore error if effect doesn't exist
        }
      }
    }
    
    // Terapkan efek sesuai level jika ada
    if (maxLevel) {
      maxLevel.effects.forEach(effect => {
        player.addEffect(effect, 999999, {
          amplifier: 0,
          showParticles: false
        });
      });
    }

    // Kirim pesan kalau naik level dan mencapai threshold baru
    if (currentLevel > lastLevel) {
      // Cek apakah mencapai threshold baru
      for (const levelInfo of levels) {
        if (currentLevel >= levelInfo.level && lastLevel < levelInfo.level) {
          player.sendMessage(`§a[Level Up] ${levelInfo.message}`);
        }
      }
    }

    // Update level terakhir
    playerLevelMap.set(player.id, currentLevel);
  }
}, 60);

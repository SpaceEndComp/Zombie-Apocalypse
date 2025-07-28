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

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const currentLevel = player.level;
    const lastLevel = playerLevelMap.get(player.id) || 0;

    // Hapus semua efek lama
    for (const { effects } of levels) {
      effects.forEach(effect => player.removeEffect(effect));
    }

    // Cek level tertinggi yang dicapai
    let max = null;
    for (const info of levels) {
      if (currentLevel >= info.level) max = info;
    }

    if (max) {
      max.effects.forEach(effect => {
        player.addEffect(effect, 999999, {
          amplifier: 0,
          showParticles: false
        });
      });

      // Kirim pesan kalau naik level
      if (currentLevel > lastLevel && currentLevel >= max.level) {
        player.sendMessage(`§a[Level Up] ${max.message}`);
      }
    }

    // Update level terakhir
    playerLevelMap.set(player.id, currentLevel);
  }
}, 60);

import { world, system, BlockPermutation, ItemStack } from "@minecraft/server";

// Definisikan nama komponen kustom yang kita buat di JSON
const CROWBAR_COMPONENT_ID = "seza:pry_plank";

/**
 * Mendengarkan event saat pemain menggunakan item pada sebuah blok.
 */
world.beforeEvents.itemUseOn.subscribe(eventData => {
    const { source: player, itemStack, block } = eventData;

    // Periksa apakah item yang digunakan memiliki komponen kustom kita
    // dan apakah blok yang diklik memiliki tag 'planks'
    if (itemStack?.hasComponent(CROWBAR_COMPONENT_ID) && block.hasTag("planks")) {
        
        // Batalkan aksi default (misalnya, menempatkan blok jika ada di tangan lain)
        eventData.cancel = true;

        // Jalankan logika di tick berikutnya untuk menghindari batasan API
        system.run(() => {
            const dimension = player.dimension;
            const blockLocation = block.location;

            // Hancurkan blok dan simulasikan jatuhan item & suara
            dimension.playSound("dig.wood", blockLocation);
            dimension.spawnItem(new ItemStack(block.typeId, 1), blockLocation);
            dimension.setBlockPermutation(blockLocation, BlockPermutation.resolve("minecraft:air"));

            // Kurangi durability item
            const durability = itemStack.getComponent("minecraft:durability");
            if (durability) {
                durability.damage++; // Tambah kerusakan
                // Jika item rusak, hapus dari inventory. Jika tidak, perbarui.
                if (durability.damage >= durability.maxDurability) {
                    player.getComponent("inventory").container.setItem(player.selectedSlotIndex); // Hapus item
                } else {
                    player.getComponent("inventory").container.setItem(player.selectedSlotIndex, itemStack); // Perbarui item
                }
            }
        });
    }
});


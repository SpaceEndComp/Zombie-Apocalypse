import { world, system } from "@minecraft/server";

const MAX_DISTANCE = 20; // Atur sesuai kebutuhanmu bro

export function raycastShoot(player) {
    system.run(() => {
        const origin = player.getHeadLocation();
        const direction = player.getViewDirection();

        for (let i = 1; i <= MAX_DISTANCE; i++) {
            const x = origin.x + direction.x * i;
            const y = origin.y + direction.y * i;
            const z = origin.z + direction.z * i;

            const entity = player.dimension.getEntities({
                location: { x, y, z },
                maxDistance: 1.5,
                excludeTypes: ["minecraft:player"],
            });

            if (entity.length > 0) {
                const target = entity[0];
                target.applyDamage(10);

                player.runCommandAsync(
                    `particle minecraft:crit ${x} ${y} ${z}`
                ).catch(() => {
                    player.runCommand(`particle minecraft:crit ${x} ${y} ${z}`);
                });
                player.runCommandAsync(`playsound random.orb @s`).catch(() => {
                    player.runCommand(`playsound random.orb @s`);
                });

                return;
            }
        }

        // Kalau gak kena apa-apa, kasih efek di ujung tembakan
        const fx = origin.x + direction.x * MAX_DISTANCE;
        const fy = origin.y + direction.y * MAX_DISTANCE;
        const fz = origin.z + direction.z * MAX_DISTANCE;

        player.runCommandAsync(`particle minecraft:smoke ${fx} ${fy} ${fz}`).catch(() => {
            player.runCommand(`particle minecraft:smoke ${fx} ${fy} ${fz}`);
        });
        player.runCommandAsync(`playsound mob.blaze.hit @s`).catch(() => {
            player.runCommand(`playsound mob.blaze.hit @s`);
        });
    });
}

import { world, system } from "@minecraft/server";

const MAX_DISTANCE = 20;

export function raycastShoot(player) {
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
            player.runCommand(`particle minecraft:crit ${x} ${y} ${z}`);
            player.runCommand(`playsound random.orb @s`);
            return;
        }
    }

    player.runCommand(
        `particle minecraft:smoke ${origin.x + direction.x * MAX_DISTANCE} ${
            origin.y + direction.y * MAX_DISTANCE
        } ${origin.z + direction.z * MAX_DISTANCE}`
    );
    player.runCommand(`playsound mob.blaze.hit @s`);
}
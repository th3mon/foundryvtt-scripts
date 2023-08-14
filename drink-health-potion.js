async function main() {
  // INFO:
  // 1. Is a token selected? Not -> error
  const tokens = canvas.tokens.controlled;

  if (!tokens.length || tokens.length > 1) {
    ui.notifications.error("Please select a single token.");
    return;
  }

  const actor = tokens[0].actor;

  // INFO:
  // 2. Dose the token have a health potion? Not -> error
  const healthPotion = actor.items.find(
    (item) => item.name === "Health Potion"
  );

  if (!healthPotion) {
    ui.notifications.error(
      "Please equip a health potion or no Health Potion left."
    );
    return;
  }

  // INFO:
  // 3. If the token is maxHealth health -> don't use health potion
  const {
    system: {
      health: { value: health, max: maxHealth },
    },
  } = actor;

  console.log({
    health,
    maxHealth,
  });

  if (health === maxHealth) {
    ui.notifications.error("The token is already maxHealth health.");
    return;
  }
  console.log({ actor, healthPotion });

  // INFO:
  // 4. If the token is not maxHealth health -> use health potion -> increase token's health

  // INFO: Use health potion
  // TODO: Use try/catch
  await healthPotion.update({
    system: {
      quantity: healthPotion.system.quantity - 1,
    },
  });

  // INFO: When quantity of health potion reaches 0 -> remove health potion
  if (healthPotion.system.quantity <= 0) {
    healthPotion.delete();
  }

  // INFO: Increase token's health
  // TODO: Use try/catch
  await actor.update({
    system: {
      health: {
        value: Math.min(
          health + healthPotion.system.attributes.hp_restore.value,
          maxHealth
        ),
      },
    },
  });
  ui.notifications.info(`${actor.name} drank a health potion`);
}

try {
  main();
} catch (error) {
  console.error(error);
}

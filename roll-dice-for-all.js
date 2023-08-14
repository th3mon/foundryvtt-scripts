async function main() {
  // INFO:
  // 1. Fetch all the selected Actors
  const actors = canvas.tokens.controlled.map((token) => token.actor);
  console.log({ actors });

  // INFO:
  // 2. Roll for each Actor
  for (const actor of actors) {
    const fightSkill = actor.system.attributes.fight?.value ?? 0;

    if (fightSkill === 0) {
      continue;
    }

    const roll = new Roll("2d20kl + @fight", { fight: fightSkill });
    await roll.evaluate();

    // INFO:
    // 4. Output each roll result to the chat
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ alias: actor.name }),
      flavor: `You roll a ${roll.total}`,
    });
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
}

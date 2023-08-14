async function main() {
  const selected = canvas.tokens.controlled;

  if (!selected.length || selected.length > 1) {
    ui.notifications.error("Please select a single target");
  }

  const targets = Array.from(game.user.targets);

  if (!targets.length || targets.length > 1) {
    ui.notifications.error("Please terger exactly one target");
  }

  const currentActor = selected[0].actor;
  const currentTarget = targets[0].actor;

  const actorWeapons = currentActor.items.filter(
    (item) => item.system.attributes.type?.value === "weapon"
  );

  const options = actorWeapons.map(
    (weapon) =>
      `<option value="${weapon.id}">${weapon.name} | Atk: ${weapon.system.attributes.attack.value}</option>`
  );

  const dialogTemplate = `
    <h1> Pick A Weapon</h1>
    <div style="display: flex;">
      <div style="flex: 1; flex-direction: column;">
        <span>Pick Weapon:</span>
        <select id="weapon">${options}</select>
      </div>
      <span style="flex: 1;">Mod: <input id="modifier" type="number" value="0" /></span>
      <span style="flex: 1;">Ignore Armor: <input id="ignore-armor" type="checkbox" checked /></span>
    </div>
  `;

  new Dialog({
    title: `Attack ${currentTarget.name}`,
    content: dialogTemplate,
    buttons: {
      rollAttack: {
        label: "Roll Attack",
        callback: async (html) => {
          const weaponId = html.find("#weapon").get(0).value;
          const weapon = actorWeapons.find((w) => w.id === weaponId);
          const { attributes: weaponAttributes } = weapon.system;

          const modifier = html.find("#modifier").get(0).value;
          const ignoreArmor = html.find("#ignore-armor").get(0).checked;

          const rollFormula = `1d20 + ${weaponAttributes.attack.value} + ${modifier}`;
          const roll = new Roll(rollFormula);
          roll.evaluate({ async: false });

          const targetArmor =
            currentTarget.system.attributes.armor?.value && !ignoreArmor
              ? currentTarget.system.attributes.armor.value
              : 0;
          let chatContent = "";

          if (roll.total > targetArmor) {
            chatContent = `
              <p>Rolled ${roll.total} against Targer Armor ${targetArmor}!</p>
              <p>It was a Hit!</p>
              <p><button id="roll-damage">Roll Damage</button></p>
            `;
          } else {
            chatContent = `
              <p>Rolled ${roll.total} against Targer Armor ${targetArmor}!</p>
              <p>It's a miss</p>
            `;
          }

          ChatMessage.create({
            content: chatContent,
            speaker: ChatMessage.getSpeaker({ alias: currentActor.name }),
          });

          Hooks.once("renderChatMessage", (_, html) => {
            html.find("#roll-damage").on("click", () => {
              const weaponDamage = weaponAttributes.damage?.value ?? 0;

              const roll = new Roll(weaponDamage);
              roll.evaluate({ async: false });
              roll.toMessage({
                speaker: ChatMessage.getSpeaker({ alias: currentActor.name }),
              });
            });
          });
        },
      },
      close: {
        label: "Close",
      },
    },
  }).render(true);
}

try {
  main();
} catch (error) {
  console.error(error);
}

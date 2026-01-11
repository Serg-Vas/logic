// logic_bridge.js (client, logic resource)
// Assumes main.js already runs switchToFreemode() on start.cconst FREEMODE_MODELS = ['mp_m_freemode_01', 'mp_f_freemode_01'];

function isFreemodeModel(modelHash) {
  return modelHash === GetHashKey(FREEMODE_MODELS[0]) || modelHash === GetHashKey(FREEMODE_MODELS[1]);
}

function presetA(p) {
  // tops (11) + eyebrows (2)
  const modelHash = GetEntityModel(p);
  console.log(`[logic] presetA ped=${p} model=${modelHash} freemode=${isFreemodeModel(modelHash)}`);
  //   SetPedHeadBlendData(
  //   p,
  //   0, 0, 0,
  //   0, 0, 0,
  //   1, 1, 0.0,
  //   false
  // );
//   SetPedComponentVariation(p, 1, 15, 0, 0);
  SetPedHeadOverlay(p, 4, 0, 1.0);
  SetPedHeadOverlayColor(p, 4, 1, 1, 1);
}

function presetB(p) {
  const modelHash = GetEntityModel(p);
  console.log(
    `[logic] presetB ped=${p} model=${modelHash} freemode=${isFreemodeModel(modelHash)}`
  );
  // SetPedHeadBlendData(
  //   p,
  //   0, 0, 0,
  //   0, 0, 0,
  //   1, 1, 0.0,
  //   false
  // );
  // Apply strong makeup
  SetPedHeadOverlay(p, 4, 20, 1.0);
  SetPedHeadOverlayColor(p, 4, 1, 10, 0);

  // Debug: confirm the game accepted it
  console.log(
    "[logic] makeup value:",
    GetPedHeadOverlayValue(p, 4),
    "data:",
    GetPedHeadOverlayData(p, 4)
  );
}


on("ceui:presetA", (data) => {
  const p = PlayerPedId();
  console.log("[logic] presetA from UI", data, "ped=", p);
  presetA(p);
});

on("ceui:presetB", (data) => {
  const p = PlayerPedId();
  console.log("[logic] presetB from UI", data, "ped=", p);
  presetB(p);
});

// optional chat commands too
RegisterCommand("a", () => presetA(PlayerPedId()), false);
RegisterCommand("b", () => presetB(PlayerPedId()), false);


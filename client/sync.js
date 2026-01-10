on('logic:freemode:statusRequest', async () => {
  const p = PlayerPedId();
  const m = GetEntityModel(p);

  if (p && DoesEntityExist(p) && isFreemodeModel(m)) {
    emit('logic:freemode:ready', {
      ped: p,
      model: m === GetHashKey(FREEMODE_MODELS[0])
        ? FREEMODE_MODELS[0]
        : FREEMODE_MODELS[1],
      modelHash: m,
    });
  } else {
    await switchToFreemode(FREEMODE_MODELS[0]);
  }
});

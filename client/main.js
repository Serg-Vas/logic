const FREEMODE_MODELS = ['mp_m_freemode_01', 'mp_f_freemode_01'];

function log(msg) {
  console.log(`[freemode] ${msg}`);
}

function isFreemodeModel(modelHash) {
  return modelHash === GetHashKey(FREEMODE_MODELS[0]) || modelHash === GetHashKey(FREEMODE_MODELS[1]);
}

async function waitFrames(n = 1) {
  for (let i = 0; i < n; i++) {
    // this MUST yield a frame. In FiveM, setTick is safest if you’ve had Delay issues.
    await new Promise((resolve) => {
      const t = setTick(() => { clearTick(t); resolve(); });
    });
  }
}

async function requestModel(hash, timeoutMs = 10000) {
  RequestModel(hash);
  const start = GetGameTimer();
  while (!HasModelLoaded(hash)) {
    await waitFrames(1);
    if (GetGameTimer() - start > timeoutMs) return false;
  }
  return true;
}

async function waitForPedStable(expectedModelHash, timeoutMs = 4000) {
  const start = GetGameTimer();

  while (true) {
    const p = PlayerPedId();
    if (p && p !== 0 && DoesEntityExist(p) && GetEntityModel(p) === expectedModelHash) {
      // sanity: components queryable (tops has >0 drawables)
      const n = GetNumberOfPedDrawableVariations(p, 11);
      if (Number.isFinite(n) && n > 0) return p;
    }

    await waitFrames(1);
    if (GetGameTimer() - start > timeoutMs) return 0;
  }
}

async function switchToFreemode(modelName = FREEMODE_MODELS[0]) {
  const modelHash = GetHashKey(modelName);

  // already correct?
  const p0 = PlayerPedId();
  if (p0 && DoesEntityExist(p0) && GetEntityModel(p0) === modelHash && isFreemodeModel(modelHash)) {
    log(`Already ${modelName}`);
    emit('logic:freemode:ready', { ped: p0, model: modelName, modelHash });
    return p0;
  }

  let ok = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    ok = await requestModel(modelHash, 10000);
    if (ok) break;
    log(`FAILED loading ${modelName} (attempt ${attempt})`);
    await waitFrames(30);
  }
  if (!ok) {
    log(`FAILED loading ${modelName} after retries`);
    return 0;
  }

  const oldPed = PlayerPedId();

  SetPlayerModel(PlayerId(), modelHash);
  SetModelAsNoLongerNeeded(modelHash);

  // Let ped swap propagate
  await waitFrames(5);

  const p = await waitForPedStable(modelHash, 4000);
  if (!p) {
    log(`FAILED ped stable for ${modelName} (oldPed=${oldPed} curPed=${PlayerPedId()})`);
    return 0;
  }

  // baseline defaults
  SetPedDefaultComponentVariation(p);
  ClearAllPedProps(p);
  // SetPedHeadBlendData(
  //   p,
  //   0, 0, 0,
  //   0, 0, 0,
  //   1, 1, 0.0,
  //   true
  // );

  // give a few frames for clothing/head to settle
  await waitFrames(5);

  emit('logic:freemode:ready', { ped: p, model: modelName, modelHash });
  log(`READY ped=${p} model=${modelName}`);

  return p;
}

// Example trigger:
on('onClientResourceStart', (res) => {
  if (res !== GetCurrentResourceName()) return;
  switchToFreemode(FREEMODE_MODELS[0]);
});

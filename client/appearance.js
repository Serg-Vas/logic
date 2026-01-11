const HEAD_OVERLAYS = [
  { key: "blemishes", label: "blemishes", overlayId: 0, defaultColorType: 0 },
  { key: "facialhair", label: "facialhair", overlayId: 1, defaultColorType: 1 },
  { key: "eyebrows", label: "eyebrows", overlayId: 2, defaultColorType: 1 },
  { key: "ageing", label: "ageing", overlayId: 3, defaultColorType: 0 },
  { key: "makeup", label: "makeup", overlayId: 4, defaultColorType: 1 },
  { key: "blush", label: "blush", overlayId: 5, defaultColorType: 2 },
  { key: "complexion", label: "complexion", overlayId: 6, defaultColorType: 0 },
  { key: "sundamage", label: "sundamage", overlayId: 7, defaultColorType: 0 },
  { key: "lipstick", label: "lipstick", overlayId: 8, defaultColorType: 2 },
  { key: "moles", label: "moles", overlayId: 9, defaultColorType: 0 },
  { key: "chesthair", label: "chesthair", overlayId: 10, defaultColorType: 1 },
  { key: "bodyblemishes", label: "bodyblemishes", overlayId: 11, defaultColorType: 0 },
  { key: "addbodyblemishes", label: "addbodyblemishes", overlayId: 12, defaultColorType: 0 },
];

const COMPONENT_NAMES = [
  { key: "face", label: "face" },
  { key: "mask", label: "mask" },
  { key: "hair", label: "hair" },
  { key: "torso", label: "torso" },
  { key: "legs", label: "legs" },
  { key: "bags", label: "bags" },
  { key: "shoes", label: "shoes" },
  { key: "accessory", label: "accessory" },
  { key: "undershirt", label: "undershirt" },
  { key: "armor", label: "armor" },
  { key: "decals", label: "decals" },
  { key: "tops", label: "tops" },
];

function getOverlayInfo(p, overlayId) {
  const data = GetPedHeadOverlayData(p, overlayId);
  if (!Array.isArray(data) || data.length < 6) return null;

  const [ok, value, colorType, firstColor, secondColor, opacity] = data;
  if (!ok) return null;

  return { value, colorType, firstColor, secondColor, opacity };
}

function getOverlayState(p, overlayId) {
  const count = GetNumHeadOverlayValues(overlayId);
  const cur = GetPedHeadOverlayValue(p, overlayId);
  const info = getOverlayInfo(p, overlayId);

  return {
    overlayId,
    count,
    cur,
    value: info?.value ?? cur,
    opacity: info?.opacity ?? 1.0,
    colorType: info?.colorType ?? 0,
    firstColor: info?.firstColor ?? 0,
    secondColor: info?.secondColor ?? 0,
  };
}

function safeNumDrawables(p, componentId) {
  const n = GetNumberOfPedDrawableVariations(p, componentId);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function safeNumTextures(p, componentId, drawable) {
  const n = GetNumberOfPedTextureVariations(p, componentId, drawable);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function safeNumPalettes(p, componentId, drawable, texture) {
  try {
    if (typeof GetNumberOfPedPaletteVariations === 'function') {
      const n = GetNumberOfPedPaletteVariations(p, componentId, drawable, texture);
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    }
  } catch (e) {}
  return 4;
}

function getComponentState(p, componentId) {
  const drawable = GetPedDrawableVariation(p, componentId);
  const texture = GetPedTextureVariation(p, componentId);
  const palette = GetPedPaletteVariation(p, componentId);

  const drawableCount = safeNumDrawables(p, componentId);
  const textureCount = safeNumTextures(p, componentId, drawable);
  const paletteCount = safeNumPalettes(p, componentId, drawable, texture);

  const state = {
    componentId,
    drawableCount,
    textureCount,
    paletteCount,
    drawable,
    texture,
    palette,
  };

  if (componentId === 2) {
    state.hairColor = GetPedHairColor(p);
    state.hairHighlight = GetPedHairHighlightColor(p);
  }

  return state;
}

function getEyeColor(p) {
  return GetPedEyeColor(p);
}

function getFaceFeatures(p) {
  const features = [];
  for (let i = 0; i < 20; i++) {
    const scale = GetPedFaceFeature(p, i);
    features.push({
      index: i,
      scale: Number.isFinite(scale) ? scale : 0,
    });
  }
  return features;
}

function getHeadBlendState(p) {
  const data = GetPedHeadBlendData(p);
  if (!Array.isArray(data) || data.length < 10) {
    return {
      shapeFirst: 0,
      skinFirst: 0,
    };
  }

  const [shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird] = data;
  return {
    shapeFirst: Number.isFinite(shapeFirst) ? shapeFirst : 0,
    skinFirst: Number.isFinite(skinFirst) ? skinFirst : 0,
  };
}

function applyAppearance(p, data = {}) {
  if (data.reset) {
    SetPedDefaultComponentVariation(p);
    ClearAllPedProps(p);
    return;
  }

  const component = data.component;
  if (component) {
    const componentId = Number(component.componentId ?? 11);
    SetPedComponentVariation(
      p,
      componentId,
      Number(component.drawable ?? 0),
      Number(component.texture ?? 0),
      Number(component.palette ?? 0)
    );
    
    if (componentId === 2 && data.hair) {
      SetPedHairTint(p, Number(data.hair.hairColor ?? 0), Number(data.hair.hairHighlight ?? 0));
    }
  }

  const hair = data.hair;
  if (hair && !component) {
    SetPedHairTint(p, Number(hair.hairColor ?? 0), Number(hair.hairHighlight ?? 0));
  }

  const overlay = data.overlay;
  if (overlay) {
    SetPedHeadOverlay(
      p,
      Number(overlay.overlayId ?? 1),
      Number(overlay.value ?? 0),
      Number(overlay.opacity ?? 1.0)
    );
    
    const overlayDef = HEAD_OVERLAYS.find((o) => o.overlayId === Number(overlay.overlayId ?? 1));
    const colorType = overlayDef?.defaultColorType ?? 0;
    
    SetPedHeadOverlayColor(
      p,
      Number(overlay.overlayId ?? 1),
      colorType,
      Number(overlay.firstColor ?? 0),
      Number(overlay.secondColor ?? 0)
    );
  }

  const headBlend = data.headBlend;
  if (headBlend) {
    SetPedHeadBlendData(
      p,
      Number(headBlend.shapeFirst ?? 0),
      Number(headBlend.shapeFirst ?? 0),
      0,
      Number(headBlend.skinFirst ?? 0),
      Number(headBlend.skinFirst ?? 0),
      0,
      1,
      1,
      0.0,
      true
    );
  }

  const faceFeature = data.faceFeature;
  if (faceFeature) {
    SetPedFaceFeature(p, Number(faceFeature.index ?? 0), Number(faceFeature.scale ?? 0.0));
  }

  const prop = data.prop;
  if (prop) {
    const propIndex = Number(prop.propId ?? 0);
    const drawable = Number(prop.drawable ?? -1);
    if (drawable < 0) {
      ClearPedProp(p, propIndex);
    } else {
      SetPedPropIndex(
        p,
        propIndex,
        drawable,
        Number(prop.texture ?? 0),
        Boolean(prop.attach ?? true)
      );
    }
  }

  const eyeColor = data.eyeColor;
  if (eyeColor !== undefined) {
    SetPedEyeColor(p, Number(eyeColor));
  }
}

on("logic:appearance:apply", (data) => {
  const p = PlayerPedId();
  if (!p || !DoesEntityExist(p)) return;
  applyAppearance(p, data || {});
});

async function changeSex(sex) {
  const oldPed = PlayerPedId();
  if (!oldPed || !DoesEntityExist(oldPed)) return false;

  const sexValue = Number(sex) === 1 ? 1 : 0;
  const modelName = FREEMODE_MODELS[sexValue];
  const modelHash = GetHashKey(modelName);

  console.log(`^3[appearance]^7 Starting model change to ${modelName}`);

  RequestModel(modelHash);
  let loaded = false;
  let timeout = 0;
  
  while (!loaded && timeout < 5000) {
    if (HasModelLoaded(modelHash)) {
      loaded = true;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
    timeout += 50;
  }

  if (!loaded) {
    console.error(`^1[appearance]^7 Failed to load model ${modelName}`);
    SetModelAsNoLongerNeeded(modelHash);
    return false;
  }

  console.log(`^3[appearance]^7 Model loaded, applying to player`);

  const coords = GetEntityCoords(oldPed);
  const heading = GetEntityHeading(oldPed);

  SetPlayerModel(PlayerId(), modelHash);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  const newPed = PlayerPedId();
  
  console.log(`^3[appearance]^7 Ped changed: old=${oldPed}, new=${newPed}`);

  SetEntityCoords(newPed, coords[0], coords[1], coords[2], false, false, false, false);
  SetEntityHeading(newPed, heading);

  SetPedDefaultComponentVariation(newPed);
  ClearAllPedProps(newPed);

  const shapeValue = sexValue === 1 ? 21 : 0;
  // const skinValue = sexValue === 1 ? 21 : 0;
  SetPedHeadBlendData(
    newPed,
    shapeValue, shapeValue, 0,
    0, 0, 0,
    1, 1, 0.0,
    true
  );

  SetModelAsNoLongerNeeded(modelHash);

  console.log(`^3[appearance]^7 Model change complete, refreshing appearance`);

  // Wait a bit then refresh appearance info
  await new Promise(resolve => setTimeout(resolve, 250));
  emit("logic:appearance:infoRequest");

  return true;
}

on("logic:appearance:changeSex", async (sex) => {
  await changeSex(sex);
});

function getSex(p) {
  const modelHash = GetEntityModel(p);
  const maleHash = GetHashKey(FREEMODE_MODELS[0]);
  const femaleHash = GetHashKey(FREEMODE_MODELS[1]);
  
  if (modelHash === maleHash) return 0;
  if (modelHash === femaleHash) return 1;
  return 0; // default to male
}

function buildAppearanceInfo(p) {
  const overlays = HEAD_OVERLAYS.map((o) => ({
    key: o.key,
    label: o.label,
    defaultColorType: o.defaultColorType,
    ...getOverlayState(p, o.overlayId),
  }));

  const components = COMPONENT_NAMES.map((c, idx) => ({
    key: c.key,
    label: c.label,
    ...getComponentState(p, idx),
  }));

  const faceFeatures = getFaceFeatures(p);
  const headBlend = getHeadBlendState(p);
  const sex = getSex(p);
  const eyeColor = getEyeColor(p);

  return {
    type: "sync",
    overlays,
    components,
    faceFeatures,
    headBlend,
    sex,
    eyeColor,
  };
}

on("logic:appearance:infoRequest", () => {
  const p = PlayerPedId();
  if (!p || !DoesEntityExist(p)) return;
  const info = buildAppearanceInfo(p);
  emit("ui:appearance:info", info);
});

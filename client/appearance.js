function applyAppearance(p, data = {}) {
  if (data.reset) {
    SetPedDefaultComponentVariation(p);
    ClearAllPedProps(p);
    // SetPedHeadBlendData(p, 0, 0, 0, 0, 0, 0, 1, 1, 0.0, true);
    return;
  }

  const component = data.component;
  let isHairComponent = false;
  if (component) {
    const componentId = Number(component.componentId ?? 11);
    SetPedComponentVariation(
      p,
      componentId,
      Number(component.drawableId ?? 15),
      Number(component.textureId ?? 0),
      Number(component.paletteId ?? 0)
    );
    isHairComponent = componentId === 2;
  }

  const hair = data.hair;
  if (hair && (isHairComponent || !component)) {
    SetPedHairTint(p, Number(hair.primary ?? 0), Number(hair.highlight ?? 0));
  }

  const overlay = data.overlay;
  if (overlay) {
    SetPedHeadOverlay(
      p,
      Number(overlay.overlayId ?? 1),
      Number(overlay.index ?? 0),
      Number(overlay.opacity ?? 1.0)
    );
    SetPedHeadOverlayColor(
      p,
      Number(overlay.overlayId ?? 1),
      Number(overlay.colorType ?? 1),
      Number(overlay.primary ?? 0),
      Number(overlay.secondary ?? 0)
    );
  }

  const headBlend = data.headBlend;
  if (headBlend) {
    console.log(`applying headBlend: ${JSON.stringify(headBlend)}`);
    console.log("p =", p, "PlayerPedId =", PlayerPedId(), "same?", p === PlayerPedId());
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
    UpdatePedHeadBlendData(p, 1, 1, 0.0);
    console.log("headBlend:", JSON.stringify(GetPedHeadBlendData(p)));
  }

  const faceFeature = data.faceFeature;
  if (faceFeature) {
    SetPedFaceFeature(p, Number(faceFeature.index ?? 0), Number(faceFeature.scale ?? 0.0));
  }

  const prop = data.prop;
  if (prop) {
    const propIndex = Number(prop.propId ?? 0);
    const drawable = Number(prop.drawableId ?? -1);
    if (drawable < 0) {
      ClearPedProp(p, propIndex);
    } else {
      SetPedPropIndex(
        p,
        propIndex,
        drawable,
        Number(prop.textureId ?? 0),
        Boolean(prop.attach ?? true)
      );
    }
  }
}

on("logic:appearance:apply", (data) => {
  const p = PlayerPedId();
  if (!p || !DoesEntityExist(p)) return;
  applyAppearance(p, data || {});
});

// RegisterCommand("appearance", () => {
//   const p = PlayerPedId();
//   if (!p || !DoesEntityExist(p)) return;
//   applyAppearance(p, {
//     component: { componentId: 11, drawableId: 15, textureId: 0, paletteId: 0 },
//     hair: { primary: 0, highlight: 0 },
//     overlay: { overlayId: 1, index: 10, opacity: 1.0, colorType: 1, primary: 1, secondary: 0 },
//     headBlend: {
//       shapeFirst: 0,
//       shapeSecond: 0,
//       shapeThird: 0,
//       skinFirst: 0,
//       skinSecond: 0,
//       skinThird: 0,
//       shapeMix: 0.5,
//       skinMix: 0.5,
//       thirdMix: 0.0,
//       isParent: false,
//     },
//     faceFeature: { index: 0, scale: 0.2 },
//   });
// }, false);

let faceCam = null;
let lockTick = null;

function getFaceCoords(p) {
  const bone = GetPedBoneIndex(p, 31086);
  return GetWorldPositionOfEntityBone(p, bone);
}

function startFaceCam() {
  const p = PlayerPedId();
  if (!p || !DoesEntityExist(p)) return;

  const [x, y, z] = getFaceCoords(p);
  const forward = GetEntityForwardVector(p);
  const camX = x + forward[0] * 0.6;
  const camY = y + forward[1] * 0.6;
  const camZ = z + 0.05;

  if (faceCam) {
    DestroyCam(faceCam, false);
    faceCam = null;
  }

  faceCam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
  SetCamCoord(faceCam, camX, camY, camZ);
  PointCamAtCoord(faceCam, x, y, z);
  SetCamFov(faceCam, 35.0);
  RenderScriptCams(true, false, 0, true, false);

  DisplayRadar(false);
  if (!lockTick) {
    lockTick = setTick(() => {
      DisableAllControlActions(0);
      DisableAllControlActions(1);
      DisableAllControlActions(2);
    });
  }
}

function stopFaceCam() {
  if (!faceCam) return;
  RenderScriptCams(false, false, 0, true, false);
  DestroyCam(faceCam, false);
  faceCam = null;

  if (lockTick) {
    clearTick(lockTick);
    lockTick = null;
  }
  DisplayRadar(true);
}

RegisterCommand("facecam", () => startFaceCam(), false);
RegisterCommand("facecam_off", () => stopFaceCam(), false);

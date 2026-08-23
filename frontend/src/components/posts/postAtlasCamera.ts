export interface AtlasCamera {
  x: number;
  y: number;
  scale: number;
}

export interface AtlasCameraPoint {
  x: number;
  y: number;
}

export interface AtlasCameraTargetOptions {
  fieldWidth: number;
  fieldHeight: number;
  scale: number;
  screenX?: number;
  screenY?: number;
}

export interface AtlasCameraViewport {
  width: number;
  height: number;
}

export const MIN_ATLAS_SCALE = 0.82;
export const MAX_ATLAS_SCALE = 3.2;

export const clampAtlasScale = (scale: number): number =>
  Math.min(MAX_ATLAS_SCALE, Math.max(MIN_ATLAS_SCALE, scale));

/** Keeps a useful portion of the scene in view after free panning or anchored zoom. */
export const clampCameraTranslation = (
  camera: AtlasCamera,
  viewport: AtlasCameraViewport,
  minimumVisibleRatio = 0.14,
  contentPoints: readonly AtlasCameraPoint[] = [],
): AtlasCamera => {
  if (contentPoints.length > 0) {
    const minimumX = viewport.width * minimumVisibleRatio;
    const maximumX = viewport.width * (1 - minimumVisibleRatio);
    const minimumY = viewport.height * minimumVisibleRatio;
    const maximumY = viewport.height * (1 - minimumVisibleRatio);
    const corrections = contentPoints.map((point) => {
      const screenX = camera.x + point.x * viewport.width * camera.scale;
      const screenY = camera.y + point.y * viewport.height * camera.scale;
      const x =
        screenX < minimumX ? minimumX - screenX : screenX > maximumX ? maximumX - screenX : 0;
      const y =
        screenY < minimumY ? minimumY - screenY : screenY > maximumY ? maximumY - screenY : 0;
      return { x, y, distance: Math.hypot(x, y) };
    });
    const nearest = corrections.reduce((best, correction) =>
      correction.distance < best.distance ? correction : best,
    );
    return { ...camera, x: camera.x + nearest.x, y: camera.y + nearest.y };
  }

  return {
    ...camera,
    x: Math.min(
      viewport.width * (1 - minimumVisibleRatio),
      Math.max(viewport.width * (minimumVisibleRatio - camera.scale), camera.x),
    ),
    y: Math.min(
      viewport.height * (1 - minimumVisibleRatio),
      Math.max(viewport.height * (minimumVisibleRatio - camera.scale), camera.y),
    ),
  };
};

/** Places a normalized graph point at a normalized location in the viewport. */
export const cameraForPoint = (
  point: AtlasCameraPoint,
  { fieldWidth, fieldHeight, scale, screenX = 0.5, screenY = 0.5 }: AtlasCameraTargetOptions,
): AtlasCamera => {
  const nextScale = clampAtlasScale(scale);
  return {
    x: fieldWidth * (screenX - point.x * nextScale),
    y: fieldHeight * (screenY - point.y * nextScale),
    scale: nextScale,
  };
};

/** Zooms without moving the graph point currently beneath the chosen screen point. */
export const zoomCameraAround = (
  camera: AtlasCamera,
  screenPoint: AtlasCameraPoint,
  requestedScale: number,
): AtlasCamera => {
  const nextScale = clampAtlasScale(requestedScale);
  const worldX = (screenPoint.x - camera.x) / camera.scale;
  const worldY = (screenPoint.y - camera.y) / camera.scale;
  return {
    x: screenPoint.x - worldX * nextScale,
    y: screenPoint.y - worldY * nextScale,
    scale: nextScale,
  };
};

/** Nudges the camera only when a world-space point would otherwise be obscured. */
export const cameraToRevealPoint = (
  camera: AtlasCamera,
  worldPoint: AtlasCameraPoint,
  viewport: AtlasCameraViewport,
  safeMarginRatio = 0.13,
  contentPoints?: readonly AtlasCameraPoint[],
): AtlasCamera => {
  const screenPoint = {
    x: camera.x + worldPoint.x * camera.scale,
    y: camera.y + worldPoint.y * camera.scale,
  };
  const minimumX = viewport.width * safeMarginRatio;
  const maximumX = viewport.width * (1 - safeMarginRatio);
  const minimumY = viewport.height * safeMarginRatio;
  const maximumY = viewport.height * (1 - safeMarginRatio);
  const correctionX =
    screenPoint.x < minimumX
      ? minimumX - screenPoint.x
      : screenPoint.x > maximumX
        ? maximumX - screenPoint.x
        : 0;
  const correctionY =
    screenPoint.y < minimumY
      ? minimumY - screenPoint.y
      : screenPoint.y > maximumY
        ? maximumY - screenPoint.y
        : 0;
  return clampCameraTranslation(
    { ...camera, x: camera.x + correctionX, y: camera.y + correctionY },
    viewport,
    0.14,
    contentPoints,
  );
};

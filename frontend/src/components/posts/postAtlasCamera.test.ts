import {
  MAX_ATLAS_SCALE,
  MIN_ATLAS_SCALE,
  cameraToRevealPoint,
  cameraForPoint,
  clampCameraTranslation,
  clampAtlasScale,
  zoomCameraAround,
} from './postAtlasCamera';

describe('post atlas camera geometry', () => {
  test('centers a normalized point at the requested screen position', () => {
    expect(
      cameraForPoint(
        { x: 0.75, y: 0.25 },
        { fieldWidth: 1000, fieldHeight: 600, scale: 2, screenX: 0.3, screenY: 0.5 },
      ),
    ).toEqual({ x: -1200, y: 0, scale: 2 });
  });

  test('preserves the world point beneath the zoom anchor', () => {
    const camera = zoomCameraAround({ x: -100, y: -50, scale: 1 }, { x: 300, y: 250 }, 2);
    expect(camera).toEqual({ x: -500, y: -350, scale: 2 });
    expect((300 - camera.x) / camera.scale).toBe(400);
    expect((250 - camera.y) / camera.scale).toBe(300);
  });

  test('clamps extreme scale requests', () => {
    expect(clampAtlasScale(0.1)).toBe(MIN_ATLAS_SCALE);
    expect(clampAtlasScale(9)).toBe(MAX_ATLAS_SCALE);
  });

  test('keeps part of the graph in view after an extreme pan', () => {
    const camera = clampCameraTranslation(
      { x: -4000, y: 2000, scale: 2 },
      { width: 1000, height: 600 },
    );
    expect(camera.x).toBeCloseTo(-1860);
    expect(camera).toMatchObject({ y: 516, scale: 2 });
  });

  test('brings the nearest real node back after an extreme pan', () => {
    const viewport = { width: 1000, height: 600 };
    const contentPoints = [
      { x: 0.12, y: 0.22 },
      { x: 0.5, y: 0.5 },
      { x: 0.86, y: 0.74 },
    ];
    const camera = clampCameraTranslation(
      { x: -4000, y: 2000, scale: 2 },
      viewport,
      0.14,
      contentPoints,
    );

    expect(camera).toEqual({ x: -1580, y: -372, scale: 2 });
    expect(camera.x + viewport.width * camera.scale * contentPoints[2].x).toBe(140);
    expect(camera.y + viewport.height * camera.scale * contentPoints[2].y).toBe(516);
  });

  test('allows the retained node to change so peripheral nodes remain reachable', () => {
    const viewport = { width: 1000, height: 600 };
    const contentPoints = [
      { x: 0.12, y: 0.22 },
      { x: 0.5, y: 0.5 },
      { x: 0.86, y: 0.74 },
    ];
    const peripheralCamera = cameraForPoint(contentPoints[0], {
      fieldWidth: viewport.width,
      fieldHeight: viewport.height,
      scale: MAX_ATLAS_SCALE,
    });

    expect(clampCameraTranslation(peripheralCamera, viewport, 0.14, contentPoints)).toEqual(
      peripheralCamera,
    );
  });

  test('reveals an offscreen keyboard target without recentering a visible one', () => {
    const viewport = { width: 1000, height: 600 };
    const camera = { x: -500, y: -200, scale: 2 };
    expect(cameraToRevealPoint(camera, { x: 650, y: 250 }, viewport)).toEqual(camera);
    expect(cameraToRevealPoint(camera, { x: 80, y: 50 }, viewport)).toEqual({
      x: -30,
      y: -22,
      scale: 2,
    });
  });
});

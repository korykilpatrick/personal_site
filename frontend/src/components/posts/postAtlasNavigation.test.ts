import { findDirectionalNodeId, isAtlasDirectionKey } from './postAtlasNavigation';

const points = [
  { id: 'center', x: 100, y: 100 },
  { id: 'right-near', x: 150, y: 112 },
  { id: 'right-far-straight', x: 190, y: 100 },
  { id: 'left', x: 40, y: 100 },
  { id: 'up', x: 100, y: 30 },
  { id: 'down', x: 100, y: 180 },
] as const;

describe('post atlas directional navigation', () => {
  test('chooses a nearby node in the requested direction', () => {
    expect(findDirectionalNodeId(points, 'center', 'ArrowRight')).toBe('right-near');
    expect(findDirectionalNodeId(points, 'center', 'ArrowLeft')).toBe('left');
    expect(findDirectionalNodeId(points, 'center', 'ArrowUp')).toBe('up');
    expect(findDirectionalNodeId(points, 'center', 'ArrowDown')).toBe('down');
  });

  test('does not wrap to a node behind the requested direction', () => {
    expect(findDirectionalNodeId(points, 'left', 'ArrowLeft')).toBeUndefined();
  });

  test('rejects unknown starting nodes and keys', () => {
    expect(findDirectionalNodeId(points, 'missing', 'ArrowRight')).toBeUndefined();
    expect(isAtlasDirectionKey('ArrowRight')).toBe(true);
    expect(isAtlasDirectionKey('Enter')).toBe(false);
  });
});

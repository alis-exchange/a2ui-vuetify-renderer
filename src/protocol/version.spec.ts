import { describe, expect, it } from 'vitest';
import { bindingPath, isV10Surface, pathBinding } from './version';

describe('protocol version helpers', () => {
  const v09 = { atLeastV10: false };
  const v10 = { atLeastV10: true };

  it('builds a binding in the surface syntax', () => {
    expect(pathBinding('/a', v09)).toEqual({ path: '/a' });
    expect(pathBinding('/a', v10)).toEqual({ '@path': '/a' });
    expect(pathBinding('/a', undefined)).toEqual({ path: '/a' });
  });

  it('reads a binding only in the surface syntax', () => {
    expect(bindingPath({ path: '/a' }, v09)).toBe('/a');
    expect(bindingPath({ '@path': '/a' }, v10)).toBe('/a');
    expect(bindingPath({ path: '/a' }, v10)).toBeUndefined();
    expect(bindingPath('literal', v09)).toBeUndefined();
    expect(bindingPath(null, v10)).toBeUndefined();
  });

  it('recognises v1.0 surfaces from their own or their catalog version', () => {
    expect(isV10Surface({ protocolVersion: 'v1.0' })).toBe(true);
    expect(isV10Surface({ defaultCatalog: { protocolVersion: '1.0' } })).toBe(true);
    expect(isV10Surface({ protocolVersion: 'v0.9' })).toBe(false);
    expect(isV10Surface(undefined)).toBe(false);
  });
});

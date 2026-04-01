import { describe, expect, it } from 'vitest';
import * as exports from '../src/index';

describe('index.ts', () => {
  it('should export CATALOG_ID constant', () => {
    expect(exports.CATALOG_ID).toBeDefined();
    expect(exports.CATALOG_ID).toBe('https://raw.githubusercontent.com/alis-exchange/a2ui-vuetify-renderer/main/catalog/vuetify-catalog.json');
  });

  it('should export getCatalogSchema', () => {
    expect(exports.getCatalogSchema).toBeDefined();
    expect(typeof exports.getCatalogSchema).toBe('function');
  });

  it('should export registerDefaultComponents', () => {
    expect(exports.registerDefaultComponents).toBeDefined();
    expect(typeof exports.registerDefaultComponents).toBe('function');
  });
});

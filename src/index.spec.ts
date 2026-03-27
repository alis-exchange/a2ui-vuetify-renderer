import { describe, it, expect } from 'vitest';
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
});


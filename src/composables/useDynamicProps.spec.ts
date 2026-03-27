import { describe, it, expect, vi } from 'vitest';
import { useDynamicProps } from './useDynamicProps';
import { computed } from 'vue';

vi.mock('./useA2UI', () => {
  return {
    useA2UI: () => ({
      resolveValue: (value: any) => {
        if (value && typeof value === 'object' && value.path === '/some/path') {
          return 'Resolved Path Value';
        }
        if (value && typeof value === 'object' && value.call === 'someFunction') {
          return 'Resolved Function Value';
        }
        return value;
      }
    })
  };
});

describe('useDynamicProps', () => {
  it('should resolve dynamic props', () => {
    const nodeProps = {
      type: 'SomeComponent',
      id: '123',
      text: { path: '/some/path' },
      label: { call: 'someFunction' },
      staticProp: 'Static Value'
    };

    const resolvedProps = useDynamicProps(nodeProps);

    expect(resolvedProps.value.text).toBe('Resolved Path Value');
    expect(resolvedProps.value.label).toBe('Resolved Function Value');
    expect(resolvedProps.value.staticProp).toBe('Static Value');
    expect(resolvedProps.value.type).toBe('SomeComponent');
    expect(resolvedProps.value.id).toBe('123');
  });

  it('should handle undefined or null props gracefully', () => {
    const resolvedProps = useDynamicProps(null as any);
    expect(resolvedProps.value).toEqual({});
  });
  
  it('should ignore internal A2UI properties like type and id from resolution if needed, though they are usually strings', () => {
    const nodeProps = {
      type: 'Text',
      id: 'txt-1',
      value: { path: '/some/path' }
    };
    const resolvedProps = useDynamicProps(nodeProps);
    expect(resolvedProps.value.type).toBe('Text');
    expect(resolvedProps.value.id).toBe('txt-1');
    expect(resolvedProps.value.value).toBe('Resolved Path Value');
  });
});

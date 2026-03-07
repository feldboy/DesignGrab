import { describe, it, expect } from 'vitest';
import { createDesignTree, createElement, ELEMENT_TYPES } from './designTree.js';

describe('ELEMENT_TYPES', () => {
  it('contains all expected types', () => {
    expect(ELEMENT_TYPES).toEqual(['text', 'image', 'shape', 'icon', 'group', 'container']);
  });
});

describe('createDesignTree', () => {
  it('creates a tree with required canvas fields', () => {
    const tree = createDesignTree({ width: 1920, height: 1080, background: '#000' });
    expect(tree.version).toBe('1.0');
    expect(tree.canvas).toEqual({ width: 1920, height: 1080, background: '#000' });
    expect(tree.elements).toEqual([]);
    expect(tree.fonts).toEqual([]);
    expect(tree.colors).toEqual([]);
  });

  it('defaults background to #ffffff', () => {
    const tree = createDesignTree({ width: 800, height: 600 });
    expect(tree.canvas.background).toBe('#ffffff');
  });

  it('passes through elements, fonts, and colors', () => {
    const elements = [{ id: 'e1', type: 'text' }];
    const fonts = [{ name: 'Inter', googleFont: true, confidence: 0.95, alternatives: [] }];
    const colors = [{ hex: '#ff0000', rgb: 'rgb(255,0,0)', usage: 'primary', name: 'Red' }];
    const tree = createDesignTree({ width: 100, height: 100 }, elements, fonts, colors);
    expect(tree.elements).toBe(elements);
    expect(tree.fonts).toBe(fonts);
    expect(tree.colors).toBe(colors);
  });
});

describe('createElement', () => {
  it('creates an element with id, type, and bounds', () => {
    const el = createElement('text', { x: 10, y: 20, w: 100, h: 50 });
    expect(el.id).toMatch(/^el_/);
    expect(el.type).toBe('text');
    expect(el.bounds).toEqual({ x: 10, y: 20, w: 100, h: 50, rotation: 0 });
    expect(el.zIndex).toBe(0);
  });

  it('defaults rotation to 0', () => {
    const el = createElement('shape', { x: 0, y: 0, w: 50, h: 50 });
    expect(el.bounds.rotation).toBe(0);
  });

  it('uses provided rotation', () => {
    const el = createElement('image', { x: 0, y: 0, w: 50, h: 50, rotation: 45 });
    expect(el.bounds.rotation).toBe(45);
  });

  it('includes style when provided', () => {
    const style = { fill: '#ff0000', opacity: 0.8 };
    const el = createElement('shape', { x: 0, y: 0, w: 10, h: 10 }, { style });
    expect(el.style).toEqual(style);
  });

  it('includes text when provided', () => {
    const text = { content: 'Hello', fontSize: 16 };
    const el = createElement('text', { x: 0, y: 0, w: 100, h: 20 }, { text });
    expect(el.text).toEqual(text);
  });

  it('includes children when provided', () => {
    const el = createElement('group', { x: 0, y: 0, w: 200, h: 200 }, { children: ['el_1', 'el_2'] });
    expect(el.children).toEqual(['el_1', 'el_2']);
  });

  it('omits style/text/children when not provided', () => {
    const el = createElement('icon', { x: 0, y: 0, w: 24, h: 24 });
    expect(el).not.toHaveProperty('style');
    expect(el).not.toHaveProperty('text');
    expect(el).not.toHaveProperty('children');
  });

  it('generates unique IDs', () => {
    const a = createElement('text', { x: 0, y: 0, w: 1, h: 1 });
    const b = createElement('text', { x: 0, y: 0, w: 1, h: 1 });
    expect(a.id).not.toBe(b.id);
  });
});

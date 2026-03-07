/**
 * DesignTree — unified intermediate format between AI image analysis and code generation.
 * Used by PixelForge to represent analyzed designs as a structured tree.
 * @module designTree
 */

/** Valid element types for DesignTree nodes */
export const ELEMENT_TYPES = ['text', 'image', 'shape', 'icon', 'group', 'container'];

/**
 * Generate a unique element ID.
 * @returns {string}
 */
const generateId = () => 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

/**
 * Create a DesignTree object — the root schema for a parsed design.
 * @param {{ width: number, height: number, background: string }} canvas
 * @param {Array} elements - Array of DesignElement objects
 * @param {Array<{ name: string, googleFont: boolean, confidence: number, alternatives: string[] }>} fonts
 * @param {Array<{ hex: string, rgb: string, usage: string, name: string }>} colors
 * @returns {{ version: string, canvas: object, elements: Array, fonts: Array, colors: Array }}
 */
export const createDesignTree = (canvas, elements = [], fonts = [], colors = []) => ({
  version: '1.0',
  canvas: {
    width: canvas.width,
    height: canvas.height,
    background: canvas.background || '#ffffff',
  },
  elements,
  fonts,
  colors,
});

/**
 * Create a single DesignElement with an auto-generated ID.
 * @param {'text'|'image'|'shape'|'icon'|'group'|'container'} type
 * @param {{ x: number, y: number, w: number, h: number, rotation?: number }} bounds
 * @param {{ style?: object, text?: object, children?: string[], zIndex?: number }} [options={}]
 * @returns {object} DesignElement
 */
export const createElement = (type, bounds, options = {}) => ({
  id: generateId(),
  type,
  bounds: { x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h, rotation: bounds.rotation || 0 },
  zIndex: options.zIndex ?? 0,
  ...(options.style && { style: options.style }),
  ...(options.text && { text: options.text }),
  ...(options.children && { children: options.children }),
});

/**
 * Validate a single DesignElement.
 * @param {object} element
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateElement = (element) => {
  const errors = [];

  if (!element.id) errors.push('Element missing id');
  if (!element.type) errors.push(`Element ${element.id || '?'} missing type`);
  else if (!ELEMENT_TYPES.includes(element.type)) {
    errors.push(`Element ${element.id} has invalid type "${element.type}"`);
  }
  if (!element.bounds) {
    errors.push(`Element ${element.id || '?'} missing bounds`);
  } else {
    for (const key of ['x', 'y', 'w', 'h']) {
      if (typeof element.bounds[key] !== 'number') {
        errors.push(`Element ${element.id} bounds.${key} must be a number`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate an entire DesignTree structure.
 * Checks version, canvas dimensions, element validity, and children references.
 * @param {object} tree
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateDesignTree = (tree) => {
  const errors = [];

  if (!tree.version) errors.push('Missing version');
  if (!tree.canvas) {
    errors.push('Missing canvas');
  } else {
    if (typeof tree.canvas.width !== 'number') errors.push('canvas.width must be a number');
    if (typeof tree.canvas.height !== 'number') errors.push('canvas.height must be a number');
  }

  if (!Array.isArray(tree.elements)) {
    errors.push('elements must be an array');
  } else {
    const ids = new Set(tree.elements.map((el) => el.id));

    for (const element of tree.elements) {
      const result = validateElement(element);
      errors.push(...result.errors);

      // Validate children references point to existing element IDs
      if (Array.isArray(element.children)) {
        for (const childId of element.children) {
          if (!ids.has(childId)) {
            errors.push(`Element ${element.id} references non-existent child "${childId}"`);
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error('[DesignGrab:designTree]', 'Validation failed:', errors);
  }

  return { valid: errors.length === 0, errors };
};

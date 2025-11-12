/**
 * Application constants and configuration values
 */

// Default form values
export const DEFAULT_VALUES = {
  STOCK_CODE: 'TEST-SKU-001',
  WAREHOUSE: 'MAIN-WH',
  BIN: 'A1-R2-S3',
  PRODUCT_CLASS: 'Electronics',
} as const;

// QR Code configuration
export const QR_CODE_CONFIG = {
  SIZE: {
    MIN: 100,
    MAX: 500,
    DEFAULT: 250,
    STEP: 10,
  },
  ERROR_CORRECTION_LEVEL: 'H' as const,
  MARGIN: 1,
} as const;

// Text size configuration
export const TEXT_SIZE_CONFIG = {
  MIN: 8,
  MAX: 24,
  DEFAULT: 14,
  STEP: 1,
} as const;

// QR Code data format template
export const QR_DATA_FORMAT = {
  STOCK_CODE_PREFIX: '[S]',
  WAREHOUSE_PREFIX: '[W]',
  BIN_PREFIX: '[B]',
  PRODUCT_CLASS_PREFIX: '[P]',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  ALL_FIELDS_REQUIRED: 'All fields are required.',
  QR_GENERATION_FAILED: 'Failed to generate QR code. Please try again.',
  INVALID_STOCK_CODE: 'Invalid stock code format.',
  INVALID_WAREHOUSE: 'Invalid warehouse format.',
  INVALID_BIN: 'Invalid bin location format.',
  INVALID_PRODUCT_CLASS: 'Invalid product class.',
  ROOT_ELEMENT_NOT_FOUND: 'Could not find root element to mount to',
} as const;

// Validation patterns (RegEx)
export const VALIDATION_PATTERNS = {
  // Alphanumeric with hyphens and underscores
  STOCK_CODE: /^[A-Za-z0-9_-]+$/,
  // Alphanumeric with hyphens
  WAREHOUSE: /^[A-Za-z0-9-]+$/,
  // Alphanumeric with hyphens for bin locations (e.g., A1-R2-S3)
  BIN: /^[A-Za-z0-9-]+$/,
  // Alphabetic characters and spaces
  PRODUCT_CLASS: /^[A-Za-z\s]+$/,
} as const;

// DOM element IDs
export const ELEMENT_IDS = {
  ROOT: 'root',
  PRINTABLE_AREA: 'printable-area',
  QR_CODE_IMAGE: 'qr-code-image',
} as const;

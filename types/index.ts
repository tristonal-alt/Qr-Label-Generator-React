/**
 * Centralized type definitions for the QR Code Label Generator
 */

/**
 * Display data for the QR code label
 */
export interface DisplayData {
  stockCode: string;
  warehouse: string;
  bin: string;
  productClass: string;
}

/**
 * Props for the QrCodeDisplay component
 */
export interface QrCodeDisplayProps extends DisplayData {
  qrCodeUrl: string;
  qrCodeSize: number;
  textSize: number;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Field validation result with field name
 */
export interface FieldValidationResult extends ValidationResult {
  field: keyof DisplayData;
}

/**
 * QR code generation options
 */
export interface QRCodeOptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  type: 'image/png' | 'image/jpeg' | 'image/webp';
  margin: number;
  width: number;
}

/**
 * Form field configuration
 */
export interface FormField {
  id: string;
  label: string;
  value: string;
  setter: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

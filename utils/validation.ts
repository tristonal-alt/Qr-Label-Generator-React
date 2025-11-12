/**
 * Validation utilities for form inputs
 */

import { VALIDATION_PATTERNS, ERROR_MESSAGES } from '../constants';
import type { ValidationResult, DisplayData } from '../types';

/**
 * Validates a stock code
 */
export const validateStockCode = (stockCode: string): ValidationResult => {
  if (!stockCode.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.ALL_FIELDS_REQUIRED,
    };
  }

  if (!VALIDATION_PATTERNS.STOCK_CODE.test(stockCode)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_STOCK_CODE,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates a warehouse code
 */
export const validateWarehouse = (warehouse: string): ValidationResult => {
  if (!warehouse.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.ALL_FIELDS_REQUIRED,
    };
  }

  if (!VALIDATION_PATTERNS.WAREHOUSE.test(warehouse)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_WAREHOUSE,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates a bin location
 */
export const validateBin = (bin: string): ValidationResult => {
  if (!bin.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.ALL_FIELDS_REQUIRED,
    };
  }

  if (!VALIDATION_PATTERNS.BIN.test(bin)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_BIN,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates a product class
 */
export const validateProductClass = (productClass: string): ValidationResult => {
  if (!productClass.trim()) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.ALL_FIELDS_REQUIRED,
    };
  }

  if (!VALIDATION_PATTERNS.PRODUCT_CLASS.test(productClass)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_PRODUCT_CLASS,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates all form fields
 */
export const validateAllFields = (data: DisplayData): ValidationResult => {
  const stockCodeValidation = validateStockCode(data.stockCode);
  if (!stockCodeValidation.isValid) {
    return stockCodeValidation;
  }

  const warehouseValidation = validateWarehouse(data.warehouse);
  if (!warehouseValidation.isValid) {
    return warehouseValidation;
  }

  const binValidation = validateBin(data.bin);
  if (!binValidation.isValid) {
    return binValidation;
  }

  const productClassValidation = validateProductClass(data.productClass);
  if (!productClassValidation.isValid) {
    return productClassValidation;
  }

  return { isValid: true, error: null };
};

/**
 * Generates QR code data string from display data
 */
export const generateQRData = (data: DisplayData): string => {
  const { STOCK_CODE_PREFIX, WAREHOUSE_PREFIX, BIN_PREFIX, PRODUCT_CLASS_PREFIX } =
    require('../constants').QR_DATA_FORMAT;

  return `${STOCK_CODE_PREFIX}${data.stockCode}${WAREHOUSE_PREFIX}${data.warehouse}${BIN_PREFIX}${data.bin}${PRODUCT_CLASS_PREFIX}${data.productClass}`;
};

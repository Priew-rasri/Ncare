import { describe, it, expect } from 'vitest';
import type { Product, SaleRecord, Customer } from '../types';

/**
 * Utility Functions for Testing
 */

// Calculate VAT
export function calculateVAT(amount: number, rate: number): number {
  return Number((amount * (rate / (100 + rate))).toFixed(2));
}

// Calculate Points Earned
export function calculatePointsEarned(netTotal: number): number {
  return Math.floor(netTotal / 20);
}

// Calculate Customer Tier
export function getCustomerTier(totalSpent: number): string {
  if (totalSpent > 100000) return 'PLATINUM';
  if (totalSpent > 20000) return 'GOLD';
  if (totalSpent > 5000) return 'SILVER';
  return 'MEMBER';
}

// Check if product is low stock
export function isLowStock(product: Product): boolean {
  return product.stock <= product.minStock;
}

// Format currency
export function formatCurrency(amount: number): string {
  return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Validate barcode (EAN-13)
export function validateEAN13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;

  const digits = barcode.split('').map(Number);
  const checksum = digits.pop();

  const sum = digits.reduce((acc, digit, index) => {
    return acc + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);

  const calculatedChecksum = (10 - (sum % 10)) % 10;
  return checksum === calculatedChecksum;
}

// ==================== TESTS ====================

describe('VAT Calculation', () => {
  it('should calculate correct VAT for 7% rate', () => {
    expect(calculateVAT(107, 7)).toBe(7);
    expect(calculateVAT(214, 7)).toBe(14);
  });

  it('should handle zero amount', () => {
    expect(calculateVAT(0, 7)).toBe(0);
  });

  it('should round to 2 decimal places', () => {
    expect(calculateVAT(100, 7)).toBe(6.54);
  });
});

describe('Points System', () => {
  it('should calculate points correctly (1 point per 20 baht)', () => {
    expect(calculatePointsEarned(100)).toBe(5);
    expect(calculatePointsEarned(199)).toBe(9);
    expect(calculatePointsEarned(200)).toBe(10);
  });

  it('should round down fractional points', () => {
    expect(calculatePointsEarned(19)).toBe(0);
    expect(calculatePointsEarned(39)).toBe(1);
  });
});

describe('Customer Tier', () => {
  it('should return correct tier based on total spent', () => {
    expect(getCustomerTier(1000)).toBe('MEMBER');
    expect(getCustomerTier(10000)).toBe('SILVER');
    expect(getCustomerTier(50000)).toBe('GOLD');
    expect(getCustomerTier(150000)).toBe('PLATINUM');
  });

  it('should handle boundary values', () => {
    expect(getCustomerTier(5000)).toBe('MEMBER');
    expect(getCustomerTier(5001)).toBe('SILVER');
    expect(getCustomerTier(20000)).toBe('SILVER');
    expect(getCustomerTier(20001)).toBe('GOLD');
  });
});

describe('Low Stock Detection', () => {
  it('should identify low stock products', () => {
    const lowStockProduct: Product = {
      id: 'P001',
      barcode: '123',
      name: 'Test Product',
      genericName: 'Generic',
      category: 'PAIN_FEVER' as any,
      manufacturer: 'Test',
      location: 'A1',
      price: 100,
      cost: 50,
      stock: 5,
      minStock: 10,
      unit: 'box',
      batches: [],
      isVatExempt: true
    };

    expect(isLowStock(lowStockProduct)).toBe(true);
  });

  it('should not flag products with sufficient stock', () => {
    const sufficientStockProduct: Product = {
      id: 'P002',
      barcode: '456',
      name: 'Test Product 2',
      genericName: 'Generic',
      category: 'PAIN_FEVER' as any,
      manufacturer: 'Test',
      location: 'A2',
      price: 100,
      cost: 50,
      stock: 50,
      minStock: 10,
      unit: 'box',
      batches: [],
      isVatExempt: true
    };

    expect(isLowStock(sufficientStockProduct)).toBe(false);
  });
});

describe('Currency Formatting', () => {
  it('should format currency with Thai baht symbol', () => {
    expect(formatCurrency(100)).toBe('฿100.00');
    expect(formatCurrency(1234.56)).toBe('฿1,234.56');
  });

  it('should handle decimal values', () => {
    expect(formatCurrency(99.9)).toBe('฿99.90');
    expect(formatCurrency(0.5)).toBe('฿0.50');
  });
});

describe('Barcode Validation', () => {
  it('should validate correct EAN-13 barcodes', () => {
    expect(validateEAN13('8850123456789')).toBe(true);
    expect(validateEAN13('5901234123457')).toBe(true);
  });

  it('should reject invalid barcodes', () => {
    expect(validateEAN13('1234567890123')).toBe(false); // Wrong checksum
    expect(validateEAN13('12345')).toBe(false); // Too short
    expect(validateEAN13('abcdefghijklm')).toBe(false); // Not numeric
  });
});

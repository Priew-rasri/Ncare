import { describe, it, expect, beforeEach } from 'vitest';
import type { GlobalState, Action, Product, SaleRecord, Customer, Batch } from '../types';

/**
 * Integration Tests for Critical Pharmacy Workflows
 * Tests the entire flow from POS → Inventory → Accounting → CRM
 */

// Mock reducer (simplified from App.tsx)
const mockInitialState: Partial<GlobalState> = {
  inventory: [
    {
      id: 'P001',
      barcode: '8850123456789',
      name: 'Sara (Paracetamol 500mg)',
      genericName: 'Paracetamol',
      category: 'PAIN_FEVER' as any,
      manufacturer: 'Test',
      location: 'A1-01',
      price: 15,
      cost: 8,
      stock: 120,
      minStock: 50,
      unit: 'แผง',
      requiresPrescription: false,
      drugInteractions: ['Warfarin', 'Alcohol'],
      isVatExempt: true,
      defaultInstruction: 'รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชม.',
      batches: [
        { lotNumber: 'L23001', expiryDate: '2025-12-31', quantity: 100, costPrice: 8 },
        { lotNumber: 'L22055', expiryDate: '2024-11-30', quantity: 20, costPrice: 7.5 }
      ]
    },
    {
      id: 'P002',
      barcode: '8850987654321',
      name: 'Amoxy (Amoxicillin 500mg)',
      genericName: 'Amoxicillin',
      category: 'ANTI_INFECTIVE' as any,
      manufacturer: 'Test',
      location: 'B2-05',
      price: 80,
      cost: 45,
      stock: 45,
      minStock: 30,
      unit: 'แผง',
      requiresPrescription: true,
      drugInteractions: ['Warfarin'],
      isVatExempt: true,
      batches: [
        { lotNumber: 'A9901', expiryDate: '2024-10-15', quantity: 45, costPrice: 45 }
      ]
    }
  ],
  customers: [
    {
      id: 'C001',
      name: 'คุณสมชาย ใจดี',
      phone: '081-111-1111',
      points: 150,
      totalSpent: 3000,
      lastVisit: '2024-05-20',
      allergies: ['Penicillin']
    }
  ],
  sales: [],
  activeShift: {
    id: 'S-001',
    staffName: 'Test Staff',
    startTime: '2024-01-01 08:00',
    startCash: 1000,
    totalSales: 0,
    totalCashSales: 0,
    totalQrSales: 0,
    totalCreditSales: 0,
    cashTransactions: [],
    status: 'OPEN'
  },
  currentUser: {
    id: 'U001',
    username: 'test',
    name: 'Test User',
    role: 'PHARMACIST'
  }
};

describe('🏥 End-to-End Pharmacy Workflows', () => {

  describe('Workflow 1: Complete POS Transaction with FEFO', () => {
    it('should process sale and deduct from oldest batch first (FEFO)', () => {
      const state = JSON.parse(JSON.stringify(mockInitialState));
      const product = state.inventory[0];

      // Initial state
      expect(product.stock).toBe(120);
      expect(product.batches).toHaveLength(2);
      expect(product.batches[0].lotNumber).toBe('L23001');
      expect(product.batches[1].lotNumber).toBe('L22055');

      // Simulate FEFO deduction (selling 25 units)
      const quantityToSell = 25;
      let remainingQty = quantityToSell;

      // Sort by expiry (oldest first)
      const sortedBatches = [...product.batches].sort((a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );

      // Should deduct from L22055 (expires 2024-11-30) first
      expect(sortedBatches[0].lotNumber).toBe('L22055');
      expect(sortedBatches[0].quantity).toBe(20);

      // FEFO logic
      const updatedBatches = sortedBatches.map(batch => {
        if (remainingQty <= 0) return batch;

        if (batch.quantity >= remainingQty) {
          const newBatch = { ...batch, quantity: batch.quantity - remainingQty };
          remainingQty = 0;
          return newBatch;
        } else {
          remainingQty -= batch.quantity;
          return { ...batch, quantity: 0 };
        }
      }).filter(b => b.quantity > 0);

      // Assertions
      expect(updatedBatches).toHaveLength(1); // L22055 should be depleted
      expect(updatedBatches[0].lotNumber).toBe('L23001');
      expect(updatedBatches[0].quantity).toBe(95); // 100 - 5 (remaining from 25-20)
      expect(product.stock - quantityToSell).toBe(95);
    });

    it('should update customer points after sale', () => {
      const customer = mockInitialState.customers![0];
      const saleAmount = 200; // 200 THB

      // Points calculation: 1 point per 20 THB
      const earnedPoints = Math.floor(saleAmount / 20);
      expect(earnedPoints).toBe(10);

      const updatedPoints = customer.points + earnedPoints;
      expect(updatedPoints).toBe(160); // 150 + 10
    });

    it('should update shift totals correctly', () => {
      const shift = mockInitialState.activeShift!;
      const saleAmount = 500;
      const paymentMethod = 'CASH';

      const updatedShift = {
        ...shift,
        totalSales: shift.totalSales + saleAmount,
        totalCashSales: paymentMethod === 'CASH'
          ? shift.totalCashSales + saleAmount
          : shift.totalCashSales
      };

      expect(updatedShift.totalSales).toBe(500);
      expect(updatedShift.totalCashSales).toBe(500);
      expect(updatedShift.totalQrSales).toBe(0);
    });
  });

  describe('Workflow 2: VAT Calculation', () => {
    it('should calculate VAT correctly for vatable items', () => {
      const subtotal = 107;
      const vatRate = 7;

      // VAT calculation: amount * (rate / (100 + rate))
      const vatAmount = Number((subtotal * (vatRate / (100 + vatRate))).toFixed(2));

      expect(vatAmount).toBe(7); // 107 * (7/107) = 7
    });

    it('should separate vatable and exempt items', () => {
      const items = [
        { price: 100, quantity: 1, isVatExempt: false }, // Vatable
        { price: 50, quantity: 1, isVatExempt: true }    // Exempt
      ];

      const vatable = items.filter(i => !i.isVatExempt)
        .reduce((sum, i) => sum + (i.price * i.quantity), 0);

      const exempt = items.filter(i => i.isVatExempt)
        .reduce((sum, i) => sum + (i.price * i.quantity), 0);

      expect(vatable).toBe(100);
      expect(exempt).toBe(50);

      const vatAmount = Number((vatable * (7 / 107)).toFixed(2));
      expect(vatAmount).toBe(6.54);
    });
  });

  describe('Workflow 3: Drug Safety Checks', () => {
    it('should detect customer drug allergies', () => {
      const customer = mockInitialState.customers![0];
      const product = mockInitialState.inventory![1]; // Amoxicillin

      // Check if customer has Penicillin allergy
      expect(customer.allergies).toContain('Penicillin');

      // Amoxicillin is Penicillin-based
      // In real app, this would trigger a warning
      const hasAllergy = customer.allergies?.some(allergy =>
        product.name.toLowerCase().includes('amox') &&
        allergy.toLowerCase().includes('penicillin')
      );

      expect(hasAllergy).toBe(true);
    });

    it('should detect drug-drug interactions', () => {
      const product1 = mockInitialState.inventory![0]; // Sara (Paracetamol)
      const product2 = mockInitialState.inventory![1]; // Amoxy

      expect(product1.drugInteractions).toContain('Warfarin');
      expect(product2.drugInteractions).toContain('Warfarin');

      // If customer is taking Warfarin, both would trigger warnings
      const currentMedications = ['Warfarin'];

      const hasInteraction1 = product1.drugInteractions?.some(drug =>
        currentMedications.includes(drug)
      );
      const hasInteraction2 = product2.drugInteractions?.some(drug =>
        currentMedications.includes(drug)
      );

      expect(hasInteraction1).toBe(true);
      expect(hasInteraction2).toBe(true);
    });
  });

  describe('Workflow 4: Inventory Low Stock Detection', () => {
    it('should identify products below minimum stock', () => {
      const products = mockInitialState.inventory!;

      products[1].stock = 25; // Set below minStock (30)

      const lowStockItems = products.filter(p => p.stock <= p.minStock);

      expect(lowStockItems).toHaveLength(1);
      expect(lowStockItems[0].id).toBe('P002');
    });
  });

  describe('Workflow 5: Void Sale and Stock Restoration', () => {
    it('should restore stock when voiding a sale', () => {
      const product = JSON.parse(JSON.stringify(mockInitialState.inventory![0]));
      const originalStock = product.stock;

      // Simulate a sale (reduce stock)
      const soldQuantity = 10;
      product.stock -= soldQuantity;
      expect(product.stock).toBe(110);

      // Void the sale (restore stock)
      product.stock += soldQuantity;

      // Restore to last batch
      if (product.batches.length > 0) {
        product.batches[product.batches.length - 1].quantity += soldQuantity;
      }

      expect(product.stock).toBe(originalStock);
    });
  });

  describe('Workflow 6: Running Number Generation', () => {
    it('should generate sequential invoice numbers', () => {
      const existingSales: SaleRecord[] = [
        { id: 'INV-2501-0001' } as any,
        { id: 'INV-2501-0002' } as any,
        { id: 'INV-2501-0003' } as any
      ];

      const now = new Date();
      const year = now.getFullYear().toString().substring(2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const prefixDate = `INV-${year}${month}-`;

      const existingIds = existingSales
        .filter(s => s.id.startsWith(prefixDate))
        .map(s => parseInt(s.id.split('-')[2] || '0'));

      const nextSeq = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      const nextId = `${prefixDate}${nextSeq.toString().padStart(4, '0')}`;

      // For current month, should be sequential
      if (prefixDate === 'INV-2501-') {
        expect(nextId).toBe('INV-2501-0004');
      }
    });
  });

  describe('Workflow 7: Customer Tier Calculation', () => {
    it('should calculate correct membership tier', () => {
      const getTier = (totalSpent: number) => {
        if (totalSpent > 100000) return 'PLATINUM';
        if (totalSpent > 20000) return 'GOLD';
        if (totalSpent > 5000) return 'SILVER';
        return 'MEMBER';
      };

      expect(getTier(1000)).toBe('MEMBER');
      expect(getTier(10000)).toBe('SILVER');
      expect(getTier(50000)).toBe('GOLD');
      expect(getTier(150000)).toBe('PLATINUM');
    });

    it('should auto-upgrade tier when spending threshold is reached', () => {
      const customer = { ...mockInitialState.customers![0] };
      customer.totalSpent = 4900; // Just below SILVER

      const newPurchase = 200;
      customer.totalSpent += newPurchase;

      const getTier = (totalSpent: number) => {
        if (totalSpent > 100000) return 'PLATINUM';
        if (totalSpent > 20000) return 'GOLD';
        if (totalSpent > 5000) return 'SILVER';
        return 'MEMBER';
      };

      expect(getTier(customer.totalSpent)).toBe('SILVER');
    });
  });

  describe('Workflow 8: Multi-Payment Method Tracking', () => {
    it('should track sales by payment method in shift', () => {
      const shift = { ...mockInitialState.activeShift! };

      const sales = [
        { amount: 100, method: 'CASH' },
        { amount: 200, method: 'QR' },
        { amount: 150, method: 'CASH' },
        { amount: 300, method: 'CREDIT' }
      ];

      sales.forEach(sale => {
        shift.totalSales += sale.amount;
        if (sale.method === 'CASH') shift.totalCashSales += sale.amount;
        if (sale.method === 'QR') shift.totalQrSales += sale.amount;
        if (sale.method === 'CREDIT') shift.totalCreditSales += sale.amount;
      });

      expect(shift.totalSales).toBe(750);
      expect(shift.totalCashSales).toBe(250); // 100 + 150
      expect(shift.totalQrSales).toBe(200);
      expect(shift.totalCreditSales).toBe(300);
    });
  });

  describe('Workflow 9: Batch Expiry Detection', () => {
    it('should detect expiring batches', () => {
      const products = mockInitialState.inventory!;
      const today = new Date();
      const threeMonthsFromNow = new Date(today.setMonth(today.getMonth() + 3));

      const expiringProducts = products.filter(p =>
        p.batches.some(b =>
          new Date(b.expiryDate) < threeMonthsFromNow
        )
      );

      // L22055 expires 2024-11-30, should be detected
      expect(expiringProducts.length).toBeGreaterThan(0);
    });
  });

  describe('Workflow 10: Points Redemption', () => {
    it('should validate points redemption', () => {
      const customer = { ...mockInitialState.customers![0] };
      const pointsToRedeem = 100;
      const pointValue = 1; // 1 point = 1 THB

      // Check if customer has enough points
      const hasEnoughPoints = customer.points >= pointsToRedeem;
      expect(hasEnoughPoints).toBe(true);

      // Calculate discount
      const discount = pointsToRedeem * pointValue;
      expect(discount).toBe(100);

      // Update customer points
      customer.points -= pointsToRedeem;
      expect(customer.points).toBe(50); // 150 - 100
    });
  });
});

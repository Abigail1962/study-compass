import { describe, it, expect } from 'vitest';

// 模拟你计算器里的格式化逻辑
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD", 
    maximumFractionDigits: 0 
  }).format(n);

describe('Calculator Formatting', () => {
  it('should format numbers as USD currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(25000)).toBe('$25,000');
  });

  it('should handle zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0');
  });
});

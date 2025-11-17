// Sample test file to demonstrate Jest usage
describe('Sample Math Functions', () => {
  
  test('should add two numbers correctly', () => {
    const sum = (a, b) => a + b;
    expect(sum(2, 3)).toBe(5);
  });

  test('should multiply two numbers correctly', () => {
    const multiply = (a, b) => a * b;
    expect(multiply(4, 5)).toBe(20);
  });

  test('should handle negative numbers', () => {
    const sum = (a, b) => a + b;
    expect(sum(-5, 3)).toBe(-2);
  });
});

describe('String Operations', () => {
  
  test('should convert string to uppercase', () => {
    const toUpper = (str) => str.toUpperCase();
    expect(toUpper('hello')).toBe('HELLO');
  });

  test('should trim whitespace', () => {
    const trim = (str) => str.trim();
    expect(trim('  hello world  ')).toBe('hello world');
  });
});

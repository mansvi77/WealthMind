export const rules = {
  Food: ['zomato', 'swiggy', 'restaurant', 'cafe', 'mcdonalds', 'starbucks', 'grocery', 'blinkit', 'instamart'],
  Transport: ['uber', 'ola', 'petrol', 'metro', 'fuel', 'irctc', 'rapido'],
  Utilities: ['electricity', 'water', 'gas', 'recharge', 'wifi', 'broadband', 'jio', 'airtel'],
  Entertainment: ['netflix', 'spotify', 'prime', 'hotstar', 'cinema', 'bookmyshow', 'steam', 'youtube'],
  Investment: ['zerodha', 'groww', 'mutual fund', 'stocks', 'sip', 'crypto'],
};

export function normalizeDescription(desc) {
  if (!desc) return '';
  return desc.toLowerCase().replace(/[0-9]/g, '').replace(/\s+/g, ' ').trim();
}

export function autoCategorize(description, dbCategories = []) {
  const normalized = normalizeDescription(description);

  for (const [categoryName, keywords] of Object.entries(rules)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      const match = dbCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      if (match) return match.id || match.name;
      return categoryName; // Fallback string if working with string category columns
    }
  }

  const directMatch = dbCategories.find(c => normalized.includes(c.name.toLowerCase()));
  if (directMatch) return directMatch.id || directMatch.name;

  return 'Uncategorized';
}
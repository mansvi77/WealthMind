export const rules = {
  Food: ['zomato', 'swiggy', 'restaurant', 'cafe', 'mcdonalds', 'starbucks', 'grocery', 'blinkit', 'instamart'],
  Transport: ['uber', 'ola', 'petrol', 'metro', 'fuel', 'irctc', 'rapido'],
  Utilities: ['electricity', 'water', 'gas', 'recharge', 'wifi', 'broadband', 'jio', 'airtel'],
  Entertainment: ['netflix', 'spotify', 'prime', 'hotstar', 'cinema', 'bookmyshow', 'steam', 'youtube'],
  Investment: ['zerodha', 'groww', 'mutual fund', 'stocks', 'sip', 'crypto'],
};

export function normalizeDescription(desc) {
  if (!desc) return '';
  return desc
    .toLowerCase()
    .replace(/[0-9]/g, '') // Strip transaction numbers or reference IDs
    .replace(/\s+/g, ' ')   // Collapse whitespace
    .trim();
}

export function autoCategorize(description, dbCategories = []) {
  const normalized = normalizeDescription(description);

  // 1. Try matching with custom rule keywords
  for (const [categoryName, keywords] of Object.entries(rules)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      const match = dbCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      if (match) return match.id;
    }
  }

  // 2. Direct string matching fallback against user categories
  const directMatch = dbCategories.find(c => normalized.includes(c.name.toLowerCase()));
  if (directMatch) return directMatch.id;

  // 3. System Default Fallback
  const uncategorized = dbCategories.find(c => c.name.toLowerCase() === 'uncategorized');
  return uncategorized ? uncategorized.id : null;
}
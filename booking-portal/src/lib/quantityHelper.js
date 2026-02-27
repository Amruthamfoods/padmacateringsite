/**
 * Auto-quantity helper for menu items
 * Calculates recommended quantities per guest count based on category name
 */

const CATEGORY_RULES = [
  { keywords: ['starter', 'appetizer', 'snack'],               unit: 'pcs', perPerson: 3 },
  { keywords: ['main course', 'gravy', 'curry', 'dal', 'fry'], unit: 'kg',  perPerson: 0.20 },
  { keywords: ['rice', 'biryani', 'pulao', 'fried rice'],      unit: 'kg',  perPerson: 0.20 },
  { keywords: ['bread', 'roti', 'naan', 'chapati', 'puri'],    unit: 'pcs', perPerson: 3 },
  { keywords: ['dessert', 'sweet', 'halwa', 'kheer', 'payasam'], unit: 'pcs', perPerson: 2 },
  { keywords: ['beverage', 'drink', 'juice', 'lassi', 'buttermilk'], unit: 'pcs', perPerson: 1 },
]

const DEFAULT_RULE = { unit: 'kg', perPerson: 0.15 }

/**
 * Returns auto-calculated quantity for a category
 * @param {string} categoryName - Name of the menu category
 * @param {number} guestCount   - Number of guests
 * @returns {{ amount: number, unit: string }}
 */
export function getAutoQuantity(categoryName, guestCount) {
  const lower = (categoryName || '').toLowerCase()
  const rule = CATEGORY_RULES.find(r => r.keywords.some(k => lower.includes(k))) || DEFAULT_RULE
  const raw = rule.perPerson * guestCount
  const amount = rule.unit === 'kg'
    ? Math.round(raw * 10) / 10  // 1 decimal place for kg
    : Math.round(raw)            // whole number for pcs
  return { amount, unit: rule.unit }
}

/**
 * Format quantity for display
 * @param {number} amount
 * @param {string} unit
 * @returns {string}
 */
export function formatQuantity(amount, unit) {
  if (unit === 'kg') return `${amount} kg`
  return `${amount} pcs`
}

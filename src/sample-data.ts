import type { Category } from './types'

export const SAMPLE_CATEGORIES: Category[] = [
  { id: '1', name: '🥬 Fruit & Veg', order: 0 },
  { id: '2', name: '🥛 Dairy', order: 1 },
  { id: '3', name: '🥩 Meat & Fish', order: 2 },
  { id: '4', name: '🥫 Pantry', order: 3 },
  { id: '5', name: '❄️ Frozen', order: 4 },
  { id: '6', name: '🍞 Bakery', order: 5 },
  { id: '7', name: '🥚 Eggs & Proteins', order: 6 },
  { id: '8', name: '🧀 Cheese & Dairy Alt', order: 7 },
  { id: '9', name: '🥤 Beverages', order: 8 },
  { id: '10', name: '🍫 Snacks & Sweets', order: 9 },
  { id: '11', name: '🧂 Seasonings & Oils', order: 10 },
  { id: '12', name: '🧃 Condiments', order: 11 },
]

export const SAMPLE_ITEMS: Record<string, {id: string, text: string, createdAt: number}[]> = {
  '1': [
    { id: '1-1', text: '🍎 Apples', createdAt: 1675795200000 }, 
    { id: '1-2', text: '🥕 Carrots', createdAt: 1675795200001 },
    { id: '1-3', text: '🍌 Bananas', createdAt: 1675795200002 },
    { id: '1-4', text: '🥦 Broccoli', createdAt: 1675795200003 },
    { id: '1-5', text: '🧅 Onions', createdAt: 1675795200004 }
  ],
  '2': [
    { id: '2-1', text: '🥛 Milk', createdAt: 1675795200005 }, 
    { id: '2-2', text: '🧀 Cheese', createdAt: 1675795200006 },
    { id: '2-3', text: '🧈 Butter', createdAt: 1675795200007 },
    { id: '2-4', text: 'Yogurt', createdAt: 1675795200008 }
  ],
  '3': [
    { id: '3-1', text: '🐔 Chicken Breast', createdAt: 1675795200009 },
    { id: '3-2', text: '🐟 Salmon', createdAt: 1675795200010 },
    { id: '3-3', text: 'Ground Beef', createdAt: 1675795200011 }
  ],
  '4': [
    { id: '4-1', text: '🍚 Rice', createdAt: 1675795200012 },
    { id: '4-2', text: '🍝 Pasta', createdAt: 1675795200013 },
    { id: '4-3', text: 'Canned Tomatoes', createdAt: 1675795200014 }
  ],
  '5': [
    { id: '5-1', text: ' Peas', createdAt: 1675795200015 },
    { id: '5-2', text: 'Ice Cream', createdAt: 1675795200016 }
  ],
  '6': [
    { id: '6-1', text: '🍞 Bread', createdAt: 1675795200017 },
    { id: '6-2', text: 'Bagels', createdAt: 1675795200018 }
  ],
  '7': [
    { id: '7-1', text: '🥚 Eggs', createdAt: 1675795200019 }
  ],
  '8': [
    { id: '8-1', text: 'Cheddar Cheese', createdAt: 1675795200020 },
    { id: '8-2', text: 'Almond Milk', createdAt: 1675795200021 }
  ],
  '9': [
    { id: '9-1', text: 'Orange Juice', createdAt: 1675795200022 },
    { id: '9-2', text: 'Sparkling Water', createdAt: 1675795200023 }
  ],
  '10': [
    { id: '10-1', text: 'Chocolate Bar', createdAt: 1675795200024 },
    { id: '10-2', text: 'Potato Chips', createdAt: 1675795200025 }
  ],
  '11': [
    { id: '11-1', text: 'Olive Oil', createdAt: 1675795200026 },
    { id: '11-2', text: 'Salt', createdAt: 1675795200027 },
    { id: '11-3', text: 'Black Pepper', createdAt: 1675795200028 }
  ],
  '12': [
    { id: '12-1', text: 'Ketchup', createdAt: 1675795200029 },
    { id: '12-2', text: 'Mayonnaise', createdAt: 1675795200030 }
  ],
}

import type { Category, ItemsMap } from './types'

export const SAMPLE_CATEGORIES: Category[] = [
  { id: '1', name: '🥬 Fruit & Veg', color: '#E8F5E9' },
  { id: '2', name: '🥛 Dairy', color: '#F3E5F5' },
  { id: '3', name: '🥩 Meat & Fish', color: '#FFEBEE' },
  { id: '4', name: '🥫 Pantry', color: '#FFF3E0' },
  { id: '5', name: '❄️ Frozen', color: '#E0F2F1' },
  { id: '6', name: '🍞 Bakery', color: '#FCE4EC' },
  { id: '7', name: '🥚 Eggs & Proteins', color: '#FFF9C4' },
  { id: '8', name: '🧀 Cheese & Dairy Alt', color: '#F1F8E9' },
  { id: '9', name: '🥤 Beverages', color: '#E3F2FD' },
  { id: '10', name: '🍫 Snacks & Sweets', color: '#F8BBD0' },
  { id: '11', name: '🧂 Seasonings & Oils', color: '#FFECB3' },
  { id: '12', name: '🧃 Condiments', color: '#B2DFDB' },
]

export const SAMPLE_ITEMS: ItemsMap = {
  '1': [
    { id: '1-1', text: '🍎 Apples' }, 
    { id: '1-2', text: '🥕 Carrots' },
    { id: '1-3', text: '🍌 Bananas' },
    { id: '1-4', text: '🥦 Broccoli' },
    { id: '1-5', text: '🧅 Onions' }
  ],
  '2': [
    { id: '2-1', text: '🥛 Milk' }, 
    { id: '2-2', text: '🧀 Cheese' },
    { id: '2-3', text: '🧈 Butter' },
    { id: '2-4', text: 'Yogurt' }
  ],
  '3': [
    { id: '3-1', text: '🐔 Chicken Breast' },
    { id: '3-2', text: '🐟 Salmon' },
    { id: '3-3', text: 'Ground Beef' }
  ],
  '4': [
    { id: '4-1', text: '🍚 Rice' },
    { id: '4-2', text: '🍝 Pasta' },
    { id: '4-3', text: 'Canned Tomatoes' }
  ],
  '5': [
    { id: '5-1', text: ' Peas' },
    { id: '5-2', text: 'Ice Cream' }
  ],
  '6': [
    { id: '6-1', text: '🍞 Bread' },
    { id: '6-2', text: 'Bagels' }
  ],
  '7': [
    { id: '7-1', text: '🥚 Eggs' }
  ],
  '8': [
    { id: '8-1', text: 'Cheddar Cheese' },
    { id: '8-2', text: 'Almond Milk' }
  ],
  '9': [
    { id: '9-1', text: 'Orange Juice' },
    { id: '9-2', text: 'Sparkling Water' }
  ],
  '10': [
    { id: '10-1', text: 'Chocolate Bar' },
    { id: '10-2', text: 'Potato Chips' }
  ],
  '11': [
    { id: '11-1', text: 'Olive Oil' },
    { id: '11-2', text: 'Salt' },
    { id: '11-3', text: 'Black Pepper' }
  ],
  '12': [
    { id: '12-1', text: 'Ketchup' },
    { id: '12-2', text: 'Mayonnaise' }
  ],
}
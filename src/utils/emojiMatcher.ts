// Map of keywords to emojis for shopping list items
const EMOJI_MAP: Record<string, string> = {
  // Fruits
  'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'lemon': '🍋', 'lime': '🍋',
  'grape': '🍇', 'strawberry': '🍓', 'strawberries': '🍓', 'watermelon': '🍉',
  'melon': '🍈', 'peach': '🍑', 'pear': '🍐', 'cherry': '🍒', 'cherries': '🍒',
  'kiwi': '🥝', 'mango': '🥭', 'pineapple': '🍍', 'coconut': '🥥', 'avocado': '🥑',
  
  // Vegetables
  'tomato': '🍅', 'carrot': '🥕', 'corn': '🌽', 'pepper': '🫑', 'broccoli': '🥦',
  'lettuce': '🥬', 'cucumber': '🥒', 'potato': '🥔', 'onion': '🧅', 'garlic': '🧄',
  'mushroom': '🍄', 'eggplant': '🍆',
  
  // Dairy
  'milk': '🥛', 'cheese': '🧀', 'butter': '🧈', 'egg': '🥚', 'eggs': '🥚',
  
  // Meat & Protein
  'chicken': '🍗', 'bacon': '🥓', 'steak': '🥩', 'meat': '🥩', 'fish': '🐟', 'shrimp': '🍤',
  
  // Bakery
  'bread': '🍞', 'bagel': '🥯', 'croissant': '🥐', 'baguette': '🥖',
  
  // Beverages
  'coffee': '☕', 'tea': '🍵', 'juice': '🧃', 'soda': '🥤', 'water': '💧', 'wine': '🍷', 'beer': '🍺',
  
  // Snacks & Sweets
  'cookie': '🍪', 'cookies': '🍪', 'chocolate': '🍫', 'candy': '🍬', 'ice cream': '🍦',
  'donut': '🍩', 'cake': '🍰', 'pie': '🥧', 'popcorn': '🍿', 'chips': '🥨',
  
  // Condiments
  'ketchup': '🍅', 'mustard': '🌭', 'mayo': '🥚', 'mayonnaise': '🥚', 'honey': '🍯', 'jam': '🍓',
  
  // Pantry
  'rice': '🍚', 'pasta': '🍝', 'cereal': '🥣', 'soup': '🥫', 'beans': '🫘',
  
  // Other
  'pizza': '🍕', 'burger': '🍔', 'taco': '🌮', 'burrito': '🌯', 'sandwich': '🥪',
  'salad': '🥗', 'peanut': '🥜', 'peanuts': '🥜', 'salt': '🧂', 'oil': '🫒',
}

export function findEmojiForItem(itemText: string): string | null {
  const lowerText = itemText.toLowerCase().trim()
  
  // Check for exact matches
  if (EMOJI_MAP[lowerText]) {
    return EMOJI_MAP[lowerText]
  }
  
  // Check if any keyword is contained in the text
  for (const [keyword, emoji] of Object.entries(EMOJI_MAP)) {
    if (lowerText.includes(keyword)) {
      return emoji
    }
  }
  
  return null
}

export function addEmojiToItem(itemText: string): string {
  const emoji = findEmojiForItem(itemText)
  if (emoji && !itemText.includes(emoji)) {
    return `${emoji} ${itemText}`
  }
  return itemText
}

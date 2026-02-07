// Map of keywords to emojis for shopping list items
const EMOJI_MAP: Record<string, string> = {
  // Fruits
  'apple': '🍎', 'apples': '🍎', 'banana': '🍌', 'bananas': '🍌', 'orange': '🍊', 'oranges': '🍊', 
  'lemon': '🍋', 'lemons': '🍋', 'lime': '🍋', 'limes': '🍋', 'grape': '🍇', 'grapes': '🍇', 
  'strawberry': '🍓', 'strawberries': '🍓', 'watermelon': '🍉', 'watermelons': '🍉',
  'melon': '🍈', 'melons': '🍈', 'peach': '🍑', 'peaches': '🍑', 'pear': '🍐', 'pears': '🍐', 
  'cherry': '🍒', 'cherries': '🍒', 'kiwi': '🥝', 'kiwis': '🥝', 'mango': '🥭', 'mangos': '🥭', 
  'pineapple': '🍍', 'pineapples': '🍍', 'coconut': '🥥', 'coconuts': '🥥', 'avocado': '🥑', 'avocados': '🥑',
  
  // Vegetables
  'tomato': '🍅', 'tomatoes': '🍅', 'carrot': '🥕', 'carrots': '🥕', 'corn': '🌽', 'pepper': '🫑', 'peppers': '🫑', 
  'broccoli': '🥦', 'lettuce': '🥬', 'cucumber': '🥒', 'cucumbers': '🥒', 'potato': '🥔', 'potatoes': '🥔', 
  'onion': '🧅', 'onions': '🧅', 'garlic': '🧄', 'mushroom': '🍄', 'mushrooms': '🍄', 'eggplant': '🍆', 'eggplants': '🍆',
  
  // Dairy
  'milk': '🥛', 'cheese': '🧀', 'butter': '🧈', 'egg': '🥚', 'eggs': '🥚',
  
  // Meat & Protein
  'chicken': '🍗', 'chickens': '🍗', 'bacon': '🥓', 'steak': '🥩', 'steaks': '🥩', 'meat': '🥩', 'fish': '🐟', 'shrimp': '🍤',
  
  // Bakery
  'bread': '🍞', 'bagel': '🥯', 'bagels': '🥯', 'croissant': '🥐', 'croissants': '🥐', 'baguette': '🥖', 'baguettes': '🥖',
  
  // Beverages
  'coffee': '☕', 'tea': '🍵', 'juice': '🧃', 'soda': '🥤', 'sodas': '🥤', 'water': '💧', 'wine': '🍷', 'wines': '🍷', 'beer': '🍺', 'beers': '🍺',
  
  // Snacks & Sweets
  'cookie': '🍪', 'cookies': '🍪', 'chocolate': '🍫', 'candy': '🍬', 'candies': '🍬', 'ice cream': '🍦',
  'donut': '🍩', 'donuts': '🍩', 'cake': '🍰', 'cakes': '🍰', 'pie': '🥧', 'pies': '🥧', 'popcorn': '🍿', 'chips': '🥨',
  
  // Condiments
  'ketchup': '🍅', 'mustard': '🌭', 'mayo': '🥚', 'mayonnaise': '🥚', 'honey': '🍯', 'jam': '🍓',
  
  // Pantry
  'rice': '🍚', 'pasta': '🍝', 'cereal': '🥣', 'soup': '🥫', 'soups': '🥫', 'beans': '🫘',
  
  // Other
  'pizza': '🍕', 'pizzas': '🍕', 'burger': '🍔', 'burgers': '🍔', 'taco': '🌮', 'tacos': '🌮', 
  'burrito': '🌯', 'burritos': '🌯', 'sandwich': '🥪', 'sandwiches': '🥪', 'salad': '🥗', 'salads': '🥗',
  'peanut': '🥜', 'peanuts': '🥜', 'salt': '🧂', 'oil': '🫒',
}

export function findEmojiForItem(itemText: string): string | null {
  const lowerText = itemText.toLowerCase().trim()
  
  // Check for exact matches
  if (EMOJI_MAP[lowerText]) {
    return EMOJI_MAP[lowerText]
  }
  
  const keywords = Object.keys(EMOJI_MAP).sort((a, b) => b.length - a.length);
  
  // Check if any keyword is contained in the text
  for (const keyword of keywords) {
    const regex = new RegExp(`\b${keyword}\b`, 'i');
    if (regex.test(lowerText)) {
      return EMOJI_MAP[keyword];
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
// Map of keywords to emojis for shopping list items
const EMOJI_MAP: Record<string, string> = {
  // Fruits
  'apple': '🍎', 'apples': '🍎', 'banana': '🍌', 'bananas': '🍌', 'orange': '🍊', 'oranges': '🍊',
  'lemon': '🍋', 'lemons': '🍋', 'lime': '🍋', 'limes': '🍋', 'grape': '🍇', 'grapes': '🍇',
  'strawberry': '🍓', 'strawberries': '🍓', 'blueberry': '🫐', 'blueberries': '🫐', 'raspberry': '🍓', 'raspberries': '🍓',
  'watermelon': '🍉', 'watermelons': '🍉', 'melon': '🍈', 'melons': '🍈', 'peach': '🍑', 'peaches': '🍑', 'pear': '🍐', 'pears': '🍐',
  'cherry': '🍒', 'cherries': '🍒', 'kiwi': '🥝', 'kiwis': '🥝', 'mango': '🥭', 'mangoes': '🥭',
  'pineapple': '🍍', 'pineapples': '🍍', 'coconut': '🥥', 'coconuts': '🥥', 'avocado': '🥑', 'avocados': '🥑',
  'plum': '🍑', 'plums': '🍑', 'apricot': '🍑', 'apricots': '🍑', 'fig': ' अंजीर', 'figs': ' अंजीर',

  // Vegetables
  'tomato': '🍅', 'tomatoes': '🍅', 'carrot': '🥕', 'carrots': '🥕', 'corn': '🌽', 'peppers': '🫑',
  'broccoli': '🥦', 'lettuce': '🥬', 'cucumber': '🥒', 'cucumbers': '🥒', 'potato': '🥔', 'potatoes': '🥔',
  'onion': '🧅', 'onions': '🧅', 'garlic': '🧄', 'mushroom': '🍄', 'mushrooms': '🍄', 'eggplant': '🍆', 'eggplants': '🍆',
  'spinach': '🥬', 'cabbage': '🥬', 'celery': '🥬', 'pumpkin': '🎃', 'pumpkins': '🎃', 'zucchini': '🥒',
  'asparagus': '🥦', 'bell pepper': '🫑', 'bell peppers': '🫑', 'sweet potato': '🍠', 'sweet potatoes': '🍠',
  'radish': 'ředkvička', 'radishes': 'ředkvička', 'artichoke': '🫑', 'artichokes': '🫑', 'peas': '🫛', 'green beans': '🫛',
  'leek': '🧅', 'leeks': '🧅',

  // Dairy & Alternatives
  'milk': '🥛', 'cheese': '🧀', 'butter': '🧈', 'egg': '🥚', 'eggs': '🥚', 'yogurt': '🍦', 'cream': '🥛',
  'almond milk': '🥛', 'soy milk': '🥛', 'oat milk': '🥛', 'cream cheese': '🧀', 'sour cream': '🍦',
  'cottage cheese': '🧀', 'greek yogurt': '🍦', 'whipped cream': '🍦',

  // Meat & Protein
  'chicken': '🍗', 'chickens': '🍗', 'bacon': '🥓', 'sausage': '🌭', 'steak': '🥩', 'steaks': '🥩', 'meat': '🥩',
  'fish': '🐟', 'salmon': '🐟', 'tuna': '🐟', 'shrimp': '🍤', 'ham': '🍖', 'pork': '🍖', 'beef': '🐄', 'turkey': '🦃', 'tofu': '🧈',
  'crab': '🦀', 'lobster': '🦞', 'oysters': '🦪', 'clams': '🦪', 'lamb': '🐑', 'duck': '🦆', 'salami': '🍖', 'pepperoni': '🍕',

  // Bakery
  'bread': '🍞', 'bagel': '🥯', 'bagels': '🥯', 'croissant': '🥐', 'croissants': '🥐', 'baguette': '🥖', 'baguettes': '🥖',
  'muffin': '🧁', 'muffins': '🧁', 'pastry': '🍰', 'pastries': '🍰', 'pancakes': '🥞', 'waffles': '🧇',
  'doughnut': '🍩', 'doughnuts': '🍩', 'pie crust': '🥧', 'pizza dough': '🍕', 'tortilla': '🌮', 'tortillas': '🌮',

  // Beverages
  'coffee': '☕', 'tea': '🍵', 'juice': '🧃', 'soda': '🥤', 'sodas': '🥤', 'water': '💧', 'wine': '🍷', 'wines': '🍷', 'beer': '🍺', 'beers': '🍺',
  'smoothie': '🥤', 'kombucha': '🥤', 'milkshake': '🥤', 'sparkling water': '💧', 'energy drink': '⚡', 'iced tea': '🍹', 'hot chocolate': '☕',

  // Snacks & Sweets
  'cookie': '🍪', 'cookies': '🍪', 'chocolate': '🍫', 'candy': '🍬', 'candies': '🍬', 'ice cream': '🍦',
  'donut': '🍩', 'donuts': '🍩', 'cake': '🍰', 'cakes': '🍰', 'pie': '🥧', 'pies': '🥧', 'popcorn': '🍿', 'chips': '🥨', 'pretzels': '🥨',
  'nuts': '🥜', 'almonds': '🥜', 'cashews': '🥜', 'pistachios': '🥜', 'granola': '🥣', 'crackers': '🥨',
  'granola bar': '🍫', 'dried fruit': '🍇', 'gummy bears': '🍬', 'marshmallows': '🍡', 'cupcake': '🧁', 'cupcakes': '🧁',

  // Condiments & Spices
  'ketchup': '🍅', 'mustard': '🌭', 'mayo': '🥚', 'mayonnaise': '🥚', 'honey': '🍯', 'jam': '🍓', 'syrup': '🍁',
  'hot sauce': '🌶️', 'salsa': '🌶️', 'soy sauce': '醤油', 'vinegar': '🍾', 'spices': '🧂', 'herbs': '🌿',
  'bbq sauce': '🍖', 'pesto': '🌿', 'hummus': '🥣', 'relish': '🥒', 'olive oil': '🫒', 'salt': '🧂', 'pepper': '🧂',
  'cinnamon': '🧂', 'oregano': '🌿', 'basil': '🌿', 'thyme': '🌿', 'rosemary': '🌿', 'garlic powder': '🧄', 'onion powder': '🧅',

  // Pantry
  'rice': '🍚', 'pasta': '🍝', 'cereal': '🥣', 'oats': '🥣', 'oatmeal': '🥣', 'flour': '🌾', 'sugar': '🍚', 'oil': '🫒',
  'soup': '🥫', 'soups': '🥫', 'beans': '🫘', 'lentils': '🫘', 'canned tomatoes': '🥫', 'tuna can': '🥫',
  'quinoa': '🍚', 'chickpeas': '🫘', 'black beans': '🫘', 'lima beans': '🫘', 'baking soda': '🍚', 'baking powder': '🍚',
  'yeast': '🍞', 'vanilla extract': '🍦', 'broth': '🥣', 'stock': '🥣', 'olives': '🫒',

  // Frozen Foods
  'frozen pizza': '🍕', 'frozen vegetables': '🥦', 'frozen fries': '🍟', 'ice cubes': '🧊',
  'frozen fruit': '🍓', 'frozen meals': '🍝', 'ice cream pints': '🍦',

  // Household
  'paper towels': '🧻', 'toilet paper': '🧻', 'tissues': '🤧', 'napkins': '🧻', 'trash bags': '🗑️',
  'dish soap': '🧼', 'laundry detergent': '🧺', 'cleaner': '🧼', 'sponge': '🧽', 'sponges': '🧽', 'light bulb': '💡',
  'batteries': '🔋', 'cleaning wipes': '🧽', 'laundry pods': '🧺', 'aluminum foil': '🍴', 'plastic wrap': '🍴',

  // Personal Care
  'soap': '🧼', 'shampoo': '🧴', 'conditioner': '🧴', 'toothpaste': '🦷', 'toothbrush': '🦷', 'deodorant': ' deodorant', 'lotion': '🧴',
  'sunscreen': '🧴', 'razor': '🪒', 'shaving cream': '🧴', 'band-aid': '🩹', 'mouthwash': '🪥', 'floss': '🦷',
  'cotton balls': '🩹', 'hand sanitizer': '🧴',

  // Baby Items
  'diapers': '🍼', 'baby food': '👶', 'wipes': '🧻', 'formula': '🍼', 'baby wipes': '🧻',

  // Pet Food
  'dog food': '🐶', 'cat food': '🐱', 'bird seed': '🐦', 'fish food': '🐠',

  // Other (General items already covered or very specific)
  'pizza': '🍕', 'pizzas': '🍕', 'burger': '🍔', 'burgers': '🍔', 'taco': '🌮', 'tacos': '🌮',
  'burrito': '🌯', 'burritos': '🌯', 'sandwich': '🥪', 'sandwiches': '🥪', 'salad': '🥗', 'salads': '🥗',
  'peanut': '🥜', 'peanuts': '🥜', 'flower': '🌸', 'flowers': '🌸',
};

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
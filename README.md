# Shopping List App

A beautiful, interactive shopping list application built with React and drag-and-drop functionality.

## Features

- 📦 **Categories**: Organize items into categories (Fruit & Veg, Dairy, Meat & Fish, Pantry, Frozen)
- 🎨 **Customizable**: Add, edit, and delete categories with custom colors
- 🎯 **Drag & Drop**: Drag items between categories and reorder them
- ✅ **Check Items**: Mark items as done
- 📱 **Multiple Views**: 
  - **Categories View**: See all category cards with item counts
  - **All Items View**: See all items in a single flat list with category badges
  - **Single Category View**: Focus on one category at a time
- 🔄 **Bottom Navigation**: Easy switching between views with tab navigation
- 💾 **Persistent Storage**: Your shopping list automatically saves to browser localStorage
- 💅 **Beautiful UI**: Modern, responsive design with smooth animations
- 📱 **Mobile Optimized**: Full touch support and responsive layout for phones and tablets

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How to Use

### Navigation
- **Categories Tab**: View all categories at once (default view)
- **All Items Tab**: View all items grouped by category, click a category to see just those items

### Managing Items
1. **Add Items**: Type in the input field and press Enter or click the Add button
2. **Check Items**: Click the checkbox to mark items as done
3. **Delete Items**: Click the × button next to an item
4. **Drag Items**: Click and drag items to reorder within a category or move between categories

### Managing Categories
1. **Drag Categories**: Click and drag the category header to reorder categories (Categories view)
2. **Manage Categories**: Click "Manage Categories" to add, edit, or delete categories
3. **View Single Category**: In All Items view, click any category to see just those items

## Technologies

- React 18
- Vite
- react-beautiful-dnd (for drag and drop)

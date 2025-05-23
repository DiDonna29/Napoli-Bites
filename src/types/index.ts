export interface PizzaAddon {
  id: string;
  name: string;
  price: number;
}

export interface PizzaSizeOption {
  id: string;
  name: string; // e.g., "Small", "Medium", "Large"
  price: number;
  diameterInches?: number;
}

export interface Pizza {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  basePrice: number; // Price for a default size, or sizes will have their own price
  sizes: PizzaSizeOption[];
  availableAddons: PizzaAddon[];
  category?: string; // e.g., "Vegetarian", "MeatLover"
}

export interface Drink {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  imageHint?: string;
  price: number;
  volume?: string; // e.g., "330ml", "500ml"
  category?: string; // e.g., "Soft Drink", "Alcoholic"
}

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number; // e.g., 2, 4
  status: 'available' | 'occupied' | 'reserved';
  availabilityTime?: string; // Estimated time if occupied/reserved, e.g., "approx. 45 mins"
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
}

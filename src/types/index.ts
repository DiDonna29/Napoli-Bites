
export interface PizzaAddon {
  id: string;
  name: string;
  price: number;
}

export interface PizzaSizeOption {
  id: string;
  name: string; // e.g., "Small", "Medium", "Large"
  price: number; // This is the *additional* price for this size relative to basePrice
  diameterInches?: number;
}

export interface Pizza {
  id: string; // productId
  name: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  basePrice: number; // Price for the default/base size (e.g., small)
  sizes: PizzaSizeOption[];
  availableAddons: PizzaAddon[];
  category?: string; // e.g., "Vegetarian", "MeatLover"
}

export interface Drink {
  id: string; // productId
  name: string;
  description?: string;
  imageUrl: string;
  imageHint?: string;
  price: number; // unit price for drinks
  volume?: string; // e.g., "330ml", "500ml"
  category?: string; // e.g., "Soft Drink", "Alcoholic"
}

export interface Dessert {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  imageHint?: string;
  price: number;
  category?: string;
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

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt: number; // Store as timestamp (Date.now())
  isAdmin?: boolean; // Added for admin role
}

// This is the detailed structure for items in the cart and in an order
export interface OrderItem {
  cartItemId: string; // Unique identifier for this specific cart line item (e.g., pizzaId_sizeId_addonsHash)
  productId: string; // Original product ID (e.g., pizza-1)
  name: string;
  quantity: number;
  unitPrice: number; // Calculated price for one unit of this item with its options
  totalPrice: number; // unitPrice * quantity
  type: 'pizza' | 'drink' | 'dessert';
  size?: PizzaSizeOption['name']; // Store size name for display
  selectedAddons?: PizzaAddon[]; // Store full addon objects
  imageUrl?: string;
  imageHint?: string;
}

export interface Order {
  orderId?: string; // Firestore document ID, will be auto-generated if not set
  userId: string;
  userDisplayName?: string; // Denormalized for easier display in admin
  userEmail?: string; // Denormalized for easier display in admin
  createdAt: number; // Store as timestamp (Date.now())
  status: 'pending_payment' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  items: OrderItem[]; // Uses the detailed OrderItem defined above
  totalAmount: number;
  orderType: string; // 'delivery', 'pickup', 'dine-in'
  deliveryAddress?: string | null;
  tableId?: string | null;
}

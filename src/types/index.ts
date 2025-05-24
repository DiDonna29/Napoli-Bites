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

// New types for User and Order
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt: number; // Store as timestamp (Date.now())
}

export interface CartItemBase {
  id: string; // Product ID
  name: string;
  quantity: number;
  price: number; // Price per unit at the time of order
}
export interface OrderItem extends CartItemBase {
 type: 'pizza' | 'drink';
}


export interface Order {
  orderId?: string; // Firestore document ID, will be auto-generated if not set
  userId: string;
  createdAt: number; // Store as timestamp (Date.now())
  status: 'pending_payment' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  orderType: string; // 'delivery', 'pickup', 'dine-in'
  deliveryAddress?: string | null;
  tableId?: string | null;
}

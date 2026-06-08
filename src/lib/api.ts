
import type { Pizza, Dessert } from '@/types';
import { PIZZA_SIZES, PIZZA_ADDONS, PIZZAS_DATA } from '@/constants/menu';

const API_BASE_URL = 'https://devsapihub.com/api-fast-food';

export async function fetchPizzasFromApi(): Promise<Pizza[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/category/pizza`);
    if (!response.ok) {
      throw new Error('Failed to fetch pizzas from API');
    }
    const data = await response.json();

    return data.map((item: any) => ({
      id: `api-pizza-${item.id}`,
      name: item.name,
      description: "Preparada al estilo napolitano con ingredientes frescos y seleccionados.",
      imageUrl: item.image,
      imageHint: "pizza food",
      basePrice: item.price,
      sizes: PIZZA_SIZES,
      availableAddons: PIZZA_ADDONS,
      category: 'pizza'
    }));
  } catch (error) {
    console.error("Error fetching pizzas:", error);
    return PIZZAS_DATA;
  }
}

export async function fetchDessertsFromApi(): Promise<Dessert[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/category/pastel`);
    if (!response.ok) {
      throw new Error('Failed to fetch desserts from API');
    }
    const data = await response.json();

    return data.map((item: any) => ({
      id: `api-dessert-${item.id}`,
      name: item.name,
      description: "Un final dulce y perfecto para tu experiencia en Napoli Bites.",
      imageUrl: item.image,
      imageHint: "dessert pastry",
      price: item.price,
      category: 'pastel'
    }));
  } catch (error) {
    console.error("Error fetching desserts:", error);
    return [];
  }
}

import type { Pizza } from '@/types';
import { PIZZA_SIZES, PIZZA_ADDONS, PIZZAS_DATA } from '@/constants/menu';

const API_BASE_URL = 'https://devsapihub.com/api-fast-food';

export async function fetchPizzasFromApi(): Promise<Pizza[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/category/pizza`);
    if (!response.ok) {
      throw new Error('Failed to fetch pizzas from API');
    }
    const data = await response.json();

    // Mapeamos los datos de la API externa a nuestro tipo Pizza interno
    return data.map((item: any) => ({
      id: `api-${item.id}`,
      name: item.name,
      description: "Preparada al estilo napolitano con ingredientes frescos y seleccionados.",
      imageUrl: item.image,
      imageHint: "pizza food",
      basePrice: item.price,
      sizes: PIZZA_SIZES,
      availableAddons: PIZZA_ADDONS,
      category: 'API'
    }));
  } catch (error) {
    console.error("Error fetching pizzas:", error);
    // Retornamos los datos locales como fallback si la API falla
    return PIZZAS_DATA;
  }
}

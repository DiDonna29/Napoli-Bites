
export type Language = 'en' | 'es';

export const translations = {
  en: {
    nav: {
      menu: 'Menu',
      tables: 'Tables',
      orderNow: 'Order Now',
      myOrders: 'My Orders',
      admin: 'Admin',
      logout: 'Log out',
      login: 'Login / Register',
    },
    hero: {
      title: 'Taste the Heart of Naples',
      subtitle: 'Experience authentic Neapolitan pizza, crafted with love and the finest Italian ingredients.',
      explore: 'Explore Menu',
      reserve: 'Reserve a Table',
    },
    orders: {
      title: 'My Orders',
      noOrders: 'No Orders Yet',
      noOrdersDesc: "You haven't placed any orders with us. Start exploring our menu!",
      browse: 'Browse Menu',
      orderId: 'Order',
      date: 'Date',
      type: 'Type',
      total: 'Total',
      items: 'Items',
      viewInvoice: 'View Invoice',
      loading: 'Loading order history...',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    }
  },
  es: {
    nav: {
      menu: 'Menú',
      tables: 'Mesas',
      orderNow: 'Pedir Ahora',
      myOrders: 'Mis Pedidos',
      admin: 'Admin',
      logout: 'Cerrar Sesión',
      login: 'Entrar / Registrarse',
    },
    hero: {
      title: 'El Corazón de Nápoles en cada bocado',
      subtitle: 'Experimenta la auténtica pizza napolitana, elaborada con amor y los mejores ingredientes italianos.',
      explore: 'Ver Menú',
      reserve: 'Reservar Mesa',
    },
    orders: {
      title: 'Mis Pedidos',
      noOrders: 'Aún no hay pedidos',
      noOrdersDesc: 'No has realizado ningún pedido con nosotros. ¡Empieza a explorar nuestro menú!',
      browse: 'Explorar Menú',
      orderId: 'Pedido',
      date: 'Fecha',
      type: 'Tipo',
      total: 'Total',
      items: 'Productos',
      viewInvoice: 'Ver Factura',
      loading: 'Cargando historial de pedidos...',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    }
  }
};

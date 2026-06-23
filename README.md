# Napoli Bites - Auténtica Experiencia Napolitana 🍕

Napoli Bites es una plataforma moderna de gestión de pedidos y reservas en tiempo real diseñada para ofrecer una experiencia gastronómica premium. Construida con tecnologías de vanguardia, la aplicación combina la simplicidad de una pizzería tradicional con la potencia de la computación en la nube.

## 🚀 Tecnologías Core

- **Frontend**: Next.js 15 (App Router) con TypeScript.
- **Estilos**: Tailwind CSS + Shadcn/UI (Filosofía Taste Skill para interfaces Anti-Slop).
- **Backend**: Firebase (Firestore para base de datos en tiempo real y Firebase Auth).
- **IA**: Genkit para futuras implementaciones de recomendaciones inteligentes.

## 🛠️ Instalación y Desarrollo

La aplicación está preparada para funcionar con cualquier gestor de paquetes moderno.

### Prerrequisitos
- Node.js 18+ instalado.
- Un proyecto de Firebase configurado.

### Configuración
1. Clona el repositorio.
2. Crea un archivo `.env.local` con tus credenciales de Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
...etc
```

### Comandos
```bash
# Con npm
npm install
npm run dev

# Con yarn
yarn install
yarn dev

# Con pnpm
pnpm install
pnpm dev
```

## 🧠 Lógica de la Aplicación

1. **Gestión de Mesas**: Utiliza listeners de Firestore (`onSnapshot`) para que el estado de disponibilidad (Disponible/Ocupada) sea instantáneo para todos los usuarios.
2. **Carrito Persistente**: El carrito se gestiona mediante un Context Provider que sincroniza los cambios con `localStorage`, permitiendo que el usuario no pierda su pedido al recargar.
3. **Flujo de Pago Simulado**: Un sistema de verificación de pedido final donde el usuario revisa cada artículo antes de que la orden se envíe a la cocina y la mesa se reserve permanentemente.

## 🎨 Diseño "Anti-Slop" (Taste Skill)

Hemos aplicado principios de diseño de alto nivel:
- **Jerarquía Visual**: Uso de fuentes Serif (Lora) para títulos y Sans-Serif (Geist) para lectura técnica.
- **Responsividad Robusta**: Contenedores blindados contra desbordamientos, especialmente críticos en pantallas móviles pequeñas.
- **Rendimiento**: Optimización de imágenes y carga diferida de componentes pesados.

## 🔮 Futuro Escalable

- **Panel de Staff**: Dashboard para cocineros y meseros con actualizaciones de estado de órdenes vía WebSockets/Firestore.
- **IA de Recomendación**: Uso de Genkit para sugerir maridajes de bebidas basados en el historial del usuario.
- **Pasarela Real**: Integración de Stripe para pagos reales.
- **Multi-Sede**: Soporte para múltiples pizzerías bajo el mismo dominio con geolocalización.

---
Creado con ❤️ para Napoli Bites.
Stockify Client - Interfaz de Gestión💻 DescripciónInterfaz gráfica (SPA - Single Page Application) del sistema ERP Stockify. Desarrollada en React 18, utiliza Material-UI v5 para garantizar la responsividad y usabilidad. La gestión del estado global (sesiones de usuario) se maneja mediante Context API, y la comunicación con el backend se realiza vía Axios con interceptores de seguridad.🛠️ Tecnologías ClaveCore: React 18UI Library: Material-UI (MUI) v5Routing: React Router DOMHTTP Client: Axios (Configurado en src/api)Gestión de Estado: React Context API (src/context)Build Tool: Webpack (vía CRA)📂 Estructura del ProyectoOrganizado por componentes funcionales y páginas, separado de la lógica de servicios:rg-plastic-frontend/
├── public/
├── src/
│   ├── api/            # Configuración de Axios
│   ├── components/     # Componentes reutilizables
│   │   ├── common/     # Botones, Modales, Inputs genéricos
│   │   ├── hhrr/       # Componentes específicos de RRHH
│   │   ├── inventory/  # Tablas de stock, kárdex
│   │   ├── production/ # Formularios de órdenes y mermas
│   │   └── sales/      # Carrito de venta, cotizador
│   ├── context/        # AuthContext, GlobalState
│   ├── hooks/          # Custom hooks (useAuth, useFetch)
│   ├── pages/          # Vistas principales (Rutas)
│   ├── utils/          # Formateadores de moneda, fechas
│   └── App.js          # Main Component
└── package.json
🚀 Instalación y Uso1. Instalación de Dependenciasnpm install
2. Configuración de EntornoCrea un archivo .env en la raíz (o .env.local):REACT_APP_API_URL=http://localhost:3001/api/v1
3. Servidor de DesarrolloPara trabajar en local con Hot Reload:npm start
La aplicación correrá en http://localhost:3000.4. Construcción para Producción (Build)Genera la carpeta /build con los archivos estáticos optimizados para Nginx/Apache.npm run build
👥 Manual de Usuario (Roles Principales)🛒 Ejecutivo de VentasCrear Pedido: Permite seleccionar cliente (con validación de límite de crédito) y agregar productos verificando stock en tiempo real.Estados: Los pedidos nacen como QUOTE y pasan a CONFIRMED para producción.🏭 Jefe de ProducciónÓrdenes (OP): Planificación de manufactura.Registro de Mermas: Interfaz para reportar desperdicios en Extrusión o Bolseo.Consumos: Descuenta materia prima del inventario automáticamente.📦 Encargado de AlmacénEntradas: Registro de mercancía referenciada a factura de proveedor.Alertas: Visualización de tarjetas rojas en el Dashboard cuando el stock cae bajo el mínimo.💰 Analista FinancieroCosteo: Cálculo automático del costo real (Materiales + Mano de Obra + Mermas) vs Precio de Venta para análisis de rentabilidad por cliente.🧪 Validaciones (QA)El frontend implementa validaciones de formulario estrictas para asegurar la integridad de datos antes de enviarlos al servidor:Validación de RUT/ID fiscal.Stock no negativo en ventas (alerta visual).Bloqueo de ventas a clientes morosos.
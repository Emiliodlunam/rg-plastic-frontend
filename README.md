# Stockify Client - Interfaz de Gestión

Interfaz gráfica del sistema ERP Stockify, desarrollada como una Single Page Application utilizando React 18. Material-UI v5 se usa para garantizar una interfaz responsiva y moderna. El estado global del usuario se maneja mediante Context API, mientras que la comunicación con el backend se realiza con Axios configurado con interceptores para manejo seguro de tokens.

---

## 1. Tecnologías Clave

* Core: React 18
* UI Library: Material-UI (MUI) v5
* Routing: React Router DOM
* Cliente HTTP: Axios (configurado en src/api)
* Gestión de Estado: React Context API (Auth y estados globales)
* Build Tool: Webpack (via Create React App)

---

## 2. Estructura del Proyecto

Organización basada en componentes funcionales, servicios y páginas.

```
rg-plastic-frontend/
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
│   ├── pages/          # Vistas principales del sistema
│   ├── utils/          # Formateadores de moneda y fechas
│   └── App.js          # Componente principal
└── package.json
```

---

## 3. Instalación y Uso

### 3.1. Instalación de dependencias

```
npm install
```

### 3.2. Configuración de entorno

Crear archivo `.env` o `.env.local` en la raíz:

```
REACT_APP_API_URL=http://localhost:3001/api/v1
```

### 3.3. Ejecutar en modo desarrollo

```
npm start
```

La aplicación estará disponible en:

```
http://localhost:3000
```

### 3.4. Construcción para producción

Genera la carpeta /build con archivos optimizados:

```
npm run build
```

---

## 4. Manual de Usuario (Roles Principales)

### Ejecutivo de Ventas

* Crear Pedidos con validación de límites de crédito.
* Selección de productos con verificación de stock en tiempo real.
* Flujo de estados: QUOTE → CONFIRMED.

### Jefe de Producción

* Gestión de Órdenes de Producción.
* Registro de mermas en procesos como Extrusión o Bolseo.
* Consumos automáticos de inventario.

### Encargado de Almacén

* Registro de entradas vinculadas a facturas de proveedor.
* Alertas visuales cuando el stock baja del mínimo.

### Analista Financiero

* Cálculo de costo real considerando materiales, mano de obra y mermas.
* Análisis de rentabilidad por cliente.

---

## 5. Validaciones (QA)

El frontend incluye validaciones estrictas antes de enviar datos al backend:

* Validación de RUT o identificación fiscal.
* Prevención de ventas con stock negativo.
* Bloqueo automático para clientes con cuentas morosas.

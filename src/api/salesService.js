import api from './api';

// --- FUNCIONES PARA CLIENTES ---

/**
 * HU020: Obtiene la lista de todos los clientes activos, con paginación y búsqueda.
 * @param {object} filters - { search, page, limit }
 * @returns {Promise<object>}
 */
export const getClients = (filters = {}) => {
    return api.get('/sales/clients', { params: filters });
};

/**
 * HU020: Obtiene los detalles de un cliente por su ID.
 * @param {number} id
 * @returns {Promise<object>}
 */
export const getClientById = (id) => {
    return api.get(`/sales/clients/${id}`);
};

/**
 * HU020: Crea un nuevo cliente.
 * @param {object} clientData
 * @returns {Promise<object>}
 */
export const createClient = (clientData) => {
    return api.post('/sales/clients', clientData);
};

/**
 * HU020: Actualiza un cliente existente.
 * @param {number} id
 * @param {object} clientData
 * @returns {Promise<object>}
 */
export const updateClient = (id, clientData) => {
    return api.put(`/sales/clients/${id}`, clientData);
};

/**
 * HU020: Elimina (lógicamente) un cliente.
 * @param {number} id
 * @returns {Promise<object>}
 */
export const deleteClient = (id) => {
    return api.delete(`/sales/clients/${id}`);
};

// --- FUNCIONES PARA PEDIDOS ---

/**
 * HU021: Crea un nuevo pedido de venta.
 */
export const createSalesOrder = (orderData) => {
    return api.post('/sales/orders', orderData);
};

/**
 * Actualiza el estado de un pedido de venta.
 * @param {number} id
 * @param {string} status
 * @returns {Promise<object>}
 */
export const updateOrderStatus = (id, status) => {
    return api.patch(`/sales/orders/${id}/status`, { status });
};

/**
 * Obtiene una lista paginada de todos los pedidos de venta.
 */
export const getSalesOrders = (filters = {}) => {
    return api.get('/sales/orders', { params: filters });
};

/**
 * Obtiene los detalles completos de un pedido de venta por su ID.
 * @param {number} id
 * @returns {Promise<object>}
 */
export const getSalesOrderById = (id) => {
    return api.get(`/sales/orders/${id}`);
};

/**
 * HU023: Obtiene el reporte de ventas por cliente, con filtro de fechas opcional.
 * @param {object} filters - { startDate, endDate }
 * @returns {Promise<object>}
 */
export const getSalesReportByClient = (filters = {}) => {
    return api.get('/sales/reports/by-client', { params: filters });
};

export const getSalesDashboardData = (filters = {}) => {
    return api.get('/sales/reports/dashboard', { params: filters });
};
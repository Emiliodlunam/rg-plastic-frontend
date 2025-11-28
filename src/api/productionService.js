import api from './api';

/**
 * Crea una nueva orden de producción.
 * @param {object} orderData
 * @returns {Promise<object>}
 */
export const createProductionOrder = (orderData) => {
    return api.post('/production/orders', orderData);
};

/**
 * Obtiene una lista paginada de órdenes de producción.
 * @param {object} filters - { search, status, page, limit }
 * @returns {Promise<object>}
 */
export const getProductionOrders = (filters = {}) => {
    return api.get('/production/orders', { params: filters });
};

/**
 * Obtiene los detalles de una orden de producción por su ID.
 * @param {number} id
 * @returns {Promise<object>}
 */
export const getProductionOrderById = (id) => {
    return api.get(`/production/orders/${id}`);
};

/**
 * Actualiza el estado de una orden de producción.
 * @param {number} id
 * @param {string} status
 * @returns {Promise<object>}
 */
export const updateProductionOrderStatus = (id, status) => {
    return api.patch(`/production/orders/${id}/status`, { status });
};

/**
 * HU011: Registra un consumo de materia prima para una orden de producción específica.
 * @param {number} orderId - El ID de la orden de producción.
 * @param {object} consumptionData - { material_id, consumed_quantity }
 * @returns {Promise<object>}
 */
export const registerProductionConsumption = (orderId, consumptionData) => {
    return api.post(`/production/orders/${orderId}/consumptions`, consumptionData);
};

/**
 * HU012 / HU013: Registra un lote de producción terminado para una orden.
 * @param {number} orderId - El ID de la orden de producción.
 * @param {object} batchData - { batch_number, quantity_produced, production_date, quality }
 * @returns {Promise<object>}
 */
export const registerProductionBatch = (orderId, batchData) => {
    return api.post(`/production/orders/${orderId}/batches`, batchData);
};

/**
 * HU014: Registra una merma para una orden de producción específica.
 * @param {number} orderId - El ID de la orden de producción.
 * @param {object} wasteData - { process, quantity, reason }
 * @returns {Promise<object>}
 */
export const registerWaste = (orderId, wasteData) => {
    return api.post(`/production/orders/${orderId}/wastes`, wasteData);
};

/**
 * HU014: Obtiene el reporte de mermas, con filtros opcionales.
 * @param {object} filters - { orderId, startDate, endDate }
 * @returns {Promise<object>}
 */
export const getWastesReport = (filters = {}) => {
    return api.get('/production/wastes', { params: filters });
};

/**
 * HU014: Obtiene los datos agregados para el gráfico de mermas.
 * @param {object} filters - { startDate, endDate }
 * @returns {Promise<object>}
 */
export const getWastesChartData = (filters = {}) => {
    return api.get('/production/wastes/chart', { params: filters });
};

/**
 * HU032: Obtiene el análisis de costos (material, merma) de una OP.
 * @param {number} orderId
 * @returns {Promise<object>}
 */
export const getProductionOrderCostAnalysis = (orderId) => {
    return api.get(`/production/orders/${orderId}/cost-analysis`);
};
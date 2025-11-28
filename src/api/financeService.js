import api from './api';

// --- FUNCIONES PARA INGRESOS ---

/**
 * HU030: Registra un nuevo ingreso.
 * @param {object} incomeData - { amount, date, source, invoice_id }
 * @returns {Promise<object>}
 */
export const createIncome = (incomeData) => {
    return api.post('/finances/incomes', incomeData);
};

/**
 * HU030: Obtiene una lista paginada de ingresos.
 * @param {object} filters - { startDate, endDate, source, page, limit }
 * @returns {Promise<object>}
 */
export const getIncomes = (filters = {}) => {
    return api.get('/finances/incomes', { params: filters });
};

// --- FUNCIONES PARA EGRESOS ---

/**
 * HU031: Registra un nuevo egreso.
 * @param {object} expenseData - { amount, date, category, supplier_id }
 * @returns {Promise<object>}
 */
export const createExpense = (expenseData) => {
    return api.post('/finances/expenses', expenseData);
};

/**
 * HU031: Obtiene una lista paginada de egresos.
 * @param {object} filters - { startDate, endDate, category, supplierId, page, limit }
 * @returns {Promise<object>}
 */
export const getExpenses = (filters = {}) => {
    return api.get('/finances/expenses', { params: filters });
};

/**
 * HU033: Obtiene el reporte de utilidad por cliente, con filtro de fechas opcional.
 * @param {object} filters - { startDate, endDate }
 * @returns {Promise<object>}
 */
export const getProfitReportByClient = (filters = {}) => {
    return api.get('/finances/reports/profit-by-client', { params: filters });
};

/**
 * HU032: Registra un nuevo cálculo de costeo para un producto.
 * @param {object} costingData
 * @returns {Promise<object>}
 */
export const createCosting = (costingData) => {
    return api.post('/finances/costings', costingData);
};

/**
 * HU032: Obtiene el historial de costeos para un producto específico.
 * @param {number} productId
 * @returns {Promise<object>}
 */
export const getCostingHistoryForProduct = (productId) => {
    return api.get(`/finances/costings/product/${productId}`);
};
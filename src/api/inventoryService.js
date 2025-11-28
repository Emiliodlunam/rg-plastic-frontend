import api from './api';

// 'filters' ahora puede contener { search, page, limit }
export const getProducts = (filters = {}) => {
    return api.get('/inventory/products', { params: filters });
};

export const getProductById = (id) => {
    return api.get(`/inventory/products/${id}`);
};

export const createProduct = (productData) => {
    return api.post('/inventory/products', productData);
};

export const updateProduct = (id, productData) => {
    return api.put(`/inventory/products/${id}`, productData);
};

export const deleteProduct = (id) => {
    return api.delete(`/inventory/products/${id}`);
};

/**
 * Registra un movimiento de entrada de inventario.
 * @param {object} movementData - Datos del movimiento (product_id, quantity, etc.).
 * @returns {Promise<object>}
 */
export const createEntryMovement = (movementData) => {
    return api.post('/inventory/movements/entry', movementData);
};

/**
 * Registra un movimiento de salida de inventario.
 * @param {object} movementData - Datos del movimiento (product_id, quantity, etc.).
 * @returns {Promise<object>}
 */
export const createExitMovement = (movementData) => {
    return api.post('/inventory/movements/exit-production', movementData);
};
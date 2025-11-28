// src/api/supplierService.js
import api from './api';

/**
 * Obtiene la lista de todos los proveedores activos.
 * @returns {Promise<object>}
 */
export const getSuppliers = () => {
    return api.get('/suppliers');
};
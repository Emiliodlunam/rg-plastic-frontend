import api from './api';

/**
 * Obtiene el resumen de KPIs de todos los módulos.
 * @returns {Promise<object>}
 */
export const getDashboardSummary = () => {
    return api.get('/dashboard/summary');
};
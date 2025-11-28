import api from './api';

/**
 * Obtiene el resumen de KPIs de notificaciones (alertas de stock, cotizaciones, etc.)
 * @returns {Promise<object>}
 */
export const getNotificationsSummary = () => {
    return api.get('/notifications/summary');
};
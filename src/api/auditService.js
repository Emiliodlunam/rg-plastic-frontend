// src/api/auditService.js
import api from './api';

/**
 * Obtiene los logs de auditoría paginados y filtrados.
 * @param {object} filters - { page, limit, userId, action, startDate, endDate }
 * @returns {Promise<object>}
 */
export const getAuditLogs = (filters = {}) => {
    return api.get('/audit', { params: filters });
};
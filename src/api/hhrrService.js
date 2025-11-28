import api from './api';

const EMPLOYEES_URL = '/hhrr/employees';
const USERS_URL = '/hhrr/users';
const ATTENDANCE_URL = '/hhrr/attendances';
const SHIFTS_URL = '/hhrr/shifts';

// === EMPLEADOS (HU040) ===
export const getEmployees = (filters = {}) => api.get(EMPLOYEES_URL, { params: filters });
export const getEmployeeById = (id) => api.get(`${EMPLOYEES_URL}/${id}`);
export const createEmployee = (employeeData) => api.post(EMPLOYEES_URL, employeeData);
export const updateEmployee = (id, employeeData) => api.put(`${EMPLOYEES_URL}/${id}`, employeeData);
export const deleteEmployee = (id) => api.delete(`${EMPLOYEES_URL}/${id}`);

// === USUARIOS (HU043) ===
export const getUsers = (filters = {}) => api.get(USERS_URL, { params: filters });
export const getUserById = (id) => api.get(`${USERS_URL}/${id}`);
export const createUser = (userData) => api.post(USERS_URL, userData);
export const updateUser = (id, userData) => api.put(`${USERS_URL}/${id}`, userData);
export const deleteUser = (id) => api.delete(`${USERS_URL}/${id}`);

// === ASISTENCIA (HU041) ===
export const getAttendances = (filters = {}) => api.get(ATTENDANCE_URL, { params: filters });
export const registerAttendance = (attendanceData) => api.post(ATTENDANCE_URL, attendanceData);

// === TURNOS (HU042) ===
export const getShifts = (filters = {}) => api.get(SHIFTS_URL, { params: filters });
export const createShift = (shiftData) => api.post(SHIFTS_URL, shiftData);
export const updateShift = (id, shiftData) => api.put(`${SHIFTS_URL}/${id}`, shiftData);
export const deleteShift = (id) => api.delete(`${SHIFTS_URL}/${id}`);


// === REPORTE DE NÓMINA ===
/**
 * Obtiene el reporte de nómina calculado.
 * @param {object} filters - { employeeId, startDate, endDate }
 * @returns {Promise<object>}
 */
export const getPayrollReport = (filters = {}) => {
    return api.get('/hhrr/payroll', { params: filters });
};
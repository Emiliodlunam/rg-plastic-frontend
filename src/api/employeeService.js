// src/api/employeeService.js
import api from './api';

// La URL base ahora es '/hhrr/employees'
const BASE_URL = '/hhrr/employees';

export const getEmployees = (filters = {}) => {
    return api.get(BASE_URL, { params: filters });
};

export const getEmployeeById = (id) => {
    return api.get(`${BASE_URL}/${id}`);
};

export const createEmployee = (employeeData) => {
    return api.post(BASE_URL, employeeData);
};

export const updateEmployee = (id, employeeData) => {
    return api.put(`${BASE_URL}/${id}`, employeeData);
};

export const deleteEmployee = (id) => {
    return api.delete(`${BASE_URL}/${id}`);
};
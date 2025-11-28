import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../../api/employeeService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  InputAdornment, IconButton, Pagination, Stack, Chip
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('es-ES') : 'N/A';
const formatCurrency = (amount) => amount != null ? `$${parseFloat(amount).toLocaleString('es-MX')}` : 'N/A';
const shiftTranslations = { 'MORNING': 'Mañana', 'AFTERNOON': 'Tarde', 'NIGHT': 'Noche' };

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getEmployees({ search: searchTerm, page, limit: 10 });
      setEmployees(response.data.data.items);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error al cargar los empleados. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('¿Estás seguro de desactivar a este empleado? Esta acción no se puede deshacer.')) {
      try {
        await deleteEmployee(employeeId);
        fetchEmployees();
      } catch (err) {
        setError('Error al desactivar el empleado. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestión de Empleados
        </Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/hhrr/employees/new')}>
            Nuevo Empleado
          </Button>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Buscar por Nombre o Cargo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>),
          }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Cargo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Turno</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha de Ingreso</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Salario</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <Chip label={shiftTranslations[employee.shift] || employee.shift} size="small" />
                  </TableCell>
                  <TableCell>{formatDate(employee.hire_date)}</TableCell>
                  <TableCell align="right">{formatCurrency(employee.salary)}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton color="primary" size="small" onClick={() => navigate(`/hhrr/employees/edit/${employee.id}`)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(employee.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Stack>
        </>
      )}
    </Paper>
  );
};

export default EmployeesPage;
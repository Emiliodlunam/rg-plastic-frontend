import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { getExpenses, createExpense } from '../../api/financeService';
import { getSuppliers } from '../../api/supplierService'; // Para el selector de proveedor
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  Grid, Pagination, Stack, Divider, Autocomplete, MenuItem // Añadir Autocomplete y MenuItem
} from '@mui/material';
import { Add, FilterList } from '@mui/icons-material';
import dayjs from 'dayjs';

// Helpers
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('es-ES') : 'N/A';
const formatCurrency = (amount) => amount != null ? `$${parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', category: '' });
  const [suppliers, setSuppliers] = useState([]); // Estado para proveedores
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const { handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues: { amount: '', date: dayjs().format('YYYY-MM-DD'), category: '', supplier_id: null }
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const cleanFilters = {};
      if (filters.startDate) cleanFilters.startDate = filters.startDate;
      if (filters.endDate) cleanFilters.endDate = filters.endDate;
      if (filters.category) cleanFilters.category = filters.category;
      
      const response = await getExpenses({ ...cleanFilters, page, limit: 10 });
      setExpenses(response.data.data.items);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error al cargar los egresos. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

   useEffect(() => {
        fetchExpenses();
        // Cargar proveedores para el selector del formulario
        const fetchSuppliers = async () => {
            try {
                const response = await getSuppliers(); // Asume que esta función existe en supplierService
                setSuppliers(response.data.data);
            } catch (err) {
                 console.error("Error al cargar proveedores", err);
            }
        };
        fetchSuppliers();
    }, [fetchExpenses]); // Dependencia fetchExpenses para recargar si cambian filtros o página


  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
      setPage(1);
      fetchExpenses();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const onSubmit = async (data) => {
      setFormLoading(true);
      setFormError('');
      setFormSuccess('');
      try {
          const payload = { 
              ...data, 
              amount: parseFloat(data.amount),
              // Extraer solo el ID del proveedor si se seleccionó uno
              supplier_id: data.supplier_id ? data.supplier_id.id : null 
            };
          await createExpense(payload);
          setFormSuccess('Egreso registrado exitosamente.');
          reset({ amount: '', date: dayjs().format('YYYY-MM-DD'), category: '', supplier_id: null }); // Reset form
          fetchExpenses(); // Recargar la lista
      } catch(err) {
          setFormError(err.response?.data?.message || 'Error al registrar el egreso.');
      } finally {
          setFormLoading(false);
      }
  };

  // Ejemplo de categorías, podrían venir del backend
  const expenseCategories = ['COMPRA_RESINA', 'PIGMENTOS', 'EMPAQUES', 'SERVICIOS_PUBLICOS', 'MANTENIMIENTO', 'NOMINA', 'OTROS'];


  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Registro y Consulta de Egresos
      </Typography>

      {/* Formulario de Registro */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Registrar Nuevo Egreso</Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
              {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
              {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}
              <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                      <Controller name="amount" control={control} rules={{ required: 'Monto requerido', min: {value: 0.01, message: 'Debe ser > 0'} }} render={({ field }) => (
                          <TextField {...field} fullWidth label="Monto *" type="number" size="small" InputProps={{ inputProps: { step: "0.01" } }} error={!!errors.amount} helperText={errors.amount?.message} />
                      )}/>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                      <Controller name="date" control={control} rules={{ required: 'Fecha requerida' }} render={({ field }) => (
                           <TextField {...field} fullWidth label="Fecha *" type="date" size="small" InputLabelProps={{ shrink: true }} error={!!errors.date} helperText={errors.date?.message} />
                      )}/>
                  </Grid>
                   <Grid item xs={12} sm={6} md={3}>
                       <Controller name="category" control={control} rules={{ required: 'Categoría requerida' }} render={({ field }) => (
                           <TextField select {...field} fullWidth label="Categoría *" size="small" error={!!errors.category} helperText={errors.category?.message} >
                               {expenseCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                           </TextField>
                       )}/>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                      <Controller name="supplier_id" control={control} render={({ field }) => (
                           <Autocomplete
                                {...field}
                                options={suppliers}
                                getOptionLabel={(option) => option.name || ""}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={(e, newValue) => field.onChange(newValue)}
                                renderInput={(params) => <TextField {...params} label="Proveedor (Opcional)" size="small" />}
                           />
                      )}/>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit" variant="contained" startIcon={<Add />} disabled={formLoading}>
                          {formLoading ? <CircularProgress size={20} color="inherit" /> : 'Registrar'}
                      </Button>
                  </Grid>
              </Grid>
          </form>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Filtros y Lista */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Historial de Egresos</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField size="small" type="date" label="Desde" name="startDate" value={filters.startDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }}/>
            <TextField size="small" type="date" label="Hasta" name="endDate" value={filters.endDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }}/>
            <TextField size="small" label="Categoría" name="category" value={filters.category} onChange={handleFilterChange} sx={{ flex: 1 }}/>
            <Button variant="outlined" onClick={handleApplyFilters} startIcon={<FilterList />}>Filtrar</Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : (
            <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Proveedor</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Monto</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expenses.map((expense) => (
                            <TableRow key={expense.id} hover>
                                <TableCell>{formatDate(expense.date)}</TableCell>
                                <TableCell>{expense.category}</TableCell>
                                <TableCell>{expense.supplier_name || '-'}</TableCell>
                                <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
             <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
                <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
            </Stack>
            {expenses.length === 0 && !loading && (
                <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                No hay egresos registrados para los filtros seleccionados.
                </Typography>
            )}
            </>
        )}
      </Paper>
    </Box>
  );
};

export default ExpensesPage;
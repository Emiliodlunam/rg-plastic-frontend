import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { getIncomes, createIncome } from '../../api/financeService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  Grid, Pagination, Stack, Divider
} from '@mui/material';
import { Add, FilterList } from '@mui/icons-material'; // Iconos
import dayjs from 'dayjs'; // Para manejar fechas

// Helpers
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('es-ES') : 'N/A';
const formatCurrency = (amount) => amount != null ? `$${parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';

const IncomesPage = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false); // Cambiado a false inicialmente
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const { handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues: { amount: '', date: dayjs().format('YYYY-MM-DD'), source: '', invoice_id: '' }
  });

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const cleanFilters = {};
      if (filters.startDate) cleanFilters.startDate = filters.startDate;
      if (filters.endDate) cleanFilters.endDate = filters.endDate;
      
      const response = await getIncomes({ ...cleanFilters, page, limit: 10 });
      setIncomes(response.data.data.items);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error al cargar los ingresos. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
      setPage(1); // Reset page on filter apply
      fetchIncomes();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const onSubmit = async (data) => {
      setFormLoading(true);
      setFormError('');
      setFormSuccess('');
      try {
          const payload = { ...data, amount: parseFloat(data.amount) };
          await createIncome(payload);
          setFormSuccess('Ingreso registrado exitosamente.');
          reset({ amount: '', date: dayjs().format('YYYY-MM-DD'), source: '', invoice_id: '' }); // Reset form
          fetchIncomes(); // Recargar la lista
      } catch(err) {
          setFormError(err.response?.data?.message || 'Error al registrar el ingreso.');
      } finally {
          setFormLoading(false);
      }
  };


  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Registro y Consulta de Ingresos
      </Typography>

      {/* Formulario de Registro */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Registrar Nuevo Ingreso</Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
              {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
              {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}
              <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                      <Controller name="amount" control={control} rules={{ required: 'Monto requerido', min: {value: 0.01, message: 'Debe ser > 0'} }} render={({ field }) => (
                          <TextField {...field} fullWidth label="Monto *" type="number" size="small" InputProps={{ inputProps: { step: "0.01" } }} error={!!errors.amount} helperText={errors.amount?.message} />
                      )}/>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                      <Controller name="date" control={control} rules={{ required: 'Fecha requerida' }} render={({ field }) => (
                           <TextField {...field} fullWidth label="Fecha *" type="date" size="small" InputLabelProps={{ shrink: true }} error={!!errors.date} helperText={errors.date?.message} />
                      )}/>
                  </Grid>
                   <Grid item xs={12} sm={4}>
                      <Controller name="source" control={control} rules={{ required: 'Fuente requerida' }} render={({ field }) => (
                           <TextField {...field} fullWidth label="Fuente *" size="small" error={!!errors.source} helperText={errors.source?.message} />
                      )}/>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                      <Controller name="invoice_id" control={control} render={({ field }) => (
                           <TextField {...field} fullWidth label="ID Factura (Opcional)" type="number" size="small" />
                      )}/>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
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
        <Typography variant="h6" gutterBottom>Historial de Ingresos</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField size="small" type="date" label="Desde" name="startDate" value={filters.startDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }}/>
            <TextField size="small" type="date" label="Hasta" name="endDate" value={filters.endDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }}/>
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
                            <TableCell sx={{ fontWeight: 'bold' }}>Fuente</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Monto</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Factura ID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {incomes.map((income) => (
                            <TableRow key={income.id} hover>
                                <TableCell>{formatDate(income.date)}</TableCell>
                                <TableCell>{income.source}</TableCell>
                                <TableCell align="right">{formatCurrency(income.amount)}</TableCell>
                                <TableCell>{income.invoice_id || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
             <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
                <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
            </Stack>
            {incomes.length === 0 && !loading && (
                <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                No hay ingresos registrados para los filtros seleccionados.
                </Typography>
            )}
            </>
        )}
      </Paper>
    </Box>
  );
};

export default IncomesPage;
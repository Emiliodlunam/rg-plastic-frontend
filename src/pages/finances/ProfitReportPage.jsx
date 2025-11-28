import React, { useState } from 'react';
import { getProfitReportByClient } from '../../api/financeService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  Grid
} from '@mui/material';
import { Assessment } from '@mui/icons-material';
// Importaciones de Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Helper para formatear moneda
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return `$${parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Componente de Tooltip personalizado para el gráfico
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
        <Typography variant="caption" sx={{ color: 'primary.main' }}>
          {`Utilidad: ${formatCurrency(payload[0].value)}`}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const ProfitReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError('');
      setReportData([]);
      const cleanFilters = {};
      if (filters.startDate) cleanFilters.startDate = filters.startDate;
      if (filters.endDate) cleanFilters.endDate = filters.endDate;

      const response = await getProfitReportByClient(cleanFilters);
      // Procesamos los datos para el gráfico y la tabla
      const dataWithProfit = response.data.data.map(item => ({
          ...item,
          total_profit: parseFloat(item.total_profit),
          total_revenue: parseFloat(item.total_revenue),
          total_cost: parseFloat(item.total_cost)
      }));
      setReportData(dataWithProfit);

    } catch (err) {
      setError('Error al generar el reporte de utilidad. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        Reporte de Utilidad por Cliente
      </Typography>

      {/* Sección de Filtros (sin cambios) */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" type="date" label="Fecha de Inicio" name="startDate" value={filters.startDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" type="date" label="Fecha de Fin" name="endDate" value={filters.endDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="contained" startIcon={<Assessment />} onClick={handleGenerateReport} disabled={loading}>
              Generar Reporte
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <>
          {/* --- NUEVA SECCIÓN: GRÁFICO DE UTILIDAD --- */}
          {reportData.length > 0 && (
            <Paper sx={{ p: 2, height: 400, mb: 3 }} variant="outlined">
              <Typography variant="h6" gutterBottom>Utilidad por Cliente</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData}
                  margin={{ top: 5, right: 0, left: 20, bottom: 60 }} // Más espacio abajo para etiquetas
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="client_name" 
                    angle={-45} // Inclinar etiquetas si son largas
                    textAnchor="end" 
                    interval={0} // Mostrar todas las etiquetas
                    height={10} // Placeholder, se ajusta con 'bottom' en margin
                  />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="total_profit" name="Utilidad">
                    {/* Colorear la barra verde si es ganancia, roja si es pérdida */}
                    {reportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.total_profit >= 0 ? '#82ca9d' : '#ff6b6b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          )}
          {/* ------------------------------------------- */}

          {/* Tabla de Detalles (sin cambios) */}
          <Typography variant="h6" gutterBottom>Detalle del Reporte</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Total Pedidos</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Ingresos Totales</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Costos Totales</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', color: 'primary.main' }}>Utilidad Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.client_id} hover>
                    <TableCell>{row.client_name}</TableCell>
                    <TableCell align="center">{row.total_orders}</TableCell>
                    <TableCell align="right">{formatCurrency(row.total_revenue)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.total_cost)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: row.total_profit >= 0 ? 'green' : 'red' }}>
                      {formatCurrency(row.total_profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {reportData.length === 0 && !loading && (
              <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                No hay datos para mostrar. Selecciona un rango de fechas y genera un reporte.
              </Typography>
            )}
          </TableContainer>
        </>
      )}
    </Paper>
  );
};

export default ProfitReportPage;
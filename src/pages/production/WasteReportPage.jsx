import React, { useState, useRef, useEffect } from 'react';
import { getWastesReport, getWastesChartData } from '../../api/productionService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  Grid
} from '@mui/material';
import { Assessment, FilterList, FileDownload } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';

// Helper para formatear fecha y hora
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const WasteReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    orderId: '',
    startDate: '',
    endDate: '',
  });

  // Estados para la Exportación
  const [csvData, setCsvData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const csvLinkRef = useRef(null);

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
      setChartData([]);

      // Creamos un objeto de filtros limpio, quitando los vacíos
      const cleanFilters = {};
      if (filters.orderId) cleanFilters.orderId = filters.orderId;
      if (filters.startDate) cleanFilters.startDate = filters.startDate;
      if (filters.endDate) cleanFilters.endDate = filters.endDate;

      // Ejecutamos ambas peticiones en paralelo
      const [tableResponse, chartResponse] = await Promise.all([
        getWastesReport(cleanFilters),
        getWastesChartData(cleanFilters)
      ]);

      setReportData(tableResponse.data.data);
      setChartData(chartResponse.data.data);
    } catch (err) {
      setError('Error al generar el reporte de mermas. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Exportación
  const handleExport = () => {
    if (reportData.length === 0) {
      setError("No hay datos para exportar. Por favor, genera un reporte primero.");
      return;
    }
    
    setExportLoading(true);
    setError('');
    try {
      // Formatear los datos que ya tenemos en la tabla
      const formattedData = reportData.map(row => ({
        Fecha: formatDateTime(row.date),
        Orden_Produccion: row.order_number,
        Proceso: row.process,
        Cantidad_kg: parseFloat(row.quantity).toFixed(2),
        Razon: row.reason || '-'
      }));
      
      setCsvData(formattedData);
      
    } catch (err) {
      setError('Error al preparar la exportación: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Cuando los datos están listos, se dispara la descarga
  useEffect(() => {
    if (csvData.length > 0 && csvLinkRef.current) {
      csvLinkRef.current.link.click();
      setCsvData([]);
    }
  }, [csvData]);

  // Definir las cabeceras para el archivo CSV
  const csvHeaders = [
    { label: "Fecha", key: "Fecha" },
    { label: "Orden Prod.", key: "Orden_Produccion" },
    { label: "Proceso", key: "Proceso" },
    { label: "Cantidad (kg)", key: "Cantidad_kg" },
    { label: "Razón", key: "Razon" }
  ];

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        Reporte de Mermas de Producción
      </Typography>

      {/* Sección de Filtros */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Filtrar por ID de Orden (Opcional)"
              name="orderId"
              value={filters.orderId}
              onChange={handleFilterChange}
              InputProps={{ startAdornment: <FilterList sx={{ color: 'action.active', mr: 1 }} /> }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Fecha de Inicio"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Fecha de Fin"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Assessment />}
              onClick={handleGenerateReport}
              disabled={loading}
            >
              Generar Reporte
            </Button>
          </Grid>
          {/* Botón de Exportar */}
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={exportLoading ? <CircularProgress size={20} /> : <FileDownload />}
              onClick={handleExport}
              disabled={exportLoading || loading || reportData.length === 0}
            >
              {exportLoading ? 'Preparando...' : 'Exportar CSV'}
            </Button>
            {/* Enlace oculto para la descarga */}
            {csvData.length > 0 && (
              <CSVLink
                data={csvData}
                headers={csvHeaders}
                filename={`reporte_mermas_${dayjs().format('YYYY-MM-DD')}.csv`}
                ref={csvLinkRef}
                style={{ display: 'none' }}
              />
            )}
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Gráfico de Barras */}
          {chartData.length > 0 && (
            <Paper sx={{ p: 2, height: 300, mb: 3 }} variant="outlined">
              <Typography variant="h6" gutterBottom>
                Total de Merma por Proceso
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="process" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} kg`} />
                  <Legend />
                  <Bar dataKey="total_waste" fill="#ff6b6b" name="Merma Total (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Tabla de Mermas */}
          <Typography variant="h6" gutterBottom>
            Detalle de Mermas
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Orden Prod.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Proceso</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Cantidad (kg)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Razón</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{formatDateTime(row.date)}</TableCell>
                    <TableCell>{row.order_number}</TableCell>
                    <TableCell>{row.process}</TableCell>
                    <TableCell align="right">{parseFloat(row.quantity).toFixed(2)}</TableCell>
                    <TableCell>{row.reason || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {reportData.length === 0 && !loading && (
              <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                No hay mermas registradas para los filtros seleccionados.
              </Typography>
            )}
          </TableContainer>
        </>
      )}
    </Paper>
  );
};

export default WasteReportPage;
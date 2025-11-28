import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getEmployees, getPayrollReport } from '../../api/hhrrService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter,
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  Grid, Autocomplete, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { Assessment, FileDownload } from '@mui/icons-material';
import { CSVLink } from 'react-csv';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Helpers
const formatCurrency = (amount) => amount != null ? `$${parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';
const formatHours = (hours) => parseFloat(hours || 0).toFixed(2);
const formatDays = (days) => parseInt(days || 0);

// Colores para el gráfico
const COLORS = {
  base: '#82ca9d', // Verde (Salario Base)
  overtime: '#8884d8', // Morado (Extras)
  deduction: '#ff6b6b' // Rojo (Deducciones)
};

const PayrollReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  
  // Filtros
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month'));
  const [period, setPeriod] = useState('month'); // Estado para los botones de período

  // Estados para la Exportación
  const [csvData, setCsvData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const csvLinkRef = useRef(null);

  // Cargar lista de empleados para el filtro
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployees({ limit: 1000 });
        setEmployees(response.data.data.items);
      } catch (err) { 
        console.error('Error al cargar empleados:', err); 
      }
    };
    fetchEmployees();
  }, []);

  // Función para calcular los totales
  const summaryData = useMemo(() => {
    if (reportData.length === 0) {
      return { totalBase: 0, totalOvertime: 0, totalDeductions: 0, totalPay: 0 };
    }
    const totalBase = reportData.reduce((acc, row) => acc + parseFloat(row.base_salary), 0);
    const totalOvertime = reportData.reduce((acc, row) => acc + parseFloat(row.overtime_pay), 0);
    const totalDeductions = reportData.reduce((acc, row) => acc + parseFloat(row.absence_deduction), 0);
    const totalPay = reportData.reduce((acc, row) => acc + parseFloat(row.total_pay), 0);
    
    return { totalBase, totalOvertime, totalDeductions, totalPay };
  }, [reportData]);

  // Datos para el gráfico de pastel
  const pieChartData = [
    { name: 'Salario Base', value: summaryData.totalBase },
    { name: 'Pago H. Extra', value: summaryData.totalOvertime },
    { name: 'Deducciones', value: summaryData.totalDeductions },
  ];

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError('');
      setReportData([]);
      
      const cleanFilters = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };
      if (selectedEmployee) {
        cleanFilters.employeeId = selectedEmployee.id;
      }

      const response = await getPayrollReport(cleanFilters);
      setReportData(response.data.data);
    } catch (err) {
      setError('Error al generar el reporte. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Manejador para los botones de período
  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod === null) return;
    setPeriod(newPeriod);
    if (newPeriod === 'week') {
      setStartDate(dayjs().startOf('week'));
      setEndDate(dayjs().endOf('week'));
    } else if (newPeriod === 'month') {
      setStartDate(dayjs().startOf('month'));
      setEndDate(dayjs().endOf('month'));
    } else if (newPeriod === 'last_month') {
      setStartDate(dayjs().subtract(1, 'month').startOf('month'));
      setEndDate(dayjs().subtract(1, 'month').endOf('month'));
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
      // Formatear los datos de la tabla actual
      const formattedData = reportData.map(row => ({
        Empleado: row.employee_name,
        Cargo: row.position,
        Salario_Base: parseFloat(row.base_salary).toFixed(2),
        Horas_Extra_Totales: formatHours(row.total_overtime_hours),
        Pago_Horas_Extra: parseFloat(row.overtime_pay).toFixed(2),
        Dias_Ausente: formatDays(row.total_absence_days),
        Deduccion_Faltas: parseFloat(row.absence_deduction).toFixed(2),
        Pago_Total_Neto: parseFloat(row.total_pay).toFixed(2)
      }));
      
      setCsvData(formattedData);
      
    } catch (err) {
      setError('Error al preparar la exportación: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Disparar la descarga cuando los datos CSV estén listos
  useEffect(() => {
    if (csvData.length > 0 && csvLinkRef.current) {
      csvLinkRef.current.link.click();
      setCsvData([]);
    }
  }, [csvData]);

  // Cabeceras para el archivo CSV
  const csvHeaders = [
    { label: "Empleado", key: "Empleado" },
    { label: "Cargo", key: "Cargo" },
    { label: "Salario Base", key: "Salario_Base" },
    { label: "H. Extra (Totales)", key: "Horas_Extra_Totales" },
    { label: "Pago H. Extra", key: "Pago_Horas_Extra" },
    { label: "Días Ausente", key: "Dias_Ausente" },
    { label: "Deducción por Faltas", key: "Deduccion_Faltas" },
    { label: "Pago Total Neto", key: "Pago_Total_Neto" }
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Reporte de Nómina
        </Typography>
        <Button
          variant="outlined"
          startIcon={exportLoading ? <CircularProgress size={20} /> : <FileDownload />}
          onClick={handleExport}
          disabled={exportLoading || loading || reportData.length === 0}
        >
          {exportLoading ? 'Preparando...' : 'Exportar CSV'}
        </Button>
      </Box>

      {/* Sección de Filtros Mejorada */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <ToggleButtonGroup value={period} exclusive onChange={handlePeriodChange} size="small" fullWidth>
              <ToggleButton value="week">Esta Semana</ToggleButton>
              <ToggleButton value="month">Este Mes</ToggleButton>
              <ToggleButton value="last_month">Mes Pasado</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={3}>
            <DatePicker 
              label="Fecha Inicio" 
              value={startDate} 
              onChange={(date) => setStartDate(date)}
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: (params) => <TextField {...params} size="small" fullWidth /> }} 
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <DatePicker 
              label="Fecha Fin" 
              value={endDate} 
              onChange={(date) => setEndDate(date)}
              enableAccessibleFieldDOMStructure={false}
              slots={{ textField: (params) => <TextField {...params} size="small" fullWidth /> }} 
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={employees}
              getOptionLabel={(option) => option.name}
              value={selectedEmployee}
              onChange={(e, newValue) => setSelectedEmployee(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Filtrar por Empleado" size="small" />
              )}
            />
          </Grid>
          <Grid item xs={12}>
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
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* KPIs Y GRÁFICO */}
          {reportData.length > 0 && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* KPIs */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="overline">Nómina Total</Typography>
                  <Typography variant="h5" color="primary.main">
                    {formatCurrency(summaryData.totalPay)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="overline">Salario Base</Typography>
                  <Typography variant="h5">
                    {formatCurrency(summaryData.totalBase)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="overline">Pago H. Extra</Typography>
                  <Typography variant="h5" sx={{ color: 'success.main' }}>
                    {formatCurrency(summaryData.totalOvertime)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="overline">Deducciones</Typography>
                  <Typography variant="h5" sx={{ color: 'error.main' }}>
                    ({formatCurrency(summaryData.totalDeductions)})
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Gráfico de Pastel */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, height: 300 }} variant="outlined">
                  <Typography variant="h6" align="center">
                    Composición de la Nómina
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieChartData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80} 
                        label
                      >
                        <Cell key="cell-0" fill={COLORS.base} />
                        <Cell key="cell-1" fill={COLORS.overtime} />
                        <Cell key="cell-2" fill={COLORS.deduction} />
                      </Pie>
                      <Tooltip formatter={formatCurrency} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tabla de Resultados */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Empleado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cargo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Salario Base</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>H. Extra</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Pago H. Extra</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Faltas</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Deducción</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', fontSize: '1.1em' }}>Pago Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.employee_id} hover>
                    <TableCell>{row.employee_name}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell align="right">{formatCurrency(row.base_salary)}</TableCell>
                    <TableCell align="right">{formatHours(row.total_overtime_hours)}</TableCell>
                    <TableCell align="right" sx={{ color: 'green' }}>
                      {formatCurrency(row.overtime_pay)}
                    </TableCell>
                    <TableCell align="center">{formatDays(row.total_absence_days)}</TableCell>
                    <TableCell align="right" sx={{ color: 'red' }}>
                      ({formatCurrency(row.absence_deduction)})
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(row.total_pay)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Fila de Totales */}
              {reportData.length > 0 && (
                <TableFooter>
                  <TableRow sx={{ bgcolor: 'grey.200' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                      TOTALES
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(summaryData.totalBase)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatHours(reportData.reduce((acc, row) => acc + parseFloat(row.total_overtime_hours), 0))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'green' }}>
                      {formatCurrency(summaryData.totalOvertime)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {formatDays(reportData.reduce((acc, row) => acc + parseInt(row.total_absence_days), 0))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'red' }}>
                      ({formatCurrency(summaryData.totalDeductions)})
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                      {formatCurrency(summaryData.totalPay)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
            {reportData.length === 0 && !loading && (
              <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                No hay datos para mostrar. Selecciona un rango de fechas y genera un reporte.
              </Typography>
            )}
          </TableContainer>
        </>
      )}

      {/* Enlace oculto para la descarga */}
      {csvData.length > 0 && (
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename={`reporte_nomina_${startDate.format('YYYY-MM-DD')}_a_${endDate.format('YYYY-MM-DD')}.csv`}
          ref={csvLinkRef}
          style={{ display: 'none' }}
        />
      )}
    </Box>
  );
};

export default PayrollReportPage;
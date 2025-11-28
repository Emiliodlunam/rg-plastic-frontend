import React, { useState, useEffect, useCallback } from 'react';
import { getSalesDashboardData, getClients } from '../../api/salesService';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  TextField,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// ==================== HELPERS ====================
const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
  return `$${num.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric'
  });
};

// ==================== COMPONENTES ====================

// Componente para las tarjetas de KPI
const KPICard = ({ title, value, icon: Icon, color }) => (
  <Card elevation={3} sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}.50`,
            borderRadius: 2,
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Icon sx={{ color: `${color}.main`, fontSize: 25 }} />
        </Box>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// Componente para la tabla de clientes
const TopClientsTable = ({ clients }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
            #
          </TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
            Cliente
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
            Ventas
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {clients.map((client, index) => (
          <TableRow
            key={index}
            sx={{
              '&:hover': { backgroundColor: 'action.hover' },
              transition: 'background-color 0.2s'
            }}
          >
            <TableCell>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}
              >
                {index + 1}
              </Box>
            </TableCell>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {client.client_name}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(client.total_sales)}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// ==================== COMPONENTE PRINCIPAL ====================
const SalesDashboardPage = () => {
  // Estados
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('weekly');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  // ==================== EFECTOS ====================
  
  // Cargar datos del dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = { period };
      if (selectedClient) {
        filters.clientId = selectedClient.id;
      }
      
      const response = await getSalesDashboardData(filters);
      setDashboardData(response.data.data);
    } catch (err) {
      setError(
        'Error al generar el dashboard. ' +
        (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  }, [period, selectedClient]);

  // Cargar lista de clientes
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getClients({ limit: 1000 });
        setClients(response.data.data.items);
      } catch (err) {
        console.error('Error al cargar clientes', err);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ==================== MANEJADORES ====================
  
  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  // ==================== RENDER ====================
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 'bold', color: 'text.primary' }}
        >
          Dashboard de Ventas
        </Typography>
      </Box>

      {/* Panel de Filtros */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Filtros
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={2}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Período
            </Typography>
            <ToggleButtonGroup
              color="primary"
              value={period}
              exclusive
              onChange={handlePeriodChange}
              fullWidth
              size="medium"
            >
              <ToggleButton value="today">Hoy</ToggleButton>
              <ToggleButton value="weekly">Semana</ToggleButton>
              <ToggleButton value="monthly">Mes</ToggleButton>
              <ToggleButton value="yearly">Año</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={10}  sx={{ width: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Cliente
            </Typography>
            <Autocomplete
              options={clients}
              getOptionLabel={(option) => option.name}
              value={selectedClient}
              onChange={(e, newValue) => setSelectedClient(newValue)}
              ListboxProps={{
                style: {
                  maxHeight: '400px',
                  fontSize: '1.125rem'
                }
              }}
              renderOption={(props, option) => (
                <li {...props} style={{ fontSize: '1.125rem', padding: '12px 16px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Seleccionar cliente (opcional)"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    style: { fontSize: '1.125rem', height: '56px', paddingTop: '8px', paddingBottom: '8px' }
                  }}
                  inputProps={{
                    ...params.inputProps,
                    style: { fontSize: '1.125rem' }
                  }}
                />
              )}
              sx={{
                '& .MuiAutocomplete-input': {
                  fontSize: '1.125rem !important'
                },
                '& .MuiInputBase-root': {
                  minHeight: '56px',
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center'
                },
                '& .MuiAutocomplete-option': {
                  fontSize: '1.125rem !important',
                  padding: '12px 16px !important',
                  whiteSpace: 'normal !important',
                  wordWrap: 'break-word !important'
                },
                '& .MuiAutocomplete-listbox': {
                  maxWidth: '100%'
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Mensaje de Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        dashboardData && (
          <Grid container spacing={3}>
            {/* KPIs */}
            <Grid item xs={12} sm={4}>
              <KPICard
                title="Ventas Totales"
                value={formatCurrency(dashboardData.kpis.total_revenue)}
                icon={AttachMoneyIcon}
                color="success"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <KPICard
                title="Total Pedidos"
                value={dashboardData.kpis.total_orders || 0}
                icon={ShoppingCartIcon}
                color="info"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <KPICard
                title="Ticket Promedio"
                value={formatCurrency(dashboardData.kpis.average_order_value)}
                icon={TrendingUpIcon}
                color="warning"
              />
            </Grid>

            {/* Gráfico de Ventas */}
            <Grid item xs={12} lg={8}>
              <Paper elevation={3} sx={{ p: 3, height: 480 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Ventas a lo largo del tiempo
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={dashboardData.salesOverTime}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      style={{ fontSize: '0.875rem' }}
                    />
                    <YAxis
                      tickFormatter={(tick) => formatCurrency(tick)}
                      style={{ fontSize: '0.875rem' }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="total_sales"
                      fill="#1976d2"
                      name="Ventas"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Top Clientes */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={3} sx={{ p: 3, height: 480 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Top 5 Clientes
                </Typography>
                <TopClientsTable clients={dashboardData.topClients} />
              </Paper>
            </Grid>
          </Grid>
        )
      )}
    </Box>
  );
};

export default SalesDashboardPage;
import React, { useState, useEffect } from 'react';
import { getDashboardSummary } from '../api/dashboardService';
import {
  Box, Paper, Typography, CircularProgress, Alert, Grid,
  List, ListItem, ListItemText, Divider, IconButton
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom'; // Para enlaces internos

// Iconos para KPIs
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Iconos para Listas Accionables
import InventoryIcon from '@mui/icons-material/Inventory';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import PersonIcon from '@mui/icons-material/Person';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


// Helper para formatear moneda
const formatCurrency = (amount) => amount != null ? `$${parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';
const formatNumber = (num) => num != null ? parseInt(num).toLocaleString('es-ES') : '0';

// Componente reutilizable para las tarjetas de KPI
const KpiCard = ({ title, value, icon, color = 'text.secondary', linkTo }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 140, // Altura fija para uniformidad
      textAlign: 'center',
      '&:hover': linkTo ? { boxShadow: 6, cursor: 'pointer' } : {},
    }}
    component={linkTo ? RouterLink : Box}
    to={linkTo}
  >
    {icon}
    <Typography variant="overline" color="text.secondary" sx={{ mt: 1 }}>{title}</Typography>
    <Typography variant="h5" sx={{ fontWeight: 'bold', color: color }}>{value}</Typography>
  </Paper>
);

// Componente para las listas de resumen
const SummaryListCard = ({ title, icon, items, renderItem, emptyMessage, linkTo }) => (
  <Paper sx={{ p: 2, height: 350, display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {icon}
      <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>{title}</Typography>
      {linkTo && (
        <IconButton component={RouterLink} to={linkTo} size="small" aria-label="Ver más">
          <ChevronRightIcon />
        </IconButton>
      )}
    </Box>
    <Divider sx={{ mb: 2 }} />
    <List dense sx={{ flexGrow: 1, overflowY: 'auto' }}>
      {items && items.length > 0 ? (
        items.map(renderItem)
      ) : (
        <Typography sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
          {emptyMessage}
        </Typography>
      )}
    </List>
  </Paper>
);


const DashboardPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await getDashboardSummary();
        setSummaryData(response.data.data);
      } catch (err) {
        setError('Error al cargar el resumen del dashboard. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }
  if (!summaryData) {
    return <Typography sx={{ m: 3 }}>No se pudieron cargar los datos del dashboard.</Typography>;
  }

  const { kpis, lists } = summaryData;
  const financialData = [
    { name: 'Ingresos (Mes)', valor: kpis.total_incomes_month },
    { name: 'Egresos (Mes)', valor: kpis.total_expenses_month },
  ];
  const balance = kpis.total_incomes_month - kpis.total_expenses_month;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Dashboard Ejecutivo
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Bienvenido, {user?.username || 'Usuario'}. Este es el resumen del negocio hoy.
      </Typography>

      {/* --- Fila 1: KPIs Principales (4 tarjetas por fila) --- */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Ventas del Mes"
            value={formatCurrency(kpis.total_sales_month)}
            icon={<MonetizationOnIcon sx={{ fontSize: 32, color: 'success.main' }} />}
            color="success.dark"
            linkTo="/sales/orders?status=COMPLETED"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Balance del Mes"
            value={formatCurrency(balance)}
            icon={balance >= 0 ? <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main' }} /> : <TrendingDownIcon sx={{ fontSize: 32, color: 'error.main' }} />}
            color={balance >= 0 ? 'success.dark' : 'error.dark'}
            linkTo="/finances/reports/profit-by-client" // O un reporte financiero más general
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Órdenes en Producción"
            value={formatNumber(kpis.orders_in_progress)}
            icon={<QueryBuilderIcon sx={{ fontSize: 32, color: 'info.main' }} />}
            linkTo="/production/orders?status=IN_PROGRESS"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Alertas de Stock"
            value={formatNumber(kpis.low_stock_items)}
            icon={<WarningIcon sx={{ fontSize: 32, color: kpis.low_stock_items > 0 ? 'error.main' : 'text.secondary' }} />}
            color={kpis.low_stock_items > 0 ? 'error.dark' : 'text.primary'}
            linkTo="/inventory/products?lowStock=true" // Suponiendo que hay un filtro en la página de productos
          />
        </Grid>
      </Grid>

      {/* --- Fila 2: Gráfico Financiero y Top Clientes (Distribución 70/30) --- */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}> {/* Ocupa 8 de 12 columnas en pantallas medianas */}
          <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Resumen Financiero (Mes Actual)</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={formatCurrency} />
                <Bar dataKey="valor">
                  {/* Celdas para colores específicos */}
                  <Cell fill="#82ca9d" /> {/* Ingresos (verde) */}
                  <Cell fill="#ff6b6b" /> {/* Egresos (rojo) */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}> {/* Ocupa 4 de 12 columnas en pantallas medianas */}
          <SummaryListCard
            title="Top 5 Clientes"
            icon={<PersonIcon color="primary" />}
            items={lists.topClients}
            renderItem={(client, index) => (
              <ListItem key={index} divider component={RouterLink} to={`/sales/clients/view/${client.client_id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemText
                  primary={client.client_name}
                  secondary={formatCurrency(client.total_sales)}
                />
              </ListItem>
            )}
            emptyMessage="No hay ventas completadas este mes."
            linkTo="/sales/reports/top-clients" // Asumiendo un reporte de top clientes
          />
        </Grid>
      </Grid>
      
      {/* --- Fila 3: Listas Accionables (3 tarjetas por fila) --- */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <SummaryListCard
            title="Alertas de Inventario"
            icon={<InventoryIcon color="error" />}
            items={lists.lowStockList}
            renderItem={(item, index) => (
              <ListItem key={index} divider component={RouterLink} to={`/inventory/products/edit/${item.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemText
                  primary={item.description}
                  secondary={`SKU: ${item.sku} | Stock: ${item.current_stock} (Min: ${item.min_stock})`}
                />
              </ListItem>
            )}
            emptyMessage="No hay productos con bajo stock."
            linkTo="/inventory/products?lowStock=true"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryListCard
            title="Cotizaciones Pendientes"
            icon={<RequestQuoteIcon color="info" />}
            items={lists.pendingQuotes}
            renderItem={(item, index) => (
              <ListItem key={index} divider component={RouterLink} to={`/sales/orders/edit/${item.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemText
                  primary={item.order_number}
                  secondary={`${item.client_name} - ${formatCurrency(item.total)}`}
                />
              </ListItem>
            )}
            emptyMessage="No hay cotizaciones pendientes."
            linkTo="/sales/orders?status=QUOTE"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryListCard
            title="Producción Activa"
            icon={<PrecisionManufacturingIcon color="action" />}
            items={lists.inProgressOrders}
            renderItem={(item, index) => (
              <ListItem key={index} divider component={RouterLink} to={`/production/orders/edit/${item.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemText
                  primary={item.order_number}
                  secondary={`${item.product_description} (Cant: ${item.quantity})`}
                />
              </ListItem>
            )}
            emptyMessage="No hay órdenes de producción en progreso."
            linkTo="/production/orders?status=IN_PROGRESS"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
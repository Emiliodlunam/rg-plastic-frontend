import React, { useState, useEffect, useCallback } from 'react'; // Se importa useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { getSalesOrderById, updateOrderStatus } from '../../api/salesService';
import {
  Box, Paper, Typography, CircularProgress, Alert, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, Button, Chip, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CancelIcon from '@mui/icons-material/Cancel';

// Helper para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Helper para formatear moneda
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return `$${parseFloat(amount).toFixed(2)}`;
};

// Mapeo de estados a colores
const statusColors = {
    QUOTE: 'default',
    CONFIRMED: 'info',
    IN_PROGRESS: 'secondary',
    COMPLETED: 'success',
    CANCELLED: 'error'
};

const OrderDetailPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { orderId } = useParams();
  const navigate = useNavigate();

  // --- CORRECCIÓN LÓGICA ---
  // Se envuelve la función de carga en useCallback para poder reutilizarla de forma segura.
  const fetchOrderDetails = useCallback(async () => {
    try {
      // No mostramos el spinner principal en las recargas para una mejor experiencia.
      // setLoading(true);
      const response = await getSalesOrderById(orderId);
      setOrder(response.data.data);
    } catch (err) {
      setError('Error al cargar los detalles del pedido. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [orderId]); // La función se recreará solo si el orderId cambia.

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`¿Estás seguro de que deseas cambiar el estado a "${newStatus}"?`)) return;
    
    setActionLoading(true);
    setError('');
    try {
        await updateOrderStatus(orderId, newStatus);
        // --- CORRECCIÓN LÓGICA ---
        // En lugar de usar la respuesta parcial de la actualización,
        // volvemos a llamar a nuestra función que carga los datos completos.
        await fetchOrderDetails();
    } catch (err) {
        setError('Error al actualizar el estado. ' + (err.response?.data?.message || err.message));
    } finally {
        setActionLoading(false);
    }
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  
  // Muestra el error principal si no es un error de los botones de acción
  if (error && !actionLoading) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (!order) {
    return <Typography sx={{ m: 3 }}>No se encontró el pedido.</Typography>;
  }

  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Detalle del Pedido: {order.order_number}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sales/orders')}
        >
          Volver a la lista
        </Button>
      </Box>
      <Chip label={order.status} color={statusColors[order.status] || 'default'} sx={{ mb: 3 }} />

      {/* Muestra un error si ocurre durante una acción de cambio de estado */}
      {error && actionLoading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Acciones del Pedido</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
            {order.status === 'QUOTE' && (
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<ThumbUpIcon />}
                    onClick={() => handleStatusChange('CONFIRMED')}
                    disabled={actionLoading}
                >
                    Confirmar Pedido
                </Button>
            )}
             {(order.status === 'CONFIRMED' || order.status === 'IN_PROGRESS') && (
                <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleStatusChange('COMPLETED')}
                    disabled={actionLoading}
                >
                    Marcar como Completado
                </Button>
            )}
            {(order.status !== 'COMPLETED' && order.status !== 'CANCELLED') && (
                 <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<CancelIcon />}
                    onClick={() => handleStatusChange('CANCELLED')}
                    disabled={actionLoading}
                >
                    Cancelar Pedido
                 </Button>
            )}
            {actionLoading && <CircularProgress size={24} />}
        </Stack>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Información del Cliente</Typography>
            <Typography variant="body1"><strong>Nombre:</strong> {order.client_name}</Typography>
            <Typography variant="body1"><strong>Código:</strong> {order.client_code}</Typography>
            <Typography variant="body1"><strong>Dirección:</strong> {order.client_address || 'N/A'}</Typography>
        </Grid>

        <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Detalles del Pedido</Typography>
            <Typography variant="body1"><strong>Fecha del Pedido:</strong> {formatDate(order.order_date)}</Typography>
            <Typography variant="body1"><strong>Fecha de Entrega:</strong> {formatDate(order.delivery_date)}</Typography> {/* <-- AÑADIR LÍNEA */}
            <Typography variant="body1"><strong>Notas:</strong> {order.notes || 'Sin notas'}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>Productos Incluidos</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Cantidad</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Precio Unitario</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Ahora el .map() es seguro porque la recarga de datos garantiza que 'order.products' siempre exista */}
            {order.products.map((product, index) => (
              <TableRow key={index}>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell align="right">{product.quantity} {product.unit}</TableCell>
                <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                <TableCell align="right">{formatCurrency(product.quantity * product.price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Box sx={{ width: '100%', maxWidth: 350 }}>
          <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Impuestos (16%):</span>
              <span>{formatCurrency(order.tax_amount)}</span>
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total:</span>
              <strong>{formatCurrency(order.total)}</strong>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default OrderDetailPage;
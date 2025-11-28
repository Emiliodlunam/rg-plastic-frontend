import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductionOrders } from '../../api/productionService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  InputAdornment, Pagination, Stack, Chip,
  Select, MenuItem, FormControl, InputLabel // Para el filtro de estado
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';

// Formato de fecha simplificado
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES');
};

// Mapeo de estados a colores
const statusColors = {
    PENDING: 'warning',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    CANCELLED: 'error'
};
const priorityColors = {
    LOW: 'success',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'error'
};

const ProductionOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Estado para el filtro

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const filters = { search: searchTerm, page, limit: 10 };
      if (statusFilter) {
        filters.status = statusFilter;
      }
      const response = await getProductionOrders(filters);
      setOrders(response.data.data.items);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error al cargar las órdenes de producción. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, statusFilter]); // Incluir statusFilter en las dependencias

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleStatusFilterChange = (event) => {
      setStatusFilter(event.target.value);
      setPage(1); // Resetear a la página 1 al cambiar filtro
      // No llamamos a fetchOrders aquí, useEffect se encargará al cambiar statusFilter
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Órdenes de Producción
        </Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/production/orders/new')}>
            Nueva Orden
          </Button>
        </Box>
      </Box>

      {/* Barra de Filtros */}
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          sx={{ flexGrow: 1 }} // Ocupa el espacio restante
          size="small"
          variant="outlined"
          placeholder="Buscar por N° Orden o Producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>),
          }}
        />
         <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
                value={statusFilter}
                label="Estado"
                onChange={handleStatusFilterChange}
            >
                <MenuItem value=""><em>Todos</em></MenuItem>
                <MenuItem value="PENDING">Pendiente</MenuItem>
                <MenuItem value="IN_PROGRESS">En Progreso</MenuItem>
                <MenuItem value="COMPLETED">Completada</MenuItem>
                <MenuItem value="CANCELLED">Cancelada</MenuItem>
            </Select>
        </FormControl>
        <Button type="submit" variant="outlined">Buscar</Button>
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
                <TableCell sx={{ fontWeight: 'bold' }}>N° Orden</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Producto</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Cantidad</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha Inicio Plan.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha Fin Plan.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Prioridad</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order.id} 
                  hover 
                  sx={{ cursor: 'pointer' }} 
                  onClick={() => navigate(`/production/orders/${order.id}`)}
                >
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>({order.product_sku}) {order.product_description}</TableCell>
                  <TableCell align="right">{order.quantity}</TableCell>
                  <TableCell>{formatDate(order.planned_start_date)}</TableCell>
                  <TableCell>{formatDate(order.planned_end_date)}</TableCell>
                  <TableCell>
                      <Chip label={order.priority} color={priorityColors[order.priority] || 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={order.status} color={statusColors[order.status] || 'default'} size="small" />
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

export default ProductionOrdersPage;
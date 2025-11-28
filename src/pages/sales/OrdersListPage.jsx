import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSalesOrders } from '../../api/salesService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  InputAdornment, Pagination, Stack, Chip
} from '@mui/material';
import { Add, Search, FileDownload } from '@mui/icons-material';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';

// Función para formatear la fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Mapeo de estados a colores para el Chip
const statusColors = {
  QUOTE: 'default',
  CONFIRMED: 'info',
  IN_PROGRESS: 'secondary',
  COMPLETED: 'success',
  CANCELLED: 'error'
};

const OrdersListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Estados para la Exportación
  const [exportData, setExportData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const csvLinkRef = useRef(null);

  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getSalesOrders({ search: searchTerm, page, limit: 10 });
      setOrders(response.data.data.items);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error al cargar los pedidos. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Lógica de Exportación
  const handleExport = async () => {
    setExportLoading(true);
    setError('');
    try {
      // Obtener TODOS los pedidos (sin paginación, con un límite alto)
      const response = await getSalesOrders({ search: searchTerm, page: 1, limit: 10000 });
      const allOrders = response.data.data.items;
      
      // Formatear los datos para el CSV
      const formattedData = allOrders.map(order => ({
        Numero_Orden: order.order_number,
        Cliente: order.client_name,
        Fecha_Pedido: formatDate(order.order_date),
        Fecha_Entrega: formatDate(order.delivery_date),
        Total: parseFloat(order.total).toFixed(2),
        Estado: order.status,
      }));
      
      setExportData(formattedData);
      
    } catch (err) {
      setError('Error al preparar la exportación: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportLoading(false);
    }
  };

  // Cuando los datos están listos, se dispara la descarga
  useEffect(() => {
    if (exportData && csvLinkRef.current) {
      csvLinkRef.current.link.click();
      setExportData(null);
    }
  }, [exportData]);

  // Definir las cabeceras para el archivo CSV
  const csvHeaders = [
    { label: "N° Orden", key: "Numero_Orden" },
    { label: "Cliente", key: "Cliente" },
    { label: "Fecha de Pedido", key: "Fecha_Pedido" },
    { label: "Fecha de Entrega", key: "Fecha_Entrega" },
    { label: "Total", key: "Total" },
    { label: "Estado", key: "Estado" }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Historial de Pedidos de Venta
        </Typography>
        <Box>
          {/* Botón de Exportar */}
          <Button
            variant="outlined"
            startIcon={exportLoading ? <CircularProgress size={20} /> : <FileDownload />}
            sx={{ mr: 2 }}
            onClick={handleExport}
            disabled={exportLoading}
          >
            {exportLoading ? 'Preparando...' : 'Exportar a CSV'}
          </Button>
          
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/sales/orders/new')}>
            Nuevo Pedido
          </Button>

          {/* Enlace oculto para la descarga */}
          {exportData && (
            <CSVLink
              data={exportData}
              headers={csvHeaders}
              filename={`reporte_pedidos_venta_${dayjs().format('YYYY-MM-DD')}.csv`}
              ref={csvLinkRef}
              style={{ display: 'none' }}
            />
          )}
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Buscar por N° de Orden o Cliente..."
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
                  <TableCell sx={{ fontWeight: 'bold' }}>N° de Orden</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha Pedido</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha Entrega</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/sales/orders/${order.id}`)}>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.client_name}</TableCell>
                    <TableCell>{formatDate(order.order_date)}</TableCell>
                    <TableCell>{formatDate(order.delivery_date)}</TableCell>
                    <TableCell>${parseFloat(order.total).toFixed(2)}</TableCell>
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

export default OrdersListPage;
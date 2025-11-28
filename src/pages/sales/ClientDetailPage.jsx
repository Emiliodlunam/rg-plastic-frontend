import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById } from '../../api/salesService';
import {
  Box, Paper, Typography, CircularProgress, Alert, Grid,
  Divider, Button, 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

// Helper para formatear moneda
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return `$${parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ClientDetailPage = () => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { clientId } = useParams();
  const navigate = useNavigate();

  const fetchClientDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getClientById(clientId);
      setClient(response.data.data);
    } catch (err) {
      setError('Error al cargar los detalles del cliente. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientDetails();
  }, [fetchClientDetails]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (!client) {
    return <Typography sx={{ m: 3 }}>No se encontró el cliente.</Typography>;
  }

  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Detalle del Cliente: {client.name}
        </Typography>
        <Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/sales/clients/edit/${client.id}`)}
              sx={{ mr: 2 }}
            >
              Editar Cliente
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/sales/clients')}
            >
              Volver a la lista
            </Button>
        </Box>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Columna de Información Principal */}
        <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Información General</Typography>
            <Typography variant="body1" gutterBottom><strong>Código:</strong> {client.code}</Typography>
            <Typography variant="body1" gutterBottom><strong>RFC:</strong> {client.tax_id || 'N/A'}</Typography>
        </Grid>

        {/* Columna de Contacto */}
        <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Información de Contacto</Typography>
            <Typography variant="body1" gutterBottom><strong>Contacto:</strong> {client.contact}</Typography>
            <Typography variant="body1" gutterBottom><strong>Teléfono:</strong> {client.phone || 'N/A'}</Typography>
            <Typography variant="body1" gutterBottom><strong>Email:</strong> {client.email || 'N/A'}</Typography>
        </Grid>

        {/* Columna de Dirección */}
         <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Dirección</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{client.address || 'N/A'}</Typography>
        </Grid>

        <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

        {/* Columna de Condiciones Comerciales */}
        <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Condiciones Comerciales</Typography>
            <Typography variant="body1" gutterBottom><strong>Límite de Crédito:</strong> {formatCurrency(client.credit_limit)}</Typography>
            <Typography variant="body1" gutterBottom><strong>Términos de Pago:</strong> {client.payment_terms} días</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ClientDetailPage;
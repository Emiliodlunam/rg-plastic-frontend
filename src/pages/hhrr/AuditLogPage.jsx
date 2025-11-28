import React, { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '../../api/auditService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, CircularProgress, Alert, TextField,
  Grid, Button, Pagination, Stack, Chip
} from '@mui/material';
import { FilterList } from '@mui/icons-material';


// Helper para formatear fecha y hora
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return new Date(dateString).toLocaleString('es-ES', options);
};

// --- FUNCIÓN DE CORRECCIÓN ---
// Esta función intenta parsear los detalles como JSON.
// Si falla, devuelve el texto original.
const formatDetails = (details) => {
    try {
        // Intenta parsear y re-formatear como JSON bonito
        return JSON.stringify(JSON.parse(details), null, 2);
    } catch (e) {
        // Si falla (porque es un string simple), devuelve el string tal cual.
        return details; 
    }
};

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const cleanFilters = {};
      if (filters.action) cleanFilters.action = filters.action;
      if (filters.startDate) cleanFilters.startDate = filters.startDate;
      if (filters.endDate) cleanFilters.endDate = filters.endDate;

      const response = await getAuditLogs({ ...cleanFilters, page, limit: 15 });
      setLogs(response.data.data.items);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      setError('Error al cargar los logs de auditoría. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const handleApplyFilters = () => {
      setPage(1);
      fetchLogs();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        Registro de Auditoría del Sistema
      </Typography>

      {/* Sección de Filtros */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Filtrar por Acción (ej: CREATE_PRODUCT)" name="action" value={filters.action} onChange={handleFilterChange} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth size="small" type="date" label="Fecha de Inicio" name="startDate" value={filters.startDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth size="small" type="date" label="Fecha de Fin" name="endDate" value={filters.endDate} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button fullWidth variant="outlined" onClick={handleApplyFilters} startIcon={<FilterList />}>Filtrar</Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha y Hora</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Acción</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Detalles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                  <TableCell>{log.user_name}</TableCell>
                  <TableCell><Chip label={log.action} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell>
                    {/* --- APLICACIÓN DE LA CORRECCIÓN --- */}
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.75rem' }}>
                      {formatDetails(log.details)}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {logs.length === 0 && !loading && (
            <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
              No hay registros de auditoría para los filtros seleccionados.
            </Typography>
          )}
        </TableContainer>
        <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Stack>
        </>
      )}
    </Paper>
  );
};

export default AuditLogPage;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getShifts, createShift, updateShift, deleteShift, getEmployees } from '../../api/hhrrService';
import ShiftFormModal from '../../components/hhrr/ShiftFormModal';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, CircularProgress, Alert, TextField,
  Grid, IconButton, Tooltip, Autocomplete, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { Add, Edit, Delete, FilterList, CalendarMonth, TableChart } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import dayjs from 'dayjs';

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('es-ES') : 'N/A';

const formatShiftsToEvents = (shifts) => {
  return shifts.map(shift => ({
    id: shift.id,
    title: `${shift.employee_name} (${shift.duration}h)`,
    start: shift.date,
    allDay: true,
    extendedProps: { ...shift }
  }));
};

const ShiftsPage = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'calendar'
  
  const [filters, setFilters] = useState({
    startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('week').format('YYYY-MM-DD'),
    employeeId: ''
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [newShiftDate, setNewShiftDate] = useState(null);
  const calendarRef = useRef(null);

  const fetchShifts = useCallback(async (fetchInfo) => {
    try {
      setLoading(true);
      setError('');
      
      let cleanFilters = {};
      
      // Si viene de FullCalendar (tiene fetchInfo)
      if (fetchInfo && fetchInfo.startStr) {
        cleanFilters.startDate = fetchInfo.startStr.slice(0, 10);
        cleanFilters.endDate = fetchInfo.endStr.slice(0, 10);
      } else {
        // Si viene de los filtros manuales
        if (filters.startDate) cleanFilters.startDate = filters.startDate;
        if (filters.endDate) cleanFilters.endDate = filters.endDate;
      }
      
      if (filters.employeeId) cleanFilters.employeeId = filters.employeeId;

      const response = await getShifts(cleanFilters);
      setShifts(response.data.data);
      
      // Si estamos en modo calendario, retornamos los eventos formateados
      if (fetchInfo) {
        return formatShiftsToEvents(response.data.data);
      }
    } catch (err) {
      setError('Error al cargar los turnos. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (viewMode === 'table') {
      fetchShifts();
    }
  }, [fetchShifts, viewMode]);

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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const handleEmployeeFilterChange = (event, newValue) => {
    setFilters({ ...filters, employeeId: newValue ? newValue.id : '' });
  };

  const handleApplyFilters = () => {
    if (viewMode === 'table') {
      fetchShifts();
    } else if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents();
    }
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleOpenCreate = (date) => {
    setEditingShift(null);
    setNewShiftDate(date || new Date());
    setModalOpen(true);
  };

  const handleOpenEdit = (shift) => {
    setEditingShift(shift);
    setNewShiftDate(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingShift(null);
    setNewShiftDate(null);
  };

  const handleSaveShift = async (data, shiftId) => {
    if (editingShift || shiftId) {
      await updateShift(editingShift?.id || shiftId, data);
    } else {
      await createShift(data);
    }
    
    if (viewMode === 'table') {
      fetchShifts();
    } else if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents();
    }
  };

  const handleDelete = async (shiftId) => {
    if (window.confirm('¿Estás seguro de eliminar este turno?')) {
      try {
        await deleteShift(shiftId);
        if (viewMode === 'table') {
          fetchShifts();
        } else if (calendarRef.current) {
          calendarRef.current.getApi().refetchEvents();
        }
      } catch (err) {
        setError('Error al eliminar el turno. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const renderEventContent = (eventInfo) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
        <Typography sx={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>
          {eventInfo.event.title}
        </Typography>
        <Tooltip title="Eliminar Turno">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(eventInfo.event.id);
            }}
            sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 }, ml: 0.5 }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Planificación de Turnos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="table">
              <TableChart sx={{ mr: 1 }} />
              Tabla
            </ToggleButton>
            <ToggleButton value="calendar">
              <CalendarMonth sx={{ mr: 1 }} />
              Calendario
            </ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenCreate()}>
            Asignar Turno
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField 
              fullWidth 
              size="small" 
              type="date" 
              label="Desde" 
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
              label="Hasta" 
              name="endDate" 
              value={filters.endDate} 
              onChange={handleFilterChange} 
              InputLabelProps={{ shrink: true }} 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={employees}
              getOptionLabel={(option) => option.name}
              onChange={handleEmployeeFilterChange}
              renderInput={(params) => (
                <TextField {...params} label="Filtrar por Empleado" size="small" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={handleApplyFilters} 
              startIcon={<FilterList />}
            >
              Filtrar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Vista de Tabla */}
      {viewMode === 'table' && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Empleado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Máquina</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Duración (h)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift.id} hover>
                      <TableCell>{shift.employee_name}</TableCell>
                      <TableCell>{formatDate(shift.date)}</TableCell>
                      <TableCell>{shift.machine || '-'}</TableCell>
                      <TableCell align="right">{parseFloat(shift.duration).toFixed(1)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar Turno">
                          <IconButton color="primary" size="small" onClick={() => handleOpenEdit(shift)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar Turno">
                          <IconButton color="error" size="small" onClick={() => handleDelete(shift.id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {shifts.length === 0 && !loading && (
                <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                  No hay turnos asignados para los filtros seleccionados.
                </Typography>
              )}
            </TableContainer>
          )}
        </>
      )}

      {/* Vista de Calendario */}
      {viewMode === 'calendar' && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            events={fetchShifts}
            locale={esLocale}
            editable={false}
            selectable={true}
            dateClick={(arg) => handleOpenCreate(arg.date)}
            eventClick={(arg) => handleOpenEdit(arg.event.extendedProps)}
            eventContent={renderEventContent}
            height="70vh"
          />
        </Paper>
      )}

      <ShiftFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveShift}
        existingShift={editingShift}
        initialDate={newShiftDate}
      />
    </Paper>
  );
};

export default ShiftsPage;
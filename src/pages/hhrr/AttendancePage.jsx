// src/pages/hhrr/AttendancePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAttendances, registerAttendance } from '../../api/hhrrService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Button, Box, Typography, CircularProgress, Alert, TextField,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';

const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    if (timeString.length >= 5) {
      return timeString.substring(0, 5);
    }
    return timeString;
};

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [manualTime, setManualTime] = useState(dayjs());
  const [absenceReason, setAbsenceReason] = useState('');
  const [overtimeHours, setOvertimeHours] = useState(0);

  // Cargar asistencias (que ahora incluye a todos los empleados activos)
  const fetchAttendances = useCallback(async () => {
    try {
      setLoading(true); setError(''); setSuccess('');
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await getAttendances({ startDate: dateStr, endDate: dateStr });
      setAttendanceData(response.data.data);
    } catch (err) {
      setError('Error al cargar las asistencias. ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  }, [selectedDate]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  // Lógica de apertura/cierre del Modal
  const openModal = (employee, type) => {
    setSelectedEmployee(employee);
    setModalType(type);
    
    // Usamos el 'employee_id' que viene del 'LEFT JOIN'
    if (type === 'entry' && employee.entry_time) {
        setManualTime(dayjs(employee.entry_time, 'HH:mm:ss'));
    } else if (type === 'exit' && employee.exit_time) {
        setManualTime(dayjs(employee.exit_time, 'HH:mm:ss'));
    } else if (type === 'absence') {
        setAbsenceReason(employee.absence_reason || 'Falta');
    } else if (type === 'overtime') {
        setOvertimeHours(employee.overtime_hours || 0);
    } else {
        setManualTime(dayjs()); 
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEmployee(null);
    setModalType(null);
    setManualTime(dayjs());
    setAbsenceReason('');
    setOvertimeHours(0);
  };

  // Lógica de guardado del Modal
  const handleModalSubmit = async () => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    // Usamos 'employee_id' que es la llave primaria de la tabla 'employees'
    let payload = { employee_id: selectedEmployee.employee_id, date: dateStr };

    if (modalType === 'entry') {
      payload.entry_time = manualTime.format('HH:mm:ss');
    } else if (modalType === 'exit') {
      payload.exit_time = manualTime.format('HH:mm:ss');
    } else if (modalType === 'absence') {
      if (!absenceReason) { alert('El motivo no puede estar vacío.'); return; }
      payload.absence_reason = absenceReason;
    } else if (modalType === 'overtime') {
      const parsedHours = parseFloat(overtimeHours);
      if (isNaN(parsedHours) || parsedHours < 0) { alert('Las horas extra deben ser un número válido.'); return; }
      payload.overtime_hours = parsedHours;
    }

    try {
      setError(''); setSuccess('');
      await registerAttendance(payload);
      setSuccess('Registro actualizado correctamente.');
      fetchAttendances(); 
      closeModal(); 
    } catch (err) {
      setError('Error al registrar: ' + (err.response?.data?.message || err.message));
    }
  };

  const getModalTitle = () => {
      if (!selectedEmployee) return '';
      switch(modalType) {
          case 'entry': return `Registrar Entrada: ${selectedEmployee.employee_name}`;
          case 'exit': return `Registrar Salida: ${selectedEmployee.employee_name}`;
          case 'absence': return `Registrar Falta: ${selectedEmployee.employee_name}`;
          case 'overtime': return `Registrar Horas Extra: ${selectedEmployee.employee_name}`;
          default: return '';
      }
  };

  return (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Control de Asistencia Diaria
        </Typography>
        <DatePicker
          label="Seleccionar Fecha"
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Empleado</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Cargo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Entrada</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Salida</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>H. Extra</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado/Notas</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((emp) => (
                <TableRow key={emp.employee_id} hover>
                  <TableCell>{emp.employee_name}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell align="center">{formatTime(emp.entry_time)}</TableCell>
                  <TableCell align="center">{formatTime(emp.exit_time)}</TableCell>
                  <TableCell align="center">{emp.overtime_hours || '0'}</TableCell>
                  <TableCell>
                    {emp.absence_reason ? (<Chip label={emp.absence_reason} color="error" size="small" />) : (emp.entry_time ? (<Chip label="Presente" color="success" variant="outlined" size="small" />) : (<Chip label="Sin Registro" size="small" />))}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Registrar/Editar Entrada"><span><IconButton color="success" onClick={() => openModal(emp, 'entry')} disabled={!!emp.absence_reason}><LoginIcon /></IconButton></span></Tooltip>
                    <Tooltip title="Registrar/Editar Salida"><span><IconButton color="error" onClick={() => openModal(emp, 'exit')} disabled={!emp.entry_time || !!emp.absence_reason}><LogoutIcon /></IconButton></span></Tooltip>
                    <Tooltip title="Registrar Falta"><span><IconButton color="warning" onClick={() => openModal(emp, 'absence')} disabled={!!emp.entry_time}><DoNotDisturbOnIcon /></IconButton></span></Tooltip>
                    <Tooltip title="Añadir Horas Extra"><span><IconButton color="primary" onClick={() => openModal(emp, 'overtime')} disabled={!emp.exit_time}><AccessAlarmsIcon /></IconButton></span></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* --- MODAL PARA REGISTRO MANUAL --- */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="xs" fullWidth>
        <DialogTitle>{getModalTitle()}</DialogTitle>
        <DialogContent>
            <Box sx={{ pt: 2 }}>
                {(modalType === 'entry' || modalType === 'exit') && (
                    <TimePicker
                        label={modalType === 'entry' ? 'Hora de Entrada' : 'Hora de Salida'}
                        value={manualTime}
                        onChange={(newTime) => setManualTime(newTime)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                )}
                {modalType === 'absence' && (
                    <TextField autoFocus margin="dense" label="Motivo de la Falta" type="text" fullWidth variant="standard" value={absenceReason} onChange={(e) => setAbsenceReason(e.target.value)} />
                )}
                {modalType === 'overtime' && (
                    <TextField autoFocus margin="dense" label="Horas Extra (ej: 2.5)" type="number" fullWidth variant="standard" value={overtimeHours} onChange={(e) => setOvertimeHours(e.target.value)} InputProps={{ inputProps: { step: "0.5", min: 0 } }} />
                )}
            </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancelar</Button>
          <Button onClick={handleModalSubmit} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AttendancePage;
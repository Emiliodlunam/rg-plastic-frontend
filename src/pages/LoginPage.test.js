import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Se necesita el Router para que useNavigate funcione
import { AuthContext } from '../context/AuthContext';
import LoginPage from './LoginPage';

// Simulamos la función useNavigate para espiar sus llamadas
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Mantenemos todo lo real de la librería
  useNavigate: () => mockedNavigate,      // Pero reemplazamos 'useNavigate' con nuestro espía
}));

const renderWithProviders = (component, providerProps) => {
  return render(
    <Router>
      <AuthContext.Provider value={providerProps}>
        {component}
      </AuthContext.Provider>
    </Router>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    mockedNavigate.mockClear(); // Limpiamos el espía antes de cada prueba
  });

  it('debe llamar a la función de login y navegar en caso de éxito', async () => {
    // Arrange
    const mockLogin = jest.fn().mockResolvedValue({ success: true });
    renderWithProviders(<LoginPage />, { login: mockLogin });

    // Act
    fireEvent.change(screen.getByLabelText(/Nombre de Usuario/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
    });
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard'); // Verificamos que se redirige
  });

  it('debe mostrar un mensaje de error si el login falla', async () => {
    // Arrange
    const mockLogin = jest.fn().mockResolvedValue({ success: false, message: 'Credenciales incorrectas' });
    renderWithProviders(<LoginPage />, { login: mockLogin });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    // Assert
    const errorMessage = await screen.findByText(/Credenciales incorrectas/i);
    expect(errorMessage).toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled(); // Verificamos que NO se redirige
  });
});
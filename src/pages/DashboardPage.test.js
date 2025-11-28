import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthContext } from '../context/AuthContext';
import DashboardPage from './DashboardPage';

// Ayudante para renderizar con el contexto
const renderWithAuthContext = (component, providerProps) => {
  return render(
    <AuthContext.Provider value={providerProps}>
      {component}
    </AuthContext.Provider>
  );
};

describe('DashboardPage', () => {
  
  it('debe mostrar el mensaje de bienvenida con el nombre de usuario correcto', () => {
    const mockProviderProps = {
      user: { username: 'superadmin' },
    };

    renderWithAuthContext(<DashboardPage />, mockProviderProps);

    const welcomeMessage = screen.getByText(/Bienvenido al Sistema de Gestión, superadmin/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  it('debe mostrar "Usuario" si el objeto user es nulo', () => {
    const mockProviderProps = {
      user: null,
    };

    renderWithAuthContext(<DashboardPage />, mockProviderProps);

    const fallbackMessage = screen.getByText(/Bienvenido al Sistema de Gestión, Usuario/i);
    expect(fallbackMessage).toBeInTheDocument();
  });
});
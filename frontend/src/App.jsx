import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { BrandingProvider } from './contexts/BrandingContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/routes';
import store from './store/store';
import './styles/index.css';

const AuthenticatedLayout = ({ children }) => {
  const location = useLocation();
  const isPublicRoute = location.pathname === '/login' || location.pathname === '/signup';
  
  if (isPublicRoute) {
    return children;
  }
  
  return <Layout>{children}</Layout>;
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <UserProvider>
            <BrandingProvider persistToLocalStorage={true}>
              <AuthenticatedLayout>
                <AppRoutes />
              </AuthenticatedLayout>
            </BrandingProvider>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;

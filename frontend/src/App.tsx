import { useEffect } from 'react';
import AppRoutes from './routes';
import { Toast } from './components/ui/Toast';
import { useAuthStore } from './store/auth.store';

const App = () => {
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <>
      <AppRoutes />
      <Toast />
    </>
  );
};

export default App;

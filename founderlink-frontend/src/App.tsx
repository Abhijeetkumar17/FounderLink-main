import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import store from './store/store';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;

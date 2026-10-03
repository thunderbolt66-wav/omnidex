import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminStandaloneApp from './components/AdminStandaloneApp';
import './index.css';

ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <AdminStandaloneApp />
  </React.StrictMode>
);

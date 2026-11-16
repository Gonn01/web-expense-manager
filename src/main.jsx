import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import React from 'react';
import { useUIStore } from '@/store/use-ui-store';
import { applyTheme } from '@/utils/theme';

applyTheme(useUIStore.getState().themeMode);

createRoot(document.querySelector('#root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);

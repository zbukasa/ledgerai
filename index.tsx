

import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContainer from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CategoryProvider } from './contexts/CategoryContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <LanguageProvider>
          <CategoryProvider>
            <AppContainer />
          </CategoryProvider>
        </LanguageProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StoreProvider } from './store';
import { CourseBuilderProvider } from './context/CourseBuilderContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <StoreProvider>
      <CourseBuilderProvider>
        <App />
      </CourseBuilderProvider>
    </StoreProvider>
  </React.StrictMode>
);

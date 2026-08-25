import React from 'react';
import { AppProvider } from './context/AppContext';
import { PhoneFrame } from './components/layout/PhoneFrame';

function App() {
  return (
    <AppProvider>
      <PhoneFrame />
    </AppProvider>
  );
}

export default App;

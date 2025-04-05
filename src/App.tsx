import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import Dashboard from './pages/Dashboard';
import Todos from './pages/Todos';
import Items from './pages/Items';
import SystemStatus from './pages/SystemStatus';
import AppHeader from './components/AppHeader';
import AppNavbar from './components/AppNavbar';

function App() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>

      <AppShell.Navbar>
        <AppNavbar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/items" element={<Items />} />
          <Route path="/system" element={<SystemStatus />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;

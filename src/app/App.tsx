import { useEffect } from 'react';
import { AppProvider, useApp } from './store/appStore';
import Layout from './layout/Layout';
import CommandPalette from './components/CommandPalette';

// Pages
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Projects from './pages/Projects';
import Founders from './pages/Founders';
import CheckIn from './pages/CheckIn';
import Clients from './pages/Clients';
import Finance from './pages/Finance';
import Meetings from './pages/Meetings';
import KnowledgeBase from './pages/KnowledgeBase';
import Analytics from './pages/Analytics';
import Gamification from './pages/Gamification';
import Notifications from './pages/Notifications';
import Login from './pages/Login';

const PAGE_MAP: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  crm: CRM,
  projects: Projects,
  founders: Founders,
  checkin: CheckIn,
  clients: Clients,
  finance: Finance,
  meetings: Meetings,
  kb: KnowledgeBase,
  analytics: Analytics,
  gamification: Gamification,
  notifications: Notifications,
};

function AppShell() {
  const { currentPage, isDark, currentFounder, setCurrentFounder } = useApp();

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    // Check if founder is stored in local storage
    const storedFounderId = localStorage.getItem('founderId');
    if (storedFounderId && currentFounder === '') {
      setCurrentFounder(storedFounderId);
    }
  }, [currentFounder, setCurrentFounder]);

  if (!currentFounder) {
    return <Login onLogin={(founder) => setCurrentFounder(founder.id)} />;
  }

  const Page = PAGE_MAP[currentPage] ?? Dashboard;

  return (
    <>
      <Layout>
        <Page />
      </Layout>
      <CommandPalette />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

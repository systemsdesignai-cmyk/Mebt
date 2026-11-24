import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppShell } from './components/AppShell';
import { OnboardingFlow } from './modules/onboarding/OnboardingFlow';
import { HomeScreen } from './modules/dashboard/HomeScreen';
import { CasesScreen } from './modules/cases/CasesScreen';
import { RightsScreen } from './modules/rights/RightsScreen';
import { VaultScreen } from './modules/vault/VaultScreen';
import { ProfileScreen } from './modules/profile/ProfileScreen';
import { AssistanceScreen } from './modules/assistance/AssistanceScreen';
import { NotificationsScreen } from './modules/notifications/NotificationsScreen';

const MebtWorkspace: React.FC = () => {
  const { state, activeTab } = useApp();

  if (!state.user.onboardingCompleted) {
    return <OnboardingFlow />;
  }

  return (
    <AppShell>
      {activeTab === 'home' && <HomeScreen />}
      {activeTab === 'cases' && <CasesScreen />}
      {activeTab === 'rights' && <RightsScreen />}
      {activeTab === 'vault' && <VaultScreen />}
      {activeTab === 'profile' && <ProfileScreen />}
      {activeTab === 'assistance' && <AssistanceScreen />}
      {activeTab === 'notifications' && <NotificationsScreen />}
    </AppShell>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MebtWorkspace />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;

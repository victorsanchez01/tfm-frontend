import { AppRoutes } from '@apps/root/routes'
import { AppProviders } from '@shared/providers/AppProviders'

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}

export default App

import Home from './pages/Home.tsx'
import MapPage from './pages/MapPage.tsx'
import { useHashRoute } from './hooks/useHashRoute.ts'

export default function App() {
  const route = useHashRoute()
  return route === 'map' ? <MapPage /> : <Home />
}

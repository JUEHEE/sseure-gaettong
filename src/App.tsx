import Home from './pages/Home.tsx'
import MapPage from './pages/MapPage.tsx'
import { useRoute } from './hooks/useRoute.ts'

export default function App() {
  const route = useRoute()
  return route === 'map' ? <MapPage /> : <Home />
}

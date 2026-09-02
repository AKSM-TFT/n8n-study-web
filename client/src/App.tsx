import { Outlet, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Directory from './pages/Directory'
import Chat from './pages/Chat'
import Quiz from './pages/Quiz'
import NotFound from './pages/NotFound'
import { RequireAuth } from './components/RequireAuth'
import { DirectoryProvider } from './lib/DirectoryContext'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireAuth />}>
        <Route
          element={
            <DirectoryProvider>
              <Outlet />
            </DirectoryProvider>
          }
        >
          <Route path="/directories" element={<Directory />} />
          <Route path="/directories/:directoryId/chat" element={<Chat />} />
          <Route path="/directories/:directoryId/quiz" element={<Quiz />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import MainLayout from "./layout/MainLayout.jsx"
import routes from "./config/routes.jsx"
import { NotesProvider } from "./context/NotesContext.jsx"
import { ThemeProvider } from "./context/ThemeContext.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import Login from "./pages/Login.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import PublicRoute from "./components/PublicRoute.jsx"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotesProvider>
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                {routes.map((route, index) => {
                  return route.redirectTo ? (
                    <Route
                      key={index}
                      path={route.path}
                      element={<Navigate to={route.redirectTo} />}
                    />
                  ) : (
                    <Route
                      key={index}
                      path={route.path}
                      element={route.element} />
                  )
                })}
              </Route>
            </Routes>
          </NotesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
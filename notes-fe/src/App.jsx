import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import MainLayout from "./layout/MainLayout.jsx"
import routes from "./config/routes.jsx"
import { NotesProvider } from "./context/NotesContext.jsx"
import { ThemeProvider } from "./context/ThemeContext.jsx"
import Login from "./pages/Login.jsx"

function App() {
  return (
    <ThemeProvider>
      <NotesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<MainLayout />}>
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
        </BrowserRouter>
      </NotesProvider>
    </ThemeProvider>
  )
}

export default App
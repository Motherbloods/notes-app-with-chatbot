import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import MainLayout from "./layout/MainLayout.jsx"
import routes from "./config/routes.jsx"
import { NotesProvider } from "./context/NotesContext.jsx"

function App() {
  return (
    <NotesProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {
              routes.map((route, index) => {
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
              })
            }
          </Route>
        </Routes>
      </BrowserRouter>
    </NotesProvider>
  )
}

export default App

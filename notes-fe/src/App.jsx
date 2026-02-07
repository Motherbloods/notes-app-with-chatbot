import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import MainLayout from "./layout/Mainlayout"
import routes from "./config/routes.jsx"

function App() {
  return (
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
  )
}

export default App

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import MainLayout from "./layout/MainLayout.jsx"
import routes from "./config/routes.jsx"
import { NotesProvider } from "./context/NotesContext.jsx"
import { ThemeProvider } from "./context/ThemeContext.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
const Login = lazy(() => import("./pages/Login.jsx"));
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import PublicRoute from "./components/PublicRoute.jsx"
import { Toaster } from "react-hot-toast";
import { Suspense, lazy } from "react";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotesProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  {routes.map((route, index) => {
                    return route.redirectTo ? (
                      <Route
                        key={index}
                        path={route.path}
                        element={<Navigate to={route.redirectTo} />}
                      />
                    ) : (
                      <Route key={index} path={route.path} element={route.element} />
                    );
                  })}
                </Route>
              </Routes>
            </Suspense>
          </NotesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider >
  );
}

export default App
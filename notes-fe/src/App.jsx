import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { NotesProvider } from "./context/NotesContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";
import { Suspense, lazy } from "react";

const MainLayout = lazy(() => import("./layout/MainLayout.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import routes from "./config/routes.jsx";
import LayoutSkeleton from "./components/LayoutSkeleton.jsx";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotesProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <Suspense fallback={<LayoutSkeleton />}>
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
                      <Route
                        key={index}
                        path={route.path}
                        element={route.element}
                      />
                    );
                  })}
                </Route>
              </Routes>
            </Suspense>
          </NotesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

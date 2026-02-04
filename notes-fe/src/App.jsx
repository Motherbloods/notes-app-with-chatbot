import { BrowserRouter, Route, Routes } from "react-router-dom"
import MainLayout from "./layout/Mainlayout"
import Notes from "./pages/Notes"
import ChatBot from "./pages/ChatBot"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Notes />}></Route>
          <Route path="/chatbot" element={<ChatBot />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

import Notes from "../pages/Notes";
import NotesPage from "../pages/NotesPage";
import ChatBot from "../pages/ChatBot";

const routes = [
  {
    path: "/",
    redirectTo: "/notes/new",
  },
  { path: "/notes/new", element: <Notes /> },
  { path: "/notes/:categoryKey", element: <NotesPage /> },
  { path: "/chatbot", element: <ChatBot /> },
];

export default routes;

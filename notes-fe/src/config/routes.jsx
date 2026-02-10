import Notes from "../pages/Notes";
import NotesPage from "../pages/NotesPage";
import ChatBot from "../pages/ChatBot";
import SearchResults from "../pages/SearchResults";

const routes = [
  {
    path: "/",
    redirectTo: "/notes/new",
  },
  { path: "/notes/new", element: <Notes /> },
  { path: "/notes/:categoryKey", element: <NotesPage /> },
  { path: "/chatbot", element: <ChatBot /> },
  { path: "/search", element: <SearchResults /> }
];

export default routes;

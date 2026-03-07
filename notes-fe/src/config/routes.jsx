import { lazy } from "react";

const Notes = lazy(() => import("../pages/Notes"));
const NotesPage = lazy(() => import("../pages/NotesPage"));
const ChatBot = lazy(() => import("../pages/ChatBot"));
const SearchResults = lazy(() => import("../pages/SearchResults"));

const routes = [
  { path: "/", redirectTo: "/notes/new" },
  { path: "/notes/new", element: <Notes /> },
  { path: "/notes/:categoryKey", element: <NotesPage /> },
  { path: "/chatbot", element: <ChatBot /> },
  { path: "/search", element: <SearchResults /> }
];

export default routes;
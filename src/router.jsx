import { createBrowserRouter } from "react-router-dom";
import { Root } from "./components/Root";
import { EventsPage } from "./pages/EventsPage";
import { EventPage } from "./pages/EventPage";
import { AddEventPage } from "./pages/AddEventPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <EventsPage />,
      },
      {
        path: "/event/:eventId",
        element: <EventPage />,
      },
      {
        path: "/add-event",
        element: <AddEventPage />,
      },
    ],
  },
]);
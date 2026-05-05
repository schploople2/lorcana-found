import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CalendarPage } from './pages/CalendarPage';
import { EventDetailPage } from './pages/EventDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

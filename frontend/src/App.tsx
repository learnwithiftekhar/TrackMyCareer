import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AllJobs from './pages/AllJobs';
import NewApplication from './pages/NewApplication';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<AllJobs />} />
        <Route path="/jobs/new" element={<NewApplication />} />
      </Routes>
    </BrowserRouter>
  );
}

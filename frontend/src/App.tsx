import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AllJobs from './pages/AllJobs';
import NewApplication from './pages/NewApplication';
import JobDetail from './pages/JobDetail';
import Companies from './pages/Companies';
import Interviews from './pages/Interviews';
import NewInterview from './pages/NewInterview';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<AllJobs />} />
        <Route path="/jobs/new" element={<NewApplication />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/interviews/new" element={<NewInterview />} />
      </Routes>
    </BrowserRouter>
  );
}

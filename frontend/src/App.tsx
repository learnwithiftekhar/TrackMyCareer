import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AllJobs from './pages/AllJobs';
import NewApplication from './pages/NewApplication';
import JobDetail from './pages/JobDetail';
import EditJob from './pages/EditJob';
import Companies from './pages/Companies';
import Interviews from './pages/Interviews';
import NewInterview from './pages/NewInterview';
import EditInterview from './pages/EditInterview';
import InterviewDetail from './pages/InterviewDetail';
import ArchivedJobs from './pages/ArchivedJobs';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<AllJobs />} />
        <Route path="/jobs/new" element={<NewApplication />} />
        <Route path="/jobs/archived" element={<ArchivedJobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/jobs/:id/edit" element={<EditJob />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/interviews/new" element={<NewInterview />} />
        <Route path="/interviews/:id" element={<InterviewDetail />} />
        <Route path="/interviews/:id/edit" element={<EditInterview />} />
      </Routes>
    </BrowserRouter>
  );
}

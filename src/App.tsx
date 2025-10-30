import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Login from './components/login';
import RegistrationForm from './components/register-form';
import ForgotPassword from './components/forgot-password';
import './App.css';
import ChangePassword from './components/change-password';
import DashboardRouter from './pages/dashboard/dashboard-router';
import CandidatesPage from './pages/candidates';
import RegisterCandidate from './pages/candidates/register';
import InterviewsPage from './pages/interviews';
import AnalyticsPage from './pages/analytics';
import UsersPage from './pages/users';
import SettingsPage from './pages/settings';
import JobBoard from './pages/job-board';
import JobDetail from './pages/job-detail';
import RegisterJob from './pages/register-job';

import JobCategories from './pages/job-categories';
import Skills from './pages/skills';
import Organizations from './pages/organizations';
import MajorSkills from './pages/major-skills';
import { AuthProvider } from './components/login/authState';
import PrivateRoute from './axios-setup/private-route';
import GoogleAuthSuccess from './components/login/googleSignIn';
import GitHubAuthSuccess from './components/login/githubSignIn';
import Loader from './components/loader/loader';

const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registerform" element={<RegistrationForm />} />
            <Route path="/loader" element={<Loader />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/change" element={<ChangePassword />} />
            <Route
              path="/dashboard"
              element={<PrivateRoute element={<DashboardRouter />} />}
            />
            <Route
              path="/jobs"
              element={<PrivateRoute element={<JobBoard />} />}
            />
            <Route
              path="/candidates"
              element={<PrivateRoute element={<CandidatesPage />} />}
            />
            <Route
              path="/candidates/register"
              element={<PrivateRoute element={<RegisterCandidate />} />}
            />
            <Route
              path="/candidates/edit/:id"
              element={<PrivateRoute element={<RegisterCandidate />} />}
            />
            <Route
              path="/candidates/view/:id"
              element={<PrivateRoute element={<RegisterCandidate />} />}
            />
            <Route
              path="/interviews"
              element={<PrivateRoute element={<InterviewsPage />} />}
            />
            <Route
              path="/analytics"
              element={<PrivateRoute element={<AnalyticsPage />} />}
            />
            <Route
              path="/users"
              element={<PrivateRoute element={<UsersPage />} />}
            />
            <Route
              path="/settings"
              element={<PrivateRoute element={<SettingsPage />} />}
            />

            <Route
              path="/skills"
              element={<PrivateRoute element={<Skills />} />}
            />
            <Route
              path="/organizations"
              element={<PrivateRoute element={<Organizations />} />}
            />
            <Route
              path="/major-skills"
              element={<PrivateRoute element={<MajorSkills />} />}
            />
            <Route
              path="/job-categories"
              element={<PrivateRoute element={<JobCategories />} />}
            />

            <Route
              path="/job-board"
              element={<PrivateRoute element={<JobBoard />} />}
            />
            <Route
              path="/jobs/:id"
              element={<PrivateRoute element={<JobDetail />} />}
            />
            <Route
              path="/register-job"
              element={<PrivateRoute element={<RegisterJob />} />}
            />
            <Route
              path="/google-auth-success"
              element={<GoogleAuthSuccess />}
            />
            <Route
              path="/github-auth-success"
              element={<GitHubAuthSuccess />}
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
};

export default App;

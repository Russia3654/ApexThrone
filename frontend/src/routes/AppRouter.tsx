import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import PublicLayout from '../components/layout/PublicLayout';
import AdminMenuPage from '../pages/private/admin/AdminMenuPage';
import SubjectDelete from '../pages/private/admin/subjects/SubjectDelete';
import SubjectList from '../pages/private/admin/subjects/SubjectList';
import SubjectView from '../pages/private/admin/subjects/SubjectView';
import ContentPage from '../pages/public/ContentPage';
import NotFound from '../pages/public/NotFound';
import Home from '../pages/public/Home';
import Tournaments from '../pages/public/Tournaments';
import AdminLogin from '../pages/private/admin/AdminLogin';
import AdminRoot from './AdminRoot';
import RequireAdmin from './RequireAdmin';
import PageList from '../pages/private/admin/pages/PageList';
import PageEditor from '../pages/private/admin/pages/PageEditor';
import PageDelete from '../pages/private/admin/pages/PageDelete';
import PageView from '../pages/private/admin/pages/PageView';
import SubjectEditor from '../pages/private/admin/subjects/SubjectEditor';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'tournaments', element: <Tournaments /> },
      { path: ':slug', element: <ContentPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoot />,
    children: [
      { path: 'login', element: <AdminLogin /> },
      {
        element: <RequireAdmin />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminMenuPage /> },
              // subjects route
              { path: 'subjects', element: <SubjectList /> },
              { path: 'subjects/SubjectNew', element: <SubjectEditor /> },
              { path: 'subjects/SubjectEdit/:id', element: <SubjectEditor /> },
              { path: 'subjects/SubjectView/:id', element: <SubjectView /> },
              { path: 'subjects/SubjectDelete/:id', element: <SubjectDelete /> },
              // pages route
              { path: 'pages', element: <PageList /> },
              { path: 'pages/new', element: <PageEditor /> },
              { path: 'pages/:id/edit', element: <PageEditor /> },
              { path: 'pages/:id', element: <PageView /> },
              { path: 'pages/:id/delete', element: <PageDelete /> },
            ],
          },
        ],
      },
    ],
  },
]);
const AppRouter = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default AppRouter;

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import AdminMenuPage from '../pages/private/admin/AdminMenuPage';
import SubjectDelete from '../pages/private/admin/subjects/SubjectDelete';
import SubjectEdit from '../pages/private/admin/subjects/SubjectEdit';
import SubjectList from '../pages/private/admin/subjects/SubjectList';
import SubjectNew from '../pages/private/admin/subjects/SubjectNew';
import SubjectView from '../pages/private/admin/subjects/SubjectView';

const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminMenuPage />,
      },
      {
        path: 'subjects',
        element: <SubjectList />,
      },
      {
        path: 'subjects/SubjectNew',
        element: <SubjectNew />,
      },
      {
        path: 'subjects/SubjectView/:id',
        element: <SubjectView />,
      },
      {
        path: 'subjects/SubjectEdit/:id',
        element: <SubjectEdit />,
      },
      {
        path: 'subjects/SubjectDelete/:id',
        element: <SubjectDelete />,
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

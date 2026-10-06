import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import AdminMenuPage from '../pages/private/admin/AdminMenuPage';

const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminMenuPage />,
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

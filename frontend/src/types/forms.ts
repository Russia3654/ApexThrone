import { PageStatus } from './api';

// form fields hold text, because that is what inputs give
export type PageFormValues = {
  parent_ID: string;
  menu_name: string;
  slug: string;
  position: string;
  visible: boolean;
  status: PageStatus;
  max_element: string;
};

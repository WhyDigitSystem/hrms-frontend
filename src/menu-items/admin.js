// assets
import { IconAppWindow, IconPasswordUser, IconUser } from '@tabler/icons-react';

// constant
const icons = { IconUser };

const icons1 = {
  IconPasswordUser
};

const icons2 = {
  IconAppWindow
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const admin = {
  id: 'admin',
  title: 'User Management',
  type: 'group',
  children: [
    {
      id: 'admin',
      title: 'User Creation',
      type: 'item',
      url: '/admin/user-creation/userCreation',
      icon: icons.IconUser,
      breadcrumbs: true
    },
    {
      id: 'rolesAndResponsibilities',
      title: 'Roles And Responsibilities',
      type: 'item',
      url: '/basicMaster/roles',
      icon: icons1.IconPasswordUser
    }
  ]
};

export default admin;

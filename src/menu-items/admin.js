// assets
import { IconUser, IconPasswordUser, IconAppWindow } from '@tabler/icons-react';
import { AiOutlineSchedule } from 'react-icons/ai';

// constant
const icons = { IconUser };

const icons1 = {
  IconPasswordUser
};

const icons2 = {
  IconAppWindow
};

const icons3 = {
  IconLeaveAssigned: AiOutlineSchedule
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
      icon: icons1.IconPasswordUser,
    },
    {
      id: 'screenNames',
      title: 'Screen Names',
      type: 'item',
      url: '/companysetup/ScreenNames',
      icon: icons2.IconAppWindow
    },
    {
      id: 'leaveAssigned',
      title: 'Leave Assigned',
      type: 'item',
      url: '/companysetup/LeaveAssigned',
      icon: icons3.IconLeaveAssigned
    },
  ]
};

export default admin;

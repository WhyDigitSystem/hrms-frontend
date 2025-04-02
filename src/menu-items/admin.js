// assets
import {
  IconAppWindow,
  IconCalendarDollar,
  IconCopyright,
  IconFileTypeDoc,
  IconSettingsPlus,
  IconSquareRoundedPlus
} from '@tabler/icons-react';
import { AiOutlineSchedule } from 'react-icons/ai';

// constant
const icons = {
  IconCopyright
};

const icons1 = {
  IconSquareRoundedPlus
};
const icons2 = {
  IconSettingsPlus
};

const icons3 = {
  IconCalendarDollar
};

const icons4 = {
  IconFileTypeDoc
};

const icons5 = {
  IconAppWindow
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const admin = {
  id: 'admin',
  // title: 'Company Setup',
  type: 'group',
  children: [
    {
      id: 'admin',
      title: 'User Management',
      type: 'collapse',
      icon: icons.IconCopyright,

      children: [
        {
          id: 'admin',
          title: 'User Creation',
          type: 'item',
          url: '/admin/user-creation/userCreation',
          icon: icons1.IconSquareRoundedPlus
        },
        {
          id: 'rolesAndResponsibilities',
          title: 'Roles And Responsibilities',
          type: 'item',
          url: '/basicMaster/roles',
          icon: icons2.IconSettingsPlus
        },
        {
          id: 'screenNames',
          title: 'Screen Names',
          type: 'item',
          url: '/companysetup/ScreenNames',
          icon: icons3.IconCalendarDollar
        },
        {
          id: 'leaveAssigned',
          title: 'Leave Assigned',
          type: 'item',
          url: '/companysetup/LeaveAssigned',
          icon: icons3.IconCalendarDollar
        }
      ]
    }
  ]
};

export default admin;

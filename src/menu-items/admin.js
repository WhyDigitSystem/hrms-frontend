// assets
import {
  IconAppWindow,
  IconCalendarDollar,
  IconCopyright,
  IconFileTypeDoc,
  IconSettingsPlus,
  IconSquareRoundedPlus,
  IconUserPlus,
  IconShield,
  IconListDetails,
  IconCalendarEvent
} from '@tabler/icons-react';
import { AiOutlineSchedule } from 'react-icons/ai';

// constant
const icons = {
  IconCopyright,
  IconUserPlus: IconUserPlus,
  IconShield: IconShield,
  IconListDetails: IconListDetails,
  IconCalendarEvent: IconCalendarEvent
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
  type: 'group',
  children: [
    {
      id: 'admin',
      title: 'User Management',
      type: 'collapse',
      icon: icons.IconShield, // Using shield icon for User Management

      children: [
        {
          id: 'admin',
          title: 'User Creation',
          type: 'item',
          url: '/admin/user-creation/userCreation',
          icon: icons.IconUserPlus // More appropriate icon for user creation
        },
        {
          id: 'rolesAndResponsibilities',
          title: 'Roles And Responsibilities',
          type: 'item',
          url: '/basicMaster/roles',
          icon: icons.IconShield // Shield icon for roles
        },
        {
          id: 'screenNames',
          title: 'Screen Names',
          type: 'item',
          url: '/companysetup/ScreenNames',
          icon: icons.IconListDetails // List icon for screen names
        },
        {
          id: 'leaveAssigned',
          title: 'Leave Assigned',
          type: 'item',
          url: '/companysetup/LeaveAssigned',
          icon: icons.IconCalendarEvent // Calendar event icon for leave
        }
      ]
    }
  ]
};

export default admin;
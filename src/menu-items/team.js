// assets
import { IconCashBanknote, IconDatabaseStar, IconBuildingFactory2, IconIdBadge2,IconMapQuestion, IconUsersGroup, IconWorld ,IconMap ,IconBuildingSkyscraper } from '@tabler/icons-react';

// constant
const icons = {
  IconWorld
};

const icons1 = {
  IconMap
};

const icons0 = {
  IconDatabaseStar
};
const icons2 = {
  IconBuildingSkyscraper
};
const icons3 = {
  IconCashBanknote
};
const icons4 = {
  IconBuildingFactory2 
};
const icons6 = {
  IconIdBadge2
};
const icons7 = {
  IconMapQuestion 
};
const icons8 = {
  IconUsersGroup 
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const team = {
  id: 'team',
  title: '',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'team',
      title: 'Team',
      type: 'collapse',
      icon: icons0.IconDatabaseStar,

      children: [
        {
          id: 'leaveApproval',
          title: 'Leave Approval',
          type: 'item',
          url: '/team/leaveApproval',
          icon: icons.IconWorld
        },
        {
          id: 'permissionApproval',
          title: 'Permission Approval',
          type: 'item',
          url: '/team/permissionApproval',
          icon: icons1.IconMap
        },
        {
          id: 'attendanceReport',
          title: 'Attendance Report',
          type: 'item',
          url: '/team/attendanceReport',
          icon: icons2.IconBuildingSkyscraper
        },
        {
          id: 'todayAttendance',
          title: 'Today Attendance',
          type: 'item',
          url: '/team/todayAttendance',
          icon: icons3.IconCashBanknote
        },
      ]
    }
  ]
};

export default team;

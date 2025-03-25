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

const userType = localStorage.getItem("userType");
const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
  "LEAVE APPROVAL": 'leaveApproval',
  "PERMISSION APPROVAL": 'permissionApproval',
  "ATTENDANCE REPORT": 'attendanceReport',
  "TODAY ATTENDANCE": 'todayAttendance',
};

const allScreens = [
  { id: "leaveApproval", title: "Leave Approval", type: "item", url: "/team/LeaveApproval", icon: icons.IconWorld },
  { id: "permissionApproval", title: "Permission Approval", type: "item", url: "/team/PermissionApproval", icon: icons1.IconMap },
  { id: "attendanceReport", title: "Attendance Report", type: "item", url: "/team/AttendanceReport", icon: icons2.IconBuildingSkyscraper },
  { id: "todayAttendance", title: "Today Attendance", type: "item", url: "/team/TodayAttendance", icon: icons3.IconCashBanknote }
];

const allowedScreenIds = userType === "ADMIN"
  ? allScreens.map(screen => screen.id) // Show all screens for ADMIN
  : allowedScreens.map(screen => screenMapping[screen]).filter(Boolean);

const team = {
  id: 'team',
  // title: 'Team',
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
          url: '/team/LeaveApproval',
          icon: icons.IconWorld
        },
        {
          id: 'permissionApproval',
          title: 'Permission Approval',
          type: 'item',
          url: '/team/PermissionApproval',
          icon: icons1.IconMap
        },
        {
          id: 'attendanceReport',
          title: 'Attendance Report',
          type: 'item',
          url: '/team/AttendanceReport',
          icon: icons2.IconBuildingSkyscraper
        },
        {
          id: 'todayAttendance',
          title: 'Today Attendance',
          type: 'item',
          url: '/team/TodayAttendance',
          icon: icons3.IconCashBanknote
        },
      ].filter((item) => allowedScreenIds.includes(item.id))
    }
  ]
};

export default team;

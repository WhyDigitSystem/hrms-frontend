// assets
import { IconUsers, IconCalendarCheck, IconClockCheck, IconChartBar, IconCalendarEvent, IconUserCheck } from '@tabler/icons-react';

// constant
const icons = {
  IconUsers, // For Team section // For Check In/Out Report
  IconCalendarCheck, // For Leave Approval
  IconUserCheck, // For Permission Approval
  IconChartBar, // For Attendance Report
  IconCalendarEvent, // For Today Attendance
  IconClockCheck // Alternative for attendance
};

const userType = localStorage.getItem('userType');
const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
  'LEAVE APPROVAL': 'leaveApproval',
  'PERMISSION APPROVAL': 'permissionApproval',
  'ATTENDANCE REPORT': 'attendanceReport',
  'TODAY ATTENDANCE': 'todayAttendance',
  'CHECK IN/OUT REPORT': 'employeeAttanceReport'
};

const allScreens = [
  {
    id: 'leaveApproval',
    title: 'Leave Approval',
    type: 'item',
    url: '/team/LeaveApproval',
    icon: icons.IconCalendarCheck
  },
  {
    id: 'permissionApproval',
    title: 'Permission Approval',
    type: 'item',
    url: '/team/PermissionApproval',
    icon: icons.IconUserCheck
  },
  {
    id: 'attendanceReport',
    title: 'Attendance Report',
    type: 'item',
    url: '/team/AttendanceReport',
    icon: icons.IconChartBar
  },
  {
    id: 'todayAttendance',
    title: 'Today Attendance',
    type: 'item',
    url: '/team/TodayAttendance',
    icon: icons.IconCalendarEvent
  },
  {
    id: 'employeeAttanceReport',
    title: 'Check In/Out Report',
    type: 'item',
    url: '/team/EmployeeAttanceReport',
    icon: icons.IconUsers
  }
];

const allowedScreenIds =
  userType === 'ADMIN' ? allScreens.map((screen) => screen.id) : allowedScreens.map((screen) => screenMapping[screen]).filter(Boolean);

const team = {
  id: 'team',
  type: 'group',
  children: [
    {
      id: 'team',
      title: 'Team',
      type: 'collapse',
      icon: icons.IconUsers, // Better represents a team
      children: allScreens.filter((item) => allowedScreenIds.includes(item.id))
    }
  ]
};

export default team;

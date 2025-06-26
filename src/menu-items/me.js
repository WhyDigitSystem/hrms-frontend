// assets
import { IconUsers } from '@tabler/icons-react';
import { FaPersonWalkingLuggage, FaUserClock } from 'react-icons/fa6';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
// constant
const icons = {
  IconUsers,
  FaPersonWalkingLuggage,
  FaUserClock,
  BeachAccessIcon,
  AccessTimeIcon,
  FlightTakeoffIcon,
};

const userType = localStorage.getItem('userType');
const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
  'PERMISSION REQUEST': 'permissionRequest',
  'LEAVE REQUEST': 'leaveRequest',
  'HOLIDAY REPORT': 'holidayReport',
  'SWIPEIN AND SWIPEOUT': 'swipeInSwipeOut',
  'TIME SHEET': 'timeSheet',
  'COMPENSATORY OFF': 'compoOff',
  'WORK FROM HOME': 'WorkFromHome',
  'TRAVEL REQUEST': 'TravelRequest',

};

const allScreens = [
  { id: 'permissionRequest', title: 'Permission Request', type: 'item', url: '/me/permissionRequest', icon: icons.FaUserClock },
  { id: 'leaveRequest', title: 'Leave Request', type: 'item', url: '/me/leaveRequest', icon: icons.FaPersonWalkingLuggage },
  { id: 'holidayReport', title: 'Holiday Report', type: 'item', url: '/me/HolidayReport', icon: icons.BeachAccessIcon },
  { id: 'swipeInSwipeOut', title: 'Check In & Out', type: 'item', url: '/me/SwipeInSwipeOut', icon: icons.AccessTimeIcon },
  { id: 'timeSheet', title: 'Time Sheet', type: 'item', url: '/me/TimeSheet', icon: icons.AccessTimeIcon },
  { id: 'WorkFromHome', title: 'WORK FROM HOME', type: 'item', url: '/me/WorkFromHome', icon: icons.AccessTimeIcon },
  { id: 'TravelRequest', title: 'WORK FROM HOME', type: 'item', url: '/me/TravelRequest', icon: icons.AccessTimeIcon },


  {
    id: 'compoOff',
    title: 'Compensatory Off',
    type: 'item',
    url: '/me/CompoOff',
    icon: icons.AccessTimeIcon // Sun icon for holidays
  }
];

const allowedScreenIds =
  userType === 'ADMIN'
    ? allScreens.map((screen) => screen.id) // Show all screens for ADMIN
    : allowedScreens.map((screen) => screenMapping[screen]).filter(Boolean);

const me = {
  id: 'me',
  // title: 'Me',
  type: 'group',
  children: [
    {
      id: 'me',
      title: 'Me',
      type: 'collapse',
      icon: icons.IconUsers,
      children: [
        {
          id: 'permissionRequest',
          title: 'Permission Request',
          type: 'item',
          url: '/me/permissionRequest',
          icon: icons.FaUserClock
        },
        {
          id: 'leaveRequest',
          title: 'Leave Request',
          type: 'item',
          url: '/me/leaveRequest',
          icon: icons.FaPersonWalkingLuggage
        },
        {
          id: 'holidayReport',
          title: 'Holiday Report',
          type: 'item',
          url: '/me/HolidayReport',
          icon: icons.BeachAccessIcon
        },
        {
          id: 'swipeInSwipeOut',
          title: 'Check In & Out',
          type: 'item',
          url: '/me/SwipeInSwipeOut',
          icon: icons.AccessTimeIcon
        },
        {
          id: 'timeSheet',
          title: 'Time Sheet',
          type: 'item',
          url: '/me/TimeSheet',
          icon: icons.AccessTimeIcon
        },
        {
          id: "compoOff",
          title: "Compensatory Off",
          type: "item",
          url: "/me/CompoOff",
          icon: icons.AccessTimeIcon  // Sun icon for holidays
        },
        {
          id: "WorkFromHome",
          title: "Work From Home",
          type: "item",
          url: "/me/WorkFromHome",
          icon: icons.AccessTimeIcon  // Sun icon for holidays
        },
        {
          id: "TravelRequest",
          title: "Travel Request",
          type: "item",
          url: "/me/TravelRequest",
          icon: icons.FlightTakeoffIcon
        }
      ].filter((item) => allowedScreenIds.includes(item.id))
    }
  ]
};

export default me;

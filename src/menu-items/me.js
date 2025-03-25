// assets
import { IconUsers } from '@tabler/icons-react';
import { FaPersonWalkingLuggage,FaUserClock  } from "react-icons/fa6";
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
// constant
const icons = {
  IconUsers, FaPersonWalkingLuggage ,FaUserClock, BeachAccessIcon, AccessTimeIcon   
};

const userType = localStorage.getItem("userType");
const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
  "PERMISSION REQUEST": 'permissionRequest',
  "LEAVE REQUEST": 'leaveRequest',
  "HOLIDAY REPORT": 'holidayReport',
  "SWIPEIN AND SWIPEOUT": 'swipeInSwipeOut',
};

const allScreens = [
  { id: "permissionRequest", title: "Permission Request", type: "item", url: "/me/permissionRequest", icon: icons.FaUserClock },
  { id: "leaveRequest", title: "Leave Request", type: "item", url: "/me/leaveRequest", icon: icons.FaPersonWalkingLuggage },
  { id: "holidayReport", title: "Holiday Report", type: "item", url: "/me/HolidayReport", icon: icons.BeachAccessIcon },
  { id: "swipeInSwipeOut", title: "Check In & Out", type: "item", url: "/me/SwipeInSwipeOut", icon: icons.AccessTimeIcon }
];

const allowedScreenIds = userType === "ADMIN"
  ? allScreens.map(screen => screen.id) // Show all screens for ADMIN
  : allowedScreens.map(screen => screenMapping[screen]).filter(Boolean);

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
      ].filter((item) => allowedScreenIds.includes(item.id))
    }
  ]
};

export default me;

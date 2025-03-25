// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

const userType = localStorage.getItem("userType");
const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
  "LEAVE TYPE": 'leaveType',
  // "LEAVE PROCESS": 'leaveProcess',
  // "LEAVE CREDIT CONTROL": 'leaveCreditControl',
  HOLIDAY: 'holidays'
};

const allScreens = [
  { id: "leaveType", title: "Leave Type", type: "item", url: "/leaveMaster/LeaveType" },
  { id: "holidays", title: "Holidays", type: "item", url: "/leaveMaster/Holidays" }
];

const allowedScreenIds = userType === "ADMIN"
  ? allScreens.map(screen => screen.id) // Show all screens for ADMIN
  : allowedScreens.map(screen => screenMapping[screen]).filter(Boolean);

const leaveMaster = {
  id: 'leaveMaster',
  // title: 'Leave Master',
  type: 'group',
  children: [
    {
      id: 'leaveMaster',
      title: 'Leave Master',
      type: 'collapse',
      icon: icons.IconKey,
      children: [
        {
          id: 'leaveType',
          title: 'Leave Type',
          type: 'item',
          url: '/leaveMaster/LeaveType'
        },
        // {
        //   id: 'leaveProcess',
        //   title: 'Leave Process',
        //   type: 'item',
        //   url: '/leaveMaster/LeaveProcess'
        // },
        // {
        //   id: 'leaveCreditControl',
        //   title: 'Leave Credit Control',
        //   type: 'item',
        //   url: '/leaveMaster/LeaveCreditControl'
        // },
        {
          id: 'holidays',
          title: 'Holidays',
          type: 'item',
          url: '/leaveMaster/Holidays'
        }
      ].filter((item) => allowedScreenIds.includes(item.id))
    }
  ]
};

export default leaveMaster;

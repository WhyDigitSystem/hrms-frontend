// assets
import { IconUsers } from '@tabler/icons-react';
import { FaPersonWalkingLuggage,FaUserClock  } from "react-icons/fa6";

// constant
const icons = {
  IconUsers, FaPersonWalkingLuggage ,FaUserClock    
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const me = {
  id: 'me',
  title: 'Me',
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
          title: 'HolidayReport',
          type: 'item',
          url: '/me/HolidayReport'
        },
        {
          id: 'swipeInSwipeOut',
          title: 'SwipeIn & SwipeOut ',
          type: 'item',
          url: '/me/SwipeInSwipeOut'
        },
        // {
        //   id: 'leaveCreditControl',
        //   title: 'Leave Credit Control',
        //   type: 'item',
        //   url: '/me/LeaveCreditControl'
        // },
        // {
        //   id: 'salaryHeads',
        //   title: 'Salary Heads',
        //   type: 'item',
        //   url: '/me/salaryHeads'
        // },
        // {
        //   id: 'salaryStructure',
        //   title: 'Salary Structure',
        //   type: 'item',
        //   url: '/me/SalaryStructure'
        // },
        // {
        //   id: 'attendenceProcess',
        //   title: 'Attendence Process',
        //   type: 'item',
        //   url: '/me/AttendenceProcess'
        // }
      ] 
    }
  ]
};

export default me;

// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};


const userType = localStorage.getItem('userType');

const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
  'EMPLOYEE CODE GENERATION': 'employeeCodeGeneration',
  'EMPLOYEE DETAILS': 'employeeDetails',
  'ATTENDENCE PROCESS': 'attendenceProcess'
};

const allScreens = [
  { id: 'employeeCodeGeneration', title: 'Employee Code Generation', type: 'item', url: '/employeeMaster/employeeCodeGeneration' },
  { id: 'employeeDetails', title: 'Employee Details', type: 'item', url: '/employeeMaster/employeeDetails' },
  { id: 'attendenceProcess', title: 'Attendence Process', type: 'item', url: '/employeeMaster/AttendenceProcess' }
];

const allowedScreenIds =
  userType === 'ADMIN'
    ? allScreens.map((screen) => screen.id) 
    : allowedScreens.map((screen) => screenMapping[screen]).filter(Boolean);

const employeeMaster = {
  id: 'employeeMaster',
  // title: 'Employee Master',
  type: 'group',
  children: [
    {
      id: 'employeeMaster',
      title: 'Employee Master',
      type: 'collapse',
      icon: icons.IconKey,
      children: [
        {
          id: 'employeeCodeGeneration',
          title: 'Employee Code Generation',
          type: 'item',
          url: '/employeeMaster/employeeCodeGeneration'
        },
        {
          id: 'employeeDetails',
          title: 'Employee Details',
          type: 'item',
          url: '/employeeMaster/employeeDetails'
        },
        {
          id: 'attendenceProcess',
          title: 'Attendence Process',
          type: 'item',
          url: '/employeeMaster/AttendenceProcess'
        }
      ].filter((item) => allowedScreenIds.includes(item.id))
    }
  ]
};

export default employeeMaster;

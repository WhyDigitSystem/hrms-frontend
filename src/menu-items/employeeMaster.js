// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const employeeMaster = {
  id: 'employeeMaster',
  title: 'Employee Master',
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
          id: 'leaveType',
          title: 'Leave Type',
          type: 'item',
          url: '/employeeMaster/LeaveType'
        },
        {
          id: 'holidays',
          title: 'Holidays',
          type: 'item',
          url: '/employeeMaster/Holidays'
        },
        {
          id: 'leaveProcess',
          title: 'Leave Process',
          type: 'item',
          url: '/employeeMaster/LeaveProcess'
        },
        {
          id: 'leaveCreditControl',
          title: 'Leave Credit Control',
          type: 'item',
          url: '/employeeMaster/LeaveCreditControl'
        },
        {
          id: 'salaryHeads',
          title: 'Salary Heads',
          type: 'item',
          url: '/employeeMaster/salaryHeads'
        },
        {
          id: 'salaryStructure',
          title: 'Salary Structure',
          type: 'item',
          url: '/employeeMaster/SalaryStructure'
        },
        {
          id: 'attendenceProcess',
          title: 'Attendence Process',
          type: 'item',
          url: '/employeeMaster/AttendenceProcess'
        }
      ] 
    }
  ]
};

export default employeeMaster;

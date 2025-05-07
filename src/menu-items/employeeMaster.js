// assets
import {
  IconKey,
  IconId,
  IconUserSearch,
  IconFingerprint,
  IconCalendarCheck,
  IconBeach,
  IconSun,
  IconCash,
  IconReceipt2,
  IconFileDollar,
  IconCalculator,
  IconChartBar
} from '@tabler/icons-react';

// constant
const icons = {
  IconKey,
  IconId,
  IconUserSearch,
  IconFingerprint,
  IconCalendarCheck,
  IconBeach,
  IconSun,
  IconCash,
  IconReceipt2,
  IconFileDollar,
  IconCalculator,
  IconChartBar,
};

const userType = localStorage.getItem('userType');
const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
  'EMPLOYEE CODE GENERATION': 'employeeCodeGeneration',
  'EMPLOYEE DETAILS': 'employeeDetails',
  'ATTENDENCE PROCESS': 'attendenceProcess',
  "LEAVE TYPE": 'leaveType',
  "HOLIDAY": 'holidays',
  "SALARY HEADS": 'salaryHeads',
  "SALARY STRUCTURE": 'salaryStructure',
  "SALARY PROCESS": 'salaryProcess',
  "SALARY REPORT": 'SalaryReport',
};

const allScreens = [
  // { 
  //   id: 'employeeCodeGeneration', 
  //   title: 'Employee Code Generation', 
  //   type: 'item', 
  //   url: '/employeeMaster/employeeCodeGeneration',
  //   icon: icons.IconId  // ID icon for code generation
  // },
  {
    id: 'employeeDetails',
    title: 'Employee Details',
    type: 'item',
    url: '/employeeMaster/employeeDetails',
    icon: icons.IconUserSearch  // User search icon for details
  },
  {
    id: 'attendenceProcess',
    title: 'Attendance Process',
    type: 'item',
    url: '/employeeMaster/AttendenceProcess',
    icon: icons.IconCalendarCheck  // Calendar check icon for attendance
  },
  {
    id: "leaveType",
    title: "Leave Type",
    type: "item",
    url: "/leaveMaster/LeaveType",
    icon: icons.IconBeach  // Beach icon for leave types
  },
  {
    id: "holidays",
    title: "Holidays",
    type: "item",
    url: "/leaveMaster/Holidays",
    icon: icons.IconSun  // Sun icon for holidays
  },
  {
    id: "salaryHeads",
    title: "Salary Heads",
    type: "item",
    url: "/salaryMaster/salaryHeads",
    icon: icons.IconReceipt2  // For salary components
  },
  {
    id: "salaryStructure",
    title: "Salary Structure",
    type: "item",
    url: "/salaryMaster/SalaryStructure",
    icon: icons.IconFileDollar  // For structured salary docs
  },
  {
    id: "salaryProcess",
    title: "Salary Process",
    type: "item",
    url: "/salaryMaster/SalaryProcess",
    icon: icons.IconCalculator  // For processing calculations
  },
  {
    id: "SalaryReport",
    title: "Salary Report",
    type: "item",
    url: "/salaryMaster/SalaryReport",
    icon: icons.IconChartBar  // For reporting/analytics
  }
];

const allowedScreenIds =
  userType === 'ADMIN'
    ? allScreens.map((screen) => screen.id)
    : allowedScreens.map((screen) => screenMapping[screen]).filter(Boolean);

const employeeMaster = {
  id: 'employeeMaster',
  type: 'group',
  children: [
    {
      id: 'employeeMaster',
      title: 'Payroll',
      type: 'collapse',
      icon: icons.IconUserSearch,  // Fingerprint icon for Employee Master
      children: allScreens.filter((item) => allowedScreenIds.includes(item.id))
    }
  ]
};

export default employeeMaster;
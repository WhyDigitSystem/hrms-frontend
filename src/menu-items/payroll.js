// assets
import {
    IconKey,
    IconId,
    IconUserSearch,
    IconFingerprint,
    IconCalendarCheck,
    IconReceipt2,    // Added
    IconFileDollar,  // Added
    IconCalculator,  // Added
    IconChartBar

} from '@tabler/icons-react';

// constant
const icons = {
    IconKey,
    IconId,
    IconUserSearch,
    IconFingerprint,
    IconCalendarCheck,
    IconReceipt2,    // Added
    IconFileDollar,  // Added
    IconCalculator,  // Added
    IconChartBar     // Added
};

const userType = localStorage.getItem('userType');
const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
    'EMPLOYEE CODE GENERATION': 'employeeCodeGeneration',
    'EMPLOYEE DETAILS': 'employeeDetails',
    'ATTENDENCE PROCESS': 'attendenceProcess'
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
        id: 'payroll',
        title: 'Employee Details',
        type: 'item',
        url: '/payroll/employeeDetails',
        icon: icons.IconUserSearch  // User search icon for details
    },
    {
        id: 'attendenceProcess',
        title: 'Attendance Process',
        type: 'item',
        url: '/payroll/AttendenceProcess',
        icon: icons.IconCalendarCheck  // Calendar check icon for attendance
    },
    {
        id: "salaryHeads",
        title: "Salary Heads",
        type: "item",
        url: "/payroll/salaryHeads",
        icon: icons.IconReceipt2  // For salary components
    },
    {
        id: "salaryStructure",
        title: "Salary Structure",
        type: "item",
        url: "/payroll/SalaryStructure",
        icon: icons.IconFileDollar  // For structured salary docs
    },
    {
        id: "salaryProcess",
        title: "Salary Process",
        type: "item",
        url: "/payroll/SalaryProcess",
        icon: icons.IconCalculator  // For processing calculations
    },
    {
        id: "SalaryReport",
        title: "Salary Report",
        type: "item",
        url: "/payroll/SalaryReport",
        icon: icons.IconChartBar  // For reporting/analytics
    }
];

const allowedScreenIds =
    userType === 'ADMIN'
        ? allScreens.map((screen) => screen.id)
        : allowedScreens.map((screen) => screenMapping[screen]).filter(Boolean);

const payroll = {
    id: 'payroll',
    type: 'group',
    children: [
        {
            id: 'payroll',
            title: 'Payroll',
            type: 'collapse',
            icon: icons.IconUserSearch,  // Fingerprint icon for Employee Master
            children: allScreens.filter((item) => allowedScreenIds.includes(item.id))
        }
    ]
};

export default payroll;
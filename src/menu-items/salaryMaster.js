// assets
import { 
    IconCash,
    IconReceipt2,
    IconFileDollar,
    IconCalculator,
    IconChartBar
  } from '@tabler/icons-react';
  
  // constant
  const icons = {
    IconCash,
    IconReceipt2,
    IconFileDollar,
    IconCalculator,
    IconChartBar
  };
  
  const userType = localStorage.getItem("userType");
  const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];
  
  const screenMapping = {
    "SALARY HEADS": 'salaryHeads',
    "SALARY STRUCTURE": 'salaryStructure',
    "SALARY PROCESS": 'salaryProcess',
    "SALARY REPORT": 'SalaryReport',
  };
  
  const allScreens = [
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
  
  const allowedScreenIds = userType === "ADMIN"
    ? allScreens.map(screen => screen.id)
    : allowedScreens.map(screen => screenMapping[screen]).filter(Boolean);
  
  const salaryMaster = {
    id: 'salaryMaster',
    type: 'group',
    children: [
      {
        id: 'salaryMaster',
        title: 'Salary Master',
        type: 'collapse',
        icon: icons.IconCash,  // Main salary icon
        children: allScreens.filter((item) => allowedScreenIds.includes(item.id))
      }
    ]
  };
  
  export default salaryMaster;
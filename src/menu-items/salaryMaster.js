// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
    IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
  "SALARY HEADS": 'salaryHeads',
  "SALARY STRUCTURE": 'salaryStructure',
  "SALARY PROCESS": 'salaryProcess',
  "SALARY REPORT": 'SalaryReport',
};

const allowedScreenIds = allowedScreens.map((screen) => screenMapping[screen]).filter(Boolean);


const salaryMaster = {
    id: 'salaryMaster',
    title: 'Salary Master',
    type: 'group',
    children: [
        {
            id: 'salaryMaster',
            title: 'Salary Master',
            type: 'collapse',
            icon: icons.IconKey,
            children: [
                {
                    id: 'salaryHeads',
                    title: 'Salary Heads',
                    type: 'item',
                    url: '/salaryMaster/salaryHeads'
                },
                {
                    id: 'salaryStructure',
                    title: 'Salary Structure',
                    type: 'item',
                    url: '/salaryMaster/SalaryStructure'
                },
                {
                    id: 'salaryProcess',
                    title: 'Salary process ',
                    type: 'item',
                    url: '/salaryMaster/SalaryProcess'
                },
                {
                    id: 'SalaryReport',
                    title: 'Salary Report ',
                    type: 'item',
                    url: '/salaryMaster/SalaryReport'
                }
            ].filter((item) => allowedScreenIds.includes(item.id))
        }
    ]
};

export default salaryMaster;

// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
    IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

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
            ]
        }
    ]
};

export default salaryMaster;

// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
    IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const leaveMaster = {
    id: 'leaveMaster',
    title: 'Leave Master',
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
                {
                    id: 'leaveProcess',
                    title: 'Leave Process',
                    type: 'item',
                    url: '/leaveMaster/LeaveProcess'
                },
                {
                    id: 'leaveCreditControl',
                    title: 'Leave Credit Control',
                    type: 'item',
                    url: '/leaveMaster/LeaveCreditControl'
                },
                {
                    id: 'holidays',
                    title: 'Holidays',
                    type: 'item',
                    url: '/leaveMaster/Holidays'
                }
            ]
        }
    ]
};

export default leaveMaster;

import React, { useState, useEffect } from 'react';
import {
    Avatar, Box, Typography, Divider, Grid
} from '@mui/material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import dayjs from 'dayjs';

function NewJoiner() {
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [todayJoiners, setTodayJoiners] = useState([]);
    const [upcomingJoiners, setUpcomingJoiners] = useState([]);

    useEffect(() => {
        if (orgId && loginUserName) {
            fetchNewJoinerData();
        }
    }, [orgId, loginUserName]);

    const fetchNewJoinerData = async () => {
        try {
            const result = await apiCalls('get', `/basicmaster/GetnewJoineDetails?orgId=${orgId}`);
            if (result?.status && result?.paramObjectsMap?.employee?.length > 0) {
                const allJoiners = result.paramObjectsMap.employee;
                const today = dayjs();
                
                const todayList = [];
                const upcomingList = [];

                allJoiners.forEach(emp => {
                    const joinDate = dayjs(emp.joinDate); // Assuming joinDate is a field in the response
                    const diffDays = joinDate.diff(today, 'day');

                    if (joinDate.isSame(today, 'day')) {
                        todayList.push({
                            name: emp.empName || emp.empCode,
                            initials: (emp.empName || emp.empCode)[0],
                            employeeId: emp.empCode,
                            role: emp.designation || 'Employee',
                        });
                    } else if (diffDays > 0 && diffDays <= 7) {
                        upcomingList.push({
                            name: emp.empName || emp.empCode,
                            employeeId: emp.empCode,
                            date: joinDate.format('MMM DD'),
                            image: '',
                            role: emp.designation || 'Employee',
                        });
                    }
                });

                setTodayJoiners(todayList);
                setUpcomingJoiners(upcomingList);
            } else {
                // showToast('No new joiners found', 'info');
            }
        } catch (error) {
            console.error('Error fetching new joiner data:', error);
            // showToast('Failed to fetch new joiner data', 'error');
        }
    };

    return (
        <>
            <Typography variant="h6" style={{ color: '#1976d2', marginBottom: '16px', fontWeight: 'bold' }}>
                🎉 New Joiners Today
            </Typography>
            {todayJoiners.length > 0 ? (
                todayJoiners.map((person, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                        <Avatar sx={{ backgroundColor: '#1976d2', color: '#fff' }}>{person.initials}</Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 'bold' }}>{person.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#757575' }}>
                                {person.employeeId} | {person.role}
                            </Typography>
                        </Box>
                    </Box>
                ))
            ) : (
                <Typography variant="body2" style={{ color: '#757575' }}>
                    No new joiners today.
                </Typography>
            )}
        </>
    );
}

export default NewJoiner;
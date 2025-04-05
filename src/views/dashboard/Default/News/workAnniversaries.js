import React, { useState, useEffect } from 'react';
import { Avatar, Typography, Grid } from '@mui/material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import dayjs from 'dayjs';

function WorkAnniversaries() {
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [todayAnniversaries, setTodayAnniversaries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (orgId) {
            fetchWorkAnniversaries();
        }
    }, [orgId]);

    const fetchWorkAnniversaries = async () => {
        setIsLoading(true);
        try {
            const result = await apiCalls('get', `/basicmaster/Getworkaniversary?orgId=${orgId}`);
            
            if (result?.status && result?.paramObjectsMap?.employee?.length > 0) {
                const today = dayjs();
                const todayMonthDay = today.format('MM-DD');
                
                const todaysAnniversaries = result.paramObjectsMap.employee
                    .filter(emp => {
                        if (!emp.joiningDate) return false;
                        const joinDate = dayjs(emp.joiningDate);
                        return joinDate.format('MM-DD') === todayMonthDay;
                    })
                    .map(emp => ({
                        name: emp.empName || emp.empCode || 'Employee',
                        initials: (emp.empName?.[0] || emp.empCode?.[0] || 'E').toUpperCase(),
                        employeeId: emp.empCode || 'N/A',
                        role: emp.designation || 'Employee',
                        years: today.diff(dayjs(emp.joiningDate), 'year'),
                        image: emp.profileImage || ''
                    }));

                setTodayAnniversaries(todaysAnniversaries);
            } else {
                setTodayAnniversaries([]);
            }
        } catch (error) {
            console.error('Error fetching work anniversaries:', error);
            showToast('Failed to fetch work anniversaries', 'error');
            setTodayAnniversaries([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Typography variant="h6" style={{ color: '#1976d2', marginBottom: '16px', fontWeight: 'bold' }}>
                🎖️ Today's Work Anniversaries
            </Typography>
            
            {isLoading ? (
                <Typography variant="body2" style={{ textAlign: 'center' }}>Loading...</Typography>
            ) : todayAnniversaries.length > 0 ? (
                <Grid container spacing={2} style={{ marginTop: '8px' }}>
                    {todayAnniversaries.map((person, index) => (
                        <Grid
                            item
                            key={index}
                            xs={6}
                            sm={6}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            {person.image ? (
                                <Avatar src={person.image} alt={person.name} style={{ marginBottom: '8px', border: '2px solid #1976d2' }} />
                            ) : (
                                <Avatar style={{ marginBottom: '8px', border: '2px solid #1976d2', backgroundColor: '#1976d2' }}>
                                    {person.initials}
                                </Avatar>
                            )}
                            <Typography variant="body2" align="center" style={{ fontWeight: 'bold' }}>{person.name}</Typography>
                            <Typography variant="caption" style={{ color: '#757575' }} align="center">
                                {person.employeeId} | {person.role}
                            </Typography>
                            <Typography variant="caption" style={{ color: '#1976d2', fontWeight: 'bold' }} align="center">
                                {person.years} Years
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="body2" style={{ 
                    color: '#757575', 
                    textAlign: 'center', 
                    marginTop: '16px',
                    fontStyle: 'italic'
                }}>
                    No work anniversaries today
                </Typography>
            )}
        </>
    );
}

export default WorkAnniversaries;
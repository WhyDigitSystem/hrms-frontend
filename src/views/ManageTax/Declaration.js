import React from 'react';
import {
    Box, Card, CardContent, Typography, Grid, Select, MenuItem, Chip, Divider,
    useTheme, useMediaQuery, Tabs, Tab
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import InsertChartIcon from '@mui/icons-material/InsertChart';

import MyDeclaration from './MyDeclaration/MyDeclaration';
import LacDeclaration from './MyDeclaration/LacDeclaration';
import TaxSavingAllowances from './MyDeclaration/TaxSavingAllowances';
import OtherDeductions from './MyDeclaration/OtherDeductions';
import HouseProperty from './MyDeclaration/HouseProperty';
import IncomeFromOtherSources from './MyDeclaration/IncomeFromOtherSources';

const Declaration = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedTab, setSelectedTab] = React.useState(0);

    const handleChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const summaryCards = [
        {
            title: "Investment Declaration",
            endDate: "Till May 25, 2025",
            icon: <InsertChartIcon color="primary" />
        },
        {
            title: "Proof Submission",
            endDate: "Till Mar 15, 2026",
            icon: <CalendarTodayIcon color="primary" />
        }
    ];

    const financeSummary = [
        { title: "Net Taxable Income", amount: "INR", link: true },
        { title: "Total Tax Payable", amount: "INR 0" },
        { title: "Tax Already Paid", amount: "INR 0" }
    ];

    return (
        <>
            <Box px={{ xs: 2, sm: 3 }} py={3} bgcolor="#f9fbfc">
                {/* Header */}
                <Box
                    display="flex"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    mb={3}
                    gap={2}
                >
                    <Typography variant="h5" fontWeight="bold">
                        Declaration Summary
                    </Typography>
                    <Select defaultValue="APR 2025 - MAR 2026" size="small" variant="outlined">
                        <MenuItem value="APR 2025 - MAR 2026">APR 2025 - MAR 2026</MenuItem>
                    </Select>
                </Box>

                {/* Status Cards */}
                <Grid container spacing={2}>
                    {summaryCards.map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: 4,
                                    transition: '0.3s',
                                    '&:hover': { boxShadow: 6 },
                                    background: `linear-gradient(to right, ${theme.palette.primary.light}, #fff)`
                                }}
                            >
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {item.icon}
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {item.title}
                                            </Typography>
                                        </Box>
                                        <Chip label="OPEN" size="small" color="success" />
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" color="text.secondary">Current Window</Typography>
                                    <Typography variant="body2">{item.endDate}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    {/* Finance Summary */}
                    {financeSummary.map((item, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <CurrencyRupeeIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" color="textSecondary">{item.title}</Typography>
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">{item.amount}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Tabs */}
            <Box sx={{ bgcolor: "#f9f9fb", px: { xs: 1, sm: 2 }, py: 1 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="declaration tabs"
                    TabIndicatorProps={{ style: { display: "none" } }}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            minWidth: 120,
                            fontWeight: 500,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            color: "#555",
                            py: 1,
                        },
                        "& .Mui-selected": {
                            backgroundColor: "#f3f0ff",
                            borderRadius: "8px",
                            color: "#000",
                        }
                    }}
                >
                    <Tab label="My Declarations" />
                    <Tab label="1.5 Lac Deductions" />
                    <Tab label="Other Deductions" />
                    <Tab label="Tax Saving Allowances" />
                    <Tab label="House Property" />
                    <Tab label="Income From Other Sources" />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box mt={3} px={{ xs: 1, sm: 2 }}>
                {selectedTab === 0 && <MyDeclaration />}
                {selectedTab === 1 && <LacDeclaration />}
                {selectedTab === 2 && <OtherDeductions />}
                {selectedTab === 3 && <TaxSavingAllowances />}
                {selectedTab === 4 && <HouseProperty />}
                {selectedTab === 5 && <IncomeFromOtherSources />}
            </Box>
        </>
    );
};

export default Declaration;

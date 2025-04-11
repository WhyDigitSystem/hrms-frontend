import React, { useState, useEffect, useMemo } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import FormControl from '@mui/material/FormControl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import apiCalls from 'apicall';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from 'utils/toast-component';
import ActionButton from 'utils/ActionButton';
import styled from 'styled-components';
import LogoImage from '../../assets/images/HRMS_Logo.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Container = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 65px auto;
  max-width: 750px; 
  padding: 20px;
  border: 2px solid #000;
  background: #fff;
  border-radius: 8px;
  box-sizing: border-box; 
`;

const Header = styled.div`
  padding-bottom: 15px;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.img`
  width: 110px;
  height: 75px;
`;

const CompanyInfo = styled.div`
  flex: 1;
  text-align: center;
`;

const CompanyName = styled.div`
  font-size: 22px;
  font-weight: bold;
`;

const CompanyAddress = styled.div`
  font-size: 13px;
  margin-top: 4px;
`;

const PayslipTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin: 15px 0;
`;

const EmployeeTable = styled.table`
  width: 100%;
  border-collapse: collapse;
 
  td {
    padding: 8px 10px;
    border: 1px solid #000;
    font-size: 14px;
  }
`;

const EarningsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 10px;
    border: 1px solid #000;
    font-size: 14px;
    text-align: left;
  }

  th {
    background-color: #f0f0f0;
  }
`;

const TotalRow = styled.tr`
  font-weight: bold;
  background-color: #e9e9e9;
`;

const NetPay = styled.div`
  font-weight: bold;
  margin-top: 10px;
  font-size: 16px;
`;

const Footer = styled.div`
  margin-top: 40px;
  font-size: 12px;
  text-align: center;
  color: #555;
  border-top: 1px dashed #ccc;
  padding-top: 10px;
`;

const ErrorText = styled.div`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #888;
  border: 1px dashed #ccc;
  margin-top: 20px;
  background-color: #f9f9f9;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #888;
`;

const Payslip = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [orgId] = useState(localStorage.getItem('orgId') || '');
    const [employeeCode] = useState(localStorage.getItem('employeeCode') || '');
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [earningsData, setEarningsData] = useState([]);
    const [totalEarningRow, setTotalEarningRow] = useState(null);
    const [deductionsData, setDeductionsData] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [showPayslip, setShowPayslip] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [errors, setErrors] = useState({ month: '', year: '' });
    const [noDataFound, setNoDataFound] = useState(false);

    useEffect(() => {
        if (showPayslip && selectedMonth && selectedYear) {
            fetchPayslipData();
        }
    }, [selectedMonth, selectedYear, showPayslip]);

    const validateForm = () => {
        let valid = true;
        const newErrors = { month: '', year: '' };
        const currentYear = dayjs().year();
        const currentMonth = dayjs().month() + 1; // 1-12

        if (!selectedMonth || !selectedYear) {
            newErrors.month = 'Month is required';
            newErrors.year = 'Year is required';
            valid = false;
        } else {
            const selectedDate = dayjs(`${selectedYear}-${selectedMonth}-01`);
            if (selectedDate.isAfter(dayjs(), 'month')) {
                newErrors.month = 'Future month not allowed';
                valid = false;
            }
        }

        if (!selectedYear) {
            newErrors.year = 'Year is required';
            valid = false;
        } else if (selectedYear > currentYear) {
            newErrors.year = 'Future year not allowed';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const fetchPayslipData = async () => {
        setIsLoading(true);
        setNoDataFound(false);

        setEmployeeDetails(null);
        setEarningsData([]);
        setDeductionsData([]);
        setTotalEarningRow(null);
        setTotalEarnings(0);

        try {
            const [employeeRes, earningsRes, deductionsRes] = await Promise.all([
                apiCalls('get', `/basicmaster/getpayslipemployeedetails?Employeecode=${employeeCode}&orgId=${orgId}`),
                apiCalls('get', `/basicmaster/getpayslipearningdetails?Employeecode=${employeeCode}&Month=${selectedMonth}&orgId=${orgId}&year=${selectedYear}`),
                apiCalls('get', `/basicmaster/getpayslipdeductiondetails?Employeecode=${employeeCode}&Month=${selectedMonth}&orgId=${orgId}&year=${selectedYear}`)
            ]);

            // Check if we have any payslip data
            const hasEarnings = earningsRes?.status && earningsRes?.paramObjectsMap?.employee?.length > 0;
            const hasDeductions = deductionsRes?.status && deductionsRes?.paramObjectsMap?.employee?.length > 0;

            if (!hasEarnings && !hasDeductions) {
                setNoDataFound(true);
                return;
            }

            // Process employee details only if we have payslip data
            if (employeeRes?.status && employeeRes?.paramObjectsMap?.employee?.length > 0) {
                setEmployeeDetails(employeeRes.paramObjectsMap.employee[0]);
            }

            // Process earnings
            if (hasEarnings) {
                const processedEarnings = processEarningsData(earningsRes.paramObjectsMap.employee);
                setEarningsData(processedEarnings.rows);
                setTotalEarningRow(processedEarnings.total);
                setTotalEarnings(processedEarnings.total.amount);
            }

            // Process deductions
            if (hasDeductions) {
                const filteredDeductions = deductionsRes.paramObjectsMap.employee
                    .filter(item => item.heading !== 'Total Deduction')
                    .map(processDeductionData);
                setDeductionsData(filteredDeductions);
            }

        } catch (error) {
            console.error('Error fetching payslip data:', error);
            showToast('Failed to fetch payslip data. Please try again.', 'error');
            setNoDataFound(true);
        } finally {
            setIsLoading(false);
        }
    };

    const processEarningsData = (data) => {
        const merged = mergeDuplicateRows(data);
        const total = merged.find(item => item.heading === 'Total Earnings') || { amount: 0, actuals: 0 };
        const rows = merged.filter(item => item.heading !== 'Total Earnings');
        return { rows, total };
    };

    const processDeductionData = (item) => ({
        ...item,
        amount: parseFloat((item.amount || '0').replace(/,/g, '')) || 0
    });

    const EmployeeDetails = async () => {
        try {
            const res = await apiCalls('get', `/basicmaster/getpayslipemployeedetails?Employeecode=${employeeCode}&orgId=${orgId}`);
            if (res?.status && res?.paramObjectsMap?.employee?.length > 0) {
                setEmployeeDetails(res.paramObjectsMap.employee[0]);
                setNoDataFound(false);
            } else {
                showToast('No employee data found.', 'warning');
                setNoDataFound(true);
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
            showToast('Failed to fetch employee details.', 'error');
            setNoDataFound(true);
        }
    };

    const getPayslipEarningDetails = async (month, year) => {
        try {
            const res = await apiCalls('get',
                `/basicmaster/getpayslipearningdetails?Employeecode=${employeeCode}&Month=${month}&orgId=${orgId}&year=${year}`
            );
            if (res?.status && res?.paramObjectsMap?.employee?.length > 0) {
                // Process each item to parse amounts correctly
                const data = res.paramObjectsMap.employee.map(item => ({
                    ...item,
                    amount: parseFloat((item.amount || '0').replace(/,/g, '')) || 0,
                    actuals: parseFloat((item.actuals || '0').replace(/,/g, '')) || 0,
                }));
                const earnings = mergeDuplicateRows(data);
                // Rest of the function remains the same
                // ...
            }
        } catch (error) {
            // Handle error
        }
    };

    const getPayslipDeductionDetails = async (month, year) => {
        try {
            const res = await apiCalls('get',
                `/basicmaster/getpayslipdeductiondetails?Employeecode=${employeeCode}&Month=${month}&orgId=${orgId}&year=${year}`
            );
            if (res?.status && res?.paramObjectsMap?.employee?.length > 0) {
                // Process each item to parse amounts correctly
                const filtered = res.paramObjectsMap.employee
                    .filter(item => item.heading !== 'Total Deduction')
                    .map(item => ({
                        ...item,
                        amount: parseFloat((item.amount || '0').replace(/,/g, '')) || 0,
                    }));
                setDeductionsData(filtered);
                setNoDataFound(false);
            } else {
                // Handle no data
            }
        } catch (error) {
            // Handle error
        }
    };

    const handleSearch = () => {
        if (!validateForm()) {
            setShowPayslip(false);
            return;
        }
        setShowPayslip(true);
    };

    const handleClear = () => {
        setSelectedMonth(null);
        setSelectedYear(null);
        setShowPayslip(false);
        setEmployeeDetails(null);
        setEarningsData([]);
        setDeductionsData([]);
        setTotalEarningRow(null);
        setTotalEarnings(0);
        setErrors({ month: '', year: '' });
        setNoDataFound(false);
    };

    const mergeDuplicateRows = (data) => {
        const map = {};

        data.forEach(item => {
            const key = item.heading;
            // Remove commas and parse the amount and actuals
            const amountStr = (item.amount || '0').replace(/,/g, '');
            const actualsStr = (item.actuals || '0').replace(/,/g, '');
            const amount = parseFloat(amountStr) || 0;
            const actuals = parseFloat(actualsStr) || 0;

            if (!map[key]) {
                map[key] = { ...item, amount, actuals };
            } else {
                map[key].amount += amount;
                map[key].actuals += actuals;
            }
        });

        return Object.values(map);
    };



    const handleDownload = () => {
        if (!showPayslip || !employeeDetails || noDataFound) {
            showToast('Please generate a valid payslip first', 'warning');
            return;
        }

        const input = document.getElementById('payslip-container');
        if (!input) {
            showToast('Payslip content not found', 'error');
            return;
        }

        const clone = input.cloneNode(true);
        clone.style.margin = '0';
        clone.style.width = '750px';
        document.body.appendChild(clone);

        html2canvas(clone, {
            scale: 2,
            logging: false,
            useCORS: true,
            windowWidth: 750,
            width: 750,
            height: clone.scrollHeight,
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Payslip_${employeeDetails.employeecode}_${selectedMonth}_${selectedYear}.pdf`);
            clone.remove();
        }).catch(error => {
            console.error('Error generating PDF:', error);
            clone.remove();
            showToast('Failed to generate PDF', 'error');
        });
    };

    const totalDeductions = useMemo(() => (
        deductionsData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    ), [deductionsData]);

    const netPay = useMemo(() => totalEarnings - totalDeductions, [totalEarnings, totalDeductions]);

    const monthName = useMemo(() => (
        selectedMonth ? dayjs().month(selectedMonth - 1).format('MMMM') : ''
    ), [selectedMonth]);


    return (
        <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
            <div className="row d-flex ml">
                <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
                    <ActionButton title="Search" icon={SearchIcon} onClick={handleSearch} disabled={isLoading} />
                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} disabled={isLoading} />
                    <ActionButton
                        title="Download"
                        icon={DownloadIcon}
                        onClick={handleDownload}
                        margin="0 10px"
                        disabled={!showPayslip || isLoading || noDataFound}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-3 mb-3">
                    <FormControl fullWidth error={!!errors.month}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Month"
                                views={['month']}
                                openTo="month"
                                format="MMMM"
                                slotProps={{ textField: { size: 'small', error: !!errors.month } }}
                                value={selectedMonth ? dayjs().month(selectedMonth - 1) : null}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        const monthNumber = newValue.month() + 1;
                                        setSelectedMonth(monthNumber);
                                    } else {
                                        setSelectedMonth(null);
                                    }
                                    setErrors({ ...errors, month: '' });
                                    setShowPayslip(false); // Hide existing data
                                }}
                            />
                        </LocalizationProvider>
                        {errors.month && <ErrorText>{errors.month}</ErrorText>}
                    </FormControl>
                </div>

                <div className="col-md-3 mb-3">
                    <FormControl fullWidth error={!!errors.year}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Year"
                                views={['year']}
                                openTo="year"
                                format="YYYY"
                                slotProps={{ textField: { size: 'small', error: !!errors.year } }}
                                value={selectedYear ? dayjs(`${selectedYear}-01-01`) : null}
                                onChange={(date) => {
                                    const year = date ? dayjs(date).format('YYYY') : null;
                                    setSelectedYear(year);
                                    setErrors({ ...errors, year: '' });
                                    setShowPayslip(false);
                                }}
                            />
                        </LocalizationProvider>
                        {errors.year && <ErrorText>{errors.year}</ErrorText>}
                    </FormControl>
                </div>
            </div>

            {isLoading && <LoadingContainer>Loading payslip data...</LoadingContainer>}

            {showPayslip && noDataFound && !isLoading && (
                <NoDataMessage>
                    No payslip data found for {monthName} {selectedYear}
                </NoDataMessage>
            )}

            {showPayslip && !noDataFound && employeeDetails && !isLoading && (
                <Container id="payslip-container">
                    <Header>
                        <LogoContainer>
                            <Logo src={LogoImage} alt="logo" />
                            <CompanyInfo>
                                <CompanyName>WHY DIGIT SYSTEMS PRIVATE LIMITED</CompanyName>
                                <CompanyAddress>
                                    23/1 T.C PALAYA MAIN ROAD, HOYSALA NAGAR BANGALORE – 560016
                                </CompanyAddress>
                            </CompanyInfo>
                        </LogoContainer>
                        <PayslipTitle>
                            PAY SLIP FOR THE MONTH OF {monthName.toUpperCase()} {selectedYear}
                        </PayslipTitle>
                    </Header>

                    <EmployeeTable>
                        <tbody>
                            <tr>
                                <td>Name:</td>
                                <td>{employeeDetails.employee} [{employeeDetails.employeecode}]</td>
                                <td>Bank Name:</td>
                                <td>{employeeDetails.bankname || '-'}</td>
                            </tr>
                            <tr>
                                <td>Joining Date:</td>
                                <td>{dayjs(employeeDetails.joiningdate).format('DD-MM-YYYY')}</td>
                                {/* <td>
                                    {employeeDetails.joiningdate ?
                                        dayjs(employeeDetails.joiningdate).isValid() ?
                                            dayjs(employeeDetails.joiningdate).format('DD-MM-YYYY') :
                                            'Invalid Date'
                                        : '-'}
                                </td> */}
                                <td>Account No:</td>
                                <td>{employeeDetails.accountno}</td>
                            </tr>
                            <tr>
                                <td>Designation:</td>
                                <td>{employeeDetails.designation}</td>
                                <td>UAN:</td>
                                <td>{employeeDetails.uanno}</td>
                            </tr>
                            <tr>
                                <td>Location:</td>
                                <td>{employeeDetails.branch}</td>
                                <td>PAN No:</td>
                                <td>{employeeDetails.panno}</td>
                            </tr>
                            <tr>
                                <td>Effective Working Days:</td>
                                <td>{employeeDetails.effectiveworkingdays}</td>
                                <td>LOP:</td>
                                <td>{employeeDetails.lopDays || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Total Working Days:</td>
                                <td>{employeeDetails.totalworkingdays}</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </EmployeeTable>

                    <EarningsTable>
                        <thead>
                            <tr>
                                <th>Earnings</th>
                                <th>Amount</th>
                                <th>Actuals</th>
                                <th>Deductions</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Math.max(earningsData.length, deductionsData.length) }).map((_, index) => (
                                <tr key={index}>
                                    <td>{earningsData[index]?.heading || ''}</td>
                                    <td>{earningsData[index] ? parseFloat(earningsData[index].amount || 0).toFixed(2) : ''}</td>
                                    <td>{earningsData[index] ? parseFloat(earningsData[index].actuals || 0).toFixed(2) : ''}</td>
                                    <td>{deductionsData[index]?.heading || ''}</td>
                                    <td>{deductionsData[index] ? parseFloat(deductionsData[index].amount || 0).toFixed(2) : ''}</td>
                                </tr>
                            ))}
                            <TotalRow>
                                <td>Total Earnings</td>
                                <td>{totalEarningRow ? parseFloat(totalEarningRow.amount).toFixed(2) : totalEarnings.toFixed(2)}</td>
                                <td>{totalEarningRow ? parseFloat(totalEarningRow.actuals).toFixed(2) : totalEarnings.toFixed(2)}</td>
                                <td>Total Deductions</td>
                                <td>{totalDeductions.toFixed(2)}</td>
                            </TotalRow>
                        </tbody>
                    </EarningsTable>

                    <NetPay>Net Pay for the month (Total Earnings - Total Deductions): Rs. {netPay.toFixed(2)}</NetPay>
                    <div>(Rupees Only)</div>

                    <Footer>This is a system-generated payslip and does not require a signature.</Footer>
                </Container>
            )}
        </div>
    );
};

export default Payslip;

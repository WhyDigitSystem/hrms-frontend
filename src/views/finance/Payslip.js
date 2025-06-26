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
import { useLocation } from 'react-router-dom';

const Payslip = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orgId] = useState(localStorage.getItem('orgId') || '');
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [earningsData, setEarningsData] = useState([]);
  const [payslipCompanydetails, setPayslipCompanydetails] = useState();
  const [totalEarningRow, setTotalEarningRow] = useState(null);
  const [deductionsData, setDeductionsData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showPayslip, setShowPayslip] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [errors, setErrors] = useState({ month: '', year: '' });
  const [noDataFound, setNoDataFound] = useState(false);
  const [employeeCode, setEmployeeCode] = useState(localStorage.getItem('employeeCode') || '');
  const location = useLocation();
  const { employeeCode: passedEmployeeCode } = location.state || {};
  const [companyDetails, setCompanyDetails] = useState(null);
  const [logoLoadError, setLogoLoadError] = useState(false);

  useEffect(() => {
    if (passedEmployeeCode) {
      setEmployeeCode(passedEmployeeCode);
    }
  }, [passedEmployeeCode]);

  useEffect(() => {
    getPayslipCompanyDetails();
  }, [orgId]);

  useEffect(() => {
    if (passedEmployeeCode && selectedMonth && selectedYear) {
      fetchPayslipData(passedEmployeeCode);
    }
  }, [passedEmployeeCode, selectedMonth, selectedYear]);

  const logoUrl = useMemo(() => {
    if (!companyDetails?.companylogo) return null;

    const logo = companyDetails.companylogo;

    // Handle base64 strings
    if (logo.startsWith('data:image')) {
      return logo;
    }

    // Handle raw base64 strings without prefix
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(logo)) {
      return `data:image/png;base64,${logo}`;
    }

    // Handle relative paths
    if (logo.startsWith('/')) {
      return `${window.location.origin}${logo}`;
    }

    // Handle missing protocol
    if (!logo.startsWith('http://') && !logo.startsWith('https://')) {
      return `https://${logo}`;
    }

    return logo;
  }, [companyDetails]);



  const getPayslipCompanyDetails = async () => {
    try {
      // FIX: Changed 'orgid' to 'orgId' to match API parameter case
      const result = await apiCalls('get', `basicmaster/getpayslipCompanydetails?orgId=${orgId}`);
      if (result.paramObjectsMap?.Company?.length > 0) {
        setCompanyDetails(result.paramObjectsMap.Company[0]);
      }
    } catch (err) {
      console.error('Failed to fetch company details:', err);
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { month: '', year: '' };
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1;

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

  const fetchPayslipData = async (empCode = employeeCode) => {
    setIsLoading(true);
    setNoDataFound(false);
    setEmployeeDetails(null);
    setEarningsData([]);
    setDeductionsData([]);
    setTotalEarningRow(null);
    setTotalEarnings(0);
    setPayslipCompanydetails();

    try {
      const [employeeRes, earningsRes, deductionsRes, payslipCompanydetails] = await Promise.all([
        apiCalls('get', `/basicmaster/getpayslipemployeedetails?Employeecode=${employeeCode}&orgId=${orgId}`),
        apiCalls(
          'get',
          `/basicmaster/getpayslipearningdetails?Employeecode=${employeeCode}&Month=${selectedMonth}&orgId=${orgId}&year=${selectedYear}`
        ),
        apiCalls(
          'get',
          `/basicmaster/getpayslipdeductiondetails?Employeecode=${employeeCode}&Month=${selectedMonth}&orgId=${orgId}&year=${selectedYear}`
        ),
        apiCalls(
          'get',
          `basicmaster/getpayslipCompanydetails?orgId=${orgId}`
        )
      ]);

      const handleApiError = (response, defaultMessage) => {
        if (!response?.status) {
          const errorMsg = response?.paramObjectsMap?.errorMessage || defaultMessage;
          // showToast(errorMsg, 'error');
          throw new Error(errorMsg);
        }
      };

      handleApiError(employeeRes, 'Failed to fetch employee details');
      handleApiError(earningsRes, 'Failed to fetch earnings details');
      handleApiError(deductionsRes, 'Failed to fetch deduction details');

      const hasEarnings = earningsRes.paramObjectsMap?.employee?.length > 0;
      const hasDeductions = deductionsRes.paramObjectsMap?.employee?.length > 0;

      if (!hasEarnings && !hasDeductions) {
        setNoDataFound(true);
        showToast(`No payslip found for ${monthName} ${selectedYear}`, 'warning');
        return;
      }

      if (employeeRes.paramObjectsMap.employee?.length > 0) {
        setEmployeeDetails(employeeRes.paramObjectsMap.employee[0]);
      }

      if (hasEarnings) {
        const processedEarnings = processEarningsData(earningsRes.paramObjectsMap.employee);
        setEarningsData(processedEarnings.rows);
        setTotalEarningRow(processedEarnings.total);
        setTotalEarnings(processedEarnings.total.amount);
      }

      if (hasDeductions) {
        const filteredDeductions = deductionsRes.paramObjectsMap.employee
          .filter((item) => item.heading !== 'Total Deduction')
          .map((item) => ({
            ...item,
            amount: parseFloat((item.amount || '0').replace(/,/g, '')) || 0
          }));
        setDeductionsData(filteredDeductions);
      }
    } catch (error) {
      console.error('Payslip fetch error:', error);
      setNoDataFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const processEarningsData = (data) => {
    const merged = data.reduce((acc, item) => {
      const key = item.heading;
      const amount = parseFloat((item.amount || '0').replace(/,/g, '')) || 0;
      const actuals = parseFloat((item.actuals || '0').replace(/,/g, '')) || 0;

      if (!acc[key]) {
        acc[key] = { ...item, amount, actuals };
      } else {
        acc[key].amount += amount;
        acc[key].actuals += actuals;
      }
      return acc;
    }, {});

    const mergedArray = Object.values(merged);
    const total = mergedArray.find((item) => item.heading === 'Total Earnings') || { amount: 0, actuals: 0 };

    return {
      rows: mergedArray.filter((item) => item.heading !== 'Total Earnings'),
      total
    };
  };

  const handleSearch = () => {
    if (!validateForm()) {
      setShowPayslip(false);
      return;
    }

    fetchPayslipData(passedEmployeeCode); // <-- trigger data fetch manually
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

  const handleDownload = () => {
    if (!showPayslip || !employeeDetails || noDataFound) {
      showToast('Please generate a valid payslip first', 'warning');
      return;
    }

    const input = document.getElementById('payslip-container');
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Payslip_${employeeDetails.employeecode}_${selectedMonth}_${selectedYear}.pdf`);
      })
      .catch((error) => {
        console.error('PDF generation failed:', error);
        // showToast('Failed to generate PDF', 'error');
      });
  };

  const totalDeductions = useMemo(() => deductionsData.reduce((sum, item) => sum + item.amount, 0), [deductionsData]);

  const netPay = useMemo(() => totalEarnings - totalDeductions, [totalEarnings, totalDeductions]);

  const monthName = useMemo(
    () =>
      selectedMonth
        ? dayjs()
          .month(selectedMonth - 1)
          .format('MMMM')
        : '',
    [selectedMonth]
  );

  const handleLogoError = () => {
    console.error('Failed to load company logo');
    setLogoLoadError(true);
  };

  const convertNumberToWords = (amount) => {
    const units = [
      'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];

    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const convertThreeDigits = (n) => {
      if (n === 0) return '';
      let str = '';
      const hundreds = Math.floor(n / 100);
      if (hundreds > 0) {
        str += `${units[hundreds]} Hundred `;
        n %= 100;
      }
      if (n > 0) {
        if (n < 20) {
          str += units[n];
        } else {
          const tensDigit = Math.floor(n / 10);
          const onesDigit = n % 10;
          str += tens[tensDigit];
          if (onesDigit > 0) {
            str += ` ${units[onesDigit]}`;
          }
        }
      }
      return str.trim();
    };

    // if (isNaN(amount) return 'Invalid Amount';
    if (amount === 0) return 'Zero';

    // Separate rupees and paise
    const rupees = Math.floor(amount);
    let paise = Math.round((amount - rupees) * 100);

    // Handle potential floating-point issues
    if (paise >= 100) {
      paise = 0;
    }

    const groups = [];
    let num = rupees;

    // Break into groups (last 3 digits, then pairs of 2 digits)
    groups.push(num % 1000);
    num = Math.floor(num / 1000);

    while (num > 0) {
      groups.push(num % 100);
      num = Math.floor(num / 100);
    }

    const unitsText = ['', 'Thousand', 'Lakh', 'Crore'];
    let words = '';

    // Process groups from highest to lowest
    for (let i = groups.length - 1; i >= 0; i--) {
      if (groups[i] !== 0) {
        words += `${convertThreeDigits(groups[i])} ${unitsText[i]} `;
      }
    }

    // Add paise if exists
    if (paise > 0) {
      words = words.trim();
      words += ` and ${convertThreeDigits(paise)} Paise`;
    }

    return words.trim();
  };

  const amountInWords = useMemo(() => {
    if (!showPayslip || noDataFound || !employeeDetails || netPay === undefined) return '';
    return convertNumberToWords(netPay);
  }, [netPay, showPayslip, noDataFound, employeeDetails]);

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
                    setSelectedMonth(newValue.month() + 1);
                    setErrors({ ...errors, month: '' });
                  } else {
                    setSelectedMonth(null);
                  }
                  setShowPayslip(false);
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
          {selectedMonth && selectedYear
            ? `No payslip found for ${monthName} ${selectedYear}`
            : 'Please select month and year to generate payslip'}
        </NoDataMessage>
      )}

      {showPayslip && !noDataFound && employeeDetails && !isLoading && (
        <Container id="payslip-container" className="w-100">
          <Header className="p-3">

            <LogoContainer>
              {logoUrl && !logoLoadError ? (
                <>
                  <CompanyLogo
                    src={logoUrl}
                    alt="Company Logo"
                    onError={handleLogoError}
                  />
                  <CompanyName>
                    {companyDetails?.companyname || 'Company Name'}
                  </CompanyName>
                </>
              ) : (
                <CompanyName id="company-name-fallback">
                  {companyDetails?.companyname || 'Company Name'}
                </CompanyName>
              )}
            </LogoContainer>

            <CompanyAddress>
              {/* {companyDetails?.address || 'Address Not Available'}, */}
              {/* {companyDetails?.companyname ? ` ${companyDetails.companyname}` : ''} */}
              {companyDetails?.address ? ` ${companyDetails.address}` : ''}
              {companyDetails?.city ? ` ${companyDetails.city}` : ''}
              {companyDetails?.pincode ? ` - ${companyDetails.pincode}` : ''}
            </CompanyAddress>

            <PayslipTitle>
              PAY SLIP FOR THE MONTH OF {monthName.toUpperCase()} {selectedYear}
            </PayslipTitle>
          </Header>

          <EmployeeInfo>
            <InfoColumn>
              <p>
                <strong>Name:</strong> {employeeDetails.employee} [{employeeDetails.employeecode}]
              </p>
              <p>
                <strong>Join Date:</strong> {dayjs(employeeDetails.joiningdate).format('DD MMM YYYY')}
              </p>
              <p>
                <strong>Designation:</strong> {employeeDetails.designation}
              </p>
              <p>
                <strong>Location:</strong> {employeeDetails.branch}
              </p>
              <p>
                <strong>Effective Work Days:</strong> {employeeDetails.effectiveworkingdays}
              </p>
              <p>
                <strong>Days In Month:</strong> {employeeDetails.totalworkingdays}
              </p>
            </InfoColumn>
            {/* <Divider /> */}
            <InfoColumn>
              <p>
                <strong>Bank Name:</strong> {employeeDetails.bankName}
              </p>
              <p>
                <strong>Account No:</strong> {employeeDetails.accountno}
              </p>
              <p>
                <strong>UAN:</strong> {employeeDetails.uanno}
              </p>
              <p>
                <strong>PAN No:</strong> {employeeDetails.panno}
              </p>
              <p>
                <strong>LOP:</strong> {employeeDetails.lopDays || '0'}
              </p>
            </InfoColumn>
          </EmployeeInfo>

          <DividerLine />

          <TableSection>
            <EarningsTable>
              <thead>
                <tr>
                  <th style={thStyle}>Earnings</th>
                  <th style={thStyle}>Full</th>
                  <th style={thStyle}>Actual</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.map((item, idx) => (
                  <tr key={idx}>
                    <td style={tdStyle}>{item.heading}</td>
                    <td style={tdRight}>{item.amount.toFixed(2)}</td>
                    <td style={tdRight}>{item.actuals.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>Total Earnings: Rs.</td>
                  <td style={tdRight}>{totalEarningRow?.amount.toFixed(2)}</td>
                  <td style={tdRight}>{totalEarningRow?.actuals?.toFixed(2)}</td>
                </tr>
              </tbody>
            </EarningsTable>

            <DeductionsTable>
              <thead>
                <tr>
                  <th style={thStyle}>Deductions</th>
                  <th style={thRight}>Actual</th>
                </tr>
              </thead>
              <tbody>
                {deductionsData.map((item, idx) => (
                  <tr key={idx}>
                    <td style={tdStyle}>{item.heading}</td>
                    <td style={tdRight}>{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>Total Deductions: Rs.</td>
                  <td style={tdRight}>{totalDeductions.toFixed(2)}</td>
                </tr>
              </tbody>
            </DeductionsTable>
          </TableSection>

          <div style={{ marginTop: '20px', padding: '10px' }}>
            <p>
              <strong>Net Pay for the month ( Total Earnings - Total Deductions): Rs. {netPay.toFixed(2)}</strong>
            </p>
            {/* <p style={{ fontStyle: 'italic' }}>(Rupees {netPay.toFixed(2)} Only)</p> */}
            <p style={{ fontStyle: 'italic' }}>(Rupees {amountInWords} Only)</p>
          </div>

          <p style={{ fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
            This is a system-generated payslip and does not require signature.
          </p>
        </Container>
      )}
    </div>
  );
};

const ErrorText = styled.div`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #888;
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

const Container = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: auto;
  max-width: 750px;
  padding: 0px;
  border: 2px solid #000;
  background: #fff;
  border-radius: 8px;
  box-sizing: border-box;
`;

const PayslipTitle = styled.div`
  width: 100%;
  margin-top: 15px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
`;

const EmployeeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
`;


const LogoContainer = styled.div`
    display: flex;
  align-items: center;
  height: 60px;
`;
const CompanyLogo = styled.img`
   max-height: 100%;
  max-width: 100%;
  object-fit: contain;
`;

const CompanyName = styled.div`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #333;
  padding-left: 40px;
`;

const CompanyAddress = styled.div`
  text-align: center;
  font-size: 14px;
  margin-bottom: 15px;
`;

const InfoColumn = styled.div`
  width: 50%;
  padding-top: 0px;
  padding-left:10px;
`;

const Divider = styled.div`
  width: 1px;
  background-color: black;
  margin: 11px 14px;
`;

const DividerLine = styled.hr`
  border: 1.5px solid black;
  margin-top: -20px;
`;

const TableSection = styled.div`
  display: flex;
  padding: 0 10px;
`;

const EarningsTable = styled.table`
  width: 50%;
  border-collapse: collapse;
`;

const DeductionsTable = styled.table`
  width: 50%;
  border-collapse: collapse;
`;

const thStyle = {
  border: '1px solid black',
  padding: '6px',
  textAlign: 'left'
};

const thRight = {
  border: '1px solid black',
  padding: '6px',
  textAlign: 'right'
};

const tdStyle = {
  border: '1px solid black',
  padding: '6px',
  textAlign: 'left'
};

const tdRight = {
  border: '1px solid black',
  padding: '6px',
  textAlign: 'right'
};
const Header = styled.div`
  text-align: center;
  border-bottom: 2px solid #ccc;
  margin-bottom: 20px;
`;

export default Payslip;
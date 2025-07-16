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
  const now = dayjs();
  const prevMonth = now.subtract(1, 'month');
  const [selectedMonth, setSelectedMonth] = useState(prevMonth.month() + 1);
  const [selectedYear, setSelectedYear] = useState(prevMonth.year());
  // const [selectedMonth, setSelectedMonth] = useState(null);
  // const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  // const [selectedYear, setSelectedYear] = useState(null);
  // const [selectedYear, setSelectedYear] = useState(dayjs().year());
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

  // Automatically fetch previous month's payslip on load
  // useEffect(() => {
  //   if (employeeCode && selectedMonth && selectedYear) {
  //     if (!showPayslip || noDataFound) {
  //       fetchPayslipData();
  //       setShowPayslip(true);
  //     }
  //   }
  // }, [employeeCode, selectedMonth, selectedYear]);

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
      const result = await apiCalls('get', `basicmaster/getpayslipCompanydetails?orgId=${orgId}`);
      if (result.paramObjectsMap?.Company?.length > 0) {
        setCompanyDetails(result.paramObjectsMap.Company[0]);
      }
    } catch (err) {
      console.error('Failed to fetch company details:', err);
    }
  };

  // Allow current month in validation
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

    fetchPayslipData(passedEmployeeCode);
    setShowPayslip(true);
  };

  const handleClear = () => {
    // Reset to previous month and year
    const now = dayjs();
    const prevMonth = now.subtract(1, 'month');

    setSelectedYear(prevMonth.year());
    setSelectedMonth(prevMonth.month() + 1);

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
        showToast('Failed to generate PDF', 'error');
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

    if (isNaN(amount)) return 'Invalid Amount';
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

  // Update the disableFutureMonth function
  const disableFutureMonth = (month) => {
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month(); // 0-indexed
    const selectedYearNum = Number(selectedYear);

    if (selectedYearNum === currentYear) {
      // Disable current month and future months
      return month.month() >= currentMonth;
    }

    return false;
  };


  // Function to disable future years
  const disableFutureYear = (date) => {
    return date.year() > dayjs().year();
  };


  return (
    <CardContainer>
      <ControlSection>
        <ButtonGroup>
          <ActionButton title="Search" icon={SearchIcon} onClick={handleSearch} disabled={isLoading} />
          <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} disabled={isLoading} />
          <ActionButton
            title="Download"
            icon={DownloadIcon}
            onClick={handleDownload}
            margin="0 10px"
            disabled={!showPayslip || isLoading || noDataFound}
          />
        </ButtonGroup>
      </ControlSection>

      <DateSection>
        <div className="col-md-3 mb-3">
          <FormControl error={!!errors.year}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Year"
                views={['year']}
                openTo="year"
                format="YYYY"
                shouldDisableYear={disableFutureYear}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: !!errors.year,
                    variant: 'outlined'
                  }
                }}
                value={dayjs(`${selectedYear}-01-01`)}
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

        <div className="col-md-3 mb-3">
          <FormControl error={!!errors.month}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Month"
                views={['month']}
                openTo="month"
                format="MMMM"
                shouldDisableMonth={disableFutureMonth}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: !!errors.month,
                    variant: 'outlined'
                  }
                }}
                value={dayjs().year(selectedYear).month(selectedMonth - 1)}
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
      </DateSection>



      {isLoading && <LoadingContainer>Loading payslip data...</LoadingContainer>}

      {showPayslip && noDataFound && !isLoading && (
        <NoDataMessage>
          {selectedMonth && selectedYear
            ? `No payslip found for ${monthName} ${selectedYear}`
            : 'Please select month and year to generate payslip'}
        </NoDataMessage>
      )}

      {showPayslip && !noDataFound && employeeDetails && !isLoading && (
        <PayslipContainer id="payslip-container">
          <HeaderSection>
            <LogoContainer>
              {logoUrl && !logoLoadError ? (
                <>
                  <CompanyLogo
                    src={logoUrl}
                    alt="Company Logo"
                    onError={handleLogoError}
                  />
                  <CompanyInfo>
                    <CompanyName>
                      {companyDetails?.companyname || 'Company Name'}
                    </CompanyName>
                    <CompanyAddress>
                      {companyDetails?.address ? `${companyDetails.address},` : ''}
                      {companyDetails?.pincode ? ` ${companyDetails.pincode}` : ''}
                    </CompanyAddress>
                  </CompanyInfo>
                </>
              ) : (
                <CompanyInfo fullWidth>
                  <CompanyName>
                    {companyDetails?.companyname || 'Company Name'}
                  </CompanyName>
                  <CompanyAddress>
                    {companyDetails?.address ? `${companyDetails.address},` : ''}
                    {companyDetails?.pincode ? ` ${companyDetails.pincode}` : ''}
                  </CompanyAddress>
                </CompanyInfo>
              )}
            </LogoContainer>

            <PayslipTitle>
              PAY SLIP FOR THE MONTH OF {monthName.toUpperCase()} {selectedYear}
            </PayslipTitle>
          </HeaderSection>

          <EmployeeInfoSection>
            <InfoColumn>
              <InfoItem>
                <InfoLabel>Name:</InfoLabel>
                <InfoValue>{employeeDetails.employee} [{employeeDetails.employeecode}]</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Join Date:</InfoLabel>
                <InfoValue>{dayjs(employeeDetails.joiningdate).format('DD MMM YYYY')}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Designation:</InfoLabel>
                <InfoValue>{employeeDetails.designation}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Location:</InfoLabel>
                <InfoValue>{employeeDetails.branch}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Effective Work Days:</InfoLabel>
                <InfoValue>{employeeDetails.effectiveworkingdays}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Days In Month:</InfoLabel>
                <InfoValue>{employeeDetails.totalworkingdays}</InfoValue>
              </InfoItem>
            </InfoColumn>

            <VerticalDivider />

            <InfoColumn>
              <InfoItem>
                <InfoLabel>Bank Name:</InfoLabel>
                <InfoValue>{employeeDetails.bankName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Account No:</InfoLabel>
                <InfoValue>{employeeDetails.accountno}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>UAN:</InfoLabel>
                <InfoValue>{employeeDetails.uanno}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>PAN No:</InfoLabel>
                <InfoValue>{employeeDetails.panno}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>LOP:</InfoLabel>
                <InfoValue>{employeeDetails.lopDays || '0'}</InfoValue>
              </InfoItem>
            </InfoColumn>
          </EmployeeInfoSection>

          <DividerLine />

          <FinancialSection>
            <EarningsTable>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell width="50%">Earnings</TableHeaderCell>
                  <TableHeaderCell width="25%" align="right">Full</TableHeaderCell>
                  <TableHeaderCell width="25%" align="right">Actual</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earningsData.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell width="50%">{item.heading}</TableCell>
                    <TableCell width="25%" align="right">{item.amount.toFixed(2)}</TableCell>
                    <TableCell width="25%" align="right">{item.actuals.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TotalRow>
                  <TableCell width="50%" style={{ fontWeight: 'bold' }}>Total Earnings: Rs.</TableCell>
                  <TableCell width="25%" align="right">{totalEarningRow?.amount.toFixed(2)}</TableCell>
                  <TableCell width="25%" align="right">{totalEarningRow?.actuals?.toFixed(2)}</TableCell>
                </TotalRow>
              </TableBody>
            </EarningsTable>

            <DeductionsTable>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell width="60%">Deductions</TableHeaderCell>
                  <TableHeaderCell width="40%" align="right">Actual</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductionsData.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell width="60%">{item.heading}</TableCell>
                    <TableCell width="40%" align="right">{item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TotalRow>
                  <TableCell width="60%" style={{ fontWeight: 'bold' }}>Total Deductions: Rs.</TableCell>
                  <TableCell width="40%" align="right">{totalDeductions.toFixed(2)}</TableCell>
                </TotalRow>
              </TableBody>
            </DeductionsTable>
          </FinancialSection>

          <NetPaySection>
            <NetPayLabel>
              Net Pay for the month (Total Earnings - Total Deductions):
            </NetPayLabel>
            <NetPayValue>Rs. {netPay.toFixed(2)}</NetPayValue>
            <AmountInWords>
              (Rupees {amountInWords} Only)
            </AmountInWords>
          </NetPaySection>

          <Footer>
            <Disclaimer>
              This is a system-generated payslip and does not require signature.
            </Disclaimer>
            <ContactInfo>
              {companyDetails?.email ? `Email: ${companyDetails.email} | ` : ''}
              {companyDetails?.phone ? `Phone: ${companyDetails.phone} | ` : ''}
              {companyDetails?.website ? `Website: ${companyDetails.website}` : ''}
            </ContactInfo>
          </Footer>
        </PayslipContainer>
      )}
    </CardContainer>
  );
};

// ====== Styled Components ====== //
const CardContainer = styled.div`
  padding: 20px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const ControlSection = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
`;

const DateSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;


const ErrorText = styled.div`
  color: #e53935;
  font-size: 12px;
  margin-top: 5px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 30px;
  font-size: 16px;
  color: #5c6bc0;
  background: #e8eaf6;
  border-radius: 8px;
  margin-top: 20px;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 30px;
  font-size: 16px;
  color: #ff9800;
  border: 1px dashed #ffb74d;
  margin-top: 20px;
  background-color: #fff8e1;
  border-radius: 8px;
`;

const PayslipContainer = styled.div`
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  margin: auto;
  max-width: 800px;
  padding: 30px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  padding: 0 15px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 576px) {
    flex-direction: column;
    text-align: center;
    padding-left: 0;
  }
`;

const CompanyLogo = styled.img`
  max-height: 100px;
  max-width: 180px;
  object-fit: contain;
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
${props => props.fullWidth && 'width: 100%;'}
`;

const CompanyName = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 0.5px;
`;

const CompanyAddress = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 5px;
`;

const PayslipTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 15px 0 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const EmployeeInfoSection = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: #f9fbfd;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #eaeaea;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const InfoColumn = styled.div`
  width: 48%;

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 15px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #34495e;
  min-width: 160px;
`;

const InfoValue = styled.span`
  color: #2c3e50;
  flex: 1;
`;

const VerticalDivider = styled.div`
  width: 1px;
  background: #e0e0e0;
  margin: 0 15px;

  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
    margin: 10px 0;
  }
`;

const DividerLine = styled.hr`
  border: 0;
  height: 1px;
  // background: linear-gradient(to right, #f7f7f7ff, #f7f7f7ff);
  margin: 20px 0;
`;

const FinancialSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  padding: 0 15px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const EarningsTable = styled.table`
  width: 60%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  table-layout: fixed;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const DeductionsTable = styled.table`
  width: 40%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  table-layout: fixed;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 15px;
  text-align: ${props => props.align || 'left'};
  font-weight: 600;
  width: ${props => props.width || 'auto'};
`;

const TableBody = styled.tbody``;

const TableCell = styled.td`
  padding: 10px 15px;
  border-bottom: 1px solid #eaeaea;
  text-align: ${props => props.align || 'left'};
  width: ${props => props.width || 'auto'};
`;

const TotalRow = styled.tr`
  background-color: #e3f2fd !important;
  font-weight: bold;
  border-top: 2px solid #bbdefb;
`;

const NetPaySection = styled.div`
  padding: 20px 15px;
  background: #e8f5e9;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #4caf50;
`;

const NetPayLabel = styled.p`
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 5px;
`;

const NetPayValue = styled.p`
  font-size: 22px;
  font-weight: 700;
  color: #1b5e20;
  margin: 5px 0;
`;

const AmountInWords = styled.p`
  font-style: italic;
  color: #43a047;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #a5d6a7;
`;

const Footer = styled.div`
  text-align: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 20px;
`;

const Disclaimer = styled.p`
  font-size: 13px;
  color: #757575;
  margin-bottom: 8px;
`;

const ContactInfo = styled.div`
  font-size: 12px;
  color: #9e9e9e;
`;
export default Payslip;
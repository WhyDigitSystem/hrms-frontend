import React from 'react';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import apiCalls from 'apicall';
import { useState, useEffect } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer } from 'react-toastify';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import DownloadIcon from '@mui/icons-material/Download';
import styled from 'styled-components';
import LogoImage from '../../assets/images/HRMS_Logo.png';

const Container = styled.div`
  font-family: Arial, sans-serif;
  margin: 20px;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
`;

const CompanyInfo = styled.div`
  text-align: center;
`;

const CompanyName = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const CompanyAddress = styled.div`
  font-size: 14px;
  margin-bottom: 20px;
`;

const PayslipTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  text-decoration: underline;
`;

const EmployeeTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  td {
    padding: 8px;
    border: 1px solid #ddd;
    font-size: 14px;
  }
`;

const EarningsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th, td {
    padding: 8px;
    border: 1px solid #ddd;
    text-align: left;
    font-size: 14px;
  }

  th {
    background-color: #f2f2f2;
  }
`;

const TotalRow = styled.tr`
  font-weight: bold;
`;

const NetPay = styled.div`
  font-weight: bold;
  margin-top: 10px;
  font-size: 16px;
`;

const Footer = styled.div`
  margin-top: 30px;
  font-size: 12px;
  text-align: center;
  color: #666;
`;

const Payslip = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
    const [branch, setBranch] = useState(localStorage.getItem('branch'));
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [employeeCode, setEmployeeCode] = useState(localStorage.getItem('employeeCode'));

    const [formData, setFormData] = useState({
        fromDate: null,
        toDate: null
    });

    const [fieldErrors, setFieldErrors] = useState({
        fromDate: null,
        toDate: null
    });

    useEffect(() => {
        if (orgId && loginUserName) {
            fetchEmployeeDetails();
        }
    }, [orgId, loginUserName]);

    const fetchEmployeeDetails = async () => {
        try {
            const result = await apiCalls('get', `/basicmaster/getpayslipemployeedetails?Employeecode=${employeeCode}&orgId=${orgId}`);
            if (result?.status && result?.paramObjectsMap?.employee?.length > 0) {
                setEmployeeDetails(result.paramObjectsMap.employee[0]);
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
        }
    };

    const handleDateChange = (field, date) => {
        if (date) {
            const formattedDate = field === 'toDate'
                ? dayjs(date).format('YYYY')
                : dayjs(date).format('MMMM YYYY');
            setFormData(prevState => ({
                ...prevState,
                [field]: formattedDate,
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [field]: '',
            }));
        }
    };

    const handleClear = () => {
        setFormData({
            fromDate: null,
            toDate: null
        });
        setFieldErrors({
            fromDate: null,
            toDate: null
        });
    };

    return (
        <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
            <div className="row d-flex ml">
                <div className="d-flex flex-wrap justify-content-start" style={{ marginBottom: '20px' }}>
                    <ActionButton title="Search" icon={SearchIcon} onClick={''} />
                    <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
                    <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={''} />
                    <ActionButton title="Download" icon={DownloadIcon} onClick={''} margin="0 10px 0 10px" />
                </div>
            </div>

            <div className="row">
                <div className="col-md-3 mb-3">
                    <FormControl fullWidth variant="filled" size="small">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Month"
                                views={["year", "month"]}
                                value={formData.fromDate ? dayjs(formData.fromDate, 'MMMM YYYY') : null}
                                onChange={(date) => handleDateChange('fromDate', date)}
                                format="MMMM YYYY"
                                slotProps={{ textField: { size: 'small', clearable: true } }}
                                error={fieldErrors.fromDate}
                                helperText={fieldErrors.fromDate ? 'This field is required' : ''}
                            />
                        </LocalizationProvider>
                    </FormControl>
                </div>

                <div className="col-md-3 mb-3">
                    <FormControl fullWidth variant="filled" size="small">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Year"
                                views={['year']}
                                value={formData.toDate ? dayjs(formData.toDate, 'YYYY') : null}
                                onChange={(date) => handleDateChange('toDate', date)}
                                format="YYYY"
                                slotProps={{ textField: { size: 'small', clearable: true } }}
                                error={fieldErrors.toDate}
                                helperText={fieldErrors.toDate ? 'This field is required' : ''}
                            />
                        </LocalizationProvider>
                    </FormControl>
                </div>
            </div>

            <Container className='w-100'>
                <Header>
                    <LogoContainer>
                        <img
                            src={LogoImage}
                            alt="logo"
                            style={{ width: '110px', height: '75px' }}
                        />
                    </LogoContainer>
                    <CompanyInfo>
                        <CompanyName>WHY DIGIT SYSTEMS PRIVATE LIMITED</CompanyName>
                        <CompanyAddress>23/1 T.C PALAYA MAIN ROAD, HOYSALA NAGAR BANGALORE – 560016</CompanyAddress>
                    </CompanyInfo>
                </Header>

                <PayslipTitle>Payslip for the month of {formData.fromDate || '---'} {formData.toDate || ''}</PayslipTitle>

                <EmployeeTable>
                    <tbody>
                        <tr>
                            <td>Name:</td>
                            <td>{employeeDetails?.employee} [{employeeDetails?.employeecode}]</td>
                            <td>Bank Name:</td>
                            <td>Axis Bank</td>
                        </tr>
                        <tr>
                            <td>Join Date:</td>
                            <td>{employeeDetails?.joiningdate}</td>
                            <td>Account No:</td>
                            <td>{employeeDetails?.accountno}</td>
                        </tr>
                        <tr>
                            <td>Designation:</td>
                            <td>{employeeDetails?.designation}</td>
                            <td>UAN:</td>
                            <td>{employeeDetails?.uanno || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Location:</td>
                            <td>{employeeDetails?.branch}</td>
                            <td>PAN No:</td>
                            <td>{employeeDetails?.panno}</td>
                        </tr>
                        <tr>
                            <td>Effective Work Days:</td>
                            <td>{employeeDetails?.effectiveworkingdays}</td>
                            <td>LOP:</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>Days In Month:</td>
                            <td>{employeeDetails?.totalworkingdays}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </EmployeeTable>

                <EarningsTable>
                    <thead>
                        <tr>
                            <th>Earnings</th>
                            <th>Full</th>
                            <th>Actual</th>
                            <th>Deductions</th>
                            <th>Actual</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>BASIC</td>
                            <td>0</td>
                            <td>0</td>
                            <td>PROF TAX</td>
                            <td>200.00</td>
                        </tr>
                        <tr>
                            <td>HRA</td>
                            <td>0</td>
                            <td>0</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>SPECIAL ALLOWANCE</td>
                            <td>0</td>
                            <td>0</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <TotalRow>
                            <td>Total Earnings: Rs.</td>
                            <td>0</td>
                            <td>0</td>
                            <td>Total Deductions: Rs.</td>
                            <td>200.00</td>
                        </TotalRow>
                    </tbody>
                </EarningsTable>

                <NetPay>Net Pay for the month (Total Earnings - Total Deductions): Rs. -200.00</NetPay>
                <div>(Rupees Only)</div>

                <Footer>
                    This is a system generated payslip and does not require signature.<br />
                    Print Date: {dayjs().format('MMM DD, YYYY h:mm A')}
                </Footer>
            </Container>
        </div>
    );
};

export default Payslip;

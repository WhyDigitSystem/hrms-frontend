import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Grid, Tab, TextField } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import 'react-tabs/style/react-tabs.css';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonTable from 'views/basicMaster/CommonTable';

const Reconcile = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [value, setValue] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const [data, setData] = useState([]);
  const [orgId, setOrgId] = useState(parseInt(localStorage.getItem('orgId'), 10));
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState();
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [loginBranchCode, setLoginBranchCode] = useState(localStorage.getItem('branchcode'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [finYear, setFinYear] = useState(localStorage.getItem('finYear'));
  const [bankName, setBankName] = useState([]);

  const handleTabSelect = (index) => {
    setTabIndex(index);
  };

  const [formData, setFormData] = useState({
    docId: '',
    docDate: dayjs(),
    bankStmtDate: null,
    bankAccount: '',
    remarks: '',
    totalDeposit: 0,
    totalWithdrawal: 0
  });

  const [formDataErrors, setFormDataErrors] = useState({
    docId: '',
    docDate: null,
    bankStmtDate: null,
    bankAccount: '',
    remarks: '',
    totalDeposit: '',
    totalWithdrawal: ''
  });

  // Handle tab changes
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    getAllReconsileBank();
    getNewBankDocId();
    getAllBankName();
  }, []);

  const getAllReconsileBank = async () => {
    try {
      const result = await apiCalls('get', `/transaction/getAllReconcileBankByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.reconcileBankVO.reverse() || []);
      showForm(true);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getNewBankDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getReconcileBankDocId?branchCode=${loginBranchCode}&branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      setFormData((prevData) => ({
        ...prevData,
        docId: response.paramObjectsMap.reconcileBankDocId,
        docDate: dayjs()
      }));
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const [withdrawalsTableData, setWithdrawalsTableData] = useState([
    {
      sno: '',
      voucherNo: '',
      voucherDate: '',
      chequeNo: '',
      chequeDate: '',
      clearedDate: '',
      withdrawal: '',
      bankRef: '',
      deposit: ''
    }
  ]);

  const [withdrawalsTableErrors, setWithdrawalsTableErrors] = useState([
    {
      sno: '',
      voucherNo: '',
      voucherDate: '',
      chequeNo: '',
      chequeDate: '',
      clearedDate: '',
      withdrawal: '',
      bankRef: '',
      deposit: ''
    }
  ]);

  // const handleAddRow = () => {
  //   setWithdrawalsTableData((prevData) => [
  //     ...prevData,
  //     {
  //       id: prevData.length + 1, // Or use a better ID generation method
  //       voucherNo: '',
  //       voucherDate: '',
  //       chequeNo: '',
  //       chequeDate: '',
  //       clearedDate: '',
  //       withdrawal: '',
  //       bankRef: '',
  //       narration: ''
  //     }
  //   ]);
  // };

  const handleAddRow = () => {
    if (isLastRowEmpty(withdrawalsTableData)) {
      displayRowError(withdrawalsTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      sno: '',
      voucherNo: '',
      voucherDate: '',
      chequeNo: '',
      chequeDate: '',
      // clearedDate: '',
      withdrawal: '',
      bankRef: '',
      deposit: ''
    };
    setWithdrawalsTableData([...withdrawalsTableData, newRow]);
    setWithdrawalsTableErrors([
      ...withdrawalsTableErrors,
      {
        sno: '',
        voucherNo: '',
        voucherDate: '',
        chequeNo: '',
        chequeDate: '',
        // clearedDate: '',
        withdrawal: '',
        bankRef: '',
        narration: ''
      }
    ]);
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === withdrawalsTableData) {
      return (
        !lastRow.voucherNo ||
        !lastRow.voucherDate ||
        !lastRow.chequeNo ||
        !lastRow.chequeDate ||
        // !lastRow.clearedDate ||
        !lastRow.deposit ||
        !lastRow.withdrawal ||
        !lastRow.bankRef
      );
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === withdrawalsTableErrors) {
      setWithdrawalsTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          voucherNo: !table[table.length - 1].voucherNo ? 'Voucher No is required' : '',
          voucherDate: !table[table.length - 1].voucherDate ? 'Voucher Date is required' : '',
          chequeNo: !table[table.length - 1].chequeNo ? 'Cheque No is required' : '',
          chequeDate: !table[table.length - 1].chequeDate ? 'Cheque Date is required' : '',
          clearedDate: !table[table.length - 1].clearedDate ? 'Cleared Date is required' : '',
          withdrawal: !table[table.length - 1].withdrawal ? 'Withdrawal is required' : '',
          bankRef: !table[table.length - 1].bankRef ? 'Bank Ref is required' : '',
          deposit: !table[table.length - 1].deposit ? 'Deposit is required' : ''
        };
        return newErrors;
      });
    }
  };

  // const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
  //   const rowIndex = table.findIndex((row) => row.id === id);
  //   // If the row exists, proceed to delete
  //   if (rowIndex !== -1) {
  //     const updatedData = table.filter((row) => row.id !== id);
  //     const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
  //     setTable(updatedData);
  //     setErrorTable(updatedErrors);
  //   }
  // };

  const handleClear = () => {
    setFormData({
      bankStmtDate: null,
      bankAccount: '',
      remarks: '',
      totalDeposit: '',
      totalWithdrawal: ''
    });

    // Set the table to only have one empty row
    setWithdrawalsTableData([
      {
        id: 1,
        sno: '',
        voucherNo: '',
        voucherDate: '',
        chequeNo: '',
        chequeDate: '',
        clearedDate: '',
        withdrawal: '',
        bankRef: '',
        deposit: ''
      }
    ]);

    // Reset table errors for just one row
    setWithdrawalsTableErrors([
      {
        sno: '',
        voucherNo: '',
        voucherDate: '',
        chequeNo: '',
        chequeDate: '',
        clearedDate: '',
        withdrawal: '',
        bankRef: '',
        deposit: ''
      }
    ]);

    // setValidationErrors({});
    setEditId('');
    getNewBankDocId();
  };

  const handleInputChange = (e) => {
    const { id, value, checked, type } = e.target;
    // setFormValues((prev) => ({
    //   ...prev,
    //   [id]: type === 'checkbox' ? checked : value
    // }));

    // Validate the input fields
    if (id === 'section' || id === 'sectionName') {
      if (!value.trim()) {
        setValidationErrors((prev) => ({
          ...prev,
          [id]: 'This field is required'
        }));
      } else {
        setValidationErrors((prev) => {
          const { [id]: removed, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const headers = [
    { label: 'Action', field: 'action', width: '68px', inputType: 'text' },
    { label: 'S.No', field: 'sno', width: '50px', inputType: 'text' },
    { label: 'Voucher No', field: 'voucherNo', inputType: 'text' },
    { label: 'Voucher Date', field: 'voucherDate', inputType: 'date' },
    { label: 'Chq/DD No', field: 'chequeNo', inputType: 'text' },
    { label: 'Chq/DD Date', field: 'chequeDate', inputType: 'date' },
    { label: 'Cleared Date', field: 'clearedDate', inputType: 'date' },
    { label: 'Withdrawal', field: 'withdrawal', inputType: 'text' },
    { label: 'Bank Ref', field: 'bankRef', inputType: 'text' },
    { label: 'Narration', field: 'narration', inputType: 'text' }
  ];

  // const [withdrawalsTableData, setWithdrawalsTableData] = useState([]);
  // const [withdrawalsTableErrors, setWithdrawalsTableErrors] = useState([]);

  // Example of handling change dynamically
  // const handleChange = (e, rowId, field, index) => {
  //   const value = e.target.value;
  //   setWithdrawalsTableData((prev) => prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));

  //   // Validation logic here
  //   const numericRegex = /^[0-9]*$/;
  //   if (field === 'voucherNo' && !numericRegex.test(value)) {
  //     setWithdrawalsTableErrors((prev) => {
  //       const newErrors = [...prev];
  //       newErrors[index] = { ...newErrors[index], [field]: 'Only numeric characters are allowed' };
  //       return newErrors;
  //     });
  //   } else {
  //     setWithdrawalsTableErrors((prev) => {
  //       const newErrors = [...prev];
  //       newErrors[index] = { ...newErrors[index], [field]: '' };
  //       return newErrors;
  //     });
  //   }
  // };

  // Delete row handler
  const handleDeleteRow = (rowId) => {
    setWithdrawalsTableData((prev) => prev.filter((row) => row.id !== rowId));
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const columns = [
    { accessorKey: 'docId', header: 'Doc No', size: 140 },
    { accessorKey: 'docDate', header: 'Doc Date', size: 140 },
    { accessorKey: 'bankStmtDate', header: 'Bank Stmt Date', size: 140 },
    { accessorKey: 'bankAccount', header: 'bankAccount', size: 140 },
    { accessorKey: 'totalDeposit', header: 'Total Deposit', size: 140 },
    { accessorKey: 'totalWithdrawal', header: 'Total Withdrawal', size: 140 }
  ];

  const handleList = () => {
    setShowForm(!showForm);
  };

  const getAllBankName = async () => {
    try {
      const response = await apiCalls('get', `/transaction/getBankNameForGroupLedger?orgId=${orgId}`);
      setBankName(response.paramObjectsMap.accountName);

      // setStateCode(response.paramObjectsMap.partyMasterVO.partyStateVO)
    } catch (error) {
      console.error('Error fetching gate passes:', error);
    }
  };

  const handleSave = async () => {
    console.log('THE HANDLE SAVE IS WORKING');

    const errors = {};
    if (!formData.bankStmtDate) errors.bankStmtDate = 'Bank Stmt Date is required';
    if (!formData.bankAccount) errors.bankAccount = 'Bank Account is required';

    let detailsTableDataValid = true;
    // if (!withdrawalsTableData || withdrawalsTableData.length === 0) {
    //   detailsTableDataValid = false;
    //   setWithdrawalsTableErrors([{ general: 'detail Table Data is required' }]);
    // }
    // else {
    //   const newTableErrors = withdrawalsTableData.map((row, index) => {
    //     const rowErrors = {};
    //     if (!row.voucherNo) {
    //       rowErrors.voucherNo = 'VoucherNo is required';
    //       detailsTableDataValid = false;
    //     }
    //     if (!row.voucherDate) {
    //       rowErrors.voucherDate = 'voucherDate is required';
    //       detailsTableDataValid = false;
    //     }
    //     if (!row.chequeNo) {
    //       rowErrors.chequeNo = 'cheque No is required';
    //       detailsTableDataValid = false;
    //     }
    //     if (!row.chequeDate) {
    //       rowErrors.chequeDate = 'cheque Date is required';
    //       detailsTableDataValid = false;
    //     }
    //     if (!row.deposit) {
    //       rowErrors.deposit = 'deposit is required';
    //       detailsTableDataValid = false;
    //     }
    //     if (!row.withdrawal) {
    //       rowErrors.withdrawal = 'withdrawal is required';
    //       detailsTableDataValid = false;
    //     }

    //     if (row.active === undefined || row.active === null) {
    //       rowErrors.active = 'Active is required';
    //       detailsTableDataValid = false;
    //     }

    //     return rowErrors;
    //   });
    //   setWithdrawalsTableErrors(newTableErrors);
    // }
    // setFormDataErrors(errors);

    // if (Object.keys(errors).length === 0 && detailsTableDataValid) {
    if (detailsTableDataValid) {
      setIsLoading(true);

      const detailsVo = withdrawalsTableData.map((row) => ({
        ...(editId && { id: row.id }),
        voucherNo: row.voucherNo,
        voucherDate: row.voucherDate,
        chequeNo: row.chequeNo,
        chequeDate: row.voucherDate,
        deposit: parseInt(row.deposit),
        withdrawal: parseInt(row.withdrawal),
        bankRef: row.bankRef
        // active: row.active === 'true' || row.active === true // Convert string 'true' to boolean true if necessary
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        // active: formData.active,
        // docId: formData.docId,
        // docDate: formData.docDate,
        bankStmtDate: formData.bankStmtDate ? dayjs(formData.bankStmtDate).format('YYYY-MM-DD') : null,
        bankAccount: formData.bankAccount,
        remarks: formData.remarks,
        particularsReconcileDTO: detailsVo,
        createdBy: loginUserName,
        totalDeposit: parseInt(formData.totalDeposit),
        totalWithdrawal: parseInt(formData.totalWithdrawal),
        orgId: orgId,
        branch: branch,
        branchCode: loginBranchCode,
        finYear: finYear
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const response = await apiCalls('put', '/transaction/updateCreateReconcileBank', saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Reconcile Bank updated successfully' : 'Reconcile Bank created successfully');
          getAllReconsileBank();
          getNewBankDocId();
          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'List of value creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'List of value creation failed');
        setIsLoading(false);
      }
    } else {
      // setFieldErrors(errors);
    }
  };

  const getReconcileById = async (row) => {
    console.log('first', row);
    setShowForm(true);
    try {
      const result = await apiCalls('get', `/transaction/getAllReconcileBankById?id=${row.original.id}`);

      if (result) {
        const listValueVO = result.paramObjectsMap.reconcileBankVO[0];
        setEditId(row.original.id);

        setFormData({
          docId: listValueVO.docId,
          docDate: listValueVO.docDate, // handle invalid or null dates
          bankStmtDate: listValueVO.bankStmtDate, //
          bankAccount: listValueVO.bankAccount,
          remarks: listValueVO.remarks,
          totalDeposit: listValueVO.totalDeposit,
          totalWithdrawal: listValueVO.totalWithdrawal
        });
        setWithdrawalsTableData(
          listValueVO.particularsReconcileVO.map((cl) => ({
            id: cl.id,
            voucherNo: cl.voucherNo,
            voucherDate: cl.voucherDate,
            chequeNo: cl.chequeNo,
            chequeDate: cl.chequeDate,
            clearedDate: cl.clearedDate,
            withdrawal: cl.withdrawal,
            bankRef: cl.bankRef,
            deposit: cl.deposit
          }))
        );

        console.log('DataToEdit', listValueVO);
      } else {
        // Handle erro
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleDepositChange = (e, row, index) => {
    const value = e.target.value;
  
    if (/^\d{0,20}$/.test(value)) {
      setWithdrawalsTableData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, deposit: value, withdrawal: value === '0' ? '' : '0' } : r
        )
      );
  
      setWithdrawalsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          deposit: !value ? 'Deposit Amount is required' : '',
          withdrawal: value === '0' ? 'Withdrawal Amount is required' : ''
        };
        return newErrors;
      });
  
      // calculateTotals(); // Recalculate totals
    }
  };
  
  const handleWithdrawalChange = (e, row, index) => {
    const value = e.target.value;
  
    if (/^\d{0,20}$/.test(value)) {
      setWithdrawalsTableData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, withdrawal: value, deposit: value === '0' ? '' : '0' } : r
        )
      );
  
      setWithdrawalsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = {
          ...newErrors[index],
          withdrawal: !value ? 'Withdrawal Amount is required' : '',
          deposit: value === '0' ? 'Deposit Amount is required' : ''
        };
        return newErrors;
      });
  
      // calculateTotals(); // Recalculate totals
    }
  };

    useEffect(() => {
      const totalDepositAmt = withdrawalsTableData.reduce((sum, row) => sum + Number(row.deposit || 0), 0);
      const totalWithdrawalAmt = withdrawalsTableData.reduce((sum, row) => sum + Number(row.withdrawal || 0), 0);
  
      setFormData((prev) => ({
        ...prev,
        totalDeposit: totalDepositAmt,
        totalWithdrawal: totalWithdrawalAmt
      }));
    }, [withdrawalsTableData]);

  // const calculateTotals = () => {
  //   let totalDeposit = 0;
  //   let totalWithdrawal = 0;
  
  //   withdrawalsTableData.forEach((row) => {
  //     console.log("total deposit", row.deposit, "total withdrawal", row.withdrawal);
      
  //     totalDeposit += parseFloat(row.deposit) || 0;
  //     totalWithdrawal += parseFloat(row.withdrawal) || 0;
  //   });
  
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     totalDeposit: totalDeposit, // Update the header with totals
  //     totalWithdrawal: totalWithdrawal
  //   }));
  // };
  
  
  // const handleDepositChange = (e, row, index) => {
  //   const value = e.target.value;

  //   if (/^\d{0,20}$/.test(value)) {
  //     setWithdrawalsTableData((prev) => prev.map((r) => (r.id === row.id ? { ...r, deposit: value, withdrawal: value ? '0' : '' } : r)));
  //     calculateTotals(value);
  //     setWithdrawalsTableErrors((prev) => {
  //       const newErrors = [...prev];
  //       newErrors[index] = {
  //         ...newErrors[index],
  //         deposit: !value ? 'Deposit Amount is required' : ''
  //       };
  //       return newErrors;
  //     });
  //   }
  // };

  return (
    <>
    <div>
        <ToastContainer />
    </div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
      <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start p-2">
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
          </div>
      </div>

        {/* Form Section */}
        {showForm ? (
          <>
            <div className="row d-flex ml">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Doc No"
                  size="small"
                  value={formData.docId}
                  disabled
                  fullWidth
                  required
                  onChange={(e) => setFormData({ ...formData, docId: e.target.value })}
                />
              </div>
              <div className="col-md-3 mb-3">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Doc Date"
                    disabled
                    slotProps={{
                      textField: { size: 'small', clearable: true }
                    }}
                    format="DD-MM-YYYY"
                    value={formData.docDate ? dayjs(formData.docDate) : null}
                    onChange={(newValue) => setFormData({ ...formData, docDate: newValue })}
                  />
                </LocalizationProvider>
              </div>
              <div className="col-md-3 mb-3">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Bank Stmt Date"
                    slotProps={{
                      textField: { size: 'small', clearable: true }
                    }}
                    format="DD-MM-YYYY"
                    value={formData.bankStmtDate ? dayjs(formData.docDate) : null}
                    onChange={(newValue) => setFormData({ ...formData, bankStmtDate: newValue })}
                  />
                </LocalizationProvider>
              </div>
              <div className="col-md-3 mb-3">
                {/* <TextField
                  label="Bank Account"
                  value={formData.bankAccount}
                  size="small"
                  fullWidth
                  required
                  placeholder="Auto"
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                /> */}

                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label" required>
                    Bank Account
                  </InputLabel>
                  <Select
                    labelId="bankAccount"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    label="Bank Account"
                    required
                    // error={!!errors.bankAccount}
                    // helperText={errors.bankAccount}
                  >
                    {bankName &&
                      bankName.map((bank, index) => (
                        <MenuItem key={index} value={bank.accountgroupname}>
                          {bank.accountgroupname}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Remarks"
                  size="small"
                  value={formData.remarks}
                  fullWidth
                  required
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Total Deposit"
                  value={formData.totalDeposit}
                  size="small"
                  fullWidth
                  required
                  disabled
                  onChange={(e) => setFormData({ ...formData, totalDeposit: e.target.value })}
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Total Withdrawal"
                  value={formData.totalWithdrawal}
                  size="small"
                  fullWidth
                  disabled
                  required
                  onChange={(e) => setFormData({ ...formData, totalWithdrawal: e.target.value })}
                />
              </div>
            </div>
            <>
              <div className="row mt-2">
                  <Box sx={{ width: '100%' }}>
                    <Tabs
                      value={value}
                      onChange={handleChange}
                      textColor="secondary"
                      indicatorColor="secondary"
                      aria-label="secondary tabs example"
                    >
                      <Tab value={0} label="Details" />
                    </Tabs>
                  </Box>
                  <Box sx={{ padding: 2 }}>
                    {value === 0 && (
                      <>
                      <div className="row d-flex ml">
                        <div className="mb-1">
                          <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                        </div>
                        <div className="row mt-2">
                          <div className="col-lg-12">
                            <div className="table-responsive">
                              <table className="table table-bordered">
                                <thead>
                                  <tr style={{ backgroundColor: '#673AB7' }}>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                      Action
                                    </th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                      S.No
                                    </th>
                                    <th className="px-2 py-2 text-white text-center"style={{ width: '150px' }}>Voucher No</th>
                                    <th className="px-2 py-2 text-white text-center"style={{ width: '240px' }}>Voucher Date</th>
                                    <th className="px-2 py-2 text-white text-center"style={{ width: '150px' }}>Chq/DD No</th>
                                    <th className="px-2 py-2 text-white text-center"style={{ width: '240px' }}>Chq/DD Date</th>
                                    <th className="px-2 py-2 text-white text-center"style={{ width: '150px' }}>Deposit</th>
                                    <th className="px-2 py-2 text-white text-center"style={{ width: '150px' }}>Withdrawal</th>
                                    <th className="px-2 py-2 text-white text-center"style={{ width: '150px' }}>Bank Ref</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Array.isArray(withdrawalsTableData) &&
                                    withdrawalsTableData.map((row, index) => (
                                      <tr key={row.id}>
                                        <td className="border px-2 py-2 text-center">
                                          <ActionButton
                                            title="Delete"
                                            icon={DeleteIcon}
                                            onClick={() =>
                                              handleDeleteRow(
                                                row.id,
                                                withdrawalsTableData,
                                                setWithdrawalsTableData,
                                                withdrawalsTableErrors,
                                                setWithdrawalsTableErrors
                                              )
                                            }
                                          />
                                        </td>
                                        <td className="text-center">
                                          <div className="pt-2">{index + 1}</div>
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.voucherNo}
                                            
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const regex = /^[a-zA-Z0-9\s- /]*$/;
                                              setWithdrawalsTableData((prev) =>
                                                prev.map((r) => (r.id === row.id ? { ...r, voucherNo: value } : r))
                                              );
                                              setWithdrawalsTableErrors((prev) => {
                                                const newErrors = [...prev];
                                                let error = '';
                                                if (!value) {
                                                  error = 'Voucher No is required';
                                                } else if (!regex.test(value)) {
                                                  error = 'Invalid Format';
                                                }
                                                newErrors[index] = {
                                                  ...newErrors[index],
                                                  voucherNo: error
                                                };
                                                return newErrors;
                                              });
                                            }}
                                            className={
                                              withdrawalsTableErrors[index]?.voucherNo ? 'error form-control' : 'form-control'
                                            }
                                          />
                                          {withdrawalsTableErrors[index]?.voucherNo && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {withdrawalsTableErrors[index].voucherNo}
                                            </div>
                                          )}
                                        </td>
<td className="border px-2 py-2">
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              value={
                                                row.voucherDate
                                                  ? dayjs(row.voucherDate, 'YYYY-MM-DD').isValid()
                                                    ? dayjs(row.voucherDate, 'YYYY-MM-DD')
                                                    : null
                                                  : null
                                              }
                                              slotProps={{
                                                textField: { size: 'small', clearable: true }
                                              }}
                                              format="DD-MM-YYYY"
                                              onChange={(newValue) => {
                                                setWithdrawalsTableData((prev) =>
                                                  prev.map((r) =>
                                                    r.id === row.id
                                                      ? { ...r, voucherDate: newValue ? newValue.format('YYYY-MM-DD') : null }
                                                      : r
                                                  )
                                                );
                                                setWithdrawalsTableErrors((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    voucherDate: !newValue ? 'Voucher Date is required' : '',
                                                  };
                                                  return newErrors;
                                                });
                                              }}
                                              renderInput={(params) => (
                                                <TextField
                                                  {...params}
                                                  // size="small"
                                                  className={
                                                    withdrawalsTableErrors[index]?.voucherDate
                                                      ? 'error form-control'
                                                      : 'form-control'
                                                  }
                                                />
                                              )}
                                              minDate={row.voucherDate ? dayjs(row.voucherDate) : dayjs()}
                                              // disabled={!row.effectiveFrom}
                                            />
                                            {withdrawalsTableErrors[index]?.voucherDate && (
                                              <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                {withdrawalsTableErrors[index].voucherDate}
                                              </div>
                                            )}
                                          </LocalizationProvider>
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.chequeNo}
                                            
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const numericRegex = /^[0-9]*$/;
                                              if (numericRegex.test(value)) {
                                                setWithdrawalsTableData((prev) =>
                                                  prev.map((r) => (r.id === row.id ? { ...r, chequeNo: value } : r))
                                                );
                                                setWithdrawalsTableErrors((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = { ...newErrors[index], chequeNo: !value ? 'Cheque No is required' : '' };
                                                  return newErrors;
                                                });
                                              } else {
                                                setWithdrawalsTableErrors((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = { ...newErrors[index], chequeNo: 'Only numeric characters are allowed' };
                                                  return newErrors;
                                                });
                                              }
                                            }}
                                            className={withdrawalsTableErrors[index]?.chequeNo ? 'error form-control' : 'form-control'}
                                          />
                                          {withdrawalsTableErrors[index]?.chequeNo && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {withdrawalsTableErrors[index].chequeNo}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                              value={
                                                row.chequeDate
                                                  ? dayjs(row.chequeDate, 'YYYY-MM-DD').isValid()
                                                    ? dayjs(row.chequeDate, 'YYYY-MM-DD')
                                                    : null
                                                  : null
                                              }
                                              slotProps={{
                                                textField: { size: 'small', clearable: true }
                                              }}
                                              format="DD-MM-YYYY"
                                              onChange={(newValue) => {
                                                setWithdrawalsTableData((prev) =>
                                                  prev.map((r) =>
                                                    r.id === row.id
                                                      ? { ...r, chequeDate: newValue ? newValue.format('YYYY-MM-DD') : null }
                                                      : r
                                                  )
                                                );
                                                setWithdrawalsTableErrors((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    chequeDate: !newValue ? 'Voucher Date is required' : '',
                                                  };
                                                  return newErrors;
                                                });
                                              }}
                                              renderInput={(params) => (
                                                <TextField
                                                  {...params}
                                                  // size="small"
                                                  className={
                                                    withdrawalsTableErrors[index]?.chequeDate
                                                      ? 'error form-control'
                                                      : 'form-control'
                                                  }
                                                />
                                              )}
                                              minDate={row.chequeDate ? dayjs(row.chequeDate) : dayjs()}
                                              // disabled={!row.effectiveFrom}
                                            />
                                            {withdrawalsTableErrors[index]?.chequeDate && (
                                              <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                                {withdrawalsTableErrors[index].chequeDate}
                                              </div>
                                            )}
                                          </LocalizationProvider>
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.deposit}
                                            
                                            onChange={(e) => handleDepositChange(e, row, index)}
                                            className={withdrawalsTableErrors[index]?.deposit ? 'error form-control' : 'form-control'}
                                          />
                                          {withdrawalsTableErrors[index]?.deposit && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {withdrawalsTableErrors[index].deposit}
                                            </div>
                                          )}
                                        </td>

                                        {/* Withdrawal Input Field */}
                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.withdrawal}
                                            
                                            onChange={(e) => handleWithdrawalChange(e, row, index)}
                                            className={withdrawalsTableErrors[index]?.withdrawal ? 'error form-control' : 'form-control'}
                                          />
                                          {withdrawalsTableErrors[index]?.withdrawal && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {withdrawalsTableErrors[index].withdrawal}
                                            </div>
                                          )}
                                        </td>
                                        <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.bankRef}
                                            
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const regex = /^[a-zA-Z0-9\s-/]*$/; // Allow letters, numbers, spaces, and dashes

                                              if (regex.test(value)) {
                                                setWithdrawalsTableData((prev) => {
                                                  const updatedData = prev.map((r) =>
                                                    r.id === row.id ? { ...r, bankRef: value } : r
                                                  );
                                                  return updatedData;
                                                });

                                                setWithdrawalsTableErrors((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    bankRef: value ? '' : 'Bank Ref is required'
                                                  };
                                                  return newErrors;
                                                });
                                              } else {
                                                setWithdrawalsTableErrors((prev) => {
                                                  const newErrors = [...prev];
                                                  newErrors[index] = {
                                                    ...newErrors[index],
                                                    bankRef: 'Only alphanumeric characters, spaces, and dashes are allowed'
                                                  };
                                                  return newErrors;
                                                });
                                              }
                                            }}
                                            className={
                                              withdrawalsTableErrors[index]?.bankRef ? 'error form-control' : 'form-control'
                                            }
                                          />
                                          {withdrawalsTableErrors[index]?.bankRef && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {withdrawalsTableErrors[index].bankRef}
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                      </>
                      )}
                  </Box>
              </div>
            </>
          </>
        ) : (
          <CommonTable data={data && data} columns={columns} blockEdit={true} toEdit={getReconcileById} />
        )}
      </div>
      {/* <ToastContainer /> */}
    </>
  );
};

export default Reconcile;

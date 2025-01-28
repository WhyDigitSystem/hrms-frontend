import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Grid, Tab, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import Tabs from '@mui/material/Tabs';
import 'react-tabs/style/react-tabs.css';
import { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import CommonTable from 'views/basicMaster/CommonTable';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const ReconcileCorp = () => {
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

  useEffect(() => {
    getAllReconsileCorp();
    getNewCorpDocId();
    getAllBankName();
  }, []);

  const [formData, setFormData] = useState({
    docId: '',
    docDate: dayjs(),
    bankStmtDate: null,
    bankAccount: '',
    remarks: ''
  });

  const [formDataErrors, setFormDataErrors] = useState({
    docId: '',
    docDate: null,
    bankStmtDate: null,
    bankAccount: '',
    remarks: ''
  });

  // Handle tab changes
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  // Placeholder action handlers
  const handleSearch = () => {
    console.log('Search action');
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

  const getAllReconsileCorp = async () => {
    try {
      const result = await apiCalls('get', `/transaction/getAllReconcileCorpBankByOrgId?orgId=${orgId}`);
      setData(result.paramObjectsMap.reconcileCorpBankVO || []);
      showForm(true);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getNewCorpDocId = async () => {
    try {
      const response = await apiCalls(
        'get',
        `/transaction/getReconcileCorpBankDocId?branchCode=${loginBranchCode}&branch=${branch}&finYear=${finYear}&orgId=${orgId}`
      );
      setFormData((prevData) => ({
        ...prevData,
        docId: response.paramObjectsMap.reconcileCorpBankDocId,
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
          voucherNo: !table[table.length - 1].voucherNo ? 'voucherNo is required' : '',
          voucherDate: !table[table.length - 1].voucherDate ? 'voucherDate is required' : '',
          chequeNo: !table[table.length - 1].chequeNo ? 'chequeNo is required' : '',
          chequeDate: !table[table.length - 1].chequeDate ? 'chequeDate is required' : '',
          clearedDate: !table[table.length - 1].clearedDate ? 'clearedDate is required' : '',
          withdrawal: !table[table.length - 1].withdrawal ? 'withdrawal is required' : '',
          bankRef: !table[table.length - 1].bankRef ? 'bankRef is required' : '',
          deposit: !table[table.length - 1].deposit ? 'deposit is required' : ''
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
      remarks: ''
    });

    getNewCorpDocId();

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
    { label: 'chq/DD No', field: 'chequeNo', inputType: 'text' },
    { label: 'chq/DD Date', field: 'chequeDate', inputType: 'date' },
    { label: 'Cleared Date', field: 'clearedDate', inputType: 'date' },
    { label: 'withdrawal', field: 'withdrawal', inputType: 'text' },
    { label: 'bankRef', field: 'bankRef', inputType: 'text' },
    { label: 'Narration', field: 'narration', inputType: 'text' }
  ];

  // const [withdrawalsTableData, setWithdrawalsTableData] = useState([]);
  // const [withdrawalsTableErrors, setWithdrawalsTableErrors] = useState([]);

  // Example of handling change dynamically
  const handleChange = (e, rowId, field, index) => {
    const value = e.target.value;
    setWithdrawalsTableData((prev) => prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));

    // Validation logic here
    const numericRegex = /^[0-9]*$/;
    if (field === 'voucherNo' && !numericRegex.test(value)) {
      setWithdrawalsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], [field]: 'Only numeric characters are allowed' };
        return newErrors;
      });
    } else {
      setWithdrawalsTableErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = { ...newErrors[index], [field]: '' };
        return newErrors;
      });
    }
  };

  // Delete row handler
  const handleDeleteRow = (rowId) => {
    setWithdrawalsTableData((prev) => prev.filter((row) => row.id !== rowId));
  };

  const columns = [
    { accessorKey: 'docId', header: 'Doc No', size: 140 },
    { accessorKey: 'docDate', header: 'Doc Date', size: 140 },
    { accessorKey: 'bankStmtDate', header: 'Bank Stmt Date', size: 140 },
    { accessorKey: 'bankAccount', header: 'bankAccount', size: 140 }
  ];

  const handleList = () => {
    setShowForm(!showForm);
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
        chequeDate: row.chequeDate,
        deposit: parseInt(row.deposit),
        withdrawal: parseInt(row.withdrawal),
        bankRef: row.bankRef
        // active: row.active === 'true' || row.active === true // Convert string 'true' to boolean true if necessary
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        // active: formData.active,
        docId: formData.docId,
        docDate: formData.docDate ? dayjs(formData.docDate).format('YYYY-MM-DD') : null,
        bankStmtDate: formData.bankStmtDate ? dayjs(formData.bankStmtDate).format('YYYY-MM-DD') : null,
        bankAccount: formData.bankAccount,
        remarks: formData.remarks,
        particularsReconcileCorpBankDTO: detailsVo,
        createdBy: loginUserName,
        orgId: orgId,
        branch: branch,
        branchCode: loginBranchCode,
        finYear: finYear
      };

      console.log('DATA TO SAVE IS:', saveFormData);

      try {
        const response = await apiCalls('put', '/transaction/updateCreateReconcileCorpBank', saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          showToast('success', editId ? 'Reconcile Corp updated successfully' : 'Reconcile Corp created successfully');
          getAllReconsileCorp();
          handleClear();
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Corp creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Corp creation failed');
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
      const result = await apiCalls('get', `/transaction/getAllReconcileCorpBankById?id=${row.original.id}`);

      if (result) {
        const listValueVO = result.paramObjectsMap.reconcileCorpBankVO[0];
        setEditId(row.original.id);

        setFormData({
          docId: listValueVO.docId,
          docDate: listValueVO.docDate ? dayjs(listValueVO.docDate) : null, // handle invalid or null dates
          bankStmtDate: listValueVO.bankStmtDate ? dayjs(listValueVO.bankStmtDate) : null, // handle invalid or null dates
          bankAccount: listValueVO.bankAccount,
          remarks: listValueVO.remarks
        });
        setWithdrawalsTableData(
          listValueVO.particularsReconcileCorpBankVO.map((cl) => ({
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

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px' }}>
      <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start p-2">
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleList} />
            <ActionButton title="Save" icon={SaveIcon} onClick={handleSave} />
          </div>
        </div>
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
                  placeholder="Auto"
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
                    value={formData.docDate || null}
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
                    value={formData.bankStmtDate || null}
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
            </div>
            <>
              <div className="row mt-2">
                  <Box sx={{ width: '100%' }}>
                    <Tabs
                      value={value}
                      onChange={handleChangeTab}
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
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>Voucher No</th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '230px' }}>Voucher Date</th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>Chq/DD No</th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '230px' }}>Chq/DD Date</th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>Deposit</th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>Withdrawal</th>
                                    <th className="px-2 py-2 text-white text-center" style={{ width: '150px' }}>Bank Ref</th>
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
                                            // onChange={(e) => {
                                            //   const value = e.target.value;
                                            //   const numericRegex = /^[0-9]*$/;
                                            //   if (numericRegex.test(value)) {
                                            //     setWithdrawalsTableData((prev) => {
                                            //       const updatedData = prev.map((r) => (r.id === row.id ? { ...r, deposit: value } : r));
                                            //       calculateTotals(updatedData); // Recalculate totals
                                            //       return updatedData;
                                            //     });

                                            //     setWithdrawalsTableErrors((prev) => {
                                            //       const newErrors = [...prev];
                                            //       newErrors[index] = {
                                            //         ...newErrors[index],
                                            //         deposit: !value ? 'Deposit is required' : ''
                                            //       };
                                            //       return newErrors;
                                            //     });
                                            //   } else {
                                            //     setWithdrawalsTableErrors((prev) => {
                                            //       const newErrors = [...prev];
                                            //       newErrors[index] = {
                                            //         ...newErrors[index],
                                            //         deposit: 'Only numeric characters are allowed'
                                            //       };
                                            //       return newErrors;
                                            //     });
                                            //   }
                                            // }}
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
                                            // onChange={(e) => {
                                            //   const value = e.target.value;
                                            //   const numericRegex = /^[0-9]*$/;
                                            //   if (numericRegex.test(value)) {
                                            //     setWithdrawalsTableData((prev) => {
                                            //       const updatedData = prev.map((r) => (r.id === row.id ? { ...r, withdrawal: value } : r));
                                            //       calculateTotals(updatedData); // Recalculate totals
                                            //       return updatedData;
                                            //     });

                                            //     setWithdrawalsTableErrors((prev) => {
                                            //       const newErrors = [...prev];
                                            //       newErrors[index] = {
                                            //         ...newErrors[index],
                                            //         withdrawal: !value ? 'Withdrawal is required' : ''
                                            //       };
                                            //       return newErrors;
                                            //     });
                                            //   } else {
                                            //     setWithdrawalsTableErrors((prev) => {
                                            //       const newErrors = [...prev];
                                            //       newErrors[index] = {
                                            //         ...newErrors[index],
                                            //         withdrawal: 'Only numeric characters are allowed'
                                            //       };
                                            //       return newErrors;
                                            //     });
                                            //   }
                                            // }}
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


                                        {/* <td className="border px-2 py-2">
                                          <input
                                            type="text"
                                            value={row.bankRef}
                                            
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const regex = /^[a-zA-Z0-9\s-]*$/;
                                              if (numericRegex.test(value)) {
                                                setWithdrawalsTableData((prev) => {
                                                  const updatedData = prev.map((r) => (r.id === row.id ? { ...r, bankRef: value } : r));
                                                  return updatedData;
                                                });
                                              // setWithdrawalsTableData((prev) =>
                                              //   prev.map((r) => (r.id === row.id ? { ...r, bankRef: value } : r))
                                              // );
                                              setWithdrawalsTableErrors((prev) => {
                                                const newErrors = [...prev];
                                                newErrors[index] = { ...newErrors[index], bankRef: !value ? 'Bank Ref is required' : '' };
                                                return newErrors;
                                              });
                                            }}
                                            className={withdrawalsTableErrors[index]?.bankRef ? 'error form-control' : 'form-control'}
                                            // onKeyDown={(e) => handleKeyDown(e, row, withdrawalsTableData)}
                                          />
                                          {withdrawalsTableErrors[index]?.bankRef && (
                                            <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                              {withdrawalsTableErrors[index].bankRef}
                                            </div>
                                          )}
                                        </td> */}
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
      <ToastContainer />
    </>
  );
};

export default ReconcileCorp;

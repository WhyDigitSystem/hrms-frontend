import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import apiCalls from 'apicall';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import 'react-toastify/dist/ReactToastify.css';
import ActionButton from 'utils/ActionButton';
import ToastComponent, { showToast } from 'utils/toast-component';
import CommonListViewTable from 'views/basicMaster/CommonListViewTable';
import CommonBulkUpload from 'utils/CommonBulkUpload';
import COASample from '../../assets/sample-files/COASample.xlsx';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaFilePdf } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import emailjs from '@emailjs/browser';
import { Select, MenuItem, InputLabel, FormControl, FormHelperText, Checkbox, ListItemText } from '@mui/material';

export const CompoOff = () => {
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [empCode, setEmpCode] = useState(localStorage.getItem('employeeCode'));
  const [empName, setEmpName] = useState(localStorage.getItem('employeeName'));
  const [department, setDepartment] = useState(localStorage.getItem('department'));
  const [designation, setDesignation] = useState(localStorage.getItem('designation'));
  const [branch, setBranch] = useState(localStorage.getItem('branch'));
  const [branchCode, setBranchCode] = useState(localStorage.getItem('branchCode'));
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifyList, setNotifyList] = useState([]);
  const [notifyEmail, setNotifyEmail] = useState([]);
  const [allReportingPersonList, setAllReportingPersonList] = useState([]);
  const [allCompoOff, setAllCompoOff] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const lastRowRef = useRef(null);

  const [formData, setFormData] = useState({
    countryCode: '',
    countryName: ''
  });
  const [editId, setEditId] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    countryName: '',
    countryCode: ''
  });

  const [leaveTypeTable, setLeaveTypeTable] = useState([
    {
      id: 1,
      leaveType: 'Compo Off',
      leaveCode: '',
      compoOff: null,
      description: '',
      notify: '',
      notifyEmail: '',
      notify2Email: '',
      allReportingPerson: []
    }
  ]);
  const [leaveTypeErrors, setLeaveTypeErrors] = useState([
    {
      leaveType: '',
      leaveCode: '',
      compoOff: null,
      description: '',
      notify: '',
      allReportingPerson: ''
    }
  ]);
  const [listView, setListView] = useState(false);

  const [listViewData, setListViewData] = useState([]);
  useEffect(() => {
    getAllNotify();
    getAllCompoOff();
    getAllReportingPersonList();
  }, []);
  const getAllNotify = async () => {
    try {
      const result = await apiCalls('get', `employeemaster/getReportingPerson?employeeCode=${empCode}&orgId=${orgId}`);
      const notifyOptions = result?.paramObjectsMap?.PermisionRequestVO || [];
      setNotifyList(notifyOptions);
      setNotifyEmail(notifyOptions.notifyEmail)
      console.log('Email', notifyOptions.notifyEmail)
      console.log('Notifyy Options:', notifyOptions);
    } catch (err) {
      console.log('Error fetching notify list', err);
    }
  };
  const getAllReportingPersonList = async () => {
    try {
      const result = await apiCalls(
        'get',
        `master/getReportingNameForEmployee?branchCode=${branchCode}&employeeCode="Undefined"&orgId=${orgId}`
      );
      const notifyOptions = result?.paramObjectsMap?.employeeVO || [];
      setAllReportingPersonList(notifyOptions);
      console.log('Notifyyy Options:', notifyOptions);
    } catch (err) {
      console.log('Error fetching notify list', err);
    }
  };

  const getAllCompoOff = async () => {
    try {
      const result = await apiCalls('get', `leaveprocess/getCompensatoryOffByOrgId?empCode=${empCode}&orgId=${orgId}`);
      const compoOffData = result?.paramObjectsMap?.compensatoryOffVO || [];

      // Convert to table structure
      const formattedData = compoOffData.map((item) => ({
        id: item.id,
        leaveType: item.leaveType,
        leaveCode: item.leaveCode,
        compoOff: item.compOffDate, // this will be used as input type="date"
        description: item.notes,
        notify: item.notify,
        allReportingPerson: item.compoffNotifyVO?.map((person) => person.notify2) || []
      }));

      setLeaveTypeTable(formattedData);
      setAllCompoOff(compoOffData); // if needed elsewhere
      console.log('Notify Options:', compoOffData);
    } catch (err) {
      console.log('Error fetching notify list', err);
    }
  };

  const getCountryById = async (row) => {
    console.log('THE SELECTED COUNTRY ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `commonmaster/country/${row.original.id}`);

      if (response.status === true) {
        const particularCountry = response.paramObjectsMap.Country;
        setFormData({
          countryCode: particularCountry.countryCode,
          countryName: particularCountry.countryName
        });
        setListView(false);
      } else {
        console.error('API Error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClear = () => {
    getAllCompoOff();
    const initialRow = {
      id: Date.now(), // or use a uuid
      leaveType: 'Compo Off',
      leaveCode: '',
      compoOff: '',
      description: '',
      notify: '',
      allReportingPerson: ''
    };

    setLeaveTypeTable([initialRow]);
    setLeaveTypeErrors([
      {
        leaveType: '',
        leaveCode: '',
        compoOff: '',
        description: '',
        notify: '',
        allReportingPerson: ''
      }
    ]);
  };

  // const handleSave = async () => {
  //   const errors = {};
  //   let tableErrors = [];
  //   let hasTableError = false;

  //   // Validate leaveTypeTable fields
  //   leaveTypeTable.forEach((row, index) => {
  //     const rowErrors = {};

  //     if (!row.leaveType) {
  //       rowErrors.leaveType = 'Leave Type is required';
  //       hasTableError = true;
  //     }
  //     if (!row.leaveCode) {
  //       rowErrors.leaveCode = 'Leave Code is required';
  //       hasTableError = true;
  //     }
  //     if (!row.compoOff) {
  //       rowErrors.compoOff = 'Compo Off is required';
  //       hasTableError = true;
  //     }
  //     if (!row.description) {
  //       rowErrors.description = 'Description is required';
  //       hasTableError = true;
  //     }
  //     if (!row.notify) {
  //       rowErrors.notify = 'Notify is required';
  //       hasTableError = true;
  //     }

  //     tableErrors[index] = rowErrors;
  //   });

  //   // Set errors if any
  //   if (Object.keys(errors).length > 0 || hasTableError) {
  //     setFieldErrors(errors);
  //     setLeaveTypeErrors(tableErrors);
  //     return;
  //   }

  //   // Construct final payload
  //   const finalPayload = leaveTypeTable.map((row) => {
  //     const notifyPerson = notifyList.find((n) => n.reportingPerson === row.notify);

  //     return {
  //       branch: branch,
  //       branchCode: branchCode,
  //       compOffDate: row.compoOff,
  //       createdBy: loginUserName,
  //       department: department,
  //       designation: designation,
  //       employeeCode: empCode,
  //       employeeName: empName,
  //       leaveCode: row.leaveCode,
  //       leaveType: row.leaveType,
  //       notes: row.description,
  //       notify: row.notify,
  //       notifyCode: notifyPerson?.reportingPersonCode || '',
  //       notifyEmail: notifyPerson?.email || '',
  //       orgId: orgId,
  //       totalDays: 1
  //     };
  //   });

  //   setIsLoading(true);

  //   try {
  //     const result = await apiCalls('put', 'leaveprocess/createUpdateCompOff', finalPayload);

  //     if (result.status === true) {
  //       showToast('success', editId ? 'Compo Off Updated Successfully' : 'Compo Off created successfully');
  //       handleClear();
  //     } else {
  //       showToast('error', result.paramObjectsMap?.errorMessage || 'Compo Off creation failed');
  //     }
  //   } catch (err) {
  //     console.log('error', err);
  //     showToast('error', 'Compo Off creation failed');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSave = async () => {
    const errors = {};
    let tableErrors = [];
    let hasTableError = false;

    // Filter only newly added rows
    const newRows = leaveTypeTable.filter((row) => row.isNew);

    if (newRows.length === 0) {
      showToast('info', 'No new data to save');
      return;
    }

    // Validate only new rows
    newRows.forEach((row, index) => {
      const rowErrors = {};

      if (!row.leaveType) {
        rowErrors.leaveType = 'Leave Type is required';
        hasTableError = true;
      }
      if (!row.leaveCode) {
        rowErrors.leaveCode = 'Leave Code is required';
        hasTableError = true;
      }
      if (!row.compoOff) {
        rowErrors.compoOff = 'Compo Off is required';
        hasTableError = true;
      }
      if (!row.description) {
        rowErrors.description = 'Description is required';
        hasTableError = true;
      }
      if (!row.notify) {
        rowErrors.notify = 'Notify is required';
        hasTableError = true;
      }

      tableErrors.push(rowErrors);
    });

    if (Object.keys(errors).length > 0 || hasTableError) {
      setFieldErrors(errors);
      setLeaveTypeErrors(tableErrors);
      return;
    }

    // Construct final payload only from new rows
    const finalPayload = newRows.map((row) => {
      const notifyPerson = notifyList.find((n) => n.reportingPerson === row.notify);
      const selectedNotifyPersons = allReportingPersonList.filter((person) => (row.allReportingPerson || []).includes(person.employeeCode));
      return {
        branch,
        branchCode,
        compOffDate: row.compoOff,
        compoffNotifyDTO: selectedNotifyPersons.map((person) => ({
          notify2: person.employeeName,
          notify2Code: person.employeeCode,
          notify2Email: person.email
        })),
        createdBy: loginUserName,
        department,
        designation,
        employeeCode: empCode,
        employeeName: empName,
        leaveCode: row.leaveCode,
        leaveType: row.leaveType,
        notes: row.description,
        notify: row.notify,
        notifyCode: notifyPerson?.reportingPersonCode || '',
        notifyEmail: notifyPerson?.email || '',
        orgId,
        totalDays: 1
      };
    });

    setIsLoading(true);

    try {
      const result = await apiCalls('put', 'leaveprocess/createUpdateCompOff', finalPayload);

      if (result.status === true) {
        showToast('success', editId ? 'Compo Off Updated Successfully' : 'Compo Off created successfully');
        await sendEmailNotification(finalPayload); // ✅ correct payload with notify2Email
        const updatedTable = leaveTypeTable.map((row) => (row.isNew ? { ...row, isNew: false } : row));
        setLeaveTypeTable(updatedTable);
        getAllCompoOff();
        // handleClear();
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Compo Off creation failed');
      }
    } catch (err) {
      console.log('error', err);
      showToast('error', 'Compo Off creation failed');
    } finally {
      setIsLoading(false);
    }
  };
  console.log('Mail', leaveTypeTable)

  const sendEmailNotification = async (newRows) => {
    try {
      for (const row of newRows) {
        const notify2Emails = (row.compoffNotifyDTO || []).map(p => p.notify2Email).join(', ');

        const emailParams = {
          name: row.notify,
          from_name: empName,
          compOffDate: row.compOffDate,
          email: row.notifyEmail,
          notify2Email: notify2Emails,
          notes: row.notes,
          approve_link: `/team/LeaveApproval/${row.id || 'leave_request_id'}`
        };

        console.log('Email Params:', emailParams);

        if (!emailParams.email) {
          console.error('Error: Recipient email is missing!');
          showToast('error', 'Recipient email is missing!');
          continue;
        }

        await emailjs.send('service_y4jqb7q', 'template_j3mr5vl', emailParams, '4wxbCMaMoQh0TD6tx');
        console.log('Email Sent Successfully for', emailParams.email);
      }
    } catch (error) {
      console.error('Email Sending Failed:', error);
      showToast('error', 'Failed to send email notification. Please try again.');
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleBulkUploadClose = () => {
    setUploadOpen(false); // Close dialog
  };

  // const handleAddRow = () => {
  //   if (isLastRowEmpty(leaveTypeTable)) {
  //     displayRowError(leaveTypeTable);
  //     return;
  //   }
  //   const newRow = {
  //     id: Date.now(),
  //     leaveType: 'Compo Off',
  //     leaveCode: '',
  //     compoOff: '',
  //     description: '',
  //     notify: ''
  //   };
  //   setLeaveTypeTable([...leaveTypeTable, newRow]);
  //   setLeaveTypeErrors([...leaveTypeErrors, { leaveCode: '', compoOff: '', description: '', notify: '' }]);
  // };

  // const handleAddRow = () => {
  //   const lastIndex = leaveTypeTable.length - 1;
  //   const lastRow = leaveTypeTable[lastIndex];

  //   const errors = {
  //     leaveType: !lastRow.leaveType ? 'Leave Type is required' : '',
  //     leaveCode: !lastRow.leaveCode ? 'Leave Code is required' : '',
  //     compoOff: !lastRow.compoOff ? 'Compo Off is required' : '',
  //     description: !lastRow.description ? 'Description is required' : '',
  //     notify: !lastRow.notify ? 'Notify is required' : '',
  //   };

  //   const hasErrors = Object.values(errors).some((msg) => msg);

  //   if (hasErrors) {
  //     // Update error state for last row
  //     setLeaveTypeErrors((prev) => {
  //       const updated = [...prev];
  //       updated[lastIndex] = errors;
  //       return updated;
  //     });

  //     // Optional alert message
  //     alert('Please fill all fields in the previous row before adding a new one.');
  //     return;
  //   }

  //   // Clear previous errors
  //   setLeaveTypeErrors((prev) => [...prev, {}]);

  //   // Add new row
  //   const newRow = {
  //     id: Date.now(),
  //     leaveType: 'Compo Off',
  //     leaveCode: '',
  //     compoOff: '',
  //     description: '',
  //     notify: '',
  //     allReportingPerson: '',
  //     isNew: true,
  //   };

  //   setLeaveTypeTable((prev) => [...prev, newRow]);

  //   // Scroll to new row
  //   requestAnimationFrame(() => {
  //     if (lastRowRef.current) {
  //       lastRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  //     }
  //   });
  // };

  const handleAddRow = () => {
    const lastIndex = leaveTypeTable.length - 1;

    // If table is empty, directly add a new row
    if (lastIndex < 0) {
      setLeaveTypeErrors([{}]);
      setLeaveTypeTable([
        {
          id: Date.now(),
          leaveType: 'Compo Off',
          leaveCode: '',
          compoOff: '',
          description: '',
          notify: '',
          allReportingPerson: '',
          isNew: true
        }
      ]);
      return;
    }

    const lastRow = leaveTypeTable[lastIndex];

    const errors = {
      leaveType: !lastRow.leaveType ? 'Leave Type is required' : '',
      leaveCode: !lastRow.leaveCode ? 'Leave Code is required' : '',
      compoOff: !lastRow.compoOff ? 'Compo Off is required' : '',
      description: !lastRow.description ? 'Description is required' : '',
      notify: !lastRow.notify ? 'Notify is required' : ''
    };

    const hasErrors = Object.values(errors).some((msg) => msg);

    if (hasErrors) {
      setLeaveTypeErrors((prev) => {
        const updated = [...prev];
        updated[lastIndex] = errors;
        return updated;
      });

      alert('Please fill all fields in the previous row before adding a new one.');
      return;
    }

    setLeaveTypeErrors((prev) => [...prev, {}]);

    const newRow = {
      id: Date.now(),
      leaveType: 'Compo Off',
      leaveCode: '',
      compoOff: '',
      description: '',
      notify: '',
      allReportingPerson: '',
      isNew: true
    };

    setLeaveTypeTable((prev) => [...prev, newRow]);

    requestAnimationFrame(() => {
      if (lastRowRef.current) {
        lastRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  };

  const isLastRowEmpty = (table) => {
    if (!table || table.length === 0) return false;

    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === leaveTypeTable) {
      return !lastRow.leaveCode || !lastRow.compoOff || !lastRow.description || !lastRow.notify;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === leaveTypeTable) {
      setLeaveTypeErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          leaveType: !table[table.length - 1].leaveType ? 'Leave Type is required' : '',
          leaveCode: !table[table.length - 1].leaveCode ? 'Leave Code is required' : '',
          compoOff: !table[table.length - 1].compoOff ? 'Compo Off Date is required' : '',
          description: !table[table.length - 1].description ? 'Description is required' : '',
          notify: !table[table.length - 1].notify ? 'Notify is required' : ''
        };
        return newErrors;
      });
    }
  };

  const handleDeleteRow = (id, table, setTable, errorTable, setErrorTable) => {
    const rowIndex = table.findIndex((row) => row.id === id);
    if (rowIndex !== -1) {
      const updatedData = table.filter((row) => row.id !== id);
      const updatedErrors = errorTable.filter((_, index) => index !== rowIndex);
      setTable(updatedData);
      setErrorTable(updatedErrors);
    }
  };

  return (
    <>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            {/* <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} /> */}
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton
              title="Save"
              icon={SaveIcon}
              isLoading={isLoading}
              onClick={() => handleSave()}
              margin="0 10px 0 10px"
            /> &nbsp;{' '}
          </div>
        </div>
        <>
          <div className="row d-flex ml">
            <div className="mb-1">
              <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
            </div>
            <div className="row mt-2">
              <div className="col-lg-12">
                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table table-bordered ">
                    {/* <thead>
                      <tr style={{ background: 'linear-gradient(193deg, #009d90 30%, #7bb9b4 90%)', color: 'white' }}> */}
                    <thead
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        background: 'linear-gradient(193deg, #009d90 30%, #7bb9b4 90%)',
                        color: 'white'
                      }}
                    >
                      <tr>
                        {/* <th className="px-2 py-2 text-center" style={{ width: '68px' }}>
                          Action
                        </th> */}
                        <th className="px-2 py-2 text-center" style={{ width: '50px' }}>
                          S.No
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '150px' }}>
                          Leave Type
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '150px' }}>
                          Leave Code
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '200px' }}>
                          Compensatory Off Date
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '200px' }}>
                          Description
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '200px' }}>
                          Reporting Person
                        </th>
                        <th className="px-2 py-2 text-center" style={{ width: '200px' }}>
                          Notify
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {Array.isArray(leaveTypeTable) &&
                        leaveTypeTable.map((row, index) => (
                          <tr key={row.id} ref={index === leaveTypeTable.length - 1 ? lastRowRef : null}>
                            {/* <td className="border px-2 py-2 text-center">
                              <ActionButton
                                title="Delete"
                                icon={DeleteIcon}
                                onClick={() =>
                                  handleDeleteRow(row.id, leaveTypeTable, setLeaveTypeTable, leaveTypeErrors, setLeaveTypeErrors)
                                }
                                />
                            </td> */}
                            <td className="text-center">
                              <div className="pt-2">{index + 1}</div>
                            </td>
                            <td className="border px-2 py-2">
                              <input
                                type="text"
                                value={row.leaveType}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setLeaveTypeTable((prev) => prev.map((r) => (r.id === row.id ? { ...r, leaveType: value } : r)));
                                  setLeaveTypeErrors((prev) => {
                                    const newErrors = [...prev];
                                    newErrors[index] = {
                                      ...newErrors[index],
                                      leaveType: !value ? 'Leave Type is required' : ''
                                    };
                                    return newErrors;
                                  });
                                }}
                                className={leaveTypeErrors[index]?.leaveType ? 'error form-control' : 'form-control'}
                                disabled
                              />
                              {leaveTypeErrors[index]?.leaveType && (
                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                  {leaveTypeErrors[index].leaveType}
                                </div>
                              )}
                            </td>
                            <td className="border px-2 py-2">
                              <input
                                type="text"
                                value={row.leaveCode}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setLeaveTypeTable((prev) => prev.map((r) => (r.id === row.id ? { ...r, leaveCode: value } : r)));
                                  setLeaveTypeErrors((prev) => {
                                    const newErrors = [...prev];
                                    newErrors[index] = {
                                      ...newErrors[index],
                                      leaveCode: !value ? 'Leave Code is required' : ''
                                    };
                                    return newErrors;
                                  });
                                }}
                                className={leaveTypeErrors[index]?.leaveCode ? 'error form-control' : 'form-control'}
                                disabled={!row.isNew}
                              />
                              {leaveTypeErrors[index]?.leaveCode && (
                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                  {leaveTypeErrors[index].leaveCode}
                                </div>
                              )}
                            </td>
                            <td className="border px-2 py-2">
                              <input
                                type="date"
                                value={row.compoOff}
                                className={leaveTypeErrors[index]?.compoOff ? 'error form-control' : 'form-control'}
                                disabled={!row.isNew}
                                onChange={(e) => {
                                  const date = e.target.value;

                                  setLeaveTypeTable((prev) => prev.map((r) => (r.id === row.id ? { ...r, compoOff: date } : r)));

                                  setLeaveTypeErrors((prev) => {
                                    const newErrors = [...prev];
                                    newErrors[index] = {
                                      ...newErrors[index],
                                      compoOff: !date ? 'Compo Off is required' : ''
                                    };
                                    return newErrors;
                                  });
                                }}
                              />
                              {leaveTypeErrors[index]?.compoOff && (
                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                  {leaveTypeErrors[index].compoOff}
                                </div>
                              )}
                            </td>
                            <td className="border px-2 py-2">
                              <input
                                type="text"
                                value={row.description}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setLeaveTypeTable((prev) => prev.map((r) => (r.id === row.id ? { ...r, description: value } : r)));
                                  setLeaveTypeErrors((prev) => {
                                    const newErrors = [...prev];
                                    newErrors[index] = {
                                      ...newErrors[index],
                                      description: !value ? 'Description is required' : ''
                                    };
                                    return newErrors;
                                  });
                                }}
                                className={leaveTypeErrors[index]?.description ? 'error form-control' : 'form-control'}
                                disabled={!row.isNew}
                              />
                              {leaveTypeErrors[index]?.description && (
                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                  {leaveTypeErrors[index].description}
                                </div>
                              )}
                            </td>
                            <td className="border px-2 py-2">
                              <select
                                value={row.notify}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const selectedPerson = notifyList.find((p) => p.reportingPerson === value);

                                  setLeaveTypeTable((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? {
                                          ...r,
                                          notify: value,
                                          notifyEmail: selectedPerson?.email || '',
                                          // notify2Email: selectedPerson?.reportingPerson2Email || ''
                                        }
                                        : r
                                    )
                                  );

                                  setLeaveTypeErrors((prev) => {
                                    const newErrors = [...prev];
                                    newErrors[index] = {
                                      ...newErrors[index],
                                      notify: !value ? 'Notify is required' : ''
                                    };
                                    return newErrors;
                                  });
                                }}
                                className={leaveTypeErrors[index]?.notify ? 'error form-control' : 'form-control'}
                                disabled={!row.isNew}
                              >
                                <option value="">Select Option</option>
                                {notifyList.map((person) => (
                                  <option key={person.reportingPersonCode} value={person.reportingPerson}>
                                    {person.reportingPerson}
                                  </option>
                                ))}
                              </select>
                              {leaveTypeErrors[index]?.notify && (
                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                  {leaveTypeErrors[index].notify}
                                </div>
                              )}
                            </td>

                            {/* <td className="border px-2 py-2">
                              <select
                                value={row.allReportingPerson}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setLeaveTypeTable((prev) => prev.map((r) => (r.id === row.id ? { ...r, allReportingPerson: value } : r)));
                                  setLeaveTypeErrors((prev) => {
                                    const newErrors = [...prev];
                                    newErrors[index] = {
                                      ...newErrors[index],
                                      allReportingPerson: !value ? 'All ReportingPerson is required' : ''
                                    };
                                    return newErrors;
                                  });
                                }}
                                className={leaveTypeErrors[index]?.allReportingPerson ? 'error form-control' : 'form-control'}
                                disabled={!row.isNew}
                              >
                                <option value="">Select Option</option>
                                {allReportingPersonList.map((person) => (
                                  <option key={person.employeeCode} value={person.employeeName}>
                                    {person.employeeName}
                                  </option>
                                ))}
                              </select>
                              {leaveTypeErrors[index]?.allReportingPerson && (
                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                  {leaveTypeErrors[index].allReportingPerson}
                                </div>
                              )}
                            </td> */}
                            {/* <td className="border px-2 py-2">
                              <select
                                value={row.allReportingPerson || []}
                                onChange={(e) => {
                                  const selectedCodes = Array.from(e.target.selectedOptions, (option) => option.value);
                                  setLeaveTypeTable((prev) =>
                                    prev.map((r) => (r.id === row.id ? { ...r, allReportingPerson: selectedCodes } : r))
                                  );
                                }}
                                className="form-control"
                              >
                                <option disabled value="">
                                  -- Select Option --
                                </option>
                                {allReportingPersonList.map((person) => (
                                  <option key={person.employeeCode} value={person.employeeCode}>
                                    {person.employeeName}
                                  </option>
                                ))}
                              </select>

                              {leaveTypeErrors[index]?.allReportingPerson && (
                                <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                  {leaveTypeErrors[index].allReportingPerson}
                                </div>
                              )}
                            </td> */}
                            <td className="border px-2 py-2">
                              <FormControl fullWidth error={Boolean(leaveTypeErrors[index]?.allReportingPerson)}>
                                {/* <InputLabel id={`multi-select-label-${row.id}`}>All Reporting Person</InputLabel> */}

                                <Select
                                  labelId={`multi-select-label-${row.id}`}
                                  multiple
                                  displayEmpty
                                  value={row.allReportingPerson?.length ? row.allReportingPerson : []}
                                  onChange={(e) => {
                                    const selectedValues = e.target.value;
                                    setLeaveTypeTable((prev) =>
                                      prev.map((r) => (r.id === row.id ? { ...r, allReportingPerson: selectedValues } : r))
                                    );
                                  }}
                                  renderValue={(selected) =>
                                    selected.length === 0 ? (
                                      <em>Select Reporting Person</em>
                                    ) : (
                                      selected
                                        .map((code) => allReportingPersonList.find((p) => p.employeeCode === code)?.employeeName || code)
                                        .join(', ')
                                    )
                                  }
                                  size="small"
                                  disabled={!row.isNew}
                                >
                                  <MenuItem disabled value="">
                                    <em>Select Reporting Person</em>
                                  </MenuItem>

                                  {allReportingPersonList.map((person) => (
                                    <MenuItem key={person.employeeCode} value={person.employeeCode}>
                                      <Checkbox checked={row.allReportingPerson?.includes(person.employeeCode)} />
                                      <ListItemText primary={person.employeeName} />
                                    </MenuItem>
                                  ))}
                                </Select>

                                {leaveTypeErrors[index]?.allReportingPerson && (
                                  <FormHelperText>{leaveTypeErrors[index].allReportingPerson}</FormHelperText>
                                )}
                              </FormControl>
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
      </div>
      <div>
        <ToastComponent />
      </div>
    </>
  );
};
export default CompoOff;

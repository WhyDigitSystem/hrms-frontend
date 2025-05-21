import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import { element } from 'prop-types';
// import Roles from 'views/basicMaster/roles';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const Calendar = Loadable(lazy(() => import('views/Calendar/Calendar')));

// company Setup
const CreateCompany = Loadable(lazy(() => import('views/companySetup/CreateCompany')));
const CompanySetup = Loadable(lazy(() => import('views/companySetup/CompanySetup')));

// basic Master
const FinYear = Loadable(lazy(() => import('views/basicMaster/finYear')));
const Country = Loadable(lazy(() => import('views/basicMaster/country')));
const State = Loadable(lazy(() => import('views/basicMaster/state')));
const City = Loadable(lazy(() => import('views/basicMaster/city')));
const Currency = Loadable(lazy(() => import('views/basicMaster/currency')));
const Department = Loadable(lazy(() => import('views/basicMaster/department')));
const Designation = Loadable(lazy(() => import('views/basicMaster/designation')));
const Region = Loadable(lazy(() => import('views/basicMaster/RegionMaster')));
const Roles = Loadable(lazy(() => import('views/basicMaster/roles')));
const ScreenNames = Loadable(lazy(() => import('views/basicMaster/ScreenNames')));
const LeaveAssigned = Loadable(lazy(() => import('views/basicMaster/leaveAssigned')));
const ProjectMaster = Loadable(lazy(() => import('views/basicMaster/ProjectMaster')));

// Employee Master
const EmployeeDetails = Loadable(lazy(() => import('views/employeeMaster/EmployeeDetails')));
const EmployeeCodeGeneration = Loadable(lazy(() => import('views/employeeMaster/EmployeeCodeGeneration')));
const AttendenceProcess = Loadable(lazy(() => import('views/employeeMaster/AttendenceProcess')));

// Leave master
const LeaveType = Loadable(lazy(() => import('views/leaveMaster/LeaveType')));
const LeaveProcess = Loadable(lazy(() => import('views/leaveMaster/LeaveProcess')));
const LeaveCreditControl = Loadable(lazy(() => import('views/leaveMaster/LeaveCreditControl')));
const Holidays = Loadable(lazy(() => import('views/leaveMaster/Holidays')));
const CompoOff = Loadable(lazy(() => import('views/me/CompoOff')));

// salary master
const SalaryHeads = Loadable(lazy(() => import('views/salaryMaster/SalaryHeads')));
const SalaryStructure = Loadable(lazy(() => import('views/salaryMaster/SalaryStructure')));
const SalaryProcess = Loadable(lazy(() => import('views/salaryMaster/SalaryProcess')));
const SalaryReport = Loadable(lazy(() => import('views/salaryMaster/SalaryReport')));

// me
const PermissionRequest = Loadable(lazy(() => import('views/me/PermissionRequest')));
const LeaveRequest = Loadable(lazy(() => import('views/me/LeaveRequest')));
const SwipeInSwipeOut = Loadable(lazy(() => import('views/me/SwipeInSwipeOut')));
const HolidayReport = Loadable(lazy(() => import('views/me/HolidayReport')));
const TimeSheet = Loadable(lazy(() => import('views/me/TimeSheet')));
const Payslip = Loadable(lazy(() => import('views/finance/Payslip')));

//team
const LeaveApproval = Loadable(lazy(() => import('views/team/LeaveApproval')));
const PermissionApproval = Loadable(lazy(() => import('views/team/PermissionApproval')));
const AttendanceReport = Loadable(lazy(() => import('views/team/AttendanceReport')));
const TodayAttendance = Loadable(lazy(() => import('views/team/TodayAttendance')));

// manageTax
const ManageTax = Loadable(lazy(() => import('views/ManageTax/manageTax')))


// ==============================|| AUTHENTICATION ROUTING ||============================== //

const HrmsRoute = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: '/calendar',
      element: <Calendar />
    },
    {
      path: '/companysetup/createcompany',
      element: <CreateCompany />
    },
    {
      path: '/companysetup/companysetup',
      element: <CompanySetup />
    },
    {
      path: '/companysetup/finYear',
      element: <FinYear />
    },
    {
      path: '/basicMaster/country',
      element: <Country />
    },
    {
      path: '/basicMaster/state',
      element: <State />
    },
    {
      path: '/basicMaster/city',
      element: <City />
    },
    {
      path: '/basicMaster/currency',
      element: <Currency />
    },
    {
      path: '/basicMaster/RegionMaster',
      element: <Region />
    },
    {
      path: '/basicMaster/Department',
      element: <Department />
    },
    {
      path: '/basicMaster/Designation',
      element: <Designation />
    },
    {
      path: '/basicMaster/ProjectMaster',
      element: <ProjectMaster />
    },
    {
      path: '/basicMaster/roles',
      element: <Roles />
    },
    {
      path: '/companysetup/ScreenNames',
      element: <ScreenNames />
    },
    {
      path: '/companysetup/LeaveAssigned',
      element: <LeaveAssigned />
    },
    {
      path: '/employeeMaster/EmployeeDetails',
      element: <EmployeeDetails />
    },
    {
      path: '/employeeMaster/EmployeeCodeGeneration',
      element: <EmployeeCodeGeneration />
    },
    {
      path: '/employeeMaster/AttendenceProcess',
      element: <AttendenceProcess />
    },
    {
      path: '/leaveMaster/LeaveType',
      element: <LeaveType />
    },
    {
      path: '/leaveMaster/LeaveProcess',
      element: <LeaveProcess />
    },
    {
      path: '/leaveMaster/LeaveCreditControl',
      element: <LeaveCreditControl />
    },
    {
      path: '/leaveMaster/Holidays',
      element: <Holidays />
    },
    {
      path: '/salaryMaster/SalaryHeads',
      element: <SalaryHeads />
    },
    {
      path: '/salaryMaster/SalaryStructure',
      element: <SalaryStructure />
    },
    {
      path: '/salaryMaster/SalaryProcess',
      element: <SalaryProcess />
    },
    {
      path: '/salaryMaster/SalaryReport',
      element: <SalaryReport />
    },
    {
      path: '/me/PermissionRequest',
      element: <PermissionRequest />
    },
    {
      path: '/me/LeaveRequest',
      element: <LeaveRequest />
    },
    {
      path: '/me/HolidayReport',
      element: <HolidayReport />
    },
    {
      path: '/me/SwipeInSwipeOut',
      element: <SwipeInSwipeOut />
    },
    {
      path: '/me/TimeSheet',
      element: <TimeSheet />
    },
    {
      path: '/me/CompoOff',
      element: <CompoOff />
    },
    {
      path: '/finance/Payslip',
      element: <Payslip />
    },
    // Team path
    {
      path: '/team/LeaveApproval',
      element: < LeaveApproval />
    },
    {
      path: '/team/PermissionApproval',
      element: < PermissionApproval />
    },
    {
      path: '/team/AttendanceReport',
      element: < AttendanceReport />
    },
    {
      path: '/team/TodayAttendance',
      element: < TodayAttendance />
    },
    // manageTax
     {
      path: '/ManageTax/manageTax',
      element: < ManageTax />
    }


  ]
};

export default HrmsRoute;
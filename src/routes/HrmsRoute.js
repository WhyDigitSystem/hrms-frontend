import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
// import Roles from 'views/basicMaster/roles';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const Calendar = Loadable(lazy(() => import('views/Calendar/Calendar')));


const CreateCompany = Loadable(lazy(() => import('views/companySetup/CreateCompany')));
const CompanySetup = Loadable(lazy(() => import('views/companySetup/CompanySetup')));
const FinYear = Loadable(lazy(() => import('views/basicMaster/finYear')));


const Country = Loadable(lazy(() => import('views/basicMaster/country')));
const State = Loadable(lazy(() => import('views/basicMaster/state')));
const City = Loadable(lazy(() => import('views/basicMaster/city')));
const Currency = Loadable(lazy(() => import('views/basicMaster/currency')));
const Department = Loadable(lazy(() => import('views/basicMaster/department')));
const Designation = Loadable(lazy(() => import('views/basicMaster/designation')));
const Region = Loadable(lazy(() => import('views/basicMaster/RegionMaster')));
const Roles = Loadable(lazy(() => import('views/basicMaster/roles')));
// const Employee = Loadable(lazy(() => import('views/basicMaster/employee')));

const EmployeeDetails = Loadable(lazy(() => import('views/employeeMaster/EmployeeDetails')));
const LeaveType = Loadable(lazy(() => import('views/employeeMaster/LeaveType')));
const Holidays = Loadable(lazy(() => import('views/employeeMaster/Holidays')));
const LeaveProcess = Loadable(lazy(() => import('views/employeeMaster/LeaveProcess')));
const LeaveCreditControl = Loadable(lazy(() => import('views/employeeMaster/LeaveCreditControl')));
const SalaryHeads = Loadable(lazy(() => import('views/employeeMaster/SalaryHeads')));
const SalaryStructure = Loadable(lazy(() => import('views/employeeMaster/SalaryStructure')));
const AttendenceProcess = Loadable(lazy(() => import('views/employeeMaster/AttendenceProcess')));

const PermissionRequest = Loadable(lazy(() => import('views/me/PermissionRequest')));
const LeaveRequest = Loadable(lazy(() => import('views/me/LeaveRequest')));
const SwipeInSwipeOut = Loadable(lazy(() => import('views/me/SwipeInSwipeOut')));
const HolidayReport = Loadable(lazy(() => import('views/me/HolidayReport')));
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
      path: '/basicMaster/finYear',
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
      path: '/basicMaster/Role',
      element: <Roles />
    },
    // {
    //   path: '/basicMaster/Employee',
    //   element: <Employee />
    // },
    {
      path: '/employeeMaster/EmployeeDetails',
      element: <EmployeeDetails />
    },
    {
      path: '/employeeMaster/LeaveType',
      element: <LeaveType />
    },
    {
      path: '/employeeMaster/Holidays',
      element: <Holidays />
    },
    {
      path: '/employeeMaster/LeaveProcess',
      element: <LeaveProcess />
    },
    {
      path: '/employeeMaster/LeaveCreditControl',
      element: <LeaveCreditControl />
    },
    {
      path: '/employeeMaster/SalaryHeads',
      element: <SalaryHeads />
    },
    {
      path: '/employeeMaster/SalaryStructure',
      element: <SalaryStructure />
    },
    {
      path: '/employeeMaster/AttendenceProcess',
      element: <AttendenceProcess />
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
    }
  ]
};

export default HrmsRoute;

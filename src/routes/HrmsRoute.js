import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';


const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const Country = Loadable(lazy(() => import('views/basicMaster/country')));
const State = Loadable(lazy(() => import('views/basicMaster/state')));
const City = Loadable(lazy(() => import('views/basicMaster/city')));
const Currency = Loadable(lazy(() => import('views/basicMaster/currency')));
const Department = Loadable(lazy(() => import('views/basicMaster/department')));
const Designation = Loadable(lazy(() => import('views/basicMaster/designation')));
const Region = Loadable(lazy(() => import('views/basicMaster/RegionMaster')));
const Employee = Loadable(lazy(() => import('views/basicMaster/employee')));

const EmployeeDetails = Loadable(lazy(() => import('views/employeeMaster/EmployeeDetails')));
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
      path: '/basicMaster/Employee',
      element: <Employee />
    },
    {
      path: '/employeeMaster/EmployeeDetails',
      element: <EmployeeDetails />
    },
  ]
};

export default HrmsRoute;

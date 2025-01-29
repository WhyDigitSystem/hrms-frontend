import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// login option 3 routing
const ContraVoucher = Loadable(lazy(() => import('views/Finance/ContraVoucher')));
const SetTaxRate = Loadable(lazy(() => import('views/Finance/SetTaxRate')));
const Taxes = Loadable(lazy(() => import('views/Finance/Taxes')));
const TcsMaster = Loadable(lazy(() => import('views/Finance/tcsMaster/TcsMaster')));
const Account = Loadable(lazy(() => import('views/Finance/account/Account')));
const ExRates = Loadable(lazy(() => import('views/Finance/ExRates')));
const SubLedgerAccount = Loadable(lazy(() => import('views/Finance/SubLedgerAcount')));
const ArBillBalance = Loadable(lazy(() => import('views/Finance/receiptAr/ArBillBalance')));
const ChequeBookMaster = Loadable(lazy(() => import('views/Finance/chequeBookMaster/ChequeBookMaster')));
const GLOpeningBalance = Loadable(lazy(() => import('views/Finance/glOpening/GlOpening')));
const Receipt = Loadable(lazy(() => import('views/Finance/receipt/Receipt')));
const Payment = Loadable(lazy(() => import('views/Finance/payment/Payment')));
const ApBillBalance = Loadable(lazy(() => import('views/Finance/paymentAp/ApBillBalance')));
const ReceiptRegister = Loadable(lazy(() => import('views/Finance/receiptRegister/ReceiptRegister')));
const TaxInvoiceDetail = Loadable(lazy(() => import('views/Finance/taxInvoice/taxInvoiceDetail')));
const CreditNoteDetail = Loadable(lazy(() => import('views/Finance/creditNote/CreditNoteDetail')));
const CostInvoice = Loadable(lazy(() => import('views/Finance/costInvoice/CostInvoice')));
const CostDebitNote = Loadable(lazy(() => import('views/Finance/costDebitNote/CostDebitNote')));
const ARAPDetail = Loadable(lazy(() => import('views/Finance/ARAP-Details')));
const ARAPAdjustment = Loadable(lazy(() => import('views/Finance/APAP-Adjustment')));


// ==============================|| AUTHENTICATION ROUTING ||============================== //

const FinanceRoute = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: '/Finance/SetTaxRate',
      element: <SetTaxRate />
    },
    {
      path: '/Finance/Taxes',
      element: <Taxes />
    },
    {
      path: '/Finance/tcsMaster/TcsMaster',
      element: <TcsMaster />
    },
    {
      path: '/Finance/account/Account',
      element: <Account />
    },
    {
      path: '/Finance/ExRates',
      element: <ExRates />
    },
    {
      path: '/Finance/SubLedgerAccount',
      element: <SubLedgerAccount />
    },
    {
      path: '/Finance/receipt/ArBillBalance',
      element: <ArBillBalance />
    },
    {
      path: '/Finance/chequeBookMaster/ChequeBookMaster',
      element: <ChequeBookMaster />
    },
    {
      path: '/Finance/glOpening/GlOpening',
      element: <GLOpeningBalance />
    },
    {
      path: '/Finance/receipt/Receipt',
      element: <Receipt />
    },
    {
      path: '/Finance/payment/Payment',
      element: <Payment />
    },
    {
      path: '/Finance/payment/ApBillBalance',
      element: <ApBillBalance />
    },
    {
      path: '/Finance/receiptRegister/ReceiptRegister',
      element: <ReceiptRegister />
    },
    {
      path: '/Finance/taxInvoice/TaxInvoiceDetail',
      element: <TaxInvoiceDetail />
    },
    {
      path: '/Finance/creditNote/CreditNoteDetail',
      element: <CreditNoteDetail />
    },
    {
      path: '/Finance/costInvoice/CostInvoice',
      element: <CostInvoice />
    },
    {
      path: '/Finance/costDebitNote/CostDebitNote',
      element: <CostDebitNote />
    },

    {
      path: 'Finance/ARAP-Details',
      element: <ARAPDetail />
    },
    {
      path: 'Finance/ARAP-Adjustment',
      element: <ARAPAdjustment />
    },
    
    {
      path: '/Finance/ContraVoucher',
      element: <ContraVoucher />
    }
  ]
};

export default FinanceRoute;

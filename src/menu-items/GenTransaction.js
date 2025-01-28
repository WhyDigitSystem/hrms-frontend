// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// Define the transaction menu without filtering
const transactionChildren = [
  {
    id: 'daily',
    title: 'EX Rates',
    type: 'item',
    url: '/finance/daily/DailyRate'
  },
  {
    id: 'chartOfCostCenter',
    title: 'Chart of Cost center',
    type: 'item',
    url: '/finance/chartOfCostcenter/ChartOfCostcenter'
  },
  {
    id: 'brsOpening',
    title: 'BRS Opening',
    type: 'item',
    url: '/finance/BRSOpening'
  },
  {
    id: 'fundTransfer',
    title: 'Fund Transfer',
    type: 'item',
    url: '/finance/FundTransfer'
  },
  {
    id: 'generalJournal',
    title: 'General Journal',
    type: 'item',
    url: '/finance/GeneralJournal/GeneralJournal'
  },
  {
    id: 'reconcile-bank',
    title: 'Reconcile Bank',
    type: 'item',
    url: '/finance/Reconcile/Reconcile'
  },
  {
    id: 'reconcile-corp',
    title: 'Reconcile - FX',
    type: 'item',
    url: '/finance/Reconcile/ReconcileCorp'
  },
  {
    id: 'reconcile-cash',
    title: 'Reconcile Cash',
    type: 'item',
    url: '/finance/Reconcile/ReconcileCash'
  },
  {
    id: 'paymentVoucher',
    title: 'Payment Voucher',
    type: 'item',
    url: '/finance/paymentVoucher/paymentVoucher'
  },
  {
    id: 'adjustmentJournal',
    title: 'Adjustment Journal',
    type: 'item',
    url: '/finance/AdjustmentJournal'
  },
  {
    id: 'JobCard',
    title: 'Job Card',
    type: 'item',
    url: '/finance/JobCard'
  },
  {
    id: 'AdjustmentOffset',
    title: 'Adjustment Offset',
    type: 'item',
    url: '/finance/AdjustmentOffset'
  },
  {
    id: 'deposit',
    title: 'Deposit',
    type: 'item',
    url: '/finance/Deposit'
  },
  {
    id: 'withdrawal',
    title: 'Withdrawal',
    type: 'item',
    url: '/finance/Withdrawal'
  }
];

// Define the transaction menu
const genTransaction = {
  id: 'transaction',
  title: 'General Transaction',
  type: 'group',
  children: [
    {
      id: 'transaction',
      title: 'Transaction',
      type: 'collapse',
      icon: icons.IconKey,
      children: transactionChildren
    }
  ]
};

export default genTransaction;

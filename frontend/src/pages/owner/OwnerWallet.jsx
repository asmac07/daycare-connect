
import { useEffect, useState } from 'react'
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
  Landmark,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import axiosInstance from '../../api/axiosInstance'

const OwnerWallet = () => {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Withdrawal
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  // Bank Account
  const [bankAccount, setBankAccount] = useState(null)
  const [showBankModal, setShowBankModal] = useState(false)
  const [bankLoading, setBankLoading] = useState(false)

  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
  })

  // Fetch wallet data
  const fetchWallet = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await axiosInstance.get('/wallet/owner')

      const walletData = response.data.data

      setBalance(walletData.balance || 0)
      setTransactions(walletData.transactions || [])
      setBankAccount(walletData.bankAccount || null)

    } catch (error) {
      console.log('GET WALLET ERROR:', error)

      setError(
        error.response?.data?.message ||
        'Failed to load wallet'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  // Format amount
  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Withdrawal
  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      return
    }

    if (Number(withdrawAmount) > balance) {
      return
    }

    if (!bankAccount) {
      setError('Please add a bank account before withdrawing money')
      return
    }

    try {
      setWithdrawLoading(true)
      setError('')

      const response = await axiosInstance.post('/wallet/withdraw', {
        amount: Number(withdrawAmount),
      })

      setBalance(response.data.data.balance)

      setWithdrawAmount('')
      setShowWithdrawModal(false)

      await fetchWallet()

    } catch (error) {
      console.error('Withdrawal failed:', error)

      setError(
        error.response?.data?.message ||
        'Withdrawal failed'
      )
    } finally {
      setWithdrawLoading(false)
    }
  }

  // Bank account submit
  const handleBankSubmit = async (e) => {
    e.preventDefault()

    try {
      setBankLoading(true)
      setError('')

      const response = await axiosInstance.post(
        '/wallet/bank-account',
        bankForm
      )

      setBankAccount(response.data.data)

      setShowBankModal(false)

      setBankForm({
        accountHolderName: '',
        accountNumber: '',
        ifsc: '',
        bankName: '',
      })

    } catch (error) {
      console.log('BANK ACCOUNT ERROR:', error)

      setError(
        error.response?.data?.message ||
        'Failed to add bank account'
      )
    } finally {
      setBankLoading(false)
    }
  }

  // Open bank modal
  const openBankModal = () => {
    if (bankAccount) {
      setBankForm({
        accountHolderName: bankAccount.accountHolderName || '',
        accountNumber: '',
        ifsc: bankAccount.ifsc || '',
        bankName: bankAccount.bankName || '',
      })
    } else {
      setBankForm({
        accountHolderName: '',
        accountNumber: '',
        ifsc: '',
        bankName: '',
      })
    }

    setShowBankModal(true)
  }

  // Withdrawal status
  const getPayoutStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return {
          label: 'Pending',
          icon: Clock3,
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        }

      case 'PROCESSING':
        return {
          label: 'Processing',
          icon: Clock3,
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        }

      case 'SUCCESS':
        return {
          label: 'Successful',
          icon: CheckCircle2,
          className: 'bg-green-50 text-green-700 border-green-200',
        }

      case 'FAILED':
        return {
          label: 'Failed',
          icon: XCircle,
          className: 'bg-red-50 text-red-600 border-red-200',
        }

      default:
        return {
          label: 'Processing',
          icon: Clock3,
          className: 'bg-slate-50 text-slate-600 border-slate-200',
        }
    }
  }

  // Summary values
  const withdrawalTransactions = transactions.filter(
    (transaction) => transaction.reason === 'WITHDRAWAL'
  )

  const totalWithdrawn = withdrawalTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount || 0),
    0
  )

  const processingWithdrawals = withdrawalTransactions.filter(
    (transaction) =>
      transaction.payoutStatus === 'PROCESSING' ||
      transaction.payoutStatus === 'PENDING'
  ).length

  const successfulWithdrawals = withdrawalTransactions.filter(
    (transaction) =>
      transaction.payoutStatus === 'SUCCESS'
  ).length

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded mb-6" />
          <div className="h-44 bg-gray-200 rounded-2xl mb-6" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-7 lg:p-8">

      {/* Page Header */}

      <div className="mb-7">

        <h1 className="text-2xl md:text-3xl font-bold text-dc-ink font-baloo">
          My Wallet
        </h1>

        <p className="text-sm text-dc-muted mt-1">
          Manage your daycare earnings and withdrawals
        </p>

      </div>


      {/* Error */}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">

          <AlertCircle size={17} />

          {error}

        </div>
      )}


      {/* Balance Card */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dc-blue to-dc-green p-6 md:p-8 text-white shadow-lg mb-7">

        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />

        <div className="absolute -right-5 bottom-[-50px] w-32 h-32 rounded-full bg-white/10" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>

            <div className="flex items-center gap-3 mb-4">

              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">

                <Wallet size={23} />

              </div>

              <span className="text-sm font-medium text-white/80">
                Available Balance
              </span>

            </div>

            <h2 className="text-4xl md:text-5xl font-bold">
              {formatAmount(balance)}
            </h2>

            <p className="text-sm text-white/70 mt-2">
              Available for withdrawal
            </p>

          </div>


          <button
            disabled={balance <= 0 || !bankAccount}
            onClick={() => setShowWithdrawModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-dc-blue font-semibold text-sm shadow-md hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            <ArrowUpFromLine size={18} />

            {bankAccount
              ? 'Withdraw Money'
              : 'Add Bank Account First'}

          </button>

        </div>

      </div>


      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

        {/* Payout Account */}

        <div className="bg-white rounded-2xl border border-dc-border shadow-sm p-5 lg:col-span-2">

          <div className="flex items-start justify-between">

            <div>

              <div className="flex items-center gap-2 mb-2">

                <Landmark
                  size={18}
                  className="text-dc-blue"
                />

                <p className="text-sm font-semibold text-dc-ink">
                  Payout Account
                </p>

              </div>

              <p className="text-xs text-dc-muted">
                Withdrawals are sent to this account
              </p>

            </div>


            {bankAccount && (
              <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                Active
              </span>
            )}

          </div>


          <div className="mt-5 rounded-xl bg-slate-50 border border-dc-border p-4">

            {bankAccount ? (
              <>

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="text-xs text-dc-muted">
                      Bank Account
                    </p>

                    <p className="text-sm font-semibold text-dc-ink mt-1">
                      {bankAccount.bankName}
                    </p>

                  </div>

                  <button
                    onClick={openBankModal}
                    className="text-xs font-semibold text-dc-blue hover:underline"
                  >
                    Update
                  </button>

                </div>


                <p className="text-sm font-medium text-dc-ink mt-3">
                  A/C: {bankAccount.accountNumber}
                </p>

                <p className="text-xs text-dc-muted mt-1">
                  {bankAccount.accountHolderName}
                </p>

                <p className="text-xs text-dc-muted mt-1">
                  IFSC: {bankAccount.ifsc}
                </p>

              </>
            ) : (

              <div>

                <p className="text-sm font-semibold text-dc-ink">
                  No bank account added
                </p>

                <p className="text-xs text-dc-muted mt-1">
                  Add a bank account to receive withdrawals.
                </p>

                <button
                  onClick={openBankModal}
                  className="mt-3 px-4 py-2 rounded-lg bg-dc-blue text-white text-xs font-semibold hover:opacity-90 transition"
                >
                  Add Bank Account
                </button>

              </div>

            )}

          </div>

        </div>


        {/* Total Withdrawn */}

        <div className="bg-white rounded-2xl border border-dc-border shadow-sm p-5">

          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">

            <ArrowUpFromLine size={19} />

          </div>

          <p className="text-xs text-dc-muted">
            Total Withdrawn
          </p>

          <p className="text-xl font-bold text-dc-ink mt-1">
            {formatAmount(totalWithdrawn)}
          </p>

        </div>


        {/* Successful Withdrawals */}

        <div className="bg-white rounded-2xl border border-dc-border shadow-sm p-5">

          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">

            <CheckCircle2 size={19} />

          </div>

          <p className="text-xs text-dc-muted">
            Successful Withdrawals
          </p>

          <p className="text-xl font-bold text-dc-ink mt-1">
            {successfulWithdrawals}
          </p>

          {processingWithdrawals > 0 && (
            <p className="text-xs text-blue-600 mt-2">
              {processingWithdrawals} currently processing
            </p>
          )}

        </div>

      </div>


      {/* Transaction History */}

      <div className="bg-white rounded-2xl border border-dc-border shadow-sm">

        <div className="p-5 md:p-6 border-b border-dc-border">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

            <div>

              <h2 className="text-lg font-bold text-dc-ink">
                Transaction History
              </h2>

              <p className="text-sm text-dc-muted mt-1">
                View your wallet transactions and withdrawal status
              </p>

            </div>

            <div className="text-xs text-dc-muted">

              {transactions.length} transaction
              {transactions.length !== 1 ? 's' : ''}

            </div>

          </div>

        </div>


        {transactions.length === 0 ? (

          /* Empty State */

          <div className="py-14 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">

              <Wallet
                size={26}
                className="text-dc-muted"
              />

            </div>

            <h3 className="font-semibold text-dc-ink">
              No transactions yet
            </h3>

            <p className="text-sm text-dc-muted mt-1">
              Your enrollment payments will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="text-left text-xs uppercase tracking-wider text-dc-muted bg-slate-50">

                  <th className="px-6 py-4 font-semibold">
                    Transaction
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Type
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Date
                  </th>

                  <th className="px-6 py-4 font-semibold text-center">
                    Status
                  </th>

                  <th className="px-6 py-4 font-semibold text-right">
                    Amount
                  </th>

                  <th className="px-6 py-4 font-semibold text-right">
                    Balance
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-dc-border">

                {transactions.map((transaction) => {

                  const isCredit = transaction.type === 'CREDIT'

                  const isWithdrawal =
                    transaction.reason === 'WITHDRAWAL'

                  const payoutStatus = isWithdrawal
                    ? getPayoutStatus(transaction.payoutStatus)
                    : null

                  const StatusIcon = payoutStatus?.icon

                  return (
                    <tr
                      key={transaction._id}
                      className="hover:bg-slate-50 transition"
                    >

                      {/* Transaction */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isCredit
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-500'
                            }`}
                          >

                            {isCredit ? (
                              <ArrowDownToLine size={18} />
                            ) : (
                              <ArrowUpFromLine size={18} />
                            )}

                          </div>


                          <div>

                            <p className="font-semibold text-sm text-dc-ink">

                              {transaction.reason === 'ENROLLMENT_PAYMENT'
                                ? 'Enrollment Payment'
                                : transaction.reason === 'WITHDRAWAL'
                                ? 'Wallet Withdrawal'
                                : transaction.reason === 'REFUND'
                                ? 'Refund'
                                : transaction.reason || 'Wallet Transaction'}

                            </p>


                            <p className="text-xs text-dc-muted mt-0.5">

                              {isWithdrawal
                                ? 'RazorpayX payout'
                                : 'Wallet transaction'}

                            </p>

                          </div>

                        </div>

                      </td>


                      {/* Type */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isCredit
                              ? 'bg-green-50 text-green-600'
                              : 'bg-red-50 text-red-500'
                          }`}
                        >
                          {transaction.type}
                        </span>

                      </td>


                      {/* Date */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2 text-sm text-dc-muted">

                          <CalendarDays size={15} />

                          {formatDate(transaction.createdAt)}

                        </div>

                      </td>


                      {/* Status */}

                      <td className="px-6 py-4 text-center">

                        {isWithdrawal ? (

                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${payoutStatus.className}`}
                          >

                            <StatusIcon size={14} />

                            {payoutStatus.label}

                          </span>

                        ) : (

                          <span className="text-xs text-dc-muted">
                            —
                          </span>

                        )}

                      </td>


                      {/* Amount */}

                      <td
                        className={`px-6 py-4 text-right font-bold ${
                          isCredit
                            ? 'text-green-600'
                            : 'text-red-500'
                        }`}
                      >

                        {isCredit ? '+' : '-'}

                        {formatAmount(transaction.amount)}

                      </td>


                      {/* Balance */}

                      <td className="px-6 py-4 text-right font-semibold text-dc-ink">

                        {formatAmount(transaction.balanceAfter)}

                      </td>

                    </tr>
                  )
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* Withdraw Modal */}

      {showWithdrawModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-dc-ink">
                  Withdraw Money
                </h2>

                <p className="text-sm text-dc-muted mt-1">
                  Enter the amount you want to withdraw.
                </p>

              </div>

              <button
                onClick={() => {
                  setShowWithdrawModal(false)
                  setWithdrawAmount('')
                }}
                className="text-dc-muted hover:text-dc-ink text-xl"
              >
                ×
              </button>

            </div>


            {/* Available Balance */}

            <div className="mt-5 rounded-xl bg-slate-50 p-4">

              <p className="text-xs text-dc-muted">
                Available Balance
              </p>

              <p className="text-xl font-bold text-dc-ink mt-1">
                {formatAmount(balance)}
              </p>

            </div>


            {/* Payout Account */}

            <div className="mt-4 rounded-xl border border-dc-border p-4">

              <div className="flex items-center gap-2">

                <Landmark
                  size={17}
                  className="text-dc-blue"
                />

                <p className="text-xs font-semibold text-dc-ink">
                  Payout Account
                </p>

              </div>


              {bankAccount ? (
                <>

                  <p className="text-sm font-semibold text-dc-ink mt-2">
                    {bankAccount.bankName}
                  </p>

                  <p className="text-sm text-dc-ink mt-1">
                    A/C: {bankAccount.accountNumber}
                  </p>

                  <p className="text-xs text-dc-muted mt-1">
                    {bankAccount.accountHolderName}
                  </p>

                  <p className="text-xs text-dc-muted mt-1">
                    IFSC: {bankAccount.ifsc}
                  </p>

                </>
              ) : (

                <p className="text-sm text-red-500 mt-2">
                  Please add a bank account first.
                </p>

              )}

            </div>


            {/* Amount Input */}

            <div className="mt-5">

              <label className="block text-sm font-medium text-dc-ink mb-2">
                Withdrawal Amount
              </label>

              <input
                type="number"
                min="1"
                max={balance}
                value={withdrawAmount}
                onChange={(e) =>
                  setWithdrawAmount(e.target.value)
                }
                placeholder="Enter amount"
                className="w-full rounded-xl border border-dc-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-dc-blue"
              />


              {withdrawAmount &&
                Number(withdrawAmount) > balance && (
                  <p className="text-xs text-red-500 mt-2">
                    Amount cannot exceed your available balance.
                  </p>
                )}

            </div>


            {/* Buttons */}

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() => {
                  setShowWithdrawModal(false)
                  setWithdrawAmount('')
                }}
                className="px-4 py-2.5 rounded-xl border border-dc-border text-sm font-semibold text-dc-ink hover:bg-slate-50 transition"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={handleWithdraw}
                disabled={
                  withdrawLoading ||
                  !withdrawAmount ||
                  Number(withdrawAmount) <= 0 ||
                  Number(withdrawAmount) > balance ||
                  !bankAccount
                }
                className="px-5 py-2.5 rounded-xl bg-dc-blue text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {withdrawLoading
                  ? 'Processing...'
                  : 'Withdraw'}

              </button>

            </div>

          </div>

        </div>
      )}


      {/* Add / Update Bank Account Modal */}

      {showBankModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-dc-ink">

                  {bankAccount
                    ? 'Update Bank Account'
                    : 'Add Bank Account'}

                </h2>

                <p className="text-sm text-dc-muted mt-1">
                  Enter the bank account details for withdrawals.
                </p>

              </div>


              <button
                onClick={() => {
                  setShowBankModal(false)
                  setBankForm({
                    accountHolderName: '',
                    accountNumber: '',
                    ifsc: '',
                    bankName: '',
                  })
                }}
                className="text-dc-muted hover:text-dc-ink text-xl"
              >
                ×
              </button>

            </div>


            <form
              onSubmit={handleBankSubmit}
              className="mt-5 space-y-4"
            >

              {/* Account Holder */}

              <div>

                <label className="block text-sm font-medium text-dc-ink mb-2">
                  Account Holder Name
                </label>

                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) =>
                    setBankForm({
                      ...bankForm,
                      accountHolderName: e.target.value,
                    })
                  }
                  placeholder="Enter account holder name"
                  className="w-full rounded-xl border border-dc-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-dc-blue"
                  required
                />

              </div>


              {/* Account Number */}

              <div>

                <label className="block text-sm font-medium text-dc-ink mb-2">
                  Account Number
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={bankForm.accountNumber}
                  onChange={(e) =>
                    setBankForm({
                      ...bankForm,
                      accountNumber: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="Enter account number"
                  className="w-full rounded-xl border border-dc-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-dc-blue"
                  required
                />

              </div>


              {/* IFSC */}

              <div>

                <label className="block text-sm font-medium text-dc-ink mb-2">
                  IFSC Code
                </label>

                <input
                  type="text"
                  value={bankForm.ifsc}
                  onChange={(e) =>
                    setBankForm({
                      ...bankForm,
                      ifsc: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Example: SBIN0001234"
                  maxLength={11}
                  className="w-full rounded-xl border border-dc-border px-4 py-3 text-sm uppercase outline-none focus:ring-2 focus:ring-dc-blue"
                  required
                />

              </div>


              {/* Bank Name */}

              <div>

                <label className="block text-sm font-medium text-dc-ink mb-2">
                  Bank Name
                </label>

                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) =>
                    setBankForm({
                      ...bankForm,
                      bankName: e.target.value,
                    })
                  }
                  placeholder="Enter bank name"
                  className="w-full rounded-xl border border-dc-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-dc-blue"
                  required
                />

              </div>


              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowBankModal(false)
                    setBankForm({
                      accountHolderName: '',
                      accountNumber: '',
                      ifsc: '',
                      bankName: '',
                    })
                  }}
                  className="px-4 py-2.5 rounded-xl border border-dc-border text-sm font-semibold text-dc-ink hover:bg-slate-50 transition"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={bankLoading}
                  className="px-5 py-2.5 rounded-xl bg-dc-blue text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  {bankLoading
                    ? 'Saving...'
                    : bankAccount
                    ? 'Update Account'
                    : 'Save Account'}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default OwnerWallet



import { useEffect, useState } from 'react'
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
} from 'lucide-react'
import axiosInstance from '../../api/axiosInstance'

const OwnerWallet = () => {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const fetchWallet = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await axiosInstance.get('/wallet/owner')

      const walletData = response.data.data

      setBalance(walletData.balance || 0)
      setTransactions(walletData.transactions || [])
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

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  
const handleWithdraw = async () => {
  if (!withdrawAmount || Number(withdrawAmount) <= 0) {
    return
  }

  if (Number(withdrawAmount) > balance) {
    return
  }

  try {
    setWithdrawLoading(true)

    const response = await axiosInstance.post('/wallet/withdraw', {
      amount: Number(withdrawAmount)
    })

    setBalance(response.data.data.balance)

    setWithdrawAmount('')
    setShowWithdrawModal(false)

    await fetchWallet()

  } catch (error) {
    console.error('Withdrawal failed:', error)
  } finally {
    setWithdrawLoading(false)
  }
}


  

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

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-bold text-dc-ink font-baloo">
          My Wallet
        </h1>

        <p className="text-sm text-dc-muted mt-1">
          Manage your daycare earnings and transactions
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dc-blue to-dc-green p-6 md:p-8 text-white shadow-lg mb-7">

        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />

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
            disabled={balance <= 0}
            onClick={() => setShowWithdrawModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-dc-blue font-semibold text-sm shadow-md hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpFromLine size={18} />
            Withdraw Money
          </button>

        </div>

      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-dc-border shadow-sm">

        <div className="p-5 md:p-6 border-b border-dc-border">

          <h2 className="text-lg font-bold text-dc-ink">
            Transaction History
          </h2>

          <p className="text-sm text-dc-muted mt-1">
            View your wallet transactions
          </p>

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
                                : transaction.reason || 'Wallet Transaction'}
                            </p>

                            <p className="text-xs text-dc-muted mt-0.5">
                              Wallet transaction
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

            
{/* Withdraw Modal */}
{showWithdrawModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

      <h2 className="text-xl font-bold text-dc-ink">
        Withdraw Money
      </h2>

      <p className="text-sm text-dc-muted mt-1">
        Enter the amount you want to withdraw.
      </p>

      {/* Available Balance */}
      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="text-xs text-dc-muted">
          Available Balance
        </p>

        <p className="text-xl font-bold text-dc-ink mt-1">
          {formatAmount(balance)}
        </p>
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
          onChange={(e) => setWithdrawAmount(e.target.value)}
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
            Number(withdrawAmount) > balance
          }
          className="px-5 py-2.5 rounded-xl bg-dc-blue text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {withdrawLoading ? 'Processing...' : 'Withdraw'}
        </button>

      </div>

    </div>

  </div>
)}


      </div>

    </div>
  )
}

export default OwnerWallet


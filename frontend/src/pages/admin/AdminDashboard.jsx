import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

import axiosInstance from '../../api/axiosInstance'


const AdminDashboard = () => {

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('month')

  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')


  // --------------------------------
  // Create date range
  // --------------------------------

  const getDateRange = (selectedFilter) => {

    const now = new Date()

    let start
    let end

    if (selectedFilter === 'today') {

      start = new Date(now)
      start.setHours(0, 0, 0, 0)

      end = new Date(now)
      end.setHours(23, 59, 59, 999)

    } else if (selectedFilter === 'month') {

      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )

      end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      )

      end.setHours(23, 59, 59, 999)

    } else if (selectedFilter === 'year') {

      start = new Date(
        now.getFullYear(),
        0,
        1
      )

      end = new Date(
        now.getFullYear(),
        11,
        31
      )

      end.setHours(23, 59, 59, 999)

    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    }
  }


  // --------------------------------
  // Fetch analytics
  // --------------------------------

  const fetchAnalytics = async (selectedFilter = filter) => {

    try {

      setLoading(true)
      setError('')

      let params = {}

      if (selectedFilter !== 'custom') {

        const { startDate, endDate } =
          getDateRange(selectedFilter)

        params = {
          startDate,
          endDate
        }

      } else {

        if (!customStartDate || !customEndDate) {
          setLoading(false)
          return
        }

        params = {
          startDate: new Date(customStartDate).toISOString(),
          endDate: new Date(
            `${customEndDate}T23:59:59`
          ).toISOString()
        }
      }


      const response = await axiosInstance.get(
        '/admin/analytics',
        { params }
      )


      if (response.data.success) {

        setAnalytics(response.data.data)

      } else {

        setError(
          response.data.message ||
          'Failed to load analytics'
        )
      }

    } catch (error) {

      console.error(
        'Analytics error:',
        error
      )

      setError(
        error.response?.data?.message ||
        'Failed to load analytics'
      )

    } finally {

      setLoading(false)

    }
  }


  // --------------------------------
  // Initial load + filter change
  // --------------------------------

  useEffect(() => {

    if (filter !== 'custom') {
      fetchAnalytics(filter)
    }

  }, [filter])


  // --------------------------------
  // Format numbers
  // --------------------------------

  const formatNumber = (number) => {

    return new Intl.NumberFormat(
      'en-IN'
    ).format(number || 0)

  }


  // --------------------------------
  // Format currency
  // --------------------------------

  const formatCurrency = (amount) => {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }
    ).format(amount || 0)

  }


  // --------------------------------
  // Transform enrollment trend
  // --------------------------------

  const enrollmentTrend =
    analytics?.enrollmentTrend?.map((item) => {

      const month = new Date(
        item._id.year,
        item._id.month - 1
      )

      return {
        month: month.toLocaleString(
          'en-US',
          {
            month: 'short',
            year: 'numeric'
          }
        ),
        enrollments: item.count
      }

    }) || []


  // --------------------------------
  // Transform payment trend
  // --------------------------------

  const paymentTrend =
    analytics?.paymentTrend?.map((item) => {

      const month = new Date(
        item._id.year,
        item._id.month - 1
      )

      return {
        month: month.toLocaleString(
          'en-US',
          {
            month: 'short',
            year: 'numeric'
          }
        ),
        revenue: item.revenue
      }

    }) || []


  // --------------------------------
  // Top daycare data
  // --------------------------------

  const topDaycares =
    analytics?.topDaycares?.map((item) => ({
      name: item.daycareName,
      enrollments: item.totalEnrollments
    })) || []


  // --------------------------------
  // Loading state
  // --------------------------------

  if (loading) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">

        <div className="max-w-7xl mx-auto">

          <div className="bg-white rounded-[2rem] p-10 shadow-sm text-center">

            <div className="w-10 h-10 border-4 border-dc-blue/20 border-t-dc-blue rounded-full animate-spin mx-auto mb-4"></div>

            <p className="text-dc-muted">
              Loading analytics...
            </p>

          </div>

        </div>

      </div>
    )
  }


  // --------------------------------
  // Error state
  // --------------------------------

  if (error) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">

        <div className="max-w-7xl mx-auto">

          <div className="bg-white rounded-[2rem] p-10 shadow-sm text-center">

            <div className="text-4xl mb-4">
              ⚠️
            </div>

            <h2 className="text-xl font-semibold text-dc-ink mb-2">
              Unable to load analytics
            </h2>

            <p className="text-dc-muted mb-5">
              {error}
            </p>

            <button
              onClick={() => fetchAnalytics(filter)}
              className="px-5 py-2.5 rounded-xl bg-dc-blue text-white font-semibold hover:opacity-90 transition"
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    )
  }


  return (

    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-6 md:p-8 font-nunito">

      <div className="max-w-7xl mx-auto">

        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)]">

                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >

                    <path
                      d="M4 19V10"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M10 19V5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M16 19V9"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    <path
                      d="M22 19V3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                  </svg>

                </div>

                <div>

                  <h1 className="text-3xl font-semibold font-baloo text-dc-ink">
                    Admin Analytics
                  </h1>

                  <p className="text-sm text-dc-muted mt-1">
                    Overview of users, enrollments and payments
                  </p>

                </div>

              </div>

            </div>


            {/* Filters */}

            <div className="flex flex-wrap items-center gap-2">

              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filter === 'today'
                    ? 'bg-dc-blue text-white'
                    : 'bg-dc-mist text-dc-ink hover:bg-dc-mist-2'
                }`}
              >
                Today
              </button>

              <button
                onClick={() => setFilter('month')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filter === 'month'
                    ? 'bg-dc-blue text-white'
                    : 'bg-dc-mist text-dc-ink hover:bg-dc-mist-2'
                }`}
              >
                This Month
              </button>

              <button
                onClick={() => setFilter('year')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filter === 'year'
                    ? 'bg-dc-blue text-white'
                    : 'bg-dc-mist text-dc-ink hover:bg-dc-mist-2'
                }`}
              >
                This Year
              </button>

              <button
                onClick={() => setFilter('custom')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filter === 'custom'
                    ? 'bg-dc-blue text-white'
                    : 'bg-dc-mist text-dc-ink hover:bg-dc-mist-2'
                }`}
              >
                Custom
              </button>

            </div>

          </div>


          {/* Custom date filter */}

          {filter === 'custom' && (

            <div className="mt-5 pt-5 border-t border-dc-mist-2">

              <div className="flex flex-col md:flex-row md:items-end gap-4">

                <div>

                  <label className="block text-sm font-semibold text-dc-ink mb-1">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) =>
                      setCustomStartDate(e.target.value)
                    }
                    className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-dc-blue"
                  />

                </div>


                <div>

                  <label className="block text-sm font-semibold text-dc-ink mb-1">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) =>
                      setCustomEndDate(e.target.value)
                    }
                    className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-dc-blue"
                  />

                </div>


                <button
                  onClick={() => fetchAnalytics('custom')}
                  disabled={
                    !customStartDate ||
                    !customEndDate
                  }
                  className="px-5 py-2.5 rounded-xl bg-dc-green text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
                >
                  Apply Filter
                </button>

              </div>

            </div>

          )}

        </div>


        {/* -------------------------------- */}
        {/* KPI Cards */}
        {/* -------------------------------- */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

          {/* Users */}

          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-white/70">

            <div className="flex items-center justify-between mb-4">

              <div className="w-11 h-11 rounded-xl bg-dc-mist flex items-center justify-center text-2xl">
                👥
              </div>

              <span className="text-xs font-semibold text-dc-muted">
                USERS
              </span>

            </div>

            <p className="text-3xl font-bold text-dc-ink">
              {formatNumber(
                analytics?.overview?.totalUsers
              )}
            </p>

            <p className="text-sm text-dc-muted mt-1">
              Total registered users
            </p>

          </div>


          {/* Daycares */}

          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-white/70">

            <div className="flex items-center justify-between mb-4">

              <div className="w-11 h-11 rounded-xl bg-[#EDF7EE] flex items-center justify-center text-2xl">
                🏠
              </div>

              <span className="text-xs font-semibold text-dc-muted">
                DAYCARES
              </span>

            </div>

            <p className="text-3xl font-bold text-dc-ink">
              {formatNumber(
                analytics?.overview?.totalDaycares
              )}
            </p>

            <p className="text-sm text-dc-muted mt-1">
              Registered daycares
            </p>

          </div>


          {/* Enrollments */}

          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-white/70">

            <div className="flex items-center justify-between mb-4">

              <div className="w-11 h-11 rounded-xl bg-[#FFF6E5] flex items-center justify-center text-2xl">
                📝
              </div>

              <span className="text-xs font-semibold text-dc-muted">
                ENROLLMENTS
              </span>

            </div>

            <p className="text-3xl font-bold text-dc-ink">
              {formatNumber(
                analytics?.overview?.totalEnrollments
              )}
            </p>

            <p className="text-sm text-dc-muted mt-1">
              Total enrollments
            </p>

          </div>


          {/* Revenue */}

          <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-white/70">

            <div className="flex items-center justify-between mb-4">

              <div className="w-11 h-11 rounded-xl bg-[#FDECEC] flex items-center justify-center text-2xl">
                💰
              </div>

              <span className="text-xs font-semibold text-dc-muted">
                REVENUE
              </span>

            </div>

            <p className="text-3xl font-bold text-dc-ink">
              {formatCurrency(
                analytics?.overview?.totalRevenue
              )}
            </p>

            <p className="text-sm text-dc-muted mt-1">
              Successful payments
            </p>

          </div>

        </div>


        {/* -------------------------------- */}
        {/* Charts */}
        {/* -------------------------------- */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Enrollment Trend */}

          <div className="bg-white rounded-[1.75rem] p-6 shadow-sm border border-white/70">

            <div className="mb-5">

              <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                Enrollment Trend
              </h2>

              <p className="text-sm text-dc-muted">
                Enrollment activity over time
              </p>

            </div>


            {enrollmentTrend.length === 0 ? (

              <div className="h-[300px] flex items-center justify-center text-dc-muted text-sm">
                No enrollment data available
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <LineChart data={enrollmentTrend}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#EAF6F5"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    name="Enrollments"
                    stroke="#4A90A4"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: '#4A90A4'
                    }}
                    activeDot={{
                      r: 6
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>


          {/* Payment Trend */}

          <div className="bg-white rounded-[1.75rem] p-6 shadow-sm border border-white/70">

            <div className="mb-5">

              <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                Payment Trend
              </h2>

              <p className="text-sm text-dc-muted">
                Successful payment revenue over time
              </p>

            </div>


            {paymentTrend.length === 0 ? (

              <div className="h-[300px] flex items-center justify-center text-dc-muted text-sm">
                No payment data available
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <LineChart data={paymentTrend}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#EAF6F5"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#7FB685"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: '#7FB685'
                    }}
                    activeDot={{
                      r: 6
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* -------------------------------- */}
        {/* Top 5 Daycares */}
        {/* -------------------------------- */}

        <div className="bg-white rounded-[1.75rem] p-6 shadow-sm border border-white/70 mb-6">

          <div className="mb-5">

            <h2 className="text-xl font-semibold font-baloo text-dc-ink">
              Top 5 Daycares
            </h2>

            <p className="text-sm text-dc-muted">
              Daycares with the highest number of enrollments
            </p>

          </div>


          {topDaycares.length === 0 ? (

            <div className="h-[300px] flex items-center justify-center text-dc-muted text-sm">
              No daycare enrollment data available
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <BarChart
                data={topDaycares}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 20,
                  left: 30,
                  bottom: 5
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#EAF6F5"
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Bar
                  dataKey="enrollments"
                  name="Enrollments"
                  fill="#4A90A4"
                  radius={[0, 8, 8, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          )}

        </div>


        {/* -------------------------------- */}
        {/* Enrollment Summary */}
        {/* -------------------------------- */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* User Summary */}

          <div className="bg-white rounded-[1.75rem] p-6 shadow-sm border border-white/70">

            <div className="mb-5">

              <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                User Summary
              </h2>

              <p className="text-sm text-dc-muted">
                Registered users by role
              </p>

            </div>


            <div className="space-y-4">

              <div className="flex items-center justify-between p-4 rounded-xl bg-dc-mist">

                <span className="font-semibold text-dc-ink">
                  Parents
                </span>

                <span className="font-bold text-dc-blue">
                  {formatNumber(
                    analytics?.overview?.totalParents
                  )}
                </span>

              </div>


              <div className="flex items-center justify-between p-4 rounded-xl bg-[#EDF7EE]">

                <span className="font-semibold text-dc-ink">
                  Owners
                </span>

                <span className="font-bold text-dc-green">
                  {formatNumber(
                    analytics?.overview?.totalOwners
                  )}
                </span>

              </div>


              <div className="flex items-center justify-between p-4 rounded-xl bg-[#FFF6E5]">

                <span className="font-semibold text-dc-ink">
                  Staff
                </span>

                <span className="font-bold text-[#C9962D]">
                  {formatNumber(
                    analytics?.overview?.totalStaff
                  )}
                </span>

              </div>

            </div>

          </div>


          {/* Enrollment Status */}

          <div className="bg-white rounded-[1.75rem] p-6 shadow-sm border border-white/70">

            <div className="mb-5">

              <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                Enrollment Status
              </h2>

              <p className="text-sm text-dc-muted">
                Current enrollment distribution
              </p>

            </div>


            <div className="space-y-3">

              {analytics?.enrollmentStatus?.length === 0 ? (

                <p className="text-sm text-dc-muted">
                  No enrollment data available
                </p>

              ) : (

                analytics?.enrollmentStatus?.map(
                  (item) => (

                    <div
                      key={item._id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-dc-mist"
                    >

                      <span className="capitalize font-medium text-dc-ink">
                        {item._id}
                      </span>

                      <span className="font-bold text-dc-blue">
                        {formatNumber(item.count)}
                      </span>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </div>


        {/* -------------------------------- */}
        {/* Payment History */}
        {/* -------------------------------- */}

        <div className="bg-white rounded-[1.75rem] p-6 shadow-sm border border-white/70">

          <div className="mb-5">

            <h2 className="text-xl font-semibold font-baloo text-dc-ink">
              Payment History
            </h2>

            <p className="text-sm text-dc-muted">
              Recent successful payments
            </p>

          </div>


          {analytics?.paymentHistory?.length === 0 ? (

            <div className="py-12 text-center text-dc-muted text-sm">
              No payment history available
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-gray-100">

                    <th className="text-left py-3 px-4 text-xs font-bold text-dc-muted uppercase">
                      Parent
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-bold text-dc-muted uppercase">
                      Daycare
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-bold text-dc-muted uppercase">
                      Package
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-bold text-dc-muted uppercase">
                      Amount
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-bold text-dc-muted uppercase">
                      Date
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-bold text-dc-muted uppercase">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {analytics?.paymentHistory?.map(
                    (payment) => (

                      <tr
                        key={payment._id}
                        className="border-b border-gray-50 hover:bg-dc-mist/50 transition"
                      >

                        <td className="py-4 px-4">

                          <div>

                            <p className="font-semibold text-dc-ink">
                              {payment.parent?.name || 'N/A'}
                            </p>

                            <p className="text-xs text-dc-muted">
                              {payment.parent?.email || ''}
                            </p>

                          </div>

                        </td>


                        <td className="py-4 px-4 text-sm text-dc-ink">

                          {payment.enrollment?.daycare?.name || 'N/A'}

                        </td>


                        <td className="py-4 px-4">

                          <span className="capitalize text-sm font-medium text-dc-ink">
                            {payment.enrollment?.package || 'N/A'}
                          </span>

                        </td>


                        <td className="py-4 px-4 font-semibold text-dc-green">

                          {formatCurrency(
                            payment.amount
                          )}

                        </td>


                        <td className="py-4 px-4 text-sm text-dc-muted">

                          {payment.paidAt
                            ? new Date(
                                payment.paidAt
                              ).toLocaleDateString('en-IN')
                            : 'N/A'}

                        </td>


                        <td className="py-4 px-4">

                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF7EE] text-dc-green">

                            Paid

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  )
}

export default AdminDashboard
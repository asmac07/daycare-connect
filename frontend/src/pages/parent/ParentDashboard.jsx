
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const ParentDashboard = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-4 sm:p-6 lg:p-8 font-nunito relative overflow-hidden">

      {/* Background Decorative Blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-dc-blue/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-24 w-72 h-72 bg-dc-green/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto space-y-6">

        {/* Welcome Section */}
        <section className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

            <div className="flex items-start gap-4">

              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)]">

                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l9-9 9 9"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
                  />
                </svg>

              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-baloo text-dc-ink">
                  Welcome, {user?.name} 👋
                </h1>

                <p className="mt-2 text-sm sm:text-base text-dc-muted max-w-xl leading-relaxed">
                  Manage your children, explore daycare options, and keep
                  track of your daycare activities from one place.
                </p>
              </div>

            </div>

            {/* Main Action */}
            <Link
              to="/parent/search"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-sm bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] transition hover:scale-[1.02] whitespace-nowrap"
            >
              Find Nearby Daycares

              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>

          </div>
        </section>


        {/* Quick Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* My Children */}
          <Link
            to="/parent/children"
            className="group bg-white/90 backdrop-blur-sm rounded-[1.5rem] p-6 border border-white/60 shadow-[0_15px_40px_-15px_rgba(74,144,164,0.18)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(74,144,164,0.25)]"
          >
            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-xl bg-dc-mist flex items-center justify-center text-dc-blue">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                  />
                  <circle cx="9" cy="7" r="4" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 8v6M22 11h-6"
                  />
                </svg>
              </div>

              <svg
                className="w-5 h-5 text-dc-muted group-hover:text-dc-blue transition"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>

            </div>

            <h2 className="mt-5 text-xl font-semibold font-baloo text-dc-ink">
              My Children
            </h2>

            <p className="mt-1 text-sm text-dc-muted">
              Manage your children's information and details.
            </p>
          </Link>


          {/* My Enrollments */}
          <Link
            to="/parent/enrollments"
            className="group bg-white/90 backdrop-blur-sm rounded-[1.5rem] p-6 border border-white/60 shadow-[0_15px_40px_-15px_rgba(74,144,164,0.18)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(74,144,164,0.25)]"
          >
            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-xl bg-dc-mist flex items-center justify-center text-dc-green">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="4"
                    y="3"
                    width="16"
                    height="18"
                    rx="2"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7h8M8 11h8M8 15h5"
                  />
                </svg>
              </div>

              <svg
                className="w-5 h-5 text-dc-muted group-hover:text-dc-green transition"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>

            </div>

            <h2 className="mt-5 text-xl font-semibold font-baloo text-dc-ink">
              My Enrollments
            </h2>

            <p className="mt-1 text-sm text-dc-muted">
              View and manage your daycare enrollments.
            </p>
          </Link>


          {/* Find Daycare */}
          <Link
            to="/parent/search"
            className="group bg-white/90 backdrop-blur-sm rounded-[1.5rem] p-6 border border-white/60 shadow-[0_15px_40px_-15px_rgba(74,144,164,0.18)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(74,144,164,0.25)]"
          >
            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-xl bg-dc-mist flex items-center justify-center text-dc-blue">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1118 0z"
                  />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>

              <svg
                className="w-5 h-5 text-dc-muted group-hover:text-dc-blue transition"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>

            </div>

            <h2 className="mt-5 text-xl font-semibold font-baloo text-dc-ink">
              Find a Daycare
            </h2>

            <p className="mt-1 text-sm text-dc-muted">
              Explore nearby daycare centers and available options.
            </p>
          </Link>

        </section>


        {/* Enrolled Daycare Section */}
        <section className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 sm:p-8 border border-white/60 shadow-[0_15px_40px_-15px_rgba(74,144,164,0.18)]">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <h2 className="text-2xl font-semibold font-baloo text-dc-ink">
                Your Daycare Journey
              </h2>

              <p className="mt-1 text-sm text-dc-muted">
                Keep track of your daycare activities and manage your
                enrollments easily.
              </p>
            </div>

            <Link
              to="/parent/enrollments"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-dc-blue font-semibold text-sm bg-dc-mist hover:bg-dc-hover transition whitespace-nowrap"
            >
              View Enrollments

              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>

          </div>

        </section>

      </div>
    </div>
  )
}

export default ParentDashboard
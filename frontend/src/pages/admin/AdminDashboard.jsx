


const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-8 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)]">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 20L20 8L34 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 18V31C10 31.5523 10.4477 32 11 32H29C29.5523 32 30 31.5523 30 31V18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 27.5C20 27.5 15.5 24.8 15.5 21.7C15.5 20.1 16.7 19 18.1 19C19 19 19.7 19.4 20 20.1C20.3 19.4 21 19 21.9 19C23.3 19 24.5 20.1 24.5 21.7C24.5 24.8 20 27.5 20 27.5Z" fill="white" />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold font-baloo text-dc-ink">
              Welcome, Admin
            </h1>
          </div>

          <p className="mt-2 text-dc-muted text-sm pl-[60px]">
            Manage daycares and users from here.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

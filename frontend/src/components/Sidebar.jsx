
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { ROLES } from '../constants'
import {
  LayoutDashboard,
  Building2,
  Home,
  ClipboardList,
  Users,
  Star,
  CalendarDays,
  Search,
  MessageCircle,
  Video,
  User,
} from 'lucide-react'

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!user) return null

 
const linksByRole = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Daycares', path: '/admin/daycares', icon: Building2 },
  ],

  [ROLES.OWNER]: [
    { label: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'My Daycare', path: '/owner/daycare', icon: Home },
    { label: 'Enrollments', path: '/owner/enrollments', icon: ClipboardList },
    { label: 'Staff', path: '/owner/staff', icon: Users },
    { label: 'Reviews', path: '/owner/reviews', icon: Star },
    { label: 'Visit Slots', path: '/owner/visitSlots', icon: CalendarDays },
    { label: 'Messages', path: '/owner/messages',icon: MessageCircle },
  ],

  [ROLES.PARENT]: [
    { label: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
    { label: 'My Children', path: '/parent/children', icon: Users },
    { label: 'Find Daycares', path: '/parent/search', icon: Search },
    { label: 'My Enrollments', path: '/parent/enrollments', icon: ClipboardList },
    { label: 'Visit Slots', path: '/parent/visitSlots', icon: CalendarDays },
    { label: 'Messages', path: '/parent/messages', icon: MessageCircle },
  ],

  [ROLES.STAFF]: [
    { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Children', path: '/staff/assigned-children', icon: Users },
    { label: 'Parent Chats', path: '/staff/parent-chats', icon: MessageCircle },
    { label: 'Video Call Requests', path: '/staff/video-calls', icon: Video },
    { label: 'Profile', path: '/staff/profile', icon: User },
  ],

  }

  const links = linksByRole[user.role] || []

  return (
    <div className="w-60 min-h-screen bg-white border-r border-dc-border p-5 font-nunito">

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-dc-blue to-dc-green">
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
            <path d="M6 20L20 8L34 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path d="M10 18V31H30V18" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <path
              d="M20 27.5C20 27.5 15.5 24.8 15.5 21.7C15.5 20.1 16.7 19 18.1 19C19 19 19.7 19.4 20 20.1C20.3 19.4 21 19 21.9 19C23.3 19 24.5 20.1 24.5 21.7C24.5 24.8 20 27.5 20 27.5Z"
              fill="white"
            />
          </svg>
        </div>

        <span className="font-bold text-lg font-baloo text-dc-ink">
          DayCare Connect
        </span>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-dc-muted mb-3 px-1">
        Menu
      </p>
<nav className="space-y-2">
  {links.map((link) => {
    const active = location.pathname === link.path
    const Icon = link.icon

    return (
      <Link
        key={link.path}
        to={link.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
          active
            ? 'bg-gradient-to-r from-dc-blue to-dc-green text-white shadow-[0_6px_16px_-6px_rgba(74,144,164,0.55)]'
            : 'text-dc-ink hover:bg-dc-hover'
        }`}
      >
        <Icon size={18} strokeWidth={2.2} className={active ? 'text-white' : 'text-dc-blue'} />
        <span>{link.label}</span>
      </Link>
    )
  })}
</nav>
    </div>
  )
}

export default Sidebar
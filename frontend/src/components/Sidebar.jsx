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
  WalletCards,
  X,
  ClipboardCheck
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
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
      { label: 'Wallet', path: '/owner/wallet', icon: WalletCards },
      { label: 'Messages', path: '/owner/messages', icon: MessageCircle },
    ],

    [ROLES.PARENT]: [
      { label: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
      { label: 'My Children', path: '/parent/children', icon: Users },
      { label: 'Find Daycares', path: '/parent/search', icon: Search },
      { label: 'My Enrollments', path: '/parent/enrollments', icon: ClipboardList },
      { label: 'Visit Slots', path: '/parent/visitSlots', icon: CalendarDays },
      { label: 'Daily Child Updates',path: '/parent/daily-child-updates',icon: ClipboardList },
      { label: 'Messages', path: '/parent/messages', icon: MessageCircle },
      { label: 'Staff Chats', path: '/parent/staff-chats', icon: MessageCircle },
    ],

    [ROLES.STAFF]: [
      { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
      { label: 'Assigned Children', path: '/staff/assigned-children', icon: Users },
      { label: 'Daily Care', path: '/staff/daily-care', icon: ClipboardCheck},
      { label: 'Parent Chats', path: '/staff/parent-chats', icon: MessageCircle }
    ],
  }

  const links = linksByRole[user.role] || []

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky
          top-0 left-0
          z-50
          w-60
          h-screen
          flex-shrink-0
          bg-white
          border-r border-dc-border
          p-5
          font-nunito
          overflow-y-auto
          transition-transform duration-300 ease-in-out

          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-end mb-6 md:hidden">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-dc-muted hover:bg-dc-hover transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Label */}
        <p className="text-xs font-semibold uppercase tracking-wider text-dc-muted mb-3 px-1">
          Menu
        </p>

        {/* Navigation */}
        <nav className="space-y-2">
          {links.map((link) => {
            const active = location.pathname === link.path
            const Icon = link.icon

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                  active
                    ? 'bg-gradient-to-r from-dc-blue to-dc-green text-white shadow-[0_6px_16px_-6px_rgba(74,144,164,0.55)]'
                    : 'text-dc-ink hover:bg-dc-hover'
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={2.2}
                  className={active ? 'text-white' : 'text-dc-blue'}
                />

                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
import { Outlet } from 'react-router-dom'

const StaffLayout = () => {
  return (
    <div className="flex-1">
      <Outlet />
    </div>
  )
}

export default StaffLayout
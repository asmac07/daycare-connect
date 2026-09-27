import { Outlet } from 'react-router-dom'

const ParentLayout = () => {
  return (
    <div className="flex-1">
      <Outlet />
    </div>
  )
}

export default ParentLayout
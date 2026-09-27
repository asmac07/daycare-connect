import { Outlet } from 'react-router-dom'

const OwnerLayout = () => {
  return (
    <div className="flex-1">
      <Outlet />
    </div>
  )
}

export default OwnerLayout
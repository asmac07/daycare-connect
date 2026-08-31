
import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'
import { isValidEmail } from '../../utils/validators'

const OwnerStaff = () => {
  const [staffName, setStaffName] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffPassword, setStaffPassword] = useState('')
  const [staffMessage, setStaffMessage] = useState('')
  const [staffList, setStaffList] = useState([])

  const [editingStaff, setEditingStaff] = useState(null)
  const [designation, setDesignation] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fetchStaff = async () => {
    try {
      const response = await axiosInstance.get('/staff/myStaff')
      setStaffList(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const validateStaffForm = () => {
    if (!staffName.trim()) {
      toast.warning('Staff name is required')
      return false
    }
    if (staffName.trim().length < 2) {
      toast.warning('Staff name must be at least 2 characters')
      return false
    }
    if (!staffEmail.trim()) {
      toast.warning('Email is required')
      return false
    }

    if (!isValidEmail(staffEmail)) {
      toast.warning('Enter a valid email')
      return false
    }

    if (!editingStaff) {
      if (!staffPassword) {
        toast.warning('Password is required')
        return false
      }

      if (staffPassword.length < 6) {
        toast.warning('Password must be at least 6 characters')
        return false
      }
    }

    setStaffMessage('')
    return true
  }

  const handleCreateStaff = async (e) => {
    e.preventDefault()
    if (!validateStaffForm()) return

    try {
      await axiosInstance.post('/staff/create', {
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        designation
      })
      toast.success('Staff account created successfully!')
      setStaffName('')
      setStaffEmail('')
      setStaffPassword('')
      fetchStaff()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create staff')
    }
  }

  const handleEditClick = (staff) => {
    setEditingStaff(staff)
    setStaffName(staff.name)
    setStaffEmail(staff.email)
    setDesignation(staff.designation || '')
  }

  const handleUpdateStaff = async (e) => {
    e.preventDefault()

    try {
      await axiosInstance.put(`/staff/update/${editingStaff._id}`, {
        name: staffName,
        email: staffEmail,
        designation
      })

      fetchStaff()

      setEditingStaff(null)
      setStaffName('')
      setStaffEmail('')
      setStaffPassword('')
      setDesignation('')

      toast.success('Staff updated successfully')

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff')
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await axiosInstance.put(`/staff/toggleStatus/${id}`)
      toast.success('Staff status updated')
      fetchStaff()
    }
    catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }
return (
  <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold font-baloo text-dc-ink">
          Staff Management
        </h1>
        <button
          onClick={() => {
            setEditingStaff(null)
            setStaffName('')
            setStaffEmail('')
            setStaffPassword('')
            setDesignation('')
            setShowModal(true)
          }}
          className="bg-gradient-to-br from-dc-blue to-dc-green text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] hover:scale-[1.02] transition"
        >
          + Add New Staff
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">
        <h2 className="text-lg font-semibold font-baloo text-dc-ink mb-4">
          Current Staff
        </h2>

        {staffList.length === 0 ? (
          <p className="text-dc-muted text-sm">No staff added yet.</p>
        ) : (
          <div className="space-y-3">
            {staffList.map((s) => (
              <div
                key={s._id}
                className="border-[1.5px] border-dc-border rounded-2xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-dc-ink">{s.name}</p>
                  <p className="text-dc-muted text-sm">{s.email}</p>
                  <p className="text-sm text-dc-blue font-semibold">
                    {s.designation || 'No designation'}
                  </p>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => {
                      handleEditClick(s)
                      setShowModal(true)
                    }}
                    className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleStatus(s._id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold text-white ml-2 transition ${
                      s.isBlocked ? 'bg-dc-green hover:opacity-90' : 'bg-dc-error-text hover:opacity-90'
                    }`}
                  >
                    {s.isBlocked ? 'Activate' : 'Deactivate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {showModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-[0_20px_50px_-12px_rgba(74,144,164,0.25)]">
          <h2 className="text-lg font-semibold font-baloo text-dc-ink mb-4">
            {editingStaff ? 'Edit Staff' : 'Add Staff'}
          </h2>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (editingStaff) {
                await handleUpdateStaff(e)
              } else {
                await handleCreateStaff(e)
              }
              setShowModal(false)
            }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Staff Name"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              required
              className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
            />

            <input
              type="email"
              placeholder="Staff Email"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              required
              className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
            />

            {!editingStaff && (
              <input
                type="password"
                placeholder="Temporary Password"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
              />
            )}

            <input
              type="text"
              placeholder="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full bg-white text-dc-muted py-2.5 rounded-full font-semibold text-sm border-[1.5px] border-dc-border hover:bg-dc-hover transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full text-white py-2.5 rounded-full font-semibold text-sm bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] transition transform hover:scale-[1.02]"
              >
                {editingStaff ? 'Update Staff' : 'Create Staff Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
)
}
export default OwnerStaff
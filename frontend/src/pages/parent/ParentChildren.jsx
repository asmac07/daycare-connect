
import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'

const ParentChildren = () => {
  const [children, setChildren] = useState([])
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('male')
  const [medicalNotes, setMedicalNotes] = useState('')
  const [error, setError] = useState('')
  const [editingChild, setEditingChild] = useState(null)

  const [showModal, setShowModal] = useState(false)

  const fetchChildren = async () => {
    try {
      const response = await axiosInstance.get('/child/myChildren')
      setChildren(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const validateForm = () => {
    setError('')

    if (!name || name.trim().length < 2) {
      toast.warning('Child name must be at least 2 characters')
      return false
    }

    if (!dateOfBirth) {
      toast.warning('Date of birth is required')
      return false
    }

    const selectedDate = new Date(dateOfBirth)
    const today = new Date()

    if (selectedDate > today) {
      toast.warning('Date of birth cannot be in the future')
      return false
    }

    if (medicalNotes.length > 200) {
      toast.warning('Medical notes cannot exceed 200 characters')
      return false
    }

    return true
  }

  const handleAddChild = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await axiosInstance.post('/child/addChild', {
        name,
        dateOfBirth,
        gender,
        medicalNotes,
      })

      setName('')
      setDateOfBirth('')
      setGender('male')
      setMedicalNotes('')
      setError('')

      fetchChildren()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add child')
    }
  }

  const handleEditClick = (child) => {
    setEditingChild(child)
    setName(child.name)
    setDateOfBirth(child.dateOfBirth.split('T')[0])
    setGender(child.gender)
    setMedicalNotes(child.medicalNotes || '')
  }

  const handleUpdateChild = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await axiosInstance.put(`/child/updateChild/${editingChild._id}`, {
        name,
        dateOfBirth,
        gender,
        medicalNotes
      })

      fetchChildren()

      setEditingChild(null)
      setName('')
      setDateOfBirth('')
      setGender('male')
      setMedicalNotes('')
      setError('')

    }
    catch (err) {
      setError(err.response?.data?.message || 'Failed to update child')
    }
  }

  const handleDeleteChild = async (id) => {
          const confirmed = window.confirm(
            'Are you sure you want to delete this child?'
          )

          if (!confirmed) return

          try {
            await axiosInstance.delete(`/child/deleteChild/${id}`)

            toast.success('Child deleted successfully')

            fetchChildren()

          } catch (error) {
            toast.error(
              error.response?.data?.message || 'Failed to delete child'
            )
          }
}

  useEffect(() => {
    fetchChildren()
  }, [])

  return (
  
  <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">
    <div className="max-w-3xl mx-auto">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-baloo text-dc-ink">My Children</h1>
          <p className="text-dc-muted text-sm">Manage your children's information.</p>
        </div>
        <button
          onClick={() => {
            setEditingChild(null)
            setName('')
            setDateOfBirth('')
            setGender('male')
            setMedicalNotes('')
            setShowModal(true)
          }}
          className="bg-gradient-to-br from-dc-blue to-dc-green text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] hover:scale-[1.02] transition"
        >
          + Add Child
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">
        <h2 className="text-lg font-semibold font-baloo text-dc-ink mb-4">My Children</h2>

        {children.length === 0 ? (
          <p className="text-dc-muted text-sm mb-4">No children added yet.</p>
        ) : (
          <div className="space-y-2">
            {children.map((child) => (
              <div key={child._id} className="border-[1.5px] border-dc-border rounded-2xl p-3.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-dc-ink">{child.name}</p>
                  <p className="text-sm text-dc-muted">
                    DOB: {new Date(child.dateOfBirth).toLocaleDateString()} | {child.gender}
                  </p>
                  {child.medicalNotes && (
                    <p className="text-sm text-dc-muted">Notes: {child.medicalNotes}</p>
                  )}
                </div>
                {/* <button
                  type="button"
                  onClick={() => {
                    handleEditClick(child)
                    setShowModal(true)
                  }}
                  className="bg-amber-500 hover:opacity-90 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                >
                  Edit
                </button> */}

                <div className="flex gap-2">
  <button
    type="button"
    onClick={() => {
      handleEditClick(child)
      setShowModal(true)
    }}
    className="bg-amber-500 hover:opacity-90 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() => handleDeleteChild(child._id)}
    className="bg-dc-error-text hover:opacity-90 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
  >
    Delete
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
            {editingChild ? 'Edit Child' : 'Add a Child'}
          </h2>

          {error && (
            <p className="bg-dc-error-bg text-dc-error-text text-sm p-3 rounded-xl mb-4">{error}</p>
          )}

          <form
            onSubmit={async (e) => {
              if (editingChild) {
                await handleUpdateChild(e)
              } else {
                await handleAddChild(e)
              }
              setShowModal(false)
            }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Child's Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
            />
            <input
              type="date"
              value={dateOfBirth}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition appearance-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              placeholder="Medical Notes (optional)"
              value={medicalNotes}
              maxLength={200}
              onChange={(e) => setMedicalNotes(e.target.value)}
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
                {editingChild ? 'Update Child' : 'Add Child'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
)
}

export default ParentChildren

import { useState } from 'react'

const ConfirmModal = ({ title, onCancel, onConfirm, confirmLabel = 'Confirm' }) => {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason..."
          className="w-full border rounded p-2"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) {
                alert('Please enter a reason')
                return
              }
              onConfirm(reason)
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
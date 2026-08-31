
import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'

const OwnerReviews = () => {
  const [daycare, setDaycare] = useState(null)
  const [reviews, setReviews] = useState([])

  const fetchMyDaycare = async () => {
    try {
      const response = await axiosInstance.get('/daycare/getmyDaycare')
      setDaycare(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchReviews = async (daycareId) => {
    try {
      const response = await axiosInstance.get(`/review/daycare/${daycareId}`)
      setReviews(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchMyDaycare()
  }, [])

  useEffect(() => {
    if (daycare) fetchReviews(daycare._id)
  }, [daycare])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold font-baloo text-dc-ink mb-6">Reviews</h1>
        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">
          {reviews.length === 0 ? (
            <p className="text-dc-muted text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-dc-border/60 last:border-0 pb-3">
                  <p className="text-sm font-semibold text-dc-ink">
                    {'⭐'.repeat(r.rating)} — {r.parent?.name}
                  </p>
                  {r.comment && <p className="text-sm text-dc-muted mt-0.5">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OwnerReviews
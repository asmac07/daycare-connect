
const ROLES = {
            ADMIN: 'admin',
            OWNER: 'owner',
            PARENT: 'parent',
            STAFF: 'staff'
         }

const ENROLLMENT_STATUS = {
            PENDING: 'pending',
            APPROVED: 'approved',
            REJECTED: 'rejected',
            CONFIRMED: 'confirmed'
        }

const PAYMENT_STATUS = {
                PENDING: 'pending',
                PAID: 'paid',
                FAILED: 'failed'
            }

const DAYCARE_STATUS = {
            PENDING: 'pending',
            APPROVED: 'approved',
            REJECTED: 'rejected',
            // BLOCKED: 'blocked',
            SUSPENDED: 'suspended'
         }
         

const VISIT_SLOT_STATUS = {
            AVAILABLE: 'available',
            BOOKED: 'booked',
            RESCHEDULE_REQUESTED: 'reschedule_requested',
            CANCELLED: 'cancelled',
            COMPLETED : 'completed'
}

const AGE_GROUPS = {
            INFANT: 'Infant',
            TODDLER: 'Toddler',
            PRESCHOOL: 'Preschool'
}

const USER_STATUS = {
            PENDING: 'pending',
            ACTIVE: 'active',
            REJECTED: 'rejected',
            SUSPENDED: 'suspended',
            BLOCKED: 'blocked'
}

const PACKAGE_PRICES = {
            daily: 300,
            weekly: 1000,
            monthly: 5500
}

module.exports = {
  ROLES,
  ENROLLMENT_STATUS,
  PAYMENT_STATUS,
  DAYCARE_STATUS,
  VISIT_SLOT_STATUS,
  AGE_GROUPS,
  USER_STATUS,
  PACKAGE_PRICES
}
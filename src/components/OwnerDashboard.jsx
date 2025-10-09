import React from 'react'
import { useNavigate } from 'react-router-dom'

const OwnerDashboard = () => {
  const navigate = useNavigate()
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Owner Dashboard</h1>
      
      </div>
    </div>
  )
}

export default OwnerDashboard
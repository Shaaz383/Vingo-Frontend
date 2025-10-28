import React from 'react'
import CategoryCarousel from './UserComponents/CategoryCarousel'
import BestRestaurantsCarousel from './UserComponents/BestRestaurantsCarousel'

const UserDashboard = () => {
  return (
    <div className="p-4 md:p-8">
      <CategoryCarousel />
      <BestRestaurantsCarousel />
    </div>
  )
}

export default UserDashboard
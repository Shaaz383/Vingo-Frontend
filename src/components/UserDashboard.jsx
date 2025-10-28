import React from 'react'
import CategoryCarousel from './UserComponents/CategoryCarousel'
import BestRestaurantsCarousel from './UserComponents/BestRestaurantsCarousel'
import SuggestedItems from './UserComponents/SuggestedItems'

const UserDashboard = () => {
  return (
    <div className="p-4 md:p-8">
      <CategoryCarousel />
      <BestRestaurantsCarousel />
      <SuggestedItems />
    </div>
  )
}

export default UserDashboard
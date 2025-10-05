import React from 'react'
import UserDashboard from '../components/userDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const Home = () => {
    const { userData } = useSelector((state) => state.user);
    if(!userData){
        return <Navigate to="/signin" />
    }
    if(userData.role === 'user'){
        return <UserDashboard />
    }
    if(userData.role === 'owner'){
        return <OwnerDashboard />
    }
    if(userData.role === 'deliveryBoy'){
        return <DeliveryBoy />
    }
  return (
    <div>Home</div>
  )
}

export default Home
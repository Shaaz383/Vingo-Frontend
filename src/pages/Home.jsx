import React from 'react'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Nav from '../components/Nav'

const Home = () => {
    const { userData, isLoadingUser } = useSelector((state) => state.user);
    if(isLoadingUser){
        return null;
    }
    if(!userData){
        return <Navigate to="/signin" />
    }

    let content = null;
    if(userData.role === 'user'){
        content = <UserDashboard />
    } else if(userData.role === 'owner'){
        content = <OwnerDashboard />
    } else if(userData.role === 'deliveryBoy'){
        content = <DeliveryBoy />
    }

  return (
    <div>
        <Nav/>
        {content}
    </div>
  )
}

export default Home
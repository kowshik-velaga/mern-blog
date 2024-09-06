import React from 'react'
import { Link } from "react-router-dom";

const ResetPasswordSuccesfull = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="flex flex-col justify-center items-center space-y-4 w-[80%] md:w-[25%]">
        <div>Your Password Has been reset Successfully</div>
        <h3><Link to="/login">Login?</Link></h3>
      </div>
    </div>
  )
}

export default ResetPasswordSuccesfull

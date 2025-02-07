import React from 'react'
import send from '../../assets/send.svg'
import calendar from '../../assets/calendar.svg'

function Ticket({title, sno, desc, date, status}) {
  return (
    <div className="bg-[#1e1e1e] rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[#005de9] text-xs mb-1">{title}</p>
          <p className='text-white font-medium'>{sno}</p>
        </div>
        <div>
            <img src={send} className='h-4'/>
        </div>
      </div>
      <div className='text-xs text-[#6d6d6d] mb-4'>
        Description: {desc} 
      </div>
      <div className='flex justify-between'>
        <div className='text-[#6d6d6d] flex'>
            <img src={calendar} className='mr-2 h-4'/>
            <p className='text-xs font-thin'>{date}</p>
        </div>
        <div className={status === "Pending"?"text-[#ffa500]":status==="Closed"?"text-[#00c400]":"text-[#c32d2f]"}>
            <div className='flex items-center'>
            <div className={status === "Pending"?"h-2 w-2 rounded-full mr-2 bg-[#ffa500]":status==="Closed"?"h-2 w-2 rounded-full mr-2 bg-[#00c400]":"bg-[#c32d2f] h-2 w-2 rounded-full mr-2"}></div>
            <p className='text-xs font-thin'>{status}</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Ticket
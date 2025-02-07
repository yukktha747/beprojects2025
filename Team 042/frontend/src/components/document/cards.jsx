import React from 'react'
import subwaypin from '../../assets/subway_pin.svg'

function Cards({title, team, desc, date, time, icon}) {
  return (
    <div className="border-b-2 border-[#292929] p-6 font-semibold">
      <div className="mb-8 flex justify-between">
        <div className="flex">
          <div className="">
            <img src={icon} />
          </div>
          <div className="mx-4 ">
            <p className="text-[#868686] text-xs">{team}</p>
            <p>{title}</p>
          </div>
        </div>
        <div className="text-[#868686] flex flex-col items-end text-xs">
          <p>{time}</p>
          <p>{date}</p>
        </div>
      </div>
      <div className="flex mt-6 items-center">
        <div className="px-3">
          <img src={subwaypin} className="h-6" />
        </div>
        <p className="text-[#868686] text-xs mx-3">Description : {desc}</p>
      </div>
    </div>
  );
}

export default Cards
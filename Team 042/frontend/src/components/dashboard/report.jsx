import React from 'react'
import rightarrow from '../../assets/rightarrow.svg'

function Report({title,date,team,icon}) {
  return (
    <div className="text-white flex justify-between py-6 px-4 border-b-2 border-[#1f1f1f] items-center">
      <div className='flex items-center'>
        <div className="mr-3">
          <img src={icon} />
        </div>
        <div>
          <p className="">{title}</p>
          <p className="text-xs text-[#6d6d6d]">
            {date} . {team}
          </p>
        </div>
      </div>
      <div>
        <img src={rightarrow} />
      </div>
    </div>
  );
}

export default Report
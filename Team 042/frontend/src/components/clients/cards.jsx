import React from 'react'
import avatars from '../../assets/avatars.svg'
import manage from "../../assets/manager.svg";
import vertical_menu from "../../assets/vertical_menu.svg";
import { useNavigate } from "react-router-dom";

function Cards({title, team, project, manager,_id}) {

    const navigate = useNavigate();

  return (
    <div className='bg-[#1e1e1e] rounded-xl p-6 pb-2 text-[#6d6d6d] hover:cursor-pointer' onClick={()=>navigate(`/clients/${title}/${_id}`)}>
        <div className='mb-4 flex justify-between'>
            <div>
                <div>
                    <p className='text-[#ffad00] text-xs'>{title}</p>
                </div>
                <div>
                    <p className='text-white'>{team}</p>
                </div>
                <div>
                    <p className='text-xs'>Project: {project}</p>
                </div>
            </div>
            <div>
                <img src={vertical_menu}/>
            </div>
        </div>
        <div className='flex justify-between border-t-2 border-[#272727] py-4'>
           <div className='flex gap-2 items-center text-sm'>
            <div>
                <img src={manage}/>
            </div>
            <div>
                <p>{manager}</p>
            </div>
            </div> 
           <div className='flex gap-2 items-center text-sm'>
            <div>
                <img src={avatars}/>
            </div>
            <div>
                <p>members</p>
            </div>
            </div> 
        </div>        
    </div>
  )
}

export default Cards
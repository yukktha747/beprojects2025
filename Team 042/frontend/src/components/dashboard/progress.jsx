import React from 'react'
import up from "../../assets/up.svg";
import down from "../../assets/down.svg";
import progress1 from '../../assets/progress1.svg'
import progress2 from '../../assets/progress2.svg'
import progress3 from '../../assets/progress3.svg'
import progress4 from '../../assets/progress4.svg'
import progress5 from '../../assets/progress5.svg'

function Progress({title,value,trend,trendvalue,desc}) {
  return (
    <div className="rounded-xl bg-[#1e1e1e] p-3">
      <div className="flex justify-between">
        <div>
          <p className="text-[#afafaf] font-semibold mb-4">{title}</p>
          <div className="flex items-center">
            <p className="text-white text-3xl mr-2 font-bold">{value}</p>
            {trend === "up" ? (
              <img src={up} />
            ) : trend === "down" ? (
              <img src={down} />
            ) : (
              <div></div>
            )}
            <p
              className={
                trend === "up"
                  ? "text-[#008000]"
                  : trend === "down"
                  ? "text-[#c32d2f]"
                  : "hidden"
              }
            >
              {trendvalue}
            </p>
          </div>
        </div>
        <div>
          <img
            src={
              title === "High Intensity"
                ? progress1
                : title === "Medium Intensity"
                ? progress2
                : title === "Critical Intensity"
                ? progress3
                : title === "Low Intensity"
                ? progress4
                : progress5
            }
          />
        </div>
      </div>
      <div className="text-[#6d6d6d] text-sm">{desc}</div>
    </div>
  );
}

export default Progress
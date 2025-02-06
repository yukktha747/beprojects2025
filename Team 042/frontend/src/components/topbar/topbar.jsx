import React, { useEffect } from "react";
import avatar from "../../assets/avatar.png";
import downarrow from "../../assets/down-arrow.svg";
import api from "@/src/api/api";
import left from "../../assets/left.svg";
import { useNavigate } from "react-router-dom";

const Topbar = React.memo(function Topbar({ active }) {
  const [msspDetails, setMsspDetails] = React.useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await api.get(
        "http://localhost:3000/api/v1/client/profile",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setMsspDetails(response.data);
    };
    fetchProfile();
  }, []);

  return (
    <div className="fixed w-[82vw] right-0 h-[12vh] flex items-center justify-center z-10">
      {window.location.pathname !== "/clients" &&
        window.location.pathname !== "/members" &&
        window.location.pathname !== "/database" && (
          <img
            src={left}
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
        )}
      <div className="text-white border-b-2 border-[#1e1e1e] h-full w-[95%] flex justify-end items-center">
        {/* <div>
          <CustomBreadcrumb />
          <div className="text-2xl">{active}</div>
        </div> */}

        <div className="flex items-center">
          <div className="mr-2 flex items-center">
            <img src={avatar} className="h-10" alt="User avatar" />
          </div>
          <div className="mr-12">
            <p className="text-lg">{msspDetails.msspName}</p>
            <p className="text-[0.7rem] font-thin">{msspDetails.role}</p>
          </div>
          <div className="h-[100%] flex items-center">
            <img src={downarrow} alt="Down arrow" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Topbar;

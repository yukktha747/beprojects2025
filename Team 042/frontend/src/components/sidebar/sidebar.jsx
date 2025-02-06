import React, { useState } from "react";
import logo from "../../assets/logo.svg";
import inbox from "../../assets/inbox.svg";
import pin from "../../assets/pin.svg";
import Dashboard from "../../assets/Dashboard.jsx";
import Document from "../../assets/Document.jsx";
import Projects from "../../assets/Projects.jsx";
import Teams from "../../assets/Teams.jsx";
import Tickets from "../../assets/Tickets.jsx";
import help from "../../assets/help.svg";
import logout from "../../assets/logout.svg";
import { toast } from "react-hot-toast";
import Members from "../members/members";

const inboxMessages = ["SZ-L-BIM-WEB...", "SZ-L-TRM-WEB", "SZ-L-NET"];

const menu = [
  { title: "dashboard", component: <Dashboard /> },
  {title:"clients", component:<Teams />},
  {title:"members", component:<Teams />},
  {title:"database", component:<Teams/>},
];


const Sidebar = ({activePage}) => {
  const [, setActivePage] = useState("");

  const handleNavClick = (page) => {
    setActivePage(page);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.success("Loggeed out successfully");
    window.location.reload();
  };
  return (
    <div className="bg-[#111214] z-10 text-[#888889] h-screen w-[18vw] p-[25px] flex flex-col justify-between border-r-2 border-[#272932] fixed">
      <div className="flex flex-col justify-between h-full">
        {/* Logo/Header */}
        <div className="w-full">
          <div className="mb-5 flex items-center justify-center">
            <img src={logo} alt="SyncZero Logo" className="mb-2 w-48" />
          </div>
          <nav className="">
            <h1 className="text-xs font-medium p-3">MAIN</h1>
            <ul>
              {menu.map((menuItem) => (
                <li
                  className={`mb-2 cursor-pointer px-2 py-1 rounded-lg font-semibold hover:bg-[#313131] hover:text-white ${
                    activePage === menuItem.title
                      ? "bg-[#313131] text-white"
                      : ""
                  }`}
                  onClick={() => handleNavClick(menuItem.title)}
                >
                  <a
                    href={`/${menuItem.title}`}
                    className="flex items-center space-x-4 m-2 hover:text-white"
                  >
                    {menuItem.component}
                    <span>{menuItem.title.charAt(0).toUpperCase() + menuItem.title.slice(1)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="font-semibold px-2">
          <div className="mb-4">
            <a
              href="#help-support"
              className="hover:text-gray-400 flex space-x-3"
            >
              <img src={help} />
              <span>Help & Support</span>
            </a>
          </div>
          <div>
            <a href="#logout" className="text-[#cc8889] flex space-x-3" onClick={handleLogout}>
              <img src={logout} />
              <span>Logout</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

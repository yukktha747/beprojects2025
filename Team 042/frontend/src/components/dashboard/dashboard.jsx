import React, { useState } from "react";
import topbg from "../../assets/topbg.png";
import reportlogo from "../../assets/reportlogo.svg";
import bglogo from "../../assets/bglogo.svg";
import Topbar from "../topbar/topbar";
import { Calendar } from "@/components/ui/calendar";
import Report from "./report.jsx";
import Progress from "./progress.jsx";
import overviewCard from "../../assets/overviewCard.svg";
import chartCard from "../../assets/chartCard.svg";
import Ticket from "./ticket.jsx";
import Sidebar from "../sidebar/sidebar.jsx";

const reports = [
  {
    title: "Report Name",
    date: "June 30, 2024",
    team: "Team Name",
    icon: { reportlogo },
  },
  {
    title: "Report Name",
    date: "June 30, 2024",
    team: "Team Name",
    icon: { reportlogo },
  },
  {
    title: "Report Name",
    date: "June 30, 2024",
    team: "Team Name",
    icon: { reportlogo },
  },
  {
    title: "Report Name",
    date: "June 30, 2024",
    team: "Team Name",
    icon: { reportlogo },
  },
  {
    title: "Report Name",
    date: "June 30, 2024",
    team: "Team Name",
    icon: { reportlogo },
  },
];
const progresses = [
  {
    title: "High Intensity",
    value: "82",
    trend: "down",
    trendvalue: "13.5",
    desc: "high-risk bugs found out of 50 tests.",
  },
  {
    title: "Medium Intensity",
    value: "14",
    trend: "up",
    trendvalue: "13.5",
    desc: "issues need regular attention.",
  },
  {
    title: "Critical Intensity",
    value: "71",
    trend: "up",
    trendvalue: "13.5",
    desc: "critical issues ressolved this month",
  },
  {
    title: "Low Intensity",
    value: "32",
    trend: "up",
    trendvalue: "13.5",
    desc: "issues resolved in maintenance.",
  },
  {
    title: "Informational",
    value: "46",
    trend: "",
    trendvalue: "13.5",
    desc: "Non-critical, no immediate impact.",
  },
];
const tickets = [
  {
    title: "Vulnerability",
    sno: "TCKT0000156",
    desc: "Lorem ipsum dolor sit amet, adipiscing elit Aene...",
    date: "June 30, 2024",
    status: "Pending",
  },
  {
    title: "Vulnerability",
    sno: "TCKT0000156",
    desc: "Lorem ipsum dolor sit amet, adipiscing elit Aene...",
    date: "June 30, 2024",
    status: "Closed",
  },
  {
    title: "Vulnerability",
    sno: "TCKT0000156",
    desc: "Lorem ipsum dolor sit amet, adipiscing elit Aene...",
    date: "June 30, 2024",
    status: "On Progress",
  },
];
function Dashboard() {
  const [date, setDate] = useState(new Date());
  console.log(":hi")
  return (
    <div className="relative">
      {/* "Coming Soon" message centered */}

      {/* <Topbar active="Dashboard" className="" /> */}
      <Sidebar activePage="dashboard" />

      {/* Blurred background image */}
      <img src={topbg} className="absolute w-[81vw] right-0 blur-sm" />

      {/* Main content with blur effect */}
      <div className="">
        {/* <div className="flex items-center justify-center absolute inset-0 z-20 h-screen ml-80">
          <div className="flex flex-col items-center bg-opacity-75 bg-black text-white border border-gray-600 p-8 rounded-lg shadow-xl space-y-4 animate-pulse fixed">
            <h1 className="text-4xl font-bold tracking-wide">Coming Soon</h1>
            <p className="text-lg text-gray-400">
              We're working hard to bring you something amazing!
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-green-400 rounded-lg">
              <div className="h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg animate-progress-bar"></div>
            </div>
          </div>
        </div> */}
        <div className="flex items-end justify-end "> {/*blur-sm*/}
          <div className="h-full w-[81vw] px-2 py-6 top-24 flex justify-around relative">
            <div className="min-h-screen w-[67%] flex flex-col">
              <div className="rounded-xl bg-[#171717] z-0">
                <img src={bglogo} className="absolute -z-10" />
                <div className="h-full w-full p-6 grid grid-cols-3 gap-4">
                  <div className="text-white py-4 px-2">
                    <p className="text-2xl font-semibold">Morning, Andrew</p>
                    <p className="text-[#a7a7a7] text-sm">
                      Track & manage your team progress here!
                    </p>
                  </div>
                  {progresses.map((progress) => (
                    <Progress
                      title={progress.title}
                      value={progress.value}
                      trend={progress.trend}
                      trendvalue={progress.trendvalue}
                      desc={progress.desc}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between my-4 gap-2">
                <img src={overviewCard} className="w-[67%]" />
                <img src={chartCard} className="w-[33%]" />
              </div>

              <div className="px-6 bg-[#171717] rounded-xl">
                <div className="py-6 flex justify-between border-b border-[#2b2b2b]">
                  <p className="font-bold text-[#afafaf]">Recent Tickets</p>
                  <p className="text-[#005de9] text-sm">View All</p>
                </div>
                <div className="py-6 grid grid-cols-3 gap-4">
                  {tickets.map((ticket) => (
                    <Ticket
                      title={ticket.title}
                      sno={ticket.sno}
                      desc={ticket.desc}
                      date={ticket.date}
                      status={ticket.status}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="min-h-screen w-[28%]">
              <div className="bg-[#171717] rounded-t-xl">
                <div className="text-white px-4 pt-4 rounded-t-xl text-lg text-center">
                  Calendar
                </div>
                <div className="px-4 pb-2">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="bg-[#171717] text-white h-72"
                  />
                </div>
              </div>

              <div className="bg-[#171717] px-4 rounded-b-xl">
                <div className="border-t-2 border-[#1f1f1f] py-4">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-lg text-white">Latest Report</p>
                    <p className="text-[#005de9] text-sm">View All</p>
                  </div>
                  <div>
                    {reports.map((report) => (
                      <Report
                        title={report.title}
                        date={report.date}
                        team={report.team}
                        icon={reportlogo}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

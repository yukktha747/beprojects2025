import React, { useState } from "react";
import Topbar from "../topbar/topbar.jsx";
import Sidebar from "../sidebar/sidebar.jsx";
import webapp from "../../assets/webapp.svg";
import filter from "../../assets/filter.svg";
import display from "../../assets/display.svg";
import plus from "../../assets/plus.svg";
import left from "../../assets/left.svg";
import right from "../../assets/right.svg";
import avatar from "../../assets/avatar.png";
import back from "../../assets/back.svg";
import bug from "../../assets/bug.svg";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeatMap from "@uiw/react-heat-map";

const members = [
  {
    name: "Carla Dokidis",
    eid: "EMP0001234",
    manager: "Omar Franci",
    status: "Complete",
  },
  {
    name: "Ahmad Press",
    eid: "EMP0001234",
    manager: "Nolan Schleifer",
    status: "Pending",
  },
  {
    name: "Justin Levin",
    eid: "EMP0001234",
    manager: "Alfredo Dokidis",
    status: "Denied",
  },
  {
    name: "Desirae Siphore",
    eid: "EMP0001234",
    manager: "Jakob Saris",
    status: "Complete",
  },
  {
    name: "Aspen George",
    eid: "EMP0001234",
    manager: "Alfredo Septimus",
    status: "Denied",
  },
  {
    name: "Emery Rosser",
    eid: "EMP0001234",
    manager: "Justin Torff",
    status: "Pending",
  },
  {
    name: "Aspen George",
    eid: "EMP0001234",
    manager: "Alfredo Septimus",
    status: "Denied",
  },
  {
    name: "Emery Rosser",
    eid: "EMP0001234",
    manager: "Justin Torff",
    status: "Pending",
  },
];

const value = [
  { date: "2024/01/01", count: 15 },
  { date: "2024/01/02", count: 28 },
  { date: "2024/01/03", count: 7 },
  { date: "2024/01/04", count: 32 },
  { date: "2024/01/05", count: 14 },
  { date: "2024/01/06", count: 18 },
  { date: "2024/01/07", count: 37 },
  { date: "2024/01/08", count: 20 },
  { date: "2024/01/09", count: 6 },
  { date: "2024/01/10", count: 23 },
  { date: "2024/01/11", count: 2 },
  { date: "2024/01/12", count: 20 },
  { date: "2024/01/13", count: 12 },
  { date: "2024/01/14", count: 25 },
  { date: "2024/01/15", count: 33 },
  { date: "2024/01/16", count: 39 },
  { date: "2024/01/17", count: 9 },
  { date: "2024/01/18", count: 30 },
  { date: "2024/01/19", count: 19 },
  { date: "2024/01/20", count: 36 },
  { date: "2024/01/21", count: 17 },
  { date: "2024/01/22", count: 29 },
  { date: "2024/01/23", count: 24 },
  { date: "2024/01/24", count: 13 },
  { date: "2024/01/25", count: 40 },
  { date: "2024/01/26", count: 26 },
  { date: "2024/01/27", count: 3 },
  { date: "2024/01/28", count: 21 },
  { date: "2024/01/29", count: 4 },
  { date: "2024/01/30", count: 35 },
  { date: "2024/01/31", count: 10 },
  { date: "2024/02/01", count: 11 },
  { date: "2024/02/02", count: 16 },
  { date: "2024/02/03", count: 34 },
  { date: "2024/02/04", count: 5 },
  { date: "2024/02/05", count: 38 },
  { date: "2024/02/06", count: 8 },
  { date: "2024/02/07", count: 22 },
  { date: "2024/02/08", count: 27 },
  { date: "2024/02/09", count: 31 },
  { date: "2024/02/10", count: 2 },
  { date: "2024/02/11", count: 30 },
  { date: "2024/02/12", count: 15 },
  { date: "2024/02/13", count: 19 },
  { date: "2024/02/14", count: 23 },
  { date: "2024/02/15", count: 28 },
  { date: "2024/02/16", count: 7 },
  { date: "2024/02/17", count: 33 },
  { date: "2024/02/18", count: 13 },
  { date: "2024/02/19", count: 26 },
  { date: "2024/02/20", count: 32 },
  { date: "2024/02/21", count: 6 },
  { date: "2024/02/22", count: 20 },
  { date: "2024/02/23", count: 14 },
  { date: "2024/02/24", count: 25 },
  { date: "2024/02/25", count: 21 },
  { date: "2024/02/26", count: 4 },
  { date: "2024/02/27", count: 38 },
  { date: "2024/02/28", count: 9 },
  { date: "2024/02/29", count: 18 },
  { date: "2024/03/01", count: 16 },
  { date: "2024/03/02", count: 5 },
  { date: "2024/03/03", count: 31 },
  { date: "2024/03/04", count: 34 },
  { date: "2024/03/05", count: 11 },
  { date: "2024/03/06", count: 35 },
  { date: "2024/03/07", count: 29 },
  { date: "2024/03/08", count: 12 },
  { date: "2024/03/09", count: 17 },
  { date: "2024/03/10", count: 10 },
  { date: "2024/03/11", count: 22 },
  { date: "2024/03/12", count: 27 },
  { date: "2024/03/13", count: 8 },
  { date: "2024/03/14", count: 36 },
  { date: "2024/03/15", count: 2 },
  { date: "2024/03/16", count: 3 },
  { date: "2024/03/17", count: 40 },
  { date: "2024/03/18", count: 30 },
  { date: "2024/03/19", count: 24 },
  { date: "2024/03/20", count: 28 },
  { date: "2024/03/21", count: 33 },
  { date: "2024/03/22", count: 19 },
  { date: "2024/03/23", count: 32 },
  { date: "2024/03/24", count: 9 },
  { date: "2024/03/25", count: 39 },
  { date: "2024/03/26", count: 23 },
  { date: "2024/03/27", count: 26 },
  { date: "2024/03/28", count: 15 },
  { date: "2024/03/29", count: 13 },
  { date: "2024/03/30", count: 6 },
  { date: "2024/03/31", count: 38 },
  { date: "2024/04/01", count: 14 },
  { date: "2024/04/02", count: 37 },
  { date: "2024/04/03", count: 7 },
  { date: "2024/04/04", count: 25 },
  { date: "2024/04/05", count: 20 },
  { date: "2024/04/06", count: 16 },
  { date: "2024/04/07", count: 18 },
  { date: "2024/04/08", count: 22 },
  { date: "2024/04/09", count: 3 },
  { date: "2024/04/10", count: 11 },
  { date: "2024/04/11", count: 39 },
  { date: "2024/04/12", count: 12 },
  { date: "2024/04/13", count: 21 },
  { date: "2024/04/14", count: 8 },
  { date: "2024/04/15", count: 27 },
  { date: "2024/04/16", count: 4 },
  { date: "2024/04/17", count: 35 },
  { date: "2024/04/18", count: 31 },
  { date: "2024/04/19", count: 5 },
  { date: "2024/04/20", count: 29 },
  { date: "2024/04/21", count: 17 },
  { date: "2024/04/22", count: 13 },
  { date: "2024/04/23", count: 34 },
  { date: "2024/04/24", count: 2 },
  { date: "2024/04/25", count: 40 },
  { date: "2024/04/26", count: 15 },
  { date: "2024/04/27", count: 6 },
  { date: "2024/04/28", count: 26 },
  { date: "2024/04/29", count: 14 },
  { date: "2024/04/30", count: 24 },
  { date: "2024/05/01", count: 18 },
  { date: "2024/05/02", count: 22 },
  { date: "2024/05/03", count: 32 },
  { date: "2024/05/04", count: 33 },
  { date: "2024/05/05", count: 10 },
  { date: "2024/05/06", count: 19 },
  { date: "2024/05/07", count: 7 },
  { date: "2024/05/08", count: 28 },
  { date: "2024/05/09", count: 37 },
  { date: "2024/05/10", count: 9 },
  { date: "2024/05/11", count: 20 },
  { date: "2024/05/12", count: 21 },
  { date: "2024/05/13", count: 36 },
  { date: "2024/05/14", count: 30 },
  { date: "2024/05/15", count: 12 },
  { date: "2024/05/16", count: 11 },
  { date: "2024/05/17", count: 23 },
  { date: "2024/05/18", count: 27 },
  { date: "2024/05/19", count: 16 },
  { date: "2024/05/20", count: 8 },
  { date: "2024/05/21", count: 39 },
  { date: "2024/05/22", count: 3 },
  { date: "2024/05/23", count: 31 },
  { date: "2024/05/24", count: 13 },
  { date: "2024/05/25", count: 5 },
  { date: "2024/05/26", count: 35 },
  { date: "2024/05/27", count: 38 },
  { date: "2024/05/28", count: 4 },
  { date: "2024/05/29", count: 17 },
  { date: "2024/05/30", count: 25 },
];

function Members() {
  const [activeTab, setActiveTab] = useState("vf");

  return (
    <div className="relative">
      <Sheet>
        <div>
          <Topbar active="Teams" />
          <Sidebar activePage="members" />
          <div className="flex items-end justify-end ">
            <div className="">
              {/* <div className="flex items-center justify-center absolute inset-0 z-20 h-screen ml-80">
                <div className="flex flex-col items-center bg-opacity-75 bg-black text-white border border-gray-600 p-8 rounded-lg shadow-xl space-y-4 animate-pulse fixed">
                  <h1 className="text-4xl font-bold tracking-wide">
                    Coming Soon
                  </h1>
                  <p className="text-lg text-gray-400">
                    We're working hard to bring you something amazing!
                  </p>
                  <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-green-400 rounded-lg">
                    <div className="h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg animate-progress-bar"></div>
                  </div>
                </div>
              </div> */}
            </div>
            <div className="text-white h-full w-[80vw] px-4 pr-8 py-6 top-24 relative">
              <div className="h-full w-full bg-[#171717] rounded-xl p-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="flex gap-2 mb-2 items-center">
                      <p className="text-2xl">Team Name</p>
                      <p className="text-[#00df80] text-xs bg-[#192f26] rounded-md py-1 px-6">
                        Complete
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div>
                        <img src={webapp} />
                      </div>
                      <p className="text-[#8a8a8a] text-xs">Web App</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <p>
                        <span className="text-xs text-[#535353]">
                          Managed by :{" "}
                        </span>
                        Omar Franci
                      </p>
                    </div>
                    <div>
                      <p>July 1, 2024 - August 1, 2024</p>
                    </div>
                  </div>
                </div>
                <div className="w-full rounded-lg bg-[#1e1e1e]">
                  <div className="p-6 border-b-2 border-[#292929]">
                    <div className="text-xl mb-4">List of Team Member</div>
                    <div className="flex justify-between w-full mb-8 h-8">
                      <div className="flex rounded-lg border-2 border-[#292929] w-[20%]">
                        <div className="flex gap-2 items-center justify-center border-r-2 border-[#292929] w-1/2 m-2">
                          <img src={filter} />
                          <p className="text-[#868686]">Filter</p>
                        </div>
                        <div className="flex gap-2 items-center justify-center m-2 w-1/2">
                          <img src={display} />
                          <p className="text-[#868686]">Display</p>
                        </div>
                      </div>
                      {/* <AlertDialogTrigger> */}
                      <div className="p-2 flex rounded-lg bg-[#005de9] items-center">
                        <img src={plus} className="h-4 mx-2" />
                        <p className="mr-2 text-sm">Add Member</p>
                      </div>
                      {/* </AlertDialogTrigger> */}
                    </div>
                  </div>
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow className="text-[#747474] border-0">
                          <TableHead className="w-[30%] text-start px-8 py-5">
                            Name
                          </TableHead>
                          <TableHead className="w-[27%] text-start">
                            Employee ID
                          </TableHead>
                          <TableHead className="w-[28%] text-start">
                            Manager
                          </TableHead>
                          <TableHead className="w-[25%] text-start">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member, idx) => (
                          <TableRow
                            key={idx}
                            className={`border-0 hover:cursor-pointer ${
                              idx % 2 === 0 ? "bg-[#1b1b1b]" : ""
                            }`}
                          >
                            <TableCell className="w-[30%] text-start px-8">
                              <SheetTrigger>{member.name}</SheetTrigger>
                            </TableCell>
                            <TableCell className="w-[27%] text-start">
                              <SheetTrigger>{member.eid}</SheetTrigger>
                            </TableCell>
                            <TableCell className="w-[28%] text-start">
                              <SheetTrigger>{member.manager}</SheetTrigger>
                            </TableCell>
                            <TableCell className="w-[25%] text-start">
                              <div
                                className={`rounded-md text-xs p-2 flex items-center justify-center w-[70%] ${
                                  member.status === "Complete"
                                    ? "bg-[#00874d]"
                                    : member.status === "Pending"
                                    ? "bg-[#c69a00]"
                                    : "bg-[#cb0000]"
                                }`}
                              >
                                <SheetTrigger>{member.status}</SheetTrigger>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="my-8 flex justify-between w-full">
                  <div className="flex gap-4 items-center">
                    <div className="text-xs text-[#a2a1a8]">Showing</div>
                    <div>
                      <select className="p-1 text-xs rounded-md bg-inherit border-2 border-[#292929]">
                        <option className="bg-[#171717]">10</option>
                        <option className="bg-[#171717]">9</option>
                        <option className="bg-[#171717]">8</option>
                        <option className="bg-[#171717]">7</option>
                        <option className="bg-[#171717]">6</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-xs text-[#a2a1a8]">
                    <p>Showing 1 to 10 out of 60 records</p>
                  </div>
                  <div className="flex gap-2 items-center text-[#a2a1a8]">
                    <div>
                      <img src={left} />
                    </div>
                    <div className="text-xs p-1 px-2 text-[#0066ff] border border-[#0066ff] rounded-md">
                      <p>1</p>
                    </div>
                    <div className="text-xs p-1 px-2">
                      <p>2</p>
                    </div>
                    <div className="text-xs p-1 px-2">
                      <p>3</p>
                    </div>
                    <div className="text-xs p-1 px-2">
                      <p>4</p>
                    </div>
                    <div>
                      <img src={right} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <SheetContent className="fixed top-0 right-0 w-screen bg-black/50">
          <div className="absolute top-0 right-0 z-50 min-h-screen text-white border-0 w-[38vw] bg-[#1c1c1c] p-8 flex flex-col justify-between">
            <div className="w-full h-full">
              <div>
                <SheetClose>
                  <img
                    src={back}
                    className="pr-4 border-r-2 border-[#393939]"
                  />
                </SheetClose>
              </div>
              <div className="py-4">
                <div className="flex gap-4 w-full">
                  <div>
                    <img src={avatar} className="h-28" />
                  </div>
                  <div className="py-2 w-[75%]">
                    <div>
                      <div className="flex gap-2 mb-6 items-center">
                        <p className="text-3xl">Carla Dokidis</p>
                        <p className="text-[#00df80] text-xs bg-[#192f26] rounded-md py-1 px-6">
                          Complete
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex flex-col items-start gap-2">
                        <div className="text-xs">
                          <p>
                            <span className="text-[#535353] text-xs">
                              Employee ID:{" "}
                            </span>
                            EMP0001234
                          </p>
                        </div>
                        <div className="text-xs">
                          <p>
                            <span className="text-[#535353] text-xs">
                              Email ID:{" "}
                            </span>
                            employee@email.com
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs">
                          <p>
                            <span className="text-[#535353] text-xs">
                              Managed by:{" "}
                            </span>
                            Omar Franci
                          </p>
                        </div>
                        <div className="text-xs">
                          <p>
                            <span className="text-[#535353] text-xs">
                              Contact No:{" "}
                            </span>
                            +91-123456789
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <Tabs defaultValue="account" className="w-full">
                  <TabsList>
                    <TabsTrigger
                      value="account"
                      className={`w-[50%] text-md py-2 ${
                        activeTab === "vf"
                          ? "text-[#005de9] border-b-2 border-[#005de9]"
                          : ""
                      }`}
                    >
                      <p onClick={() => setActiveTab("vf")}>
                        Vulnerabilities found
                      </p>
                    </TabsTrigger>
                    <TabsTrigger
                      value="password"
                      className={`w-[50%] text-md py-2 ${
                        activeTab === "pwo"
                          ? "text-[#005de9] border-b-2 border-[#005de9]"
                          : ""
                      }`}
                    >
                      <p onClick={() => setActiveTab("pwo")}>
                        Projects worked on
                      </p>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    <div className="my-5 rounded-lg bg-[#242424] p-6">
                      <div className="flex gap-4 items-center">
                        <div>
                          <img src={bug} />
                        </div>
                        <div>
                          <div>
                            <h1>Vulnerabilities</h1>
                          </div>
                          <div className="text-xs">
                            <p>Goal : 3000 Vulnerabilities / 365 Days</p>
                          </div>
                        </div>
                      </div>
                      <div className="pb-4 pt-8 flex">
                        <div className="border-r border-[#5e6064] basis-1/4">
                          <p className="font-semibold">
                            218 <span className="text-xs">Days</span>
                          </p>
                          <div className="text-[#bdbdbd] text-sm">Finished</div>
                        </div>
                        <div className="border-r border-[#5e6064] basis-1/4 flex flex-col items-center">
                          <p className="font-semibold">
                            2180 <span className="text-xs">Bugs</span>
                          </p>
                          <div className="text-[#bdbdbd] text-sm">
                            Vulnerabilities
                          </div>
                        </div>
                        <div className="border-r border-[#5e6064] basis-1/4 flex flex-col items-center">
                          <p className="font-semibold">
                            71 <span className="text-xs">%</span>
                          </p>
                          <div className="text-[#bdbdbd] text-sm">
                            Completed
                          </div>
                        </div>
                        <div className="basis-1/4 flex flex-col items-center">
                          <p className="font-semibold">
                            145 <span className="text-xs">Days</span>
                          </p>
                          <div className="text-[#bdbdbd] text-sm">Left</div>
                        </div>
                      </div>
                      <div className="text-white border-b-2 border-[#b0c8ec]">
                        <HeatMap
                          value={value}
                          width={600}
                          weekLabels={[
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                          ]}
                          startDate={new Date("2024/01/01")}
                          style={{ color: "#ffffff" }}
                          endDate={new Date("2024/05/30")}
                          legendRender={(props) => (
                            <rect {...props} y={props.y + 10} rx={4} />
                          )}
                          rectProps={{
                            rx: 3,
                          }}
                          rectSize={18}
                          space={4}
                          className="w-full py-4 pb-12 text-white font-bold"
                          panelColors={{
                            10: "#b0c8ec",
                            20: "#004ec2",
                            40: "#002357",
                          }}
                        />
                      </div>
                      <div className="flex py-4 text-xs items-center justify-between">
                        <div className="">
                          <p>Recent Activities :</p>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="rounded-full border border-[#b0c8ec] px-2 py-1 flex gap-1 items-center">
                            <div className="bg-[#c32d2f] rounded-full w-2 h-2"></div>
                            <div>
                              <p>All</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="rounded-full p-1 flex gap-1 items-center">
                            <div className="bg-[#002357] rounded-full w-2 h-2"></div>
                            <div>
                              <p>Found</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="rounded-full p-1 flex gap-1 items-center">
                            <div className="bg-[#004ec2] rounded-full w-2 h-2"></div>
                            <div>
                              <p>Partial Found</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="rounded-full p-1 flex gap-1 items-center">
                            <div className="bg-[#b0c8ec] rounded-full w-2 h-2"></div>
                            <div>
                              <p>Fail</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="password">
                    <div className="w-full h-[50vh] text-2xl flex items-center justify-center">
                      <div>
                        <hi>Nothing here</hi>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default Members;

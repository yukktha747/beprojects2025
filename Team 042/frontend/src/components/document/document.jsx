import React from "react";
import Topbar from "../topbar/topbar";
import plus from "../../assets/plus.svg";
import search from "../../assets/search.svg";
import filter from "../../assets/filter.svg";
import trash from "../../assets/trash.svg";
import star from "../../assets/star.svg";
import undo from "../../assets/undo.svg";
import redo from "../../assets/redo.svg";
import dropfolder from "../../assets/dropfolder.svg";
import pdficon from "../../assets/pdficon.svg";
import close from "../../assets/close.svg";
import imageicon from "../../assets/imageicon.svg";
import download from "../../assets/download.svg";
import reportlogo from "../../assets/reportlogo.svg";
import Cards from "./cards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Sidebar from "../sidebar/sidebar";



const cards = [
  {
    title: "Project name",
    team: "Team Name",
    desc: "BAC on add new delegation using reponse manuputation",
    date: "June 30, 2024",
    time: "8:56 PM",
  },
  {
    title: "Project name",
    team: "Team Name",
    desc: "BAC on add new delegation using reponse manuputation",
    date: "June 30, 2024",
    time: "8:56 PM",
  },
  {
    title: "Project name",
    team: "Team Name",
    desc: "BAC on add new delegation using reponse manuputation",
    date: "June 30, 2024",
    time: "8:56 PM",
  },
  {
    title: "Project name",
    team: "Team Name",
    desc: "BAC on add new delegation using reponse manuputation",
    date: "June 30, 2024",
    time: "8:56 PM",
  },
  {
    title: "Project name",
    team: "Team Name",
    desc: "BAC on add new delegation using reponse manuputation",
    date: "June 30, 2024",
    time: "8:56 PM",
  },
  {
    title: "Project name",
    team: "Team Name",
    desc: "BAC on add new delegation using reponse manuputation",
    date: "June 30, 2024",
    time: "8:56 PM",
  },
];

function Document() {
  return (
    <AlertDialog>
      <div>
        <Topbar active="Document" />
        <Sidebar activePage="Document" />
        <div className="flex items-end justify-end ">
          <div className="text-white h-full w-[80vw] px-4 pr-8 py-6 top-24 relative">
            <div className="flex justify-between w-full mb-8">
              <div className="flex gap-4">
                <div>
                  <div className="bg-[#171717] border-2 border-[#292929] rounded-lg p-2 flex">
                    <img src={search} className="mx-2" />
                    <input
                      className="bg-[#171717] mx-2 border-none focus:outline-0 w-80"
                      placeholder="Search"
                    />
                  </div>
                </div>
                <div className="flex rounded-lg border-2 border-[#292929] px-8">
                  <div className="flex gap-2 items-center">
                    <img src={filter} />
                    <p className="text-[#868686]">Filter</p>
                  </div>
                </div>
              </div>
              <AlertDialogTrigger>
                <div className="p-2 flex rounded-lg bg-[#005de9] items-center">
                  <img src={plus} className="h-4 mx-2" />
                  <p className="mr-2">Add New Document</p>
                </div>
              </AlertDialogTrigger>
            </div>
            <div className="w-full bg-[#171717] rounded-xl flex">
              <div className="border-r-2 border-[#292929] w-[30%]">
                <div className="text-2xl font-bold p-6 pt-8">
                  <h1>Latest Document</h1>
                </div>
                {cards.map((card) => (
                  <Cards
                    title={card.title}
                    team={card.team}
                    desc={card.desc}
                    date={card.date}
                    time={card.time}
                    icon={reportlogo}
                  />
                ))}
              </div>
              <div className="text-[#868686] w-[70%] font-semibold">
                <div className="border-b-2 border-[#292929] flex justify-between px-6 pb-4 pt-6 w-full">
                  <div className="flex items-center">
                    <img src={reportlogo} className="h-12 mr-2" />
                    <div className="mx-2 ">
                      <p className="text-[#868686] text-xs">Team Name</p>
                      <p className="text-white">Project name</p>
                    </div>
                  </div>
                  <div className="flex justify-between gap-12 items-center">
                    <img src={trash} className="h-5" />
                    <img src={star} className="h-5" />
                    <img src={undo} className="h-6" />
                    <img src={redo} className="h-6" />
                  </div>
                </div>
                <div className="px-6 py-10">
                  <div className="flex justify-between items-center">
                    <div className="">
                      <p className="text-[#868686]">Team Name</p>
                      <p className="text-white text-2xl">SZ-L-BIM-WEB-170724</p>
                    </div>
                    <div className="text-[#868686] flex flex-col items-end text-sm">
                      <p>8:56 PM</p>
                      <p>June 30, 2024</p>
                    </div>
                  </div>
                  <div className="mt-12 mb-10">
                    <p>
                      <span className="font-medium">Description</span> : BAC on
                      add new delegation using reponse manuputation
                    </p>
                  </div>
                  <div className="font-medium">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Aenean fringilla ante a fermentum laoreet. Fusce
                      condimentum blandit velit, nec commodo purus fermentum
                      vel.
                    </p>
                    <div className="px-8 py-6">
                      <ul className="list-disc">
                        <li>
                          Proin suscipit lacus nisl, in condimentum nisl
                          pharetra at.
                        </li>
                        <li>
                          Nulla ultricies felis quis tortor pharetra, eget
                          ornare urna tincidunt.
                        </li>
                        <li>
                          Nam dignissim turpis posuere venenatis venenatis. In
                          placerat auctor malesuada.
                        </li>
                        <li>
                          Fusce condimentum blandit velit, nec commodo purus
                          fermentum vel.
                        </li>
                        <li>
                          Nulla ultricies felis quis tortor pharetra, eget
                          ornare urna tincidunt.
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-8 my-8">
                    <div className="px-6 py-2 bg-[#12223c] rounded-xl flex gap-4 items-center">
                      <img src={pdficon} />
                      <div className="mr-6">
                        <p className="text-white">Brief Details</p>
                        <p>50.50 MB</p>
                      </div>
                      <div>
                        <img src={download} />
                      </div>
                    </div>
                    <div className="px-6 py-2 bg-[#001b47] rounded-xl flex gap-4 items-center">
                      <img src={imageicon} />
                      <div className="mr-6">
                        <p className="text-white">Brief Details</p>
                        <p>50.50 MB</p>
                      </div>
                      <div>
                        <img src={download} />
                      </div>
                    </div>
                  </div>
                  <div className="border-dashed border-2 my-16 border-[#868686] w-full flex justify-center items-center p-12 rounded-xl">
                    <div className="flex flex-col items-center">
                      <img src={dropfolder} />
                      <p className="underline text-[#c0c0c0] m-2">
                        Drop File Here
                      </p>
                      <p className="text-xs">PDF.DOC,XLSL images, etc.</p>
                      <p className="text-xs">Files with max size of 15 MB.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AlertDialogContent className="fixed top-0 left-0 z-50 text-white border-0 h-screen w-screen bg-black/50 flex items-center justify-center">
        <div className="absolute bg-[#1c1c1c] rounded-xl px-4 pb-4 w-[35vw]">
          <AlertDialogCancel className="w-full flex justify-end border-none p-0 bg-[#1c1c1c]">
            <img src={close} />
          </AlertDialogCancel>
          <AlertDialogHeader className="flex flex-col items-start pb-3 border-b-2 border-[#373737] w-full">
            <AlertDialogTitle className="text-2xl">
              New Document
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#7e7e7e]">
              Enter Details for Software Vulnerability Assessment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-6">
            <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4">
              <label className="font-semibold">Project Name</label>
              <input
                type="text"
                className="bg-[#272727] font-thin w-full focus:outine-0 focus:border-0 p-3 rounded-lg"
                placeholder="Enter name of the project"
              />
            </div>
            <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4">
              <label className="font-semibold">Teams Name</label>
              <input
                type="text"
                className="bg-[#272727] font-thin w-full focus:outine-0 p-3 rounded-lg"
                placeholder="Enter team name"
              />
            </div>
            <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4">
              <label className="font-semibold">Date</label>
              <input
                type="date"
                className="bg-[#272727] font-thin w-full focus:outine-0 p-3 rounded-lg"
                placeholder="Select Date"
              />
            </div>
            <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4">
              <label className="font-semibold">Description</label>
              <textarea
                className="bg-[#272727] font-thin w-full focus:outine-0 p-3 rounded-lg"
                placeholder="Enter Description"
              />
            </div>
          </div>
          <AlertDialogFooter className="flex gap-3 items-center justify-end">
            <AlertDialogCancel className="rounded-lg border-2 border-[#1368e8] bg-[#1c1c1c]  px-8 my-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="rounded-lg bg-[#1368e8] px-8 my-2">
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default Document;

import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/sidebar.jsx";
import Topbar from "../topbar/topbar.jsx";
import filter from "../../assets/filter.svg";
import display from "../../assets/display.svg";
import plus from "../../assets/plus.svg";
import close from "../../assets/close.svg";
import Cards from "./cards.jsx";
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
import axios from "axios";
import { toast } from "react-hot-toast";
import api from "@/src/api/api.js";

const teams = [
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
  {
    title: "Vulnerability",
    team: "Team Name",
    project: "SZ-L-MMC-WEB-130624",
    manager: "Manager Name",
  },
];

function Clients() {
  const [clients, setClients] = useState([]);
  const [clientDetails, setClientDetails] = useState({
    clientName: "",
    clientEmail: "",
    managerName: "",
    managerEmail: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    const fetchClients = async () => {
      const response = await api.get(
        "http://localhost:3000/api/v1/client/get-clients/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setClients(response.data);
      };
    fetchClients();
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await api.post(
        "http://localhost:3000/api/v1/client/create-client/",
        clientDetails,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Client Added Successfully");

        setClients((prevClients) => [...prevClients, response.data]);

        setClientDetails({
          clientName: "",
          clientEmail: "",
          managerName: "",
          managerEmail: "",
          phoneNumber: "",
          address: "",
        });
      } else {
        toast.error("Client Already Exists");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("An error occurred while adding the client.");
    }
  };

  return (
    <AlertDialog>
      <div>
        <Topbar active="Clients" />
        <Sidebar activePage="clients" />
        <div className="flex items-end justify-end ">
          <div className="text-white h-full w-[80vw] px-4 pr-8 py-6 top-24 relative">
            <div className="flex justify-between w-full mb-8">
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
              <AlertDialogTrigger>
                <div className="p-2 flex rounded-lg bg-[#005de9] items-center">
                  <img src={plus} className="h-4 mx-2" />
                  <p className="mr-2">Add New Client</p>
                </div>
              </AlertDialogTrigger>
            </div>
            <div>
              <div className="grid grid-cols-3 gap-6">
                {clients.length > 0 ? (
                  clients.map((client) => (
                    <Cards
                      title={client.clientName}
                      team={client.clientEmail}
                      project={client.project}
                      manager={client.managerName}
                      _id={client._id}
                    />
                  ))
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AlertDialogContent className="fixed top-0 left-0 z-50 text-white border-0 h-screen w-screen bg-black/50 flex items-center justify-center">
        <div className="bg-[#1c1c1c] absolute rounded-xl px-4 pb-4 w-[35vw]">
          <AlertDialogCancel className="w-full flex justify-end bg-[#1c1c1c] border-none p-0">
            <img src={close} />
          </AlertDialogCancel>
          <AlertDialogHeader className="flex flex-col items-start pb-3 border-b-2 border-[#373737] w-full">
            <AlertDialogTitle className="text-2xl">
              Add New Client
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#7e7e7e]">
              Enter details for the client
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-6">
            <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4">
              <label className="font-semibold">Client Name</label>
              <input
                type="text"
                className="bg-[#272727] font-thin w-full focus:outine-0 border-none p-3 rounded-lg"
                placeholder="Enter name of the client"
                onChange={(e) =>
                  setClientDetails({
                    ...clientDetails,
                    clientName: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4">
              <label className="font-semibold">Email</label>
              <input
                type="text"
                className="bg-[#272727] font-thin w-full focus:outine-0 p-3 rounded-lg"
                placeholder="Enter email"
                onChange={(e) =>
                  setClientDetails({
                    ...clientDetails,
                    clientEmail: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4">
              <label className="font-semibold">Manager Name</label>
              <input
                type="text"
                className="bg-[#272727] font-thin w-full focus:outine-0 p-3 rounded-lg"
                placeholder="Enter manager name"
                onChange={(e) =>
                  setClientDetails({
                    ...clientDetails,
                    managerName: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4">
              <label className="font-semibold">Manager Email</label>
              <input
                type="text"
                className="bg-[#272727] font-thin w-full focus:outine-0 p-3 rounded-lg"
                placeholder="Enter manager email"
                onChange={(e) =>
                  setClientDetails({
                    ...clientDetails,
                    managerEmail: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4">
              <label className="font-semibold">Phone Number</label>
              <input
                type="text"
                className="bg-[#272727] font-thin w-full focus:outine-0 p-3 rounded-lg"
                placeholder="Enter client phone number"
                onChange={(e) =>
                  setClientDetails({
                    ...clientDetails,
                    phoneNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4">
              <label className="font-semibold">Address</label>
              <input
                type="text"
                className="bg-[#272727] font-thin w-full focus:outine-0 p-3 rounded-lg"
                placeholder="Enter address"
                onChange={(e) =>
                  setClientDetails({
                    ...clientDetails,
                    address: e.target.value,
                  })
                }
              />
            </div>
            {/* <div className="flex flex-col gap-2 text-[#d2d2d2] text-sm my-4 border">
              <label className="font-semibold">Description</label>
              <div
                className="bg-[#272727] font-thin w-full focus:outine-0 p-3 rounded-lg"
                placeholder="Enter Description"
              >
                <select className="w-full bg-inherit">
                  <option value="volvo">Volvo</option>
                  <option value="saab">Saab</option>
                  <option value="opel">Opel</option>
                  <option value="audi">Audi</option>
                </select>
              </div>
            </div> */}
          </div>
          <AlertDialogFooter className="flex gap-3 items-center justify-end">
            <AlertDialogCancel className="rounded-lg border-2 bg-[#1c1c1c] border-[#1368e8] px-8 my-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-[#1368e8] px-8 my-2"
              onClick={handleSubmit}
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default Clients;

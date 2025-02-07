import React, { useEffect, useState } from "react";
import Topbar from "../topbar/topbar";
import Sidebar from "../sidebar/sidebar";
import webapp from "../../assets/webapp.svg";
import scope from "../../assets/scope.svg";
import plus from "../../assets/plus.svg";
import filter from "../../assets/filter.svg";
import display from "../../assets/display.svg";
import left from "../../assets/left.svg";
import right from "../../assets/right.svg";
import sendblue from "../../assets/sendblue.svg";
import close from "../../assets/close.svg";
import back from "../../assets/back.svg";
import expand from "../../assets/expand.svg";
import comment from "../../assets/comment.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "@/src/api/api";

function Projectdetail() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVulnerabilities, setTotalVulnerabilities] = useState(0);
  const [limit, setLimit] = useState(10);
  const [projectDetails, setProjectDetails] = useState(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = id.split("-").pop();
  const [activeTab, setActiveTab] = useState("Description");

  useEffect(() => {
    const fetchVulnerability = async (page = 1, itemsPerPage = 10) => {
      const response = await api.get(
        `http://localhost:3000/api/v1/client/get-vulnerabilities/${projectId}?page=${page}&limit=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setVulnerabilities(response.data.vulnerabilities);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalVulnerabilities(response.data.total);
    };
    fetchVulnerability(currentPage, limit);

    const fetchProject = async () => {
      const response = await api.get(
        `http://localhost:3000/api/v1/client/get-project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setProjectDetails(response.data);
    };
    fetchProject();
  }, [currentPage, limit]);

  const handleRowClick = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1); 
  };

  if (!projectDetails || !vulnerabilities) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet>
      <AlertDialog>
        <div>
          <Topbar active="Test Details" />
          <Sidebar activePage="clients" />
          <div className="flex items-end justify-end ">
            <div className="text-white h-full w-[80vw] px-4 pr-8 py-6 top-24 relative">
              <div className="rounded-xl p-6 pt-8 bg-[#171717]">
                <div className="flex justify-between w-full mb-8">
                  <div>
                    <div className="flex gap-6 items-center">
                      <p className="text-3xl">{projectDetails?.projectName}</p>
                      <p className="text-white text-xs bg-[#00874d] rounded-md py-1 px-6">
                        {projectDetails.status}
                      </p>
                    </div>
                    <div className="my-4 text-sm flex gap-2">
                      <div>
                        <img src={webapp} />
                      </div>
                      <div>
                        <p>{projectDetails.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm flex flex-col items-end gap-4">
                    <div>
                      <span className="text-[#535353]">Managed by : </span>
                      {projectDetails.managerName}
                    </div>
                    <div className="">
                      <div>
                        <p>
                          {projectDetails.startDate.split('T')[0]} - {projectDetails.endDate.split('T')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#1e1e1e]">
                  <div className="p-6">
                    <div className="text-2xl">List of vulnerabilities</div>
                    <div className="flex justify-between py-4">
                      <div className="flex rounded-lg border-2 border-[#292929] w-[25%] text-sm">
                        <div className="flex gap-2 items-center justify-center border-r-2 border-[#292929] w-1/2 ">
                          <img src={filter} />
                          <p className="text-[#868686]">Filter</p>
                        </div>
                        <div className="flex gap-2 items-center justify-center m-2 w-1/2">
                          <img src={display} />
                          <p className="text-[#868686]">Display</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <AlertDialogTrigger>
                          <div className="flex py-2 px-2 gap-1 border-2 rounded-lg border-[#292929] items-center">
                            <img src={scope} />
                            <p>Scope</p>
                          </div>
                        </AlertDialogTrigger>
                        <div
                          onClick={() => navigate(`/Projects/${id}/add`)}
                          className="flex p-1 px-2 gap-1 rounded-lg bg-[#0066ff] items-center hover:cursor-pointer"
                        >
                          <img src={plus} className="h-3" />
                          <p>Add Vulnerability</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Table>
                      <TableHeader className="border-y-2 border-[#2d2d2d]">
                        <TableRow className="text-[#747474] border-0">
                          <TableHead className="w-[40%] text-start px-8 py-">
                            Test Name
                          </TableHead>
                          <TableHead className="w-[15%] text-start">
                            Severity
                          </TableHead>
                          <TableHead className="w-[15%] text-start">
                            CVSS
                          </TableHead>
                          <TableHead className="w-[15%] text-start">
                            Tags
                          </TableHead>
                          <TableHead className="w-[15%] text-start">
                            URL
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vulnerabilities.map((vulnerability, idx) => (
                          <>
                            <TableRow
                              key={idx}
                              className={`border-0 hover:cursor-pointer ${
                                idx % 2 === 0 ? "bg-[#1b1b1b]" : ""
                              }`}
                              onClick={() => handleRowClick(vulnerability)}
                            >
                              <TableCell className="w-[40%] text-start px-8">
                                <SheetTrigger>
                                  {vulnerability.issueTitle}
                                </SheetTrigger>
                              </TableCell>
                              <TableCell className="w-[15%] text-start">
                                <SheetTrigger>
                                  {vulnerability.severity}
                                </SheetTrigger>
                              </TableCell>
                              <TableCell className="w-[15%] text-start">
                                <SheetTrigger>
                                  {vulnerability.cvss}
                                </SheetTrigger>
                              </TableCell>
                              <TableCell className="w-[15%] text-start">
                                <div
                                  className={`rounded-md text-xs p-2 flex items-center justify-center w-[70%] ${
                                    vulnerability.tags === "Good Practice"
                                      ? "bg-[#949494]"
                                      : vulnerability.tags === "Medium"
                                      ? "bg-[#d7a700]"
                                      : vulnerability.tags === "Denied"
                                      ? "bg-[#d30000]"
                                      : vulnerability.tags === "High"
                                      ? "bg-[#d30000]"
                                      : vulnerability.tags === "Low"
                                      ? "bg-[#009e5b]"
                                      : "bg-[#325373]"
                                  }`}
                                >
                                  <SheetTrigger>
                                    {vulnerability.tags}
                                  </SheetTrigger>
                                </div>
                              </TableCell>
                              <TableCell className="w-[15%] text-start text-[#0066ff]">
                                <div className="flex gap-1 underline">
                                  <p>{vulnerability.url}</p>
                                  <img src={sendblue} />
                                </div>
                              </TableCell>
                            </TableRow>
                            {selectedVulnerability && (
                              <SheetContent className="fixed top-0 right-0 w-screen bg-black/50">
                                <div className="absolute top-0 right-0 z-50 min-h-screen text-white border-0 w-[50vw] bg-[#1c1c1c] p-8 flex flex-col justify-between">
                                  <div className="w-full h-full">
                                    <div className="flex">
                                      <SheetClose>
                                        <img
                                          src={back}
                                          className="pr-4 border-r-2 border-[#393939]"
                                        />
                                      </SheetClose>
                                      <div
                                        className="mx-4 hover:cursor-pointer"
                                        onClick={() =>
                                          navigate(
                                            `/Projects/desc/${selectedVulnerability.name}-${selectedVulnerability._id}`
                                          )
                                        }
                                      >
                                        <img src={expand} />
                                      </div>
                                    </div>
                                    <div className="py-4">
                                      <div className="flex items-start w-[70%] py-4 gap-2">
                                        <p className="text-3xl">
                                          {selectedVulnerability.name}
                                        </p>
                                        <div className="py-2">
                                          <p className="text-white text-xs bg-[#00874d] rounded-md py-1 px-6">
                                            {selectedVulnerability.severity}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex w-[70%] gap-8">
                                        <div className="flex flex-col gap-1 items-start">
                                          <div className="text-[#696969]">
                                            CVSS :
                                          </div>
                                          <div>
                                            {selectedVulnerability.cvss}
                                          </div>
                                        </div>
                                        {/* <div className="flex flex-col gap-1 items-start">
                  <div className="text-[#696969]">ID :</div>
                  <div>ID Information</div>
                </div> */}
                                        <div className="flex flex-col gap-1 items-start">
                                          <div className="text-[#696969]">
                                            URL :
                                          </div>
                                          <div className="text-[#005de9] underline">
                                            {selectedVulnerability.url}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="py-4">
                                      <Tabs
                                        defaultValue="description"
                                        className="w-full "
                                      >
                                        <TabsList className="text-[#696969] w-full">
                                          <TabsTrigger
                                            value="description"
                                            className={`w-[25%] font-bold text-md py-2 ${
                                              activeTab === "Description"
                                                ? "text-[#005de9] border-b-2 border-[#005de9]"
                                                : "border-[#696969] border-b-2"
                                            }`}
                                          >
                                            <p
                                              onClick={() =>
                                                setActiveTab("Description")
                                              }
                                            >
                                              Description
                                            </p>
                                          </TabsTrigger>
                                          <TabsTrigger
                                            value="impact"
                                            className={`w-[25%] font-bold text-md py-2 ${
                                              activeTab === "Impact"
                                                ? "text-[#005de9] border-b-2 border-[#005de9]"
                                                : "border-[#696969] border-b-2"
                                            }`}
                                          >
                                            <p
                                              onClick={() =>
                                                setActiveTab("Impact")
                                              }
                                            >
                                              Impact
                                            </p>
                                          </TabsTrigger>
                                          <TabsTrigger
                                            value="poc"
                                            className={`w-[25%] font-bold text-md py-2 ${
                                              activeTab === "poc"
                                                ? "text-[#005de9] border-b-2 border-[#005de9]"
                                                : "border-[#696969] border-b-2"
                                            }`}
                                          >
                                            <p
                                              onClick={() =>
                                                setActiveTab("poc")
                                              }
                                            >
                                              Proof of Concept
                                            </p>
                                          </TabsTrigger>
                                          <TabsTrigger
                                            value="recommendation"
                                            className={`w-[25%] font-bold text-md py-2 ${
                                              activeTab === "recommendation"
                                                ? "text-[#005de9] border-b-2 border-[#005de9]"
                                                : "border-[#696969] border-b-2"
                                            }`}
                                          >
                                            <p
                                              onClick={() =>
                                                setActiveTab("recommendation")
                                              }
                                            >
                                              Recommendation
                                            </p>
                                          </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="description">
                                          <div className="text-[#696969]">
                                            <div className="py-6">
                                              <p>
                                                {
                                                  selectedVulnerability.description
                                                }
                                              </p>{" "}
                                            </div>
                                          </div>
                                        </TabsContent>
                                        <TabsContent value="impact">
                                          <div className="text-[#696969]">
                                            <div className="py-6">
                                              <p>
                                                {selectedVulnerability.impact}
                                              </p>{" "}
                                            </div>
                                          </div>
                                        </TabsContent>
                                        <TabsContent value="poc">
                                          <div className="text-[#696969]">
                                            <div className="py-6">
                                              <p>
                                                {
                                                  selectedVulnerability.proofOfConcept
                                                }
                                              </p>{" "}
                                            </div>
                                          </div>
                                        </TabsContent>
                                        <TabsContent value="recommendation">
                                          <div className="text-[#696969]">
                                            <div className="py-6">
                                              <p>
                                                {
                                                  selectedVulnerability.recommendation
                                                }
                                              </p>{" "}
                                            </div>
                                          </div>
                                        </TabsContent>
                                      </Tabs>
                                    </div>
                                  </div>
                                </div>
                              </SheetContent>
                            )}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              <div className="my-8 flex justify-between w-full">
                <div className="flex gap-4 items-center">
                  <div className="text-xs text-[#a2a1a8]">Showing</div>
                  <div>
                    <select
                      className="p-1 text-xs rounded-md bg-inherit border-2 border-[#292929]"
                      value={limit}
                      onChange={(e) =>
                        handleLimitChange(Number(e.target.value))
                      }
                    >
                      <option className="bg-[#171717]">10</option>
                      <option className="bg-[#171717]">20</option>
                      <option className="bg-[#171717]">30</option>
                      <option className="bg-[#171717]">40</option>
                      <option className="bg-[#171717]">50</option>
                    </select>
                  </div>
                </div>
                <div className="text-xs text-[#a2a1a8]">
                  <p>
                    Showing {(currentPage - 1) * limit + 1} to{" "}
                    {Math.min(currentPage * limit, totalVulnerabilities)} out of{" "}
                    {totalVulnerabilities} records
                  </p>
                </div>
                <div className="flex gap-2 items-center text-[#a2a1a8]">
                  <div
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                  >
                    <img src={left} className="cursor-pointer" />
                  </div>
                  {[...Array(totalPages)].map((_, index) => (
                    <div
                      key={index}
                      className={`text-xs p-1 px-2 cursor-pointer ${
                        currentPage === index + 1
                          ? "text-[#0066ff] border border-[#0066ff] rounded-md"
                          : ""
                      }`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      <p>{index + 1}</p>
                    </div>
                  ))}
                  <div
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                  >
                    <img src={right} className="cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <AlertDialogContent className="fixed top-0 left-0 z-50 text-white border-0 h-screen w-screen bg-black/50 flex items-center justify-center">
          <div className="absolute bg-[#1c1c1c] rounded-xl px-4 pb-4 w-[35vw]">
            <AlertDialogCancel className="w-full flex justify-end border-none p-0 bg-inherit">
              <img src={close} />
            </AlertDialogCancel>
            <AlertDialogHeader className="flex flex-col items-start pb-3 border-b-2 border-[#373737] w-full">
              <AlertDialogTitle className="text-2xl">Scope</AlertDialogTitle>
              <AlertDialogDescription className="text-[#7e7e7e]">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius,
                fugiat.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-6 text-sm text-[#7e7e7e]">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                fringilla ante a fermentum laoreet. Fusce condimentum blandit
                velit, nec commodo purus fermentum vel.
              </p>{" "}
              <ul className="list-disc pl-6 py-4">
                <li>
                  Proin suscipit lacus nisl, in condimentum nisl pharetra at.
                </li>
                <li>
                  Nulla ultricies felis quis tortor pharetra, eget ornare urna
                  tincidunt.
                </li>{" "}
                <li>
                  Nam dignissim turpis posuere venenatis venenatis. In placerat
                  auctor malesuada.
                </li>{" "}
                <li>
                  Fusce condimentum blandit velit, nec commodo purus fermentum
                  vel.
                </li>{" "}
                <li>
                  Nulla ultricies felis quis tortor pharetra, eget ornare urna
                  tincidunt.
                </li>
              </ul>{" "}
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                fringilla ante a fermentum laoreet. Fusce condimentum blandit
                velit, nec commodo purus fermentum vel.
              </p>
            </div>
          </div>
        </AlertDialogContent> */}
      </AlertDialog>
    </Sheet>
  );
}

export default Projectdetail;

import React, { useEffect, useState } from "react";
import Topbar from "../topbar/topbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "../sidebar/sidebar";
import severity from "../../assets/severity.svg";
import cvss from "../../assets/cvss.svg";
import url from "../../assets/url.svg";
import { useParams } from "react-router-dom";
import axios from "axios";
import api from "@/src/api/api";
import saveAs from "file-saver";
import { AlignmentType, Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";

function Detaildesc() {
  const { id } = useParams();
  const [vulnerabilityDetails, setVulnerabilityDetails] = useState(null);


  
  const vulnerabilityId = id.split("-").pop();

  useEffect(() => {
    const fetchVulnerability = async () => {
      const response = await api.get(
        `http://localhost:3000/api/v1/client/get-vulnerability/${vulnerabilityId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setVulnerabilityDetails(response.data);
      console.log(response.data);
    };
    fetchVulnerability();
  }, [vulnerabilityId]);

  const createTextParagraph = (text, bold = false, italic = false, size = 24, color = "000000") =>
    new Paragraph({
        children: [
            new TextRun({
                text,
                bold,
                italics: italic,
                size,
                color,
            }),
        ],
    });

    const generateDocx = async () => {
      const doc = new Document({
          sections: [
              {
                  properties: {},
                  children: [
                      // Title Section
                      new Paragraph({
                          children: [
                              new TextRun({
                                  text: "Web App Pentest",
                                  bold: true,
                                  size: 32,
                              }),
                          ],
                          alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                          children: [
                              new TextRun({
                                  text: "SampleCorp",
                                  bold: true,
                              }),
                              new TextRun({
                                  text: ` - ${new Date().toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                  })}`,
                              }),
                          ],
                          alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                          children: [
                              new TextRun({
                                  text: "THIS DOCUMENT IS CLASSIFIED AS CONFIDENTIAL",
                                  bold: true,
                                  color: "FF0000",
                              }),
                          ],
                          alignment: AlignmentType.CENTER,
                      }),
  
                      new Paragraph({
                          children: [
                              new TextRun({
                                  text: "Version History",
                                  bold: true,
                                  underline: {},
                                  size: 28,
                              }),
                          ],
                          spacing: { before: 300, after: 100 },
                      }),
                      new Table({
                          rows: [
                              new TableRow({
                                  children: [
                                      new TableCell({ children: [new Paragraph("Author")] }),
                                      new TableCell({ children: [new Paragraph("Delivery Date")] }),
                                      new TableCell({ children: [new Paragraph("Version")] }),
                                      new TableCell({ children: [new Paragraph("Status")] }),
                                  ],
                              }),
                              new TableRow({
                                  children: [
                                      new TableCell({ children: [new Paragraph("Tyler Durdan")] }),
                                      new TableCell({ children: [new Paragraph("01/08/2024")] }),
                                      new TableCell({ children: [new Paragraph("0.7")] }),
                                      new TableCell({ children: [new Paragraph("First Draft")] }),
                                  ],
                              }),
                              new TableRow({
                                  children: [
                                      new TableCell({ children: [new Paragraph("Ethan Hunt")] }),
                                      new TableCell({ children: [new Paragraph("01/08/2024")] }),
                                      new TableCell({ children: [new Paragraph("0.8")] }),
                                      new TableCell({ children: [new Paragraph("Technical QA")] }),
                                  ],
                              }),
                              new TableRow({
                                  children: [
                                      new TableCell({ children: [new Paragraph("HP. Nograj")] }),
                                      new TableCell({ children: [new Paragraph("01/08/2024")] }),
                                      new TableCell({ children: [new Paragraph("0.9")] }),
                                      new TableCell({ children: [new Paragraph("QA")] }),
                                  ],
                              }),
                              new TableRow({
                                  children: [
                                      new TableCell({ children: [new Paragraph("Luke Vollhard")] }),
                                      new TableCell({ children: [new Paragraph("01/08/2024")] }),
                                      new TableCell({ children: [new Paragraph("1.0")] }),
                                      new TableCell({ children: [new Paragraph("Final")] }),
                                  ],
                              }),
                          ],
                      }),
  
                      new Paragraph({
                          children: [
                              new TextRun({
                                  text: "Vulnerability Details",
                                  bold: true,
                                  underline: {},
                                  size: 28,
                              }),
                          ],
                          spacing: { before: 300, after: 100 },
                      }),
                      new Table({
                          rows: [
                              new TableRow({
                                  children: [
                                      new TableCell({ children: [new Paragraph("Sl. No.")] }),
                                      new TableCell({ children: [new Paragraph("Title")] }),
                                      new TableCell({ children: [new Paragraph("CWE ID")] }),
                                      new TableCell({ children: [new Paragraph("Severity")] }),
                                  ],
                              }),
                              ...Object.entries(vulnerabilityDetails).map((vuln, index) =>
                                  new TableRow({
                                      children: [
                                          new TableCell({ children: [new Paragraph((index + 1).toString())] }),
                                          new TableCell({ children: [new Paragraph(vuln.name)] }),
                                          new TableCell({ children: [new Paragraph(vuln._Id)] }),
                                          new TableCell({ children: [new Paragraph(vuln.severity)] }),
                                      ],
                                  })
                              ),
                          ],
                      }),
  
                      // Detailed Vulnerability Descriptions
                      ...Object.entries(vulnerabilityDetails).map((vuln, index) => [
                          new Paragraph({
                              children: [
                                  new TextRun({
                                      text: `${index + 1}. ${vuln.title}`,
                                      bold: true,
                                      size: 24,
                                  }),
                              ],
                              spacing: { before: 300, after: 100 },
                          }),
                          new Paragraph({
                              children: [
                                  new TextRun({
                                      text: `Severity: ${vuln.severity}`,
                                      bold: true,
                                  }),
                              ],
                          }),
                          new Paragraph({
                              children: [
                                  new TextRun({
                                      text: `Description: ${vuln.description}`,
                                  }),
                              ],
                          }),
                          new Paragraph({
                              children: [
                                  new TextRun({
                                      text: `Recommendation: ${vuln.recommendation}`,
                                      italics: true,
                                  }),
                              ],
                          }),
                      ]),
                  ],
              },
          ],
      });
  
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "vulnerability_report.docx");
  };

  const [activeTab, setActiveTab] = useState("Description");

  if (!vulnerabilityDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Topbar active="Vulnerability Description" />
      <Sidebar activePage="clients" />
      <div className="flex items-end justify-end ">
        <div className="text-white h-full w-[80vw] px-4 pr-8 py-6 top-24 relative">
          <div className="rounded-xl p-6 pt-8 bg-[#171717]">
            <div>
              <div className="flex my-2 ">
                <div className="flex items-start w-[72%] gap-2 justify-between">
                  <p className="text-3xl">{vulnerabilityDetails.issueTitle}</p>
                </div>
                <div className="w-[28%] flex items-end justify-end">
                  <div className="flex gap-1 items-center">
                    <div>
                      <img src={severity} alt="Severity" />
                    </div>
                    <div className="flex items-center gap-4">
                      <p>Severity</p>
                      <div className="flex py-2 gap-3 items-center">
                        <div>
                          <p className="text-white text-xs bg-[#00874d] rounded-md py-1 px-8 text-center">
                            {vulnerabilityDetails.severity}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={generateDocx}
                          className=" bg-blue-600 py-1 px-1 rounded text-sm"
                        >
                          Generate DOCX
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-between mb-6 gap-3">
                <div className="flex gap-4">
                  <div className="flex gap-1S flex-row">
                    <div className="">#ID:</div>
                    <div className="text-[#696969]">
                      {vulnerabilityDetails._id}
                    </div>
                  </div>
                  <div className="flex gap-1 items-start">
                    <div className="flex gap-1 items-center">
                      <div>
                        <img src={url} alt="URL" />
                      </div>
                      <div>URL:</div>
                    </div>
                    <a
                      className="text-[#005de9] underline cursor-pointer"
                      href={vulnerabilityDetails.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {vulnerabilityDetails.url}
                    </a>
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <div>
                    <img src={cvss} alt="CVSS" />
                  </div>
                  <div>
                    <p>CVSS:{vulnerabilityDetails.cvss}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="py-4">
              <Tabs defaultValue="description" className="">
                <TabsList className="text-[#696969] w-full">
                  <TabsTrigger
                    value="description"
                    className={`w-[25%] font-bold text-md py-2 ${
                      activeTab === "Description"
                        ? "text-[#005de9] border-b-2 border-[#005de9]"
                        : "border-[#696969] border-b-2"
                    }`}
                  >
                    <p onClick={() => setActiveTab("Description")}>
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
                    <p onClick={() => setActiveTab("Impact")}>Impact</p>
                  </TabsTrigger>
                  <TabsTrigger
                    value="poc"
                    className={`w-[25%] font-bold text-md py-2 ${
                      activeTab === "poc"
                        ? "text-[#005de9] border-b-2 border-[#005de9]"
                        : "border-[#696969] border-b-2"
                    }`}
                  >
                    <p onClick={() => setActiveTab("poc")}>Proof of Concept</p>
                  </TabsTrigger>
                  <TabsTrigger
                    value="recommendation"
                    className={`w-[25%] font-bold text-md py-2 ${
                      activeTab === "recommendation"
                        ? "text-[#005de9] border-b-2 border-[#005de9]"
                        : "border-[#696969] border-b-2"
                    }`}
                  >
                    <p onClick={() => setActiveTab("recommendation")}>
                      Recommendation
                    </p>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                  <div className="text-[#696969]">
                    <div className="py-6">
                      <p>{vulnerabilityDetails.description}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="impact">
                  <div className="text-[#696969]">
                    <div className="py-6">
                      <p>{vulnerabilityDetails.impact}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="poc">
                  <div className="text-[#696969]">
                    <div className="py-6">
                      <p>{vulnerabilityDetails.proofOfConcept}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="recommendation">
                  <div className="text-[#696969]">
                    <div className="py-6">
                      <p>{vulnerabilityDetails.recommendation}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detaildesc;

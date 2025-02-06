import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import CWE from "../../json/CWE_V.4.3.json";
import enterprise from "../../json/enterprise-attack.json";
import mobile from "../../json/mobile-attack.json";
import OWASP2021 from "../../json/OWASPtop102021.json";
import OWASP2017 from "../../json/OWASPtop102017.json";
import OWASPCICD from "../../json/OWASPtop10cicd.json";
import OWASPK8 from "../../json/OWASPtop10k8s.json";
import api from "@/src/api/api";

const templates = [
  {
    title: "CWE Research Concepts",
    items: CWE,
  },
  {
    title: "MITRE ATT&CK Enterprise",
    items: enterprise,
  },
  {
    title: "MITRE ATT&CK Mobile",
    items: mobile,
  },
  {
    title: "OWASP Top 10 2021 Web Application Security Risks",
    items: OWASP2021,
  },
  {
    title: "OWASP Top 10 2017 Mobile Security Risks",
    items: OWASP2017,
  },
  {
    title: "OWASP Top 10 CICD Securtiy Risks",
    items: OWASPCICD,
  },
  {
    title: "OWASP Top 10 Kubernetes Security Risks",
    items: OWASPK8,
  },
];

function Addvul() {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = id.split("-").pop();

  const [selectedTemplate, setSelectedTemplate] = useState({});
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [vulnerabilityDetails, setVulnerabilityDetails] = useState({
    template: "",
    issueTitle: "",
    cvss: "",
    severity: "",
    tags: "",
    url: [],
    description: "",
    impact: "",
    proofOfConcept: "",
    recommendation: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVulnerabilityDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleIssueTitleChange = (e) => {
    const selectedIssue = selectedTemplate.items.find(
      (issue) => issue.title === e.target.value
    );
    console.log(selectedIssue.ref.split("\n"));
    setVulnerabilityDetails((prevDetails) => ({
      ...prevDetails,
      issueTitle: selectedIssue?.title || selectedIssue?.maincategory || "",
      cvss: selectedIssue?.cvss || "",
      severity: selectedIssue?.severity || "",
      description: selectedIssue?.desc || "",
      impact: selectedIssue?.impact || "",
      proofOfConcept: selectedIssue?.poc || "",
      recommendation: selectedIssue?.recommendation || "",
      url: selectedIssue?.ref.split("\n") || "",
    }));
  };

  const handleTemplateChange = (e) => {
    const selected = templates.find(
      (template) => template.title === e.target.value
    );
    console.log(selected);
    setSelectedTemplate(selected);
    setVulnerabilityDetails({
      ...vulnerabilityDetails,
      template: selected.title,
    });
    setIssues(
      selected?.items.map((item) => item.title || item.maincategory) || []
    );
  };

  const handleSubmit = async (e) => {
    console.log(vulnerabilityDetails);
    e.preventDefault();
    try {
      await api.post(
        `http://localhost:3000/api/v1/client/create-vulnerability/${projectId}`,
        vulnerabilityDetails,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      toast.success("Vulnerability added successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error submitting vulnerability:", error);
      toast.error("Failed to add vulnerability");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-[#1E1E1E] text-white p-8 border w-[80%] h-[80%] rounded-lg">
        <h1 className="text-3xl font-bold mb-8">Add New Vulnerability</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm">Template</label>
              <select
                type="text"
                name="template"
                value={vulnerabilityDetails.template}
                onChange={handleTemplateChange}
                className="w-full bg-[#2D2D2D] rounded p-2 text-sm"
                placeholder="Empty"
              >
                {templates.map((template, idx) => (
                  <option key={idx}>{template.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm">Issue Title</label>
              <select
                name="issueTitle"
                value={vulnerabilityDetails.issueTitle}
                onChange={handleIssueTitleChange}
                className="w-full bg-[#2D2D2D] rounded p-2 text-sm"
                disabled={!selectedTemplate}
              >
                <option value="" disabled>
                  Select Issue
                </option>
                {issues.map((issue, idx) => (
                  <option key={idx} value={issue}>
                    {issue}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm">CVSS</label>
              <input
                type="text"
                name="cvss"
                value={vulnerabilityDetails.cvss}
                onChange={handleInputChange}
                className="w-full bg-[#2D2D2D] rounded p-2 text-sm"
                placeholder="Empty"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Severity</label>
              <div className="relative">
                <input
                  type="text"
                  name="severity"
                  value={vulnerabilityDetails.severity}
                  onChange={handleInputChange}
                  className="w-full bg-[#2D2D2D] rounded p-2 text-sm pr-8"
                  placeholder="Empty"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  ▼
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm">Tags</label>
              <div className="relative">
                <input
                  type="text"
                  name="tags"
                  value={vulnerabilityDetails.tags}
                  onChange={handleInputChange}
                  className="w-full bg-[#2D2D2D] rounded p-2 text-sm pr-8"
                  placeholder="Empty"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  ⊕
                </span>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm">URL 1</label>
              <div className="relative">
                <input
                  type="text"
                  name="url"
                  value={vulnerabilityDetails.url}
                  onChange={handleInputChange}
                  className="w-full bg-[#2D2D2D] rounded p-2 text-sm pr-8"
                  placeholder="Empty"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  ↗
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-4 border-b border-[#3D3D3D] justify-between">
              {[
                "Description",
                "Impact",
                "Proof of Concept",
                "Recommendation",
              ].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`py-2 px-4 ${
                    activeTab === tab.toLowerCase().replace(/ /g, "")
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-500"
                  }`}
                  onClick={() =>
                    setActiveTab(tab.toLowerCase().replace(/ /g, ""))
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <button type="button" className="p-1 hover:bg-[#2D2D2D] rounded">
                <Bold size={16} />
              </button>
              <button type="button" className="p-1 hover:bg-[#2D2D2D] rounded">
                <Italic size={16} />
              </button>
              <button type="button" className="p-1 hover:bg-[#2D2D2D] rounded">
                <Underline size={16} />
              </button>
              <div className="border-l border-[#3D3D3D] mx-2"></div>
              <button type="button" className="p-1 hover:bg-[#2D2D2D] rounded">
                <AlignLeft size={16} />
              </button>
              <button type="button" className="p-1 hover:bg-[#2D2D2D] rounded">
                <AlignCenter size={16} />
              </button>
              <button type="button" className="p-1 hover:bg-[#2D2D2D] rounded">
                <AlignRight size={16} />
              </button>
              <button type="button" className="p-1 hover:bg-[#2D2D2D] rounded">
                <AlignJustify size={16} />
              </button>
            </div>
            <textarea
              name={activeTab}
              value={vulnerabilityDetails[activeTab]}
              onChange={handleInputChange}
              className="w-full bg-[#2D2D2D] rounded p-2 mt-2 h-40 text-sm"
              placeholder="Type something..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-[#3D3D3D] rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 rounded text-sm"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Addvul;

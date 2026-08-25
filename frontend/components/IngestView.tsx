"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Database,
  PlusCircle,
  FileSpreadsheet,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Upload,
  FileText,
  Clock,
  Layers,
  Activity,
  Award,
  Check,
  Download
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFilter } from "@/context/FilterContext";
import { createOutageApi, createBatchOutagesApi } from "@/lib/api";
import {
  evaluateMathematicalScore,
  REGION_METADATA_MAP,
  ScoringEvaluationResult
} from "@/lib/scoring";
import { OutageItem } from "@/lib/data";

const SAMPLE_BATCH_CSV = `outage_id,region_name,node_id,severity,subscribers_affected,complaints_count,duration_hours,revenue_tier,root_cause,status
OUT-2026-0825-N101,Mumbai,Node-MUM-Core-03,Critical,48000,1920,4.5,Premium,DWDM Optical Fiber Cut near Western Highway,Open
OUT-2026-0825-N102,Delhi NCR,Node-DEL-South-14,High,28500,1150,2.8,Premium,Edge Routing Switch Memory Buffer Overrun,Open
OUT-2026-0825-N103,Bangalore,Tower-BLR-Tech-22,High,22000,880,3.2,Premium,5G Massive MIMO Beamforming Calibration Delay,In Progress
OUT-2026-0825-N104,Chennai,Node-MAA-Coast-07,Medium,14000,460,1.8,High,Distribution Power Relay Thermal Trip,Open
OUT-2026-0825-N105,Jaipur,Tower-JAI-Central-02,Low,2500,75,0.9,Standard,Scheduled Optical SFP+ Transceiver Swap,Resolved`;

export default function IngestView() {
  const { user, isLeadership } = useAuth();
  const { refreshOutages, allOutages } = useFilter();

  const [activeTab, setActiveTab] = useState<"manual" | "batch" | "formula">("manual");

  // Form states for manual single incident entry
  const [outageId, setOutageId] = useState<string>("OUT-2026-0825-N105");
  const [regionName, setRegionName] = useState<string>("Mumbai");
  const [nodeId, setNodeId] = useState<string>("Node-MUM-Core-02");
  const [severity, setSeverity] = useState<"Critical" | "High" | "Medium" | "Low">("Critical");
  const [subscribers, setSubscribers] = useState<number>(38500);
  const [complaints, setComplaints] = useState<number>(1450);
  const [durationHours, setDurationHours] = useState<number>(3.5);
  const [status, setStatus] = useState<"Open" | "Active Triage" | "In Progress" | "Resolved">("Open");
  const [rootCause, setRootCause] = useState<string>(
    "Metro Optical Backbone DWDM Link Severance along Infrastructure Corridor"
  );
  const [services, setServices] = useState<string[]>([
    "5G Enterprise",
    "VoLTE Voice",
    "Broadband Leased Lines"
  ]);

  // Batch CSV state
  const [csvText, setCsvText] = useState<string>(SAMPLE_BATCH_CSV);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastCreatedOutage, setLastCreatedOutage] = useState<OutageItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available service tags
  const ALL_SERVICES = [
    "5G Enterprise",
    "5G Ultra Broadband",
    "VoLTE Voice",
    "Core Data Gateway",
    "Broadband Leased Lines",
    "E911 Emergency Services",
    "Cellular 4G/LTE",
    "SMS Gateway"
  ];

  // Helper to toggle service tags
  const toggleService = (svc: string) => {
    if (services.includes(svc)) {
      setServices(services.filter((s) => s !== svc));
    } else {
      setServices([...services, svc]);
    }
  };

  // Auto-generate random ID
  const generateNewId = () => {
    const regCode = REGION_METADATA_MAP[regionName.toLowerCase()]?.code || "REG";
    const randNum = Math.floor(Math.random() * 900) + 100;
    const newId = `OUT-2026-0825-N${randNum}`;
    setOutageId(newId);
    setNodeId(`Node-${regCode}-Core-${Math.floor(Math.random() * 20) + 1}`);
  };

  // Quick Preset Scenarios
  const loadScenario = (type: "fiber" | "switch" | "ran" | "routine") => {
    if (type === "fiber") {
      setRegionName("Mumbai");
      setSeverity("Critical");
      setSubscribers(45000);
      setComplaints(1850);
      setDurationHours(4.2);
      setStatus("Open");
      setRootCause("Core Optical Backbone DWDM Link Severance along BKC Corridor");
      setServices(["5G Enterprise", "VoLTE Voice", "E911 Emergency Services"]);
    } else if (type === "switch") {
      setRegionName("Delhi NCR");
      setSeverity("Critical");
      setSubscribers(36000);
      setComplaints(1520);
      setDurationHours(3.2);
      setStatus("Open");
      setRootCause("High-Capacity Edge Switch ASIC Hardware Memory Overrun");
      setServices(["5G Ultra Broadband", "VoLTE Voice", "Broadband Leased Lines"]);
    } else if (type === "ran") {
      setRegionName("Hyderabad");
      setSeverity("High");
      setSubscribers(18500);
      setComplaints(640);
      setDurationHours(2.5);
      setStatus("In Progress");
      setRootCause("5G RAN Massive MIMO Carrier Aggregation Sync Loss");
      setServices(["5G Ultra Broadband", "Cellular 4G/LTE"]);
    } else if (type === "routine") {
      setRegionName("Ahmedabad");
      setSeverity("Low");
      setSubscribers(3200);
      setComplaints(110);
      setDurationHours(0.8);
      setStatus("Resolved");
      setRootCause("Scheduled Optical SFP+ Transceiver Hot-Swap & Diagnostics");
      setServices(["Cellular 4G/LTE", "SMS Gateway"]);
    }
  };

  // Real-time live mathematical scoring evaluation
  const liveEvaluation: ScoringEvaluationResult = useMemo(() => {
    const regMeta = REGION_METADATA_MAP[regionName.toLowerCase()] || {
      id: "mum",
      code: "MUM",
      tier: "Premium",
      hourly: "₹38.5 L/hr",
      name: regionName,
      subs: 4200000
    };

    return evaluateMathematicalScore({
      subscribers_affected: subscribers,
      complaints_count: complaints,
      duration_hours: durationHours,
      region_name: regionName,
      severity,
      revenue_tier: regMeta.tier,
      revenue_exposure_hourly: regMeta.hourly
    });
  }, [subscribers, complaints, durationHours, regionName, severity]);

  // Batch CSV parsed preview
  const parsedCsvPreview = useMemo(() => {
    if (!csvText.trim()) return [];
    const lines = csvText.trim().split("\n").filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const items: {
      outage_id: string;
      region_name: string;
      node_id: string;
      severity: string;
      subscribers: number;
      complaints: number;
      duration_hours: number;
      status: string;
      eval: ScoringEvaluationResult;
    }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
      if (vals.length >= headers.length) {
        const rowObj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = vals[idx];
        });

        const subs = parseInt(rowObj.subscribers_affected || rowObj.subscribers || "10000", 10) || 10000;
        const comps = parseInt(rowObj.complaints_count || rowObj.complaints || "300", 10) || 300;
        const dur = parseFloat(rowObj.duration_hours || "1.5") || 1.5;
        const reg = rowObj.region_name || rowObj.region || "Mumbai";
        const sev = rowObj.severity || "Medium";

        const ev = evaluateMathematicalScore({
          subscribers_affected: subs,
          complaints_count: comps,
          duration_hours: dur,
          region_name: reg,
          severity: sev,
          revenue_tier: rowObj.revenue_tier
        });

        items.push({
          outage_id: rowObj.outage_id || `OUT-2026-0825-N${100 + i}`,
          region_name: reg,
          node_id: rowObj.node_id || `Node-${reg.slice(0, 3).toUpperCase()}-01`,
          severity: sev,
          subscribers: subs,
          complaints: comps,
          duration_hours: dur,
          status: rowObj.status || "Open",
          eval: ev
        });
      }
    }
    return items;
  }, [csvText]);

  // Handle Manual Single Outage Submission
  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const regMeta = REGION_METADATA_MAP[regionName.toLowerCase()] || {
      id: regionName.slice(0, 3).toLowerCase(),
      code: regionName.slice(0, 3).toUpperCase(),
      tier: "High",
      hourly: "₹15.0 L/hr",
      name: regionName,
      subs: 1500000
    };

    const payload = {
      outage_id: outageId,
      region_name: regMeta.name,
      region_code: regMeta.code,
      node_id: nodeId,
      severity,
      status,
      subscribers_affected: subscribers,
      complaints_count: complaints,
      duration_hours: durationHours,
      revenue_tier: regMeta.tier,
      revenue_exposure_hourly: regMeta.hourly,
      root_cause: rootCause,
      affected_services: services.join("/")
    };

    try {
      const res = await createOutageApi(payload);
      if (res.success) {
        setSuccessMessage(
          `✓ Outage ${outageId} successfully evaluated (Impact Score: ${liveEvaluation.impact_score}, Priority: ${liveEvaluation.priority_tier}) and committed to SQLite!`
        );
        if (res.outage) {
          setLastCreatedOutage(res.outage);
        }
        await refreshOutages();
        generateNewId();
      } else {
        setErrorMessage(res.message || "Failed to commit outage to database");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during ingestion");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Batch CSV Submission
  const handleSubmitBatch = async () => {
    if (parsedCsvPreview.length === 0) {
      setErrorMessage("No valid CSV records detected. Please check your CSV format.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await createBatchOutagesApi({ csv_data: csvText });
      if (res.success) {
        setSuccessMessage(
          `✓ Successfully evaluated and committed ${res.count || parsedCsvPreview.length} outage records to SQLite!`
        );
        await refreshOutages();
      } else {
        setErrorMessage(res.message || "Batch ingestion failed to commit to SQLite database");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to execute batch ingestion");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setCsvText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_BATCH_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "OutageIQ_Batch_Ingestion_Template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Director Privilege Banner */}
      <div className="bg-gradient-to-r from-[#1C143B] via-[#2A1D54] to-[#1C143B] text-white border border-amber-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-lg shadow-amber-950/40">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-extrabold text-base text-white">
                  Executive Data Ingestion &amp; Scoring Engine Studio
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Exclusive Write Access
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SQLite Connected
                </span>
              </div>
              <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
                As <strong>Executive Director ({user?.name || "Vikram D."})</strong>, you have exclusive authority to add live incident data either manually (single record) or through bulk CSV files. All added data is evaluated through the 4-factor scoring logic, committed to SQLite, and instantly propagated across all operational dashboards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-mono">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Database Records: <strong>{allOutages.length} Outages</strong></span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/queue"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all"
            >
              View in Queue →
            </Link>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-white cursor-pointer px-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Ingestion Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "manual"
                ? "bg-white text-purple-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span>Single Record Ingress</span>
          </button>

          <button
            onClick={() => setActiveTab("batch")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "batch"
                ? "bg-white text-purple-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>Batch CSV Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab("formula")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "formula"
                ? "bg-white text-purple-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>Mathematical Scoring Formula</span>
          </button>
        </div>

        {/* Real-time sync badge */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
          <span>Real-time Scoring Preview Active</span>
        </div>
      </div>

      {/* TAB 1: MANUAL SINGLE RECORD INGRESS */}
      {activeTab === "manual" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-purple-600" />
                  <span>Manual Incident Telemetry Entry</span>
                </h3>
                <button
                  type="button"
                  onClick={generateNewId}
                  className="text-xs font-mono font-semibold text-purple-600 hover:text-purple-700 underline cursor-pointer"
                >
                  Generate New ID
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter raw incident telemetry. As you type or adjust sliders, the mathematical computation evaluates live on the right.
              </p>

              {/* Scenario Preset Buttons */}
              <div className="mt-4 p-3 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider font-mono block">
                  Quick-Fill Real-World Telecom Scenarios:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadScenario("fiber")}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    🚨 Metro Core Fiber Cut (Mumbai P1)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadScenario("switch")}
                    className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    ⚡ Switch Memory Fault (Delhi P1)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadScenario("ran")}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    📡 5G RAN Sync Loss (Hyderabad P2)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadScenario("routine")}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    🔧 Routine Patch (Ahmedabad P3)
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitSingle} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Outage ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                    Outage Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={outageId}
                    onChange={(e) => setOutageId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-mono font-bold focus:bg-white focus:outline-none focus:border-purple-500"
                    placeholder="OUT-2026-0825-N105"
                  />
                </div>

                {/* Region Circle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                    Telecom Circle Region
                  </label>
                  <select
                    value={regionName}
                    onChange={(e) => setRegionName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-sans font-semibold focus:bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Mumbai">Mumbai (Premium Tier)</option>
                    <option value="Delhi NCR">Delhi NCR (Premium Tier)</option>
                    <option value="Bangalore">Bangalore (Premium Tier)</option>
                    <option value="Chennai">Chennai (High Tier)</option>
                    <option value="Hyderabad">Hyderabad (High Tier)</option>
                    <option value="Pune">Pune (Mid Tier)</option>
                    <option value="Kolkata">Kolkata (Mid Tier)</option>
                    <option value="Ahmedabad">Ahmedabad (Standard Tier)</option>
                    <option value="Jaipur">Jaipur (Standard Tier)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Node ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                    Node / Equipment ID
                  </label>
                  <input
                    type="text"
                    required
                    value={nodeId}
                    onChange={(e) => setNodeId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-mono focus:bg-white focus:outline-none focus:border-purple-500"
                    placeholder="Node-MUM-Core-02"
                  />
                </div>

                {/* Severity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                    Initial Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-sans font-semibold focus:bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Critical">Critical (P1 Base: 80)</option>
                    <option value="High">High (P2 Base: 60)</option>
                    <option value="Medium">Medium (P3 Base: 40)</option>
                    <option value="Low">Low (P3 Base: 20)</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                    Incident Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-sans font-semibold focus:bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="Active Triage">Active Triage</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Slider 1: Subscribers Affected */}
              <div className="space-y-2 p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>1. Customer Reach (Subscribers Affected)</span>
                  </label>
                  <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {subscribers.toLocaleString()} users
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60000"
                  step="500"
                  value={subscribers}
                  onChange={(e) => setSubscribers(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>0 (0 pts)</span>
                  <span>25,000 (17.5 pts)</span>
                  <span>50,000+ (35.0 pts Max)</span>
                </div>
              </div>

              {/* Slider 2: Complaints Count */}
              <div className="space-y-2 p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>2. Inbound Complaints Pressure</span>
                  </label>
                  <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    {complaints.toLocaleString()} tickets
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="25"
                  value={complaints}
                  onChange={(e) => setComplaints(Number(e.target.value))}
                  className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>0 (0 pts)</span>
                  <span>1,000 (15.0 pts)</span>
                  <span>2,000+ (30.0 pts Max)</span>
                </div>
              </div>

              {/* Slider 3: Duration */}
              <div className="space-y-2 p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>3. Elapsed Outage Duration</span>
                  </label>
                  <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    {durationHours.toFixed(1)} hrs ({liveEvaluation.duration_text})
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="12.0"
                  step="0.1"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>0.5h (1.05x Escalation)</span>
                  <span>4.0h (1.40x Escalation)</span>
                  <span>10.0h+ (1.50x Max)</span>
                </div>
              </div>

              {/* Root Cause */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                  Root Cause Diagnostic Description
                </label>
                <input
                  type="text"
                  required
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-sans focus:bg-white focus:outline-none focus:border-purple-500"
                  placeholder="Describe technical root cause"
                />
              </div>

              {/* Affected Services Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                  Impacted Network Services
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SERVICES.map((svc) => {
                    const isSelected = services.includes(svc);
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleService(svc)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{svc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm py-3 px-6 rounded-2xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Database className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "Evaluating & Committing to SQLite..."
                      : `Commit Record to SQLite Database (Score: ${liveEvaluation.impact_score})`}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Mathematical Computation Visualizer */}
          <div className="lg:col-span-5 space-y-6 sticky top-6">
            <div className="bg-[#130E26] text-white border border-[#2B1F54] rounded-3xl p-6 shadow-2xl space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2B1F54] pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
                    Mathematical Scoring Visualizer
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    Backend Evaluation Inspector
                  </h4>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-mono font-extrabold px-3 py-1 rounded-full border ${
                      liveEvaluation.priority_tier === "P1"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : liveEvaluation.priority_tier === "P2"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    }`}
                  >
                    {liveEvaluation.priority_tier} PRIORITY
                  </span>
                </div>
              </div>

              {/* Big Score Gauge */}
              <div className="py-4 flex flex-col items-center justify-center text-center">
                <div className="text-6xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                  {liveEvaluation.impact_score}
                  <span className="text-lg text-gray-400 font-normal"> / 100</span>
                </div>
                <p className="text-xs text-gray-300 font-medium mt-1">
                  Evaluated Priority: <strong>{liveEvaluation.priority_tier} Tier</strong> | SLA Target: <strong>{liveEvaluation.sla_target_hours}h</strong>
                </p>

                {/* SLA Status Pill */}
                <div className="mt-2.5">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      liveEvaluation.sla_status === "BREACHED"
                        ? "bg-rose-500/30 text-rose-300 border-rose-500"
                        : liveEvaluation.sla_status === "AT_RISK"
                        ? "bg-amber-500/30 text-amber-300 border-amber-500"
                        : "bg-emerald-500/30 text-emerald-300 border-emerald-500"
                    }`}
                  >
                    SLA Status: {liveEvaluation.sla_status}
                  </span>
                </div>

                {/* Stacked Bar */}
                <div className="w-full bg-[#231748] h-3 rounded-full mt-5 overflow-hidden flex shadow-inner">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${liveEvaluation.contributions.reach}%` }}
                    title={`Reach: +${liveEvaluation.contributions.reach} pts`}
                  />
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${liveEvaluation.contributions.complaints}%` }}
                    title={`Complaints: +${liveEvaluation.contributions.complaints} pts`}
                  />
                  <div
                    className="bg-purple-500 h-full transition-all duration-300"
                    style={{ width: `${liveEvaluation.contributions.revenue}%` }}
                    title={`Revenue: +${liveEvaluation.contributions.revenue} pts`}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${liveEvaluation.contributions.duration}%` }}
                    title={`Duration: +${liveEvaluation.contributions.duration} pts`}
                  />
                </div>
              </div>

              {/* 4-Factor Step-by-Step Breakdown Cards */}
              <div className="space-y-2 font-mono text-xs">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold font-sans">
                  Sub-Score Contribution Breakdown:
                </div>

                {/* Reach Card */}
                <div className="p-2.5 rounded-xl bg-[#1C143B] border border-[#2F225E] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <div>
                      <div className="text-white text-xs font-semibold">1. Customer Reach (35%)</div>
                      <div className="text-[10px] text-gray-400">
                        {subscribers.toLocaleString()} / 50k norm ({liveEvaluation.subscores.reach}%)
                      </div>
                    </div>
                  </div>
                  <span className="text-blue-400 font-bold text-sm">
                    +{liveEvaluation.contributions.reach} pts
                  </span>
                </div>

                {/* Complaints Card */}
                <div className="p-2.5 rounded-xl bg-[#1C143B] border border-[#2F225E] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <div>
                      <div className="text-white text-xs font-semibold">2. Complaint Pressure (30%)</div>
                      <div className="text-[10px] text-gray-400">
                        {complaints.toLocaleString()} / 2k norm ({liveEvaluation.subscores.complaints}%)
                      </div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-bold text-sm">
                    +{liveEvaluation.contributions.complaints} pts
                  </span>
                </div>

                {/* Revenue Card */}
                <div className="p-2.5 rounded-xl bg-[#1C143B] border border-[#2F225E] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <div>
                      <div className="text-white text-xs font-semibold">3. Revenue Exposure (20%)</div>
                      <div className="text-[10px] text-gray-400">
                        {liveEvaluation.revenue_tier} Circle ({liveEvaluation.subscores.revenue}%)
                      </div>
                    </div>
                  </div>
                  <span className="text-purple-400 font-bold text-sm">
                    +{liveEvaluation.contributions.revenue} pts
                  </span>
                </div>

                {/* Duration Card */}
                <div className="p-2.5 rounded-xl bg-[#1C143B] border border-[#2F225E] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <div>
                      <div className="text-white text-xs font-semibold">4. Duration &amp; Severity (15%)</div>
                      <div className="text-[10px] text-gray-400">
                        {severity} base × {durationHours.toFixed(1)}h duration
                      </div>
                    </div>
                  </div>
                  <span className="text-rose-400 font-bold text-sm">
                    +{liveEvaluation.contributions.duration} pts
                  </span>
                </div>
              </div>

              {/* Mathematical Equation Box */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-1.5 text-[11px] font-mono">
                <div className="text-purple-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Mathematical Proof:</span>
                </div>
                <div className="text-gray-300 text-[10.5px]">
                  {liveEvaluation.formula.calculation}
                </div>
                <div className="text-emerald-400 font-bold text-[10.5px]">
                  Result: Score {liveEvaluation.impact_score} ➔ {liveEvaluation.priority_tier} Tier Resolution
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATCH CSV MULTI-INCIDENT INGESTION */}
      {activeTab === "batch" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                  <span>Bulk Multi-Incident CSV Ingestion</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a CSV file or paste raw CSV incident data. Every row is parsed and evaluated against the mathematical scoring logic.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" />
                  <span>Download Sample CSV</span>
                </button>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .CSV File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* CSV Paste Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                  CSV Data Editor / Paste Buffer
                </label>
                <button
                  type="button"
                  onClick={() => setCsvText(SAMPLE_BATCH_CSV)}
                  className="text-xs font-mono text-purple-600 hover:text-purple-700 underline cursor-pointer"
                >
                  Reset to Sample Template
                </button>
              </div>
              <textarea
                rows={7}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full bg-gray-900 text-emerald-300 font-mono text-xs rounded-2xl p-4 border border-gray-800 focus:outline-none focus:border-purple-500 leading-relaxed"
                placeholder="outage_id,region_name,node_id,severity,subscribers_affected,complaints_count,duration_hours,revenue_tier,root_cause,status"
              />
            </div>

            {/* Batch Mathematical Evaluation Preview Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900">
                    Batch Mathematical Scoring Preview Table
                  </h4>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    {parsedCsvPreview.length} records parsed
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  P1: <strong>{parsedCsvPreview.filter((r) => r.eval.priority_tier === "P1").length}</strong> | P2: <strong>{parsedCsvPreview.filter((r) => r.eval.priority_tier === "P2").length}</strong> | P3: <strong>{parsedCsvPreview.filter((r) => r.eval.priority_tier === "P3").length}</strong>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Outage ID</th>
                      <th className="p-3">Region</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Subscribers</th>
                      <th className="p-3">Complaints</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Evaluated Score</th>
                      <th className="p-3">Priority Tier</th>
                      <th className="p-3">SLA Target</th>
                      <th className="p-3">SLA Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {parsedCsvPreview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3 font-mono text-gray-400 font-bold">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-gray-900">{row.outage_id}</td>
                        <td className="p-3 font-semibold text-gray-800">{row.region_name}</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              row.severity === "Critical"
                                ? "bg-rose-100 text-rose-800"
                                : row.severity === "High"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {row.severity}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{row.subscribers.toLocaleString()}</td>
                        <td className="p-3 font-mono">{row.complaints.toLocaleString()}</td>
                        <td className="p-3 font-mono">{row.duration_hours}h</td>
                        <td className="p-3 font-mono font-black text-purple-700 text-sm">
                          {row.eval.impact_score}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                              row.eval.priority_tier === "P1"
                                ? "bg-rose-500/20 text-rose-700 border-rose-300"
                                : row.eval.priority_tier === "P2"
                                ? "bg-amber-500/20 text-amber-700 border-amber-300"
                                : "bg-blue-500/20 text-blue-700 border-blue-300"
                            }`}
                          >
                            {row.eval.priority_tier}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-gray-600">{row.eval.sla_target_hours}h</td>
                        <td className="p-3">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              row.eval.sla_status === "BREACHED"
                                ? "bg-rose-100 text-rose-800"
                                : row.eval.sla_status === "AT_RISK"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {row.eval.sla_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Commit Batch Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmitBatch}
                disabled={isSubmitting || parsedCsvPreview.length === 0}
                className="w-full bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm py-3 px-6 rounded-2xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Evaluating & Ingesting Batch..."
                    : `Commit Batch (${parsedCsvPreview.length} Records) to SQLite Database`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATHEMATICAL SCORING FORMULA EXPLANATION */}
      {activeTab === "formula" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>OutageIQ Mathematical Scoring Logic &amp; Resolution Engine</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Zero Black Box: Here is the exact transparent formula executed in both the Python backend and UI evaluation simulator.
            </p>
          </div>

          <div className="bg-[#130E26] text-white p-6 rounded-2xl border border-[#2C1F54] space-y-4">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
              Core Vectorized Equation
            </span>
            <div className="font-mono text-sm sm:text-base text-amber-300 font-bold p-3.5 bg-black/40 rounded-xl border border-white/10 overflow-x-auto">
              Impact Score = (0.35 × S_reach) + (0.30 × S_complaints) + (0.20 × S_revenue) + (0.15 × S_duration)
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Every score evaluates between <strong>0.0 and 100.0 points</strong>. Normalization scales each raw operational signal against telecom circle thresholds before applying weighted multipliers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reach */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>1. Customer Reach (35% Weight)</span>
              </div>
              <div className="font-mono text-xs text-blue-900 font-semibold bg-white p-2 rounded-lg border border-blue-200">
                S_reach = min(100, (Subscribers / 50,000) × 100)
              </div>
              <p className="text-[11px] text-gray-600">
                Measures the percentage of circle customer base experiencing service blackout. Maximum 35.0 composite points.
              </p>
            </div>

            {/* Complaints */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span>2. Complaint Pressure (30% Weight)</span>
              </div>
              <div className="font-mono text-xs text-amber-900 font-semibold bg-white p-2 rounded-lg border border-amber-200">
                S_complaints = min(100, (Inbound Complaints / 2,000) × 100)
              </div>
              <p className="text-[11px] text-gray-600">
                Tracks live inbound support call center, mobile app, and portal complaint arrival rates. Maximum 30.0 composite points.
              </p>
            </div>

            {/* Revenue */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
              <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span>3. Revenue Exposure (20% Weight)</span>
              </div>
              <div className="font-mono text-xs text-purple-900 font-semibold bg-white p-2 rounded-lg border border-purple-200">
                Premium: 95 | High: 75 | Mid: 55 | Standard: 30
              </div>
              <p className="text-[11px] text-gray-600">
                Accounts for regional ARPU, enterprise SLAs, and business market density. Maximum 20.0 composite points.
              </p>
            </div>

            {/* Duration */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
              <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>4. Duration &amp; Severity (15% Weight)</span>
              </div>
              <div className="font-mono text-xs text-rose-900 font-semibold bg-white p-2 rounded-lg border border-rose-200">
                S_dur = min(100, Base_sev × (1.0 + Duration_hours / 10))
              </div>
              <p className="text-[11px] text-gray-600">
                Severity baseline (Critical=80, High=60, Medium=40, Low=20) scaled up over time as an outage remains open. Maximum 15.0 composite points.
              </p>
            </div>
          </div>

          {/* Priority Tier Mapping Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">
              Operational Priority Tier &amp; SLA Resolution Rules
            </span>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Priority Tier</th>
                    <th className="p-3">Score Threshold</th>
                    <th className="p-3">Target SLA Window</th>
                    <th className="p-3">Operational Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-rose-50/30">
                    <td className="p-3 font-bold text-rose-700">P1 — Critical</td>
                    <td className="p-3 font-mono font-bold">Score ≥ 75.0</td>
                    <td className="p-3 font-mono font-bold text-rose-700">2.0 Hours</td>
                    <td className="p-3 text-gray-700">Immediate executive escalation and emergency optical field tech dispatch</td>
                  </tr>
                  <tr className="bg-amber-50/30">
                    <td className="p-3 font-bold text-amber-700">P2 — High</td>
                    <td className="p-3 font-mono font-bold">50.0 ≤ Score &lt; 75.0</td>
                    <td className="p-3 font-mono font-bold text-amber-700">4.0 Hours</td>
                    <td className="p-3 text-gray-700">High operational priority triage within standard SLA</td>
                  </tr>
                  <tr className="bg-blue-50/30">
                    <td className="p-3 font-bold text-blue-700">P3 — Medium</td>
                    <td className="p-3 font-mono font-bold">25.0 ≤ Score &lt; 50.0</td>
                    <td className="p-3 font-mono font-bold text-blue-700">8.0 Hours</td>
                    <td className="p-3 text-gray-700">Standard operational queue prioritization</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-600">P3 — Low</td>
                    <td className="p-3 font-mono font-bold">Score &lt; 25.0</td>
                    <td className="p-3 font-mono font-bold text-gray-600">24.0 Hours</td>
                    <td className="p-3 text-gray-700">Low business impact or scheduled routine maintenance event</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

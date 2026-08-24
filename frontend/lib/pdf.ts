import { OutageItem } from "./data";

/**
 * Generates an RFC-compliant binary PDF-1.4 Blob for Executive Incident Briefings.
 */
export function buildPdfBlob(params: {
  title: string;
  subtitle: string;
  kpis: { label: string; value: string; sub: string }[];
  topOutages: OutageItem[];
}): Blob {
  const streamLines: string[] = [];

  // Header bar background (dark purple)
  streamLines.push("0.12 0.08 0.28 rg");
  streamLines.push("30 710 552 60 re");
  streamLines.push("f");

  // Title & Subtitle in white
  streamLines.push("BT");
  streamLines.push("1 1 1 rg");
  streamLines.push("/F1 16 Tf");
  streamLines.push("45 745 Td");
  const cleanTitle = params.title.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  streamLines.push(`(${cleanTitle}) Tj`);
  streamLines.push("/F2 9 Tf");
  streamLines.push("0 -18 Td");
  const cleanSub = params.subtitle.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  streamLines.push(`(${cleanSub}) Tj`);
  streamLines.push("ET");

  // KPI Section Title
  streamLines.push("BT");
  streamLines.push("0.15 0.15 0.2 rg");
  streamLines.push("/F1 11 Tf");
  streamLines.push("45 680 Td");
  streamLines.push("(1. Executive Operations KPI Summary) Tj");
  streamLines.push("ET");

  // 4 KPI Cards
  const yKpi = 615;
  params.kpis.forEach((kpi, i) => {
    const xKpi = 45 + i * 135;
    streamLines.push("0.96 0.96 0.98 rg");
    streamLines.push(`${xKpi} ${yKpi} 125 50 re`);
    streamLines.push("f");
    streamLines.push("0.85 0.85 0.9 rg");
    streamLines.push(`${xKpi} ${yKpi} 125 50 re`);
    streamLines.push("s");

    streamLines.push("BT");
    streamLines.push("0.4 0.4 0.5 rg");
    streamLines.push("/F1 7 Tf");
    streamLines.push(`${xKpi + 10} ${yKpi + 35} Td`);
    streamLines.push(`(${kpi.label.toUpperCase()}) Tj`);
    streamLines.push("0.1 0.1 0.2 rg");
    streamLines.push("/F1 13 Tf");
    streamLines.push("0 -15 Td");
    streamLines.push(`(${kpi.value}) Tj`);
    streamLines.push("0.4 0.4 0.5 rg");
    streamLines.push("/F2 7 Tf");
    streamLines.push("0 -10 Td");
    streamLines.push(`(${kpi.sub}) Tj`);
    streamLines.push("ET");
  });

  // Table Section Title
  streamLines.push("BT");
  streamLines.push("0.15 0.15 0.2 rg");
  streamLines.push("/F1 11 Tf");
  streamLines.push("45 580 Td");
  streamLines.push("(2. Top Prioritized Critical Outages) Tj");
  streamLines.push("ET");

  // Table Header Row
  const yTbl = 550;
  streamLines.push("0.92 0.90 0.98 rg");
  streamLines.push(`45 ${yTbl} 522 20 re`);
  streamLines.push("f");
  streamLines.push("BT");
  streamLines.push("0.3 0.2 0.5 rg");
  streamLines.push("/F1 8 Tf");
  streamLines.push(`55 ${yTbl + 6} Td`);
  streamLines.push("(RANK) Tj");
  streamLines.push("35 0 Td");
  streamLines.push("(OUTAGE ID) Tj");
  streamLines.push("110 0 Td");
  streamLines.push("(REGION) Tj");
  streamLines.push("70 0 Td");
  streamLines.push("(SEVERITY) Tj");
  streamLines.push("60 0 Td");
  streamLines.push("(SCORE) Tj");
  streamLines.push("50 0 Td");
  streamLines.push("(COMPLAINTS) Tj");
  streamLines.push("70 0 Td");
  streamLines.push("(STATUS) Tj");
  streamLines.push("ET");

  // Table Rows
  let currY = yTbl;
  params.topOutages.forEach((out, idx) => {
    currY -= 26;
    if (idx % 2 === 1) {
      streamLines.push("0.98 0.98 0.99 rg");
      streamLines.push(`45 ${currY} 522 24 re`);
      streamLines.push("f");
    }
    streamLines.push("0.9 0.9 0.92 rg");
    streamLines.push(`45 ${currY} 522 24 re`);
    streamLines.push("s");

    streamLines.push("BT");
    streamLines.push("0.2 0.2 0.3 rg");
    streamLines.push("/F2 8 Tf");
    streamLines.push(`55 ${currY + 8} Td`);
    streamLines.push(`(#${idx + 1}) Tj`);
    streamLines.push("35 0 Td");
    streamLines.push("/F1 8 Tf");
    streamLines.push(`(${out.id}) Tj`);
    streamLines.push("/F2 8 Tf");
    streamLines.push("110 0 Td");
    streamLines.push(`(${out.region}) Tj`);
    streamLines.push("70 0 Td");
    streamLines.push(`(${out.severity}) Tj`);
    streamLines.push("60 0 Td");
    streamLines.push("/F1 8 Tf");
    streamLines.push(`(${out.impactScore}) Tj`);
    streamLines.push("/F2 8 Tf");
    streamLines.push("50 0 Td");
    streamLines.push(`(${out.complaints.toLocaleString()}) Tj`);
    streamLines.push("70 0 Td");
    streamLines.push(`(${out.status}) Tj`);
    streamLines.push("ET");
  });

  // Footer Note
  streamLines.push("BT");
  streamLines.push("0.5 0.5 0.6 rg");
  streamLines.push("/F2 7 Tf");
  streamLines.push("45 40 Td");
  streamLines.push("(Generated automatically by OutageIQ Real-time Prioritization Engine | Classification: Confidential) Tj");
  streamLines.push("ET");

  const streamContent = streamLines.join("\n");
  const obj6 = `6 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`;

  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    obj6,
  ];

  const header = "%PDF-1.4\n";
  const offsets: number[] = [0];
  let currOffset = header.length;

  for (const obj of objects) {
    offsets.push(currOffset);
    currOffset += obj.length + 1;
  }

  let xrefStr = "xref\n0 7\n0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    xrefStr += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${currOffset}\n%%EOF\n`;

  const fullPdf = header + objects.join("\n") + "\n" + xrefStr + trailer;
  return new Blob([fullPdf], { type: "application/pdf" });
}

/**
 * Triggers download of the generated PDF document.
 */
export async function downloadExecutivePdf(params?: {
  title?: string;
  subtitle?: string;
  kpis?: { label: string; value: string; sub: string }[];
  topOutages?: OutageItem[];
}) {
  // First attempt to fetch directly from Python backend /api/export/pdf
  try {
    const res = await fetch("/api/export/pdf");
    if (res.ok && res.headers.get("content-type")?.includes("pdf")) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OutageIQ_Executive_Briefing_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
  } catch (_) {}

  // Fallback to client-side binary PDF builder
  const title = params?.title || "OutageIQ Executive Incident Briefing";
  const subtitle = params?.subtitle || `Generated: ${new Date().toISOString().split("T")[0]} | Classification: Confidential`;
  const kpis = params?.kpis || [
    { label: "Active Outages", value: "24", sub: "+6 vs yesterday" },
    { label: "Critical P1", value: "5", sub: "Requires action" },
    { label: "Total Reach", value: "2.48M", sub: "Across 8 circles" },
    { label: "SLA Compliance", value: "84%", sub: "Target >= 90%" },
  ];
  const topOutages = params?.topOutages || [];

  const blob = buildPdfBlob({ title, subtitle, kpis, topOutages });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `OutageIQ_Executive_Briefing_${new Date().toISOString().split("T")[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


import { jsPDF } from "jspdf";

export interface AiReportSection {
  heading: string;
  content: string | string[];
}

interface DownloadAiReportOptions {
  title: string;
  subtitle?: string;
  fileName: string;
  sections: AiReportSection[];
  disclaimer?: string;
}

export const downloadAiReportPdf = ({
  title,
  subtitle,
  fileName,
  sections,
  disclaimer,
}: DownloadAiReportOptions): void => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 18;

  let y = 20;

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - bottomMargin) {
      pdf.addPage();
      y = 20;
    }
  };

  // Report title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);

  const titleLines = pdf.splitTextToSize(title, contentWidth);

  ensureSpace(titleLines.length * 9 + 12);
  pdf.text(titleLines, margin, y);

  y += titleLines.length * 9 + 3;

  // Optional subtitle
  if (subtitle) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const subtitleLines = pdf.splitTextToSize(
      subtitle,
      contentWidth,
    );

    ensureSpace(subtitleLines.length * 5 + 8);
    pdf.text(subtitleLines, margin, y);

    y += subtitleLines.length * 5 + 5;
  }

  // Report generation date
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(
    `Generated: ${new Date().toLocaleString()}`,
    margin,
    y,
  );

  y += 7;

  // Divider
  pdf.setDrawColor(180, 180, 180);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Report sections
  for (const section of sections) {
    ensureSpace(16);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);

    pdf.text(section.heading, margin, y);
    y += 7;

    const items = Array.isArray(section.content)
      ? section.content
      : [section.content];

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    if (items.length === 0) {
      const emptyLines = pdf.splitTextToSize(
        "None identified.",
        contentWidth,
      );

      ensureSpace(emptyLines.length * 5 + 3);
      pdf.text(emptyLines, margin, y);
      y += emptyLines.length * 5 + 3;
    }

    for (const item of items) {
      const value = String(item ?? "").trim();

      if (!value) continue;

      const lines = pdf.splitTextToSize(
        Array.isArray(section.content)
          ? `- ${value}`
          : value,
        contentWidth,
      );

      for (const line of lines) {
        ensureSpace(5);
        pdf.text(line, margin, y);
        y += 5;
      }

      y += 2;
    }

    y += 3;
  }

  // Disclaimer
  if (disclaimer) {
    const disclaimerLines = pdf.splitTextToSize(
      disclaimer,
      contentWidth,
    );

    ensureSpace(disclaimerLines.length * 4.5 + 12);

    pdf.setDrawColor(180, 180, 180);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 7;

    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);

    for (const line of disclaimerLines) {
      ensureSpace(4.5);
      pdf.text(line, margin, y);
      y += 4.5;
    }
  }

  // Page numbers
  const totalPages = pdf.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    pdf.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" },
    );
  }

  const safeFileName = fileName
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\.pdf$/i, "")
    .trim();

  pdf.save(`${safeFileName || "AI-Report"}.pdf`);
};

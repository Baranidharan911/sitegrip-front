// utils/exportPDF.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportComponentToPDF(componentId: string, filename = 'seo_crawl_report.pdf') {
  const element = document.getElementById(componentId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    scrollY: -window.scrollY,
    windowWidth: document.body.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);
  const ratio = imgProps.width / imgProps.height;
  const pdfHeight = pageWidth / ratio;

  let position = 0;
  while (position < pdfHeight) {
    pdf.addImage(imgData, 'PNG', 0, -position, pageWidth, pdfHeight);
    position += pageHeight;
    if (position < pdfHeight) pdf.addPage();
  }

  pdf.save(filename);
}

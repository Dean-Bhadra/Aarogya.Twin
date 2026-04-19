import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPdf = async (elementId, filename = 'AarogyaTwin_Report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Add a temporary style to ensure the background is captured correctly, especially for dark mode
    const originalBg = element.style.background;
    element.style.background = 'var(--bg)'; // or '#0a0f1e'

    const canvas = await html2canvas(element, {
      scale: 2, // Higher density for better text resolution
      useCORS: true,
      logging: false,
      backgroundColor: null, // Transparent to let our bg style through
    });

    element.style.background = originalBg;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Handle multi-page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
  }
};

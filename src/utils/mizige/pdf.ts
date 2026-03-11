import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export async function exportToPdf(
  element: HTMLElement,
  paperSize: 'a4' | 'letter' = 'a4'
) {
  const prevBgImage = element.style.backgroundImage;
  const prevBorderRadius = element.style.borderRadius;
  element.style.backgroundImage = 'none';
  element.style.borderRadius = '0';

  // Force all animated rows to full opacity — uses renamed class
  const animatedEls = element.querySelectorAll<HTMLElement>('.mizige-fade-in-up');
  animatedEls.forEach((el) => {
    el.style.animation = 'none';
    el.style.opacity = '1';
  });

  const containerRect = element.getBoundingClientRect();
  const rowEls = element.querySelectorAll<HTMLElement>('.mizige-fade-in-up');
  const rowBreaks: number[] = [0];
  rowEls.forEach((row) => {
    const rect = row.getBoundingClientRect();
    const bottom = rect.bottom - containerRect.top;
    rowBreaks.push(bottom);
  });

  const scale = 2;
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: '#f5e6c8',
  });

  element.style.backgroundImage = prevBgImage;
  element.style.borderRadius = prevBorderRadius;
  animatedEls.forEach((el) => {
    el.style.animation = '';
    el.style.opacity = '';
  });

  const pageWidthMm = paperSize === 'a4' ? 210 : 215.9;
  const pageHeightMm = paperSize === 'a4' ? 297 : 279.4;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: paperSize,
  });

  const pxToMm = pageWidthMm / containerRect.width;
  const marginTopMm = 10;
  const usablePageHeightMm = pageHeightMm - marginTopMm;
  const pageHeightPx = usablePageHeightMm / pxToMm;

  const pages: { startPx: number; endPx: number }[] = [];
  let currentStartPx = 0;

  while (currentStartPx < containerRect.height) {
    const idealEndPx = currentStartPx + pageHeightPx;

    let bestBreak = idealEndPx;
    for (let i = rowBreaks.length - 1; i >= 0; i--) {
      if (rowBreaks[i] <= idealEndPx && rowBreaks[i] > currentStartPx) {
        bestBreak = rowBreaks[i];
        break;
      }
    }

    if (bestBreak <= currentStartPx) {
      bestBreak = idealEndPx;
    }

    pages.push({ startPx: currentStartPx, endPx: Math.min(bestBreak, containerRect.height) });
    currentStartPx = bestBreak;

    if (bestBreak >= containerRect.height) break;
  }

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();

    pdf.setFillColor(245, 230, 200);
    pdf.rect(0, 0, pageWidthMm, pageHeightMm, 'F');

    const { startPx, endPx } = pages[i];
    const cropY = Math.round(startPx * scale);
    const cropH = Math.round((endPx - startPx) * scale);
    const cropW = canvas.width;

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = cropW;
    pageCanvas.height = cropH;
    const ctx = pageCanvas.getContext('2d')!;

    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(0, 0, cropW, cropH);

    ctx.drawImage(canvas, 0, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const pageImgData = pageCanvas.toDataURL('image/png');
    const imgWidthMm = pageWidthMm;
    const imgHeightMm = (endPx - startPx) * pxToMm;

    pdf.addImage(pageImgData, 'PNG', 0, marginTopMm, imgWidthMm, imgHeightMm);
  }

  pdf.save('mizige-worksheet.pdf');
}

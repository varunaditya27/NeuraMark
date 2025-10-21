/**
 * PDF Certificate Generator for NeuraMark
 * 
 * Generates professional, glassmorphism-inspired proof certificates
 * with QR codes linking to blockchain transactions.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

/**
 * Certificate data structure
 */
export interface CertificateData {
  proofTitle: string;
  creatorWallet: string;
  ipfsCID: string;
  txHash: string;
  timestamp: string;
  proofFingerprint: string;
  modelInfo?: string;
  etherscanUrl?: string;
}

/**
 * Generates a professional proof certificate PDF
 * 
 * @param data Certificate data including proof details
 * @returns PDF as Uint8Array buffer
 */
export async function generateProofCertificate(
  data: CertificateData
): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page (A4 size: 595 x 842 points)
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  // Embed fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

  // Color palette (glassmorphism-inspired)
  const darkBg = rgb(0.055, 0.055, 0.071); // #0E0E12
  const primaryColor = rgb(0.388, 0.4, 0.945); // #6366F1 (Indigo)
  const secondaryColor = rgb(0.078, 0.722, 0.651); // #14B8A6 (Teal)
  const lightText = rgb(0.95, 0.95, 0.95);
  const mutedText = rgb(0.7, 0.7, 0.7);

  // Draw dark background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: darkBg,
  });

  // Draw decorative header gradient effect (simulated with rectangles)
  page.drawRectangle({
    x: 0,
    y: height - 150,
    width,
    height: 150,
    color: rgb(0.388, 0.4, 0.945),
    opacity: 0.1,
  });

  // Draw decorative accent line
  page.drawRectangle({
    x: 0,
    y: height - 155,
    width,
    height: 3,
    color: primaryColor,
  });

  let currentY = height - 60;

  // === HEADER SECTION ===
  
  // NeuraMark Logo Text (centered)
  page.drawText('NEURAMARK', {
    x: width / 2 - 70,
    y: currentY,
    size: 28,
    font: boldFont,
    color: lightText,
  });

  currentY -= 40;

  // Certificate Title
  page.drawText('PROOF OF AUTHORSHIP CERTIFICATE', {
    x: width / 2 - 165,
    y: currentY,
    size: 16,
    font: boldFont,
    color: secondaryColor,
  });

  currentY -= 25;

  // Verification Badge
  page.drawText('VERIFIED BY NEURAMARK', {
    x: width / 2 - 75,
    y: currentY,
    size: 11,
    font: boldFont,
    color: secondaryColor,
  });

  currentY -= 60;

  // === PROOF TITLE SECTION ===
  
  page.drawText('Proof Title:', {
    x: 60,
    y: currentY,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });

  currentY -= 20;

  // Wrap proof title if too long
  const wrappedTitle = wrapText(data.proofTitle, 70);
  for (const line of wrappedTitle) {
    page.drawText(line, {
      x: 60,
      y: currentY,
      size: 14,
      font: boldFont,
      color: lightText,
    });
    currentY -= 18;
  }

  currentY -= 20;

  // === CREATOR SECTION ===
  
  page.drawText('Creator Wallet Address:', {
    x: 60,
    y: currentY,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });

  currentY -= 20;

  page.drawText(data.creatorWallet, {
    x: 60,
    y: currentY,
    size: 10,
    font: monoFont,
    color: lightText,
  });

  currentY -= 35;

  // === MODEL INFO SECTION (if provided) ===
  
  if (data.modelInfo) {
    page.drawText('AI Model:', {
      x: 60,
      y: currentY,
      size: 12,
      font: boldFont,
      color: primaryColor,
    });

    currentY -= 20;

    page.drawText(data.modelInfo, {
      x: 60,
      y: currentY,
      size: 11,
      font: regularFont,
      color: lightText,
    });

    currentY -= 35;
  }

  // === TIMESTAMP SECTION ===
  
  page.drawText('Registration Date:', {
    x: 60,
    y: currentY,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });

  currentY -= 20;

  page.drawText(formatTimestamp(data.timestamp), {
    x: 60,
    y: currentY,
    size: 11,
    font: regularFont,
    color: lightText,
  });

  currentY -= 35;

  // === BLOCKCHAIN SECTION ===
  
  page.drawText('Blockchain Transaction:', {
    x: 60,
    y: currentY,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });

  currentY -= 20;

  page.drawText(data.txHash, {
    x: 60,
    y: currentY,
    size: 9,
    font: monoFont,
    color: lightText,
  });

  currentY -= 30;

  // === IPFS SECTION ===
  
  page.drawText('IPFS Content ID:', {
    x: 60,
    y: currentY,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });

  currentY -= 20;

  page.drawText(data.ipfsCID, {
    x: 60,
    y: currentY,
    size: 9,
    font: monoFont,
    color: lightText,
  });

  currentY -= 30;

  // === PROOF FINGERPRINT SECTION ===
  
  page.drawText('Proof Fingerprint (SHA-256):', {
    x: 60,
    y: currentY,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });

  currentY -= 20;

  // Split fingerprint into two lines for readability
  const fp1 = data.proofFingerprint.substring(0, 35);
  const fp2 = data.proofFingerprint.substring(35);

  page.drawText(fp1, {
    x: 60,
    y: currentY,
    size: 9,
    font: monoFont,
    color: lightText,
  });

  currentY -= 15;

  page.drawText(fp2, {
    x: 60,
    y: currentY,
    size: 9,
    font: monoFont,
    color: lightText,
  });

  currentY -= 40;

  // === QR CODE SECTION ===
  
  // Generate QR code as data URL
  const qrUrl = data.etherscanUrl || `https://sepolia.etherscan.io/tx/${data.txHash}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 150,
    margin: 1,
    color: {
      dark: '#FFFFFF',
      light: '#0E0E12',
    },
  });

  // Embed QR code image
  const qrImage = await pdfDoc.embedPng(qrDataUrl);
  const qrDims = qrImage.scale(0.8);

  page.drawImage(qrImage, {
    x: width - 180,
    y: currentY - 120,
    width: qrDims.width,
    height: qrDims.height,
  });

  // QR code label
  page.drawText('Scan to Verify', {
    x: width - 170,
    y: currentY - 140,
    size: 10,
    font: boldFont,
    color: mutedText,
  });

  page.drawText('on Etherscan', {
    x: width - 170,
    y: currentY - 155,
    size: 9,
    font: regularFont,
    color: mutedText,
  });

  // === FOOTER SECTION ===
  
  const footerY = 80;

  // Draw footer separator line
  page.drawRectangle({
    x: 60,
    y: footerY + 30,
    width: width - 120,
    height: 1,
    color: mutedText,
    opacity: 0.3,
  });

  // Footer text (centered)
  const footerText = 'This certificate verifies the authorship and originality of AI-generated content';
  const footerText2 = 'registered on the Ethereum blockchain via NeuraMark.';

  page.drawText(footerText, {
    x: width / 2 - 230,
    y: footerY,
    size: 9,
    font: regularFont,
    color: mutedText,
  });

  page.drawText(footerText2, {
    x: width / 2 - 180,
    y: footerY - 15,
    size: 9,
    font: regularFont,
    color: mutedText,
  });

  // Certificate ID (bottom right)
  page.drawText(`Certificate ID: ${data.proofFingerprint.substring(0, 16)}...`, {
    x: 60,
    y: 40,
    size: 8,
    font: monoFont,
    color: mutedText,
  });

  // Generation date (bottom left)
  const genDate = new Date().toISOString().split('T')[0];
  page.drawText(`Generated: ${genDate}`, {
    x: width - 180,
    y: 40,
    size: 8,
    font: regularFont,
    color: mutedText,
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}

/**
 * Wraps text to fit within a specified character width
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * Formats ISO timestamp into human-readable date
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return timestamp;
  }
}

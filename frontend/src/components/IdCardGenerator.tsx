import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { User } from '../api/api';
import './IdCardGenerator.css';

interface IdCardGeneratorProps {
  staff: User;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function formatDate(d?: string | Date | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function IdCardGenerator({ staff }: IdCardGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const verifyUrl = `https://suethiopia.org/erp/verify/${staff.idNumber}`;
  const photoSrc = staff.photoUrl
    ? (staff.photoUrl.startsWith('http') ? staff.photoUrl : `${BASE_URL}${staff.photoUrl}`)
    : null;

  const fullNameAm = staff.fullNameAmharic ||
    [staff.titleAm, staff.firstNameAm, staff.lastNameAm].filter(Boolean).join(' ') || '—';
  const fullNameEn = [staff.title, staff.full_name].filter(Boolean).join(' ');
  const deptEn = staff.department || staff.area || staff.subRegion || staff.region || 'HEAD OFFICE';
  const deptAm = staff.departmentAm || 'ዋና መሥሪያ ቤት';

  const generatePDF = async () => {
    if (!frontRef.current || !backRef.current || !staff.idNumber) return;
    setIsGenerating(true);
    try {
      // Give the browser time to physically draw Amharic glyphs & load logo
      await new Promise(resolve => setTimeout(resolve, 800));

      // Capture front and back at native 1011px width (= 300 DPI for CR80)
      const [frontCanvas, backCanvas] = await Promise.all([
        html2canvas(frontRef.current, { scale: 4, useCORS: true, logging: true, backgroundColor: '#ffffff' }),
        html2canvas(backRef.current, { scale: 4, useCORS: true, logging: true, backgroundColor: '#ffffff' }),
      ]);

      // Landscape A4 = 297mm × 210mm
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();  // 297
      const pageH = pdf.internal.pageSize.getHeight(); // 210

      // CR80 = 85.6 × 54 mm  (landscape)
      const cardW = 85.6;
      const cardH = 54;
      // const margin = 10;
      const cropLen = 4;
      const cropGap = 2;

      // Place front on left half, back on right half, both vertically centered
      const frontX = (pageW / 2 - cardW) / 2;
      const backX  = pageW / 2 + (pageW / 2 - cardW) / 2;
      const cardY  = (pageH - cardH) / 2;

      const frontImg = frontCanvas.toDataURL('image/png');
      const backImg  = backCanvas.toDataURL('image/png');
      pdf.addImage(frontImg, 'PNG', frontX, cardY, cardW, cardH);
      pdf.addImage(backImg,  'PNG', backX,  cardY, cardW, cardH);

      // Draw crop marks function
      const drawCropMarks = (x: number, y: number) => {
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.2);
        // Top-left
        pdf.line(x - cropGap - cropLen, y, x - cropGap, y);
        pdf.line(x, y - cropGap - cropLen, x, y - cropGap);
        // Top-right corner (x+w, y)
        pdf.line(x + cardW + cropGap, y, x + cardW + cropGap + cropLen, y);
        pdf.line(x + cardW, y - cropGap - cropLen, x + cardW, y - cropGap);
        // Bottom-left (x, y+h)
        pdf.line(x - cropGap - cropLen, y + cardH, x - cropGap, y + cardH);
        pdf.line(x, y + cardH + cropGap, x, y + cardH + cropGap + cropLen);
        // Bottom-right
        pdf.line(x + cardW + cropGap, y + cardH, x + cardW + cropGap + cropLen, y + cardH);
        pdf.line(x + cardW, y + cardH + cropGap, x + cardW, y + cardH + cropGap + cropLen);
      };

      drawCropMarks(frontX, cardY);
      drawCropMarks(backX, cardY);

      // Divider line down center
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(pageW / 2, 5, pageW / 2, pageH - 5);
      pdf.setLineDashPattern([], 0);

      // Labels
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text('FRONT', frontX + cardW / 2, cardY - cropGap - cropLen - 2, { align: 'center' });
      pdf.text('BACK',  backX  + cardW / 2, cardY - cropGap - cropLen - 2, { align: 'center' });

      // Instructions at bottom
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        'Cut along crop marks · Laminate · Fold along center line if double-sided  |  በመቁረጫ ምልክቶቹ ቁረጥ · ሽፋን ይደረጉ · በመሃሉ ይጠፍ',
        pageW / 2, pageH - 4, { align: 'center' }
      );

      pdf.save(`StaffID_${staff.idNumber?.replace('/', '-')}_${staff.full_name.replace(/\s+/g, '_')}.pdf`);
    } catch (err: any) {
      console.error('PDF generation failed', err);
      alert('Failed to generate ID card PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="id-card-action">
      <button
        className="id-card-btn"
        onClick={generatePDF}
        disabled={isGenerating || !staff.idNumber}
        title={!staff.idNumber ? 'Staff requires an ID Number first' : 'Download Printable PDF'}
      >
        <span className="material-symbols-outlined">badge</span>
        {isGenerating ? 'Generating…' : 'ID Card'}
      </button>

      {/* ══════════════════ FRONT – 1011 × 638 px (CR80 @ 300 DPI) ══════════════════ */}
      <div className="id-card-hidden-render">
        <div className="id-card-preview-scale">
          <div className="id-cr80" ref={frontRef} style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}>
            {/* Header */}
            <div className="id-header">
              <img src="/logo.png" alt="SUE Logo" crossOrigin="anonymous" className="id-logo" />
              <div className="id-org-name">
                <span className="id-org-am">የኢትዮጵያ የቃለ እግዚአብሔር አንባቢዎች ማኅበር</span>
                <span className="id-org-en">Scripture Union of Ethiopia</span>
              </div>
            </div>

            {/* Body */}
            <div className="id-body">
              {/* Photo */}
              <div className="id-photo-wrap">
                {photoSrc ? (
                  <img src={photoSrc} alt="Staff" crossOrigin="anonymous" className="id-photo" />
                ) : (
                  <div className="id-photo-placeholder">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                )}
              </div>

              {/* Typographic Stack – NO LABELS */}
              <div className="id-type-stack">
                <span className="id-name-am">{fullNameAm}</span>
                <span className="id-name-en">{fullNameEn}</span>

                <span className="id-role-am">{staff.roleAmharic || '—'}</span>
                <span className="id-role-en">{staff.role?.replace(/_/g, ' ') || '—'}</span>

                <span className="id-dept">
                  {deptEn}
                  {deptAm ? <> · <span style={{ fontSize: 18 }}>{deptAm}</span></> : null}
                </span>

                <span className="id-number">{staff.idNumber}</span>
              </div>
            </div>

            {/* Footer bar */}
            <div className="id-footer-bar" />
          </div>
        </div>
      </div>

      {/* ══════════════════ BACK – 1011 × 638 px ══════════════════ */}
      <div className="id-card-hidden-render">
        <div className="id-card-preview-scale">
          <div className="id-cr80 id-cr80-back" ref={backRef} style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}>
            <div className="id-back-body">
              {/* Left: QR + Emergency */}
              <div className="id-back-left">
                <QRCodeSVG value={verifyUrl} size={200} level="H" includeMargin={false} />
                <p className="id-qr-label">Scan to verify · ለማረጋገጥ ይቃኙ</p>
                {staff.emergencyContact && (
                  <div className="id-emergency">
                    <span className="id-em-title">Emergency / አስቸኳይ</span>
                    <span className="id-em-val">{staff.emergencyContact}</span>
                  </div>
                )}
              </div>

              {/* Right: Info grid */}
              <div className="id-back-right">
                <div className="id-info-row">
                  <span className="id-info-val id-info-office">{staff.officeAddress || 'HEAD OFFICE / ዋና ቢሮ'}</span>
                </div>
                {staff.phone && <div className="id-info-row"><span className="id-info-val">{staff.phone}</span></div>}
                <div className="id-info-row"><span className="id-info-val">{staff.nationality || 'ETHIOPIAN / ኢትዮጵያዊ'}</span></div>
                <div className="id-info-row"><span className="id-info-val">suethiopia.org</span></div>

                <div className="id-dates">
                  <div>
                    <span className="id-date-label">Issued</span>
                    <span className="id-date-val">{formatDate(staff.issueDate)}</span>
                  </div>
                  <div>
                    <span className="id-date-label">Expires</span>
                    <span className="id-date-val">{formatDate(staff.expireDate)}</span>
                  </div>
                </div>

                <div className="id-signature-line">
                  <div className="id-sig-blank" />
                  <span className="id-sig-label">Authorized Signature / ፈቃዳዊ ፊርማ</span>
                </div>
              </div>
            </div>

            {/* Footer disclaimer */}
            <div className="id-back-footer">
              ※ This card is the property of Scripture Union Ethiopia. If found, please return to the nearest office.
              &nbsp;|&nbsp; ይህ ካርድ የኢትዮጵያ ቅዱሳን ቃላት ሕብረት ንብረት ነው። ቢጠፋ ወደ ቅርብ ቢሮ ይመልሱ።
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

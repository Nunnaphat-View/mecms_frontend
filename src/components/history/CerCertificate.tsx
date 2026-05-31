import React from "react"

export interface QualitativeItem {
  item_name: string
  result: string
  category_id?: number
  display_order?: number
}

export interface SpecificParameterApi {
  id: number
  name: string
  value: string | null
  unit: string | null
  task_id: number
}

export interface CerData {
  pmNo: string
  pmId: string
  detail: string
  manufacture: string
  model: string
  serialNo: string
  idNo: string
  department: string
  address: string
  section: string
  pmDate: string
  remark1: string
  remark2: string
  remark3: string
  overallResult: "pass" | "fail"
  qualitatives?: QualitativeItem[]
  specificParameters?: SpecificParameterApi[]
  technician?: {
    name: string
    signatureUrl?: string | null
    role?: {
      description: string
    } | null
  } | null
  hospital?: {
    name: string
    logoUrl?: string
    address?: string
    district?: string
    province?: string
    zipCode?: string
  } | null
}

interface CerCertificateProps {
  data: CerData
}

const CheckBox = ({ checked }: { checked: boolean }) => (
  <div
    style={{
      width: "12px",
      height: "12px",
      border: "1.2px solid #000",
      borderRadius: "1px",
      lineHeight: "10px",
      textAlign: "center",
      fontSize: "8pt",
      fontWeight: "bold",
      fontFamily: "Arial, sans-serif",
      margin: "auto",
      backgroundColor: "transparent",
      color: "#000",
    }}
  >
    {checked ? "✓" : ""}
  </div>
)

export default function CerCertificate({ data }: CerCertificateProps) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

  function getImageUrl(path: string | null | undefined) {
    if (!path) return ""
    if (path.startsWith("http")) return path
    return `${apiBase}${path}`
  }

  // Group qualitatives by category_id and sort by display_order
  const groupedQualitatives = React.useMemo(() => {
    if (!data.qualitatives) return []
    const groups: Record<number, QualitativeItem[]> = {}
    data.qualitatives.forEach((q) => {
      const catId = q.category_id || 0
      if (!groups[catId]) groups[catId] = []
      groups[catId].push(q)
    })

    const sortedCatIds = Object.keys(groups)
      .map(Number)
      .sort((a, b) => a - b)

    return sortedCatIds.map((id) =>
      (groups[id] || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    )
  }, [data.qualitatives])

  function getStatus(sectionIdx: number, itemIdx: number): "normal" | "abnormal" | "na" {
    const section = groupedQualitatives[sectionIdx]
    if (!section || !section[itemIdx]) return "na"
    const res = section[itemIdx].result.toUpperCase()
    if (res === "PASS") return "normal"
    if (res === "FAIL") return "abnormal"
    return "na"
  }

  function getDone(sectionIdx: number, itemIdx: number): boolean {
    const section = groupedQualitatives[sectionIdx]
    if (!section || !section[itemIdx]) return false
    return section[itemIdx].result.toUpperCase() === "PASS"
  }

  // Section 1 items mapping
  const section1Items = React.useMemo(() => {
    const section = groupedQualitatives[0]
    if (!section || section.length === 0) {
      return [
        { code: "1.1", name: "สภาพภายนอก /โครงสร้าง", status: getStatus(0, 0) },
        { code: "1.2", name: "ฝีมือการติดตั้ง/ยึดโยง", status: getStatus(0, 1) },
        { code: "1.3", name: "การขับเคลื่อน/เบรค", status: getStatus(0, 2) },
        { code: "1.4", name: "สายไฟ AC ปลั๊ก", status: getStatus(0, 3) },
        { code: "1.5", name: "สายสัญญาณ", status: getStatus(0, 4) },
        { code: "1.6", name: "ความตึงหย่อน/ความหนาแน่น", status: getStatus(0, 5) },
        { code: "1.7", name: "เบรกเกอร์/ฟิวส์", status: getStatus(0, 6) },
        { code: "1.8", name: "หลอด ท่อ/วัสดุห่อหุ้ม", status: getStatus(0, 7) },
        { code: "1.9", name: "สายเคเบิล", status: getStatus(0, 8) },
        { code: "1.10", name: "ข้อต่อ/จุดต่อต่างๆ", status: getStatus(0, 9) },
        { code: "1.11", name: "Electrodes/Transducers", status: getStatus(0, 10) },
        { code: "1.12", name: "ฟิลเตอร์", status: getStatus(0, 11) },
        { code: "1.13", name: "สวิทช์/การควบคุม", status: getStatus(0, 12) },
        { code: "1.14", name: "อินเตอร์", status: getStatus(0, 13) },
        { code: "1.15", name: "มอเตอร์/ปั๊ม/พัดลม", status: getStatus(0, 14) },
        { code: "1.16", name: "ระดับ/ของเหลว", status: getStatus(0, 15) },
        { code: "1.17", name: "แบตเตอรี/การชาร์จประจุ", status: getStatus(0, 16) },
        { code: "1.18", name: "การแสดงผล", status: getStatus(0, 17) },
        { code: "1.19", name: "Self Test", status: getStatus(0, 18) },
        { code: "1.20", name: "สัญญาณเตือน", status: getStatus(0, 19) },
        { code: "1.21", name: "สัญญาณแสดงการทำงาน", status: getStatus(0, 20) },
        { code: "1.22", name: "ฉลาก/เครื่องหมาย", status: getStatus(0, 21) },
        { code: "1.23", name: "อุปกรณ์ประกอบ", status: getStatus(0, 22) },
      ]
    }
    return section.map((q, idx) => ({
      code: `1.${idx + 1}`,
      name: q.item_name,
      status:
        q.result.toUpperCase() === "PASS"
          ? "normal"
          : q.result.toUpperCase() === "FAIL"
          ? "abnormal"
          : ("na" as const),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedQualitatives])

  // Section 2 items mapping
  const section2Items = React.useMemo(() => {
    const section = groupedQualitatives[1]
    if (!section || section.length === 0) {
      return [
        { code: "2.1", name: "ระบบกราวด์ (0.5 OHM)", status: getStatus(1, 0) },
        { code: "2.2", name: "การรั่วของกระแสไฟฟ้า", status: getStatus(1, 1) },
      ]
    }
    return section.map((q, idx) => ({
      code: `2.${idx + 1}`,
      name: q.item_name,
      status:
        q.result.toUpperCase() === "PASS"
          ? "normal"
          : q.result.toUpperCase() === "FAIL"
          ? "abnormal"
          : ("na" as const),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedQualitatives])

  // Section 3 items mapping
  const section3Items = React.useMemo(() => {
    const section = groupedQualitatives[2]
    if (!section || section.length === 0) {
      return [
        {
          code: "3.1",
          name: "ทำความสะอาดตัวเครื่อง,สายประกอบภายนอกและภายใน",
          done: getDone(2, 0),
        },
        { code: "3.2", name: "การหล่อลื่นจุดสัมผัสกลไกต่างๆ", done: getDone(2, 1) },
        {
          code: "3.3",
          name: "ปรับเทียบค่ามาตรฐาน/ปรับจูนแก้ไข กลไกต่างๆ",
          done: getDone(2, 2),
        },
        { code: "3.4", name: "เปลี่ยนวัสดุตามอายุงาน ฟิลเตอร์/แปงถ่าน", done: getDone(2, 3) },
        { code: "3.5", name: "เปลี่ยนถ่ายของเหลวในกระเปาะ", done: getDone(2, 4) },
      ]
    }
    return section.map((q, idx) => ({
      code: `3.${idx + 1}`,
      name: q.item_name,
      done: q.result.toUpperCase() === "PASS",
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedQualitatives])

  return (
    <div className="cer-wrapper print:p-0 print:bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        .cer-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          padding: 0;
          min-height: auto;
        }
        .a4-size {
          width: 210mm;
          height: 296mm;
          background: #fff;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
          position: relative;
          overflow: hidden;
          page-break-after: avoid;
        }
        .cer-page {
          font-family: 'Sarabun', 'TH Sarabun New', 'Arial', sans-serif;
          font-size: 11pt;
          color: #000;
          padding: 8mm 10mm 6mm 10mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .cer-header {
          display: flex;
          align-items: center;
          padding-bottom: 4px;
        }
        .header-divider {
          border-bottom: 3px solid #000;
          margin-bottom: 6px;
        }
        .header-logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hospital-logo {
          width: 54px;
          height: 54px;
          object-fit: contain;
          border: 2px solid #000;
          border-radius: 50%;
          padding: 2px;
        }
        .hospital-name {
          font-size: 15pt;
          font-weight: 700;
          color: #000;
          line-height: 1.3;
        }
        .hospital-address {
          font-size: 10pt;
          color: #000;
          font-style: italic;
        }
        .header-pm-no {
          text-align: right;
          font-size: 10pt;
          color: #000;
        }
        .pm-no-label {
          font-weight: 600;
        }
        .pm-no-value {
          margin-left: 4px;
        }
        .cer-title-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 12px;
          margin: 4px 0 6px;
        }
        .cer-title {
          font-size: 16pt;
          font-weight: 700;
          color: #000;
          text-align: center;
        }
        .cer-info-grid {
          display: flex;
          gap: 0;
          margin-bottom: 8px;
          border-radius: 2px;
          border-bottom: 1px solid #ccc;
        }
        .info-col {
          flex: 1;
          padding: 5px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .info-divider {
          width: 1px;
          background: #ccc;
        }
        .info-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          font-size: 9.5pt;
        }
        .info-label {
          color: #444;
          min-width: 90px;
          flex-shrink: 0;
        }
        .info-value {
          color: #000;
          flex: 1;
        }
        .info-value--bold {
          font-weight: 700;
          color: #000;
        }
        .cer-body {
          display: flex;
          gap: 0;
          flex: 1;
        }
        .body-left {
          flex: 1.1;
          padding-right: 6px;
        }
        .body-right {
          flex: 1;
          padding-left: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .check-section {
          margin-bottom: 4px;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 1px;
          margin-bottom: 1px;
          font-weight: 700;
          font-size: 9.5pt;
        }
        .section-name {
          flex: 1;
          text-decoration: underline;
        }
        .check-header-cols {
          display: flex;
          gap: 6px;
          font-size: 8pt;
          font-weight: 700;
          color: #000;
        }
        .check-header-cols span {
          width: 36px;
          text-align: center;
          flex-shrink: 0;
        }
        .check-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9pt;
          padding: 1px 4px;
          margin-bottom: 4px;
        }
        .item-code {
          min-width: 28px;
          font-weight: 600;
          color: #000;
          font-size: 8.5pt;
        }
        .item-name {
          flex: 1;
          font-size: 9pt;
        }
        .check-boxes {
          display: flex;
          gap: 8px;
        }
        .check-boxes > input {
          width: 36px;
          flex-shrink: 0;
          display: flex;
          justify-content: center;
        }
        .check-item--maintenance {
          justify-content: flex-start;
        }
        .check-item--maintenance .check-box-single {
          margin-left: auto;
        }
        .remark-block {
          display: flex;
          align-items: flex-start;
          gap: 4px;
          margin-bottom: 4px;
        }
        .remark-side {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }
        .remark-label {
          font-size: 8pt;
          font-weight: 700;
          color: #000;
          white-space: nowrap;
          padding: 2px 0;
        }
        .remark-num {
          font-size: 10pt;
          font-weight: 700;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .remark-box {
          flex: 1;
          border: 1.5px solid #ccc;
          border-radius: 2px;
          height: 80px;
          padding: 4px;
          font-size: 8.5pt;
          margin-top: 20px;
        }
        .remark-box--sm {
          min-height: 28px;
        }
        .result-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          padding-top: 4px;
        }
        .result-row .result-label {
          font-weight: 700;
          font-size: 10pt;
          margin-left: 50px;
          margin-right: 40px;
          text-decoration: underline;
        }
        .result-check {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .result-text {
          font-size: 10pt;
          margin-right: 20px;
        }
        .repair-note {
          font-size: 10pt;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: 65px;
        }
        .signature-area {
          margin-top: 8px;
          text-align: center;
          padding-top: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .signature-area .signature-img {
          height: 45px;
          margin-bottom: -15px;
          z-index: 1;
        }
        .signature-area .signature-img img {
          max-height: 100%;
          object-fit: contain;
        }
        .signature-area .signature-placeholder {
          height: 30px;
          visibility: hidden;
        }
        .signature-area .signature-line {
          font-size: 9.5pt;
          position: relative;
          z-index: 2;
        }
        .signature-area .signature-title {
          font-weight: 700;
          font-size: 9.5pt;
        }
        .cer-footer {
          margin-top: auto;
          padding-top: 6px;
          border-top: 2px solid #000;
          font-size: 8pt;
          color: #444;
          text-align: center;
        }
        @media print {
          .cer-wrapper {
            background: none;
            padding: 0;
          }
          .a4-size {
            width: 210mm;
            height: 297mm;
            box-shadow: none;
            margin: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      ` }} />

      <div className="cer-page a4-size">
        {/* ===== HEADER ===== */}
        <div className="cer-header">
          <div className="header-logo-area">
            <img
              src={getImageUrl(data.hospital?.logoUrl) || "/image/logo.png"}
              alt="Hospital Logo"
              className="hospital-logo"
            />
            <div className="hospital-info text-left">
              <div className="hospital-name">{data.hospital?.name || "Hospital Name"}</div>
              <div className="hospital-address">
                {data.hospital?.address || ""}
                {" "}{data.hospital?.district || ""} {data.hospital?.province || ""}
              </div>
            </div>
          </div>
        </div>
        <div className="header-divider"></div>
        <div className="header-pm-no">
          <span className="pm-no-label">PM. No:</span>
          <span className="pm-no-value">{data.pmNo}</span>
        </div>

        {/* ===== TITLE ===== */}
        <div className="cer-title-row">
          <div className="cer-title">Preventive Maintenance Report</div>
        </div>

        {/* ===== INFO GRID ===== */}
        <div className="cer-info-grid">
          {/* Left Column */}
          <div className="info-col text-left">
            <div className="info-row">
              <span className="info-label text-left">Detail :</span>
              <span className="info-value">{data.detail}</span>
            </div>
            <div className="info-row">
              <span className="info-label text-left">Manufacture :</span>
              <span className="info-value">{data.manufacture}</span>
            </div>
            <div className="info-row">
              <span className="info-label text-left">Model :</span>
              <span className="info-value">{data.model}</span>
            </div>
            <div className="info-row">
              <span className="info-label text-left">S/N :</span>
              <span className="info-value">{data.serialNo}</span>
            </div>
            <div className="info-row">
              <span className="info-label text-left">ID No :</span>
              <span className="info-value">{data.idNo}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="info-divider"></div>

          {/* Right Column */}
          <div className="info-col text-left">
            <div className="info-row">
              <span className="info-label text-left">Department :</span>
              <span className="info-value">{data.department}</span>
            </div>
            <div className="info-row">
              <span className="info-label text-left">Address :</span>
              <span className="info-value">{data.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label text-left">Section :</span>
              <span className="info-value">{data.section}</span>
            </div>
            <div className="info-row">
              <span className="info-label text-left">PM Date :</span>
              <span className="info-value info-value--bold">{data.pmDate}</span>
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="cer-body">
          {/* ===== LEFT BODY COLUMN ===== */}
          <div className="body-left text-left">
            {/* Section 1: ตรวจสภาพทั่วไป */}
            <div className="check-section">
              <div className="section-title">
                <span className="section-name">1. ตรวจสภาพทั่วไป</span>
                <div className="check-header-cols">
                  <span>ปกติ</span>
                  <span>ไม่ปกติ</span>
                  <span>N/A</span>
                </div>
              </div>
              
              <div className="space-y-[1px]">
                {section1Items.map((item, idx) => (
                  <div key={idx} className="check-item">
                    <span className="item-code">{item.code}</span>
                    <span className="item-name text-left">{item.name}</span>
                    <div className="check-header-cols gap-1.5 justify-end">
                      <span>
                        <CheckBox checked={item.status === "normal"} />
                      </span>
                      <span>
                        <CheckBox checked={item.status === "abnormal"} />
                      </span>
                      <span>
                        <CheckBox checked={item.status === "na"} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== RIGHT BODY COLUMN ===== */}
          <div className="body-right text-left">
            {/* Remark Box 1 */}
            <div className="remark-block">
              <div className="remark-side">
                <div className="remark-label">หมายเหตุ</div>
                <div className="remark-num bg-slate-100 border border-slate-300">1</div>
              </div>
              <div className="remark-box">{data.remark1}</div>
            </div>

            {/* Section 2: การปลอดภัย */}
            <div className="check-section">
              <div className="section-title">
                <span className="section-name">2. การปลอดภัย</span>
                <div className="check-header-cols">
                  <span>ปกติ</span>
                  <span>ไม่ปกติ</span>
                  <span>N/A</span>
                </div>
              </div>
              <div className="space-y-[1px]">
                {section2Items.map((item, idx) => (
                  <div key={idx} className="check-item">
                    <span className="item-code">{item.code}</span>
                    <span className="item-name text-left">{item.name}</span>
                    <div className="check-header-cols gap-1.5 justify-end">
                      <span>
                        <CheckBox checked={item.status === "normal"} />
                      </span>
                      <span>
                        <CheckBox checked={item.status === "abnormal"} />
                      </span>
                      <span>
                        <CheckBox checked={item.status === "na"} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remark Box 2 */}
            <div className="remark-block remark-block--sm">
              <div className="remark-side">
                <div className="remark-label">หมายเหตุ</div>
                <div className="remark-num bg-slate-100 border border-slate-300">2</div>
              </div>
              <div className="remark-box remark-box--sm">{data.remark2}</div>
            </div>

            {/* Section 3: การบำรุงรักษา */}
            <div className="check-section">
              <div className="section-title section-title--no-header">
                <span className="section-name">3. การบำรุงรักษา</span>
              </div>
              <div className="space-y-[1px]">
                {section3Items.map((item, idx) => (
                  <div key={idx} className="check-item check-item--maintenance">
                    <span className="item-code">{item.code}</span>
                    <span className="item-name text-left">{item.name}</span>
                    <div className="check-box-single mr-2">
                      <CheckBox checked={item.done} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remark Box 3 */}
            <div className="remark-block remark-block--sm">
              <div className="remark-side">
                <div className="remark-label">หมายเหตุ</div>
                <div className="remark-num bg-slate-100 border border-slate-300">3</div>
              </div>
              <div className="remark-box remark-box--sm">{data.remark3}</div>
            </div>

            {/* Result Row */}
            <div className="result-row">
              <span className="result-label">สรุปโดยรวม</span>
              <div className="result-check gap-2">
                <CheckBox checked={data.overallResult === "pass"} />
                <span className="result-text ml-0.5">ผ่าน</span>
                <CheckBox checked={data.overallResult === "fail"} />
                <span className="result-text ml-0.5">ไม่ผ่าน</span>
              </div>
            </div>

            {/* Repair Note */}
            <div className="repair-note">
              <span>บำรุงรักษาโดย : </span>
              <div className="signature-area">
                <div className="signature-wrapper">
                  {data.technician?.signatureUrl ? (
                    <div className="signature-img">
                      <img
                        src={getImageUrl(data.technician.signatureUrl)}
                        alt="Technician Signature"
                        className="mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="signature-placeholder"></div>
                  )}
                  <div className="dots-line">....................................................</div>
                </div>

                <div className="signature-line mt-1">
                  ( {data.technician?.name || "...................................................."} )
                </div>
                <div className="signature-title text-[9pt] text-slate-500 mt-0.5">
                  {data.technician?.role?.description || "นายช่างไฟฟ้า"}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="cer-footer">
          {data.hospital?.name || ""}{" "}
          {data.hospital?.address || ""}{" "}
          {data.hospital?.district || ""} {data.hospital?.province || ""}{" "}
          {data.hospital?.zipCode || ""}
        </div>
      </div>
    </div>
  )
}

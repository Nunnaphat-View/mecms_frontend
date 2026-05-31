import React from "react"

export interface MeasurementApi {
  id: number
  parameter_name?: string | null
  range?: string | number | null
  standard_value?: number | null
  reading_1?: number | null
  reading_2?: number | null
  reading_3?: number | null
  std_reading_1?: number | null
  std_reading_2?: number | null
  std_reading_3?: number | null
  average_value?: number | null
  average_standard?: number | null
  error_value?: number | null
  result?: string | null
  display_type?: string | null
  resolution?: string | null
  std_type?: string | null
  data?: Record<string, unknown>
}

export interface SpecificParameterApi {
  id?: string | number
  name?: string
  value?: string | null
  unit?: string | null
  task_id?: number
}

export interface CerCalibrationData {
  certNo: string
  detail: string
  manufacture: string
  model: string
  serialNo: string
  idNo: string
  department: string
  address: string
  section: string
  temperature: string
  humidity: string
  calDate: string
  apprDate: string
  hospital?: {
    name: string
    logoUrl?: string
    address?: string
    district?: string
    province?: string
    zipCode?: string
  } | null
}

export interface CalibrationSettingItem {
  id?: number
  equipment_name?: string
  type?: string
  parameter_name?: string
  unit?: string
  tolerance?: string
  std_type?: string
  display_type?: string
  resolution?: string
}

interface StandardItem {
  name: string
  manufacture: string
  model: string
  sn: string
  calDate: string
  certNo: string
}

interface CerCalibrationProps {
  data: CerCalibrationData
  specificParameters?: SpecificParameterApi[]
  measurements?: MeasurementApi[]
  technician?: {
    name: string
    position?: string
    signatureUrl?: string | null
  } | null
  approver?: {
    name: string
    position?: string
    signatureUrl?: string | null
  } | null
  alarms?: {
    I: string
    II: string
    III: string
    AVR: string
    AVL: string
    AVF: string
    Alarm: string
    oneMV: string
  }
  standards?: StandardItem[]
  settings?: CalibrationSettingItem[]
}

interface GroupedParameter {
  parameter_name: string
  unit: string
  std_type: string
  uncertainty: string
  mpe: string
  rows: MeasurementApi[]
}

const UNIT_MAP: Record<string, string> = {
  "Systolic Pressure": "mmHg",
  "Diastolic Pressure": "mmHg",
  Temperature: "Celsius",
  "Heart Rate": "Pulse/min",
  SpO2: "%",
  "Flow Rate": "mL/h",
  Volume: "mL",
}

export default function CerCalibration({
  data,
  specificParameters = [],
  measurements = [],
  technician = null,
  approver = null,
  alarms,
  standards = [],
  settings = [],
}: CerCalibrationProps) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

  function getImageUrl(path: string | null | undefined) {
    if (!path) return ""
    if (path.startsWith("http")) return path
    return `${apiBase}${path}`
  }

  const isMode4 = (group: GroupedParameter) => {
    return (
      group.std_type?.includes("4") ||
      group.std_type?.includes("3 UUC : 3 STD") ||
      (group.std_type?.includes("3 UUC") && !group.std_type?.includes("1 STD"))
    )
  }

  const getCol2Header = (group: GroupedParameter) => {
    const isUUC = group.std_type?.includes("2") && group.std_type?.includes("UUC")
    const isUUT = group.std_type?.includes("UUT")
    const label = isUUC ? "UUC Setting" : isUUT ? "STD" : "STD Setting"
    return group.unit ? `${label} (${group.unit})` : label
  }

  const getCol3Header = (group: GroupedParameter) => {
    const isUUC = group.std_type?.includes("2") && group.std_type?.includes("UUC")
    const isUUT = group.std_type?.includes("UUT")
    const label = isUUC ? "STD Reading" : isUUT ? "UUT Reading" : "UUC Reading"
    return group.unit ? `${label} (${group.unit})` : label
  }

  const formatValue = (val: unknown) => {
    if (val === null || val === undefined || val === "") return "-"
    const num = Number(val)
    if (!isNaN(num)) return num.toFixed(2)
    return typeof val === "string" || typeof val === "number" ? String(val) : "-"
  }

  const groupedMeasurements = React.useMemo((): GroupedParameter[] => {
    if (!measurements) return []
    const groups: Record<string, MeasurementApi[]> = {}

    measurements.forEach((m) => {
      if (!m) return
      const name = m.parameter_name || ""
      if (!groups[name]) groups[name] = []
      groups[name].push(m)
    })

    return Object.keys(groups).map((name) => {
      const items = groups[name] || []
      const first = items[0]

      const setting = settings?.find((s) => (s.parameter_name || "") === name)
      const unit = setting?.unit || UNIT_MAP[name] || ""
      const mpe = setting?.tolerance || first?.range?.toString() || "1.0"
      const uncertainty = setting?.resolution || first?.resolution || "0.1"

      const isM4 =
        first?.std_type?.includes("4") ||
        first?.std_type?.includes("3 UUC : 3 STD") ||
        (first?.std_type?.includes("3 UUC") && !first?.std_type?.includes("1 STD"))

      const parsedRows = items.map((item) => {
        const getVal = (key: string): unknown => {
          const d = item.data
          if (d && typeof d === "object" && d !== null && key in d) {
            return d[key]
          }
          return (item as unknown as Record<string, unknown>)[key]
        }

        return {
          ...item,
          standard_value: isM4
            ? (getVal("average_standard") ?? getVal("standard_value"))
            : getVal("standard_value"),
          reading_1: getVal("reading_1"),
          reading_2: getVal("reading_2"),
          reading_3: getVal("reading_3"),
          std_reading_1: getVal("std_reading_1"),
          std_reading_2: getVal("std_reading_2"),
          std_reading_3: getVal("std_reading_3"),
          average_value: getVal("average_value"),
          average_standard: getVal("average_standard"),
          error_value: getVal("error_value"),
        } as unknown as MeasurementApi
      })

      return {
        parameter_name: name,
        unit,
        std_type: first?.std_type || "",
        uncertainty,
        mpe,
        rows: parsedRows,
      }
    })
  }, [measurements, settings])

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
        .header-cert-no {
          text-align: right;
          font-size: 10pt;
          color: #000;
        }
        .cert-no-label {
          font-weight: 600;
        }
        .cert-no-value {
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
        .right-col .info-label {
          min-width: 80px;
        }
        .env-row, .date-row {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }
        .env-item, .date-item {
          display: flex;
          gap: 4px;
        }
        .info-value--bold {
          font-weight: 700;
        }
        .cer-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .reading-table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
          font-size: 9pt;
          border-bottom: 2px solid #002d62;
        }
        .reading-table th {
          border-top: 2px solid #002d62;
          border-bottom: 2px solid #002d62;
          padding: 5px 4px;
          font-weight: 600;
        }
        .reading-table td {
          padding: 2px 4px;
          line-height: 1.2;
        }
        .param-header-row td {
          border-top: 2px solid #002d62;
          border-bottom: 2px solid #002d62;
          padding: 3px 4px;
          color: #002d62;
          line-height: 1.2;
        }
        .param-title {
          font-size: 9.5pt;
          font-weight: 700;
          color: #002d62;
          text-decoration: underline;
        }
        .param-data-row td {
          border-bottom: none;
          font-size: 8.5pt;
          padding: 1px 4px;
          line-height: 1.2;
        }
        .reading-table .label-col {
          font-weight: 600;
        }
        .text-left {
          text-align: left;
        }
        .alarms-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1.5px solid #ccc;
          padding: 3px 8px;
          font-size: 9pt;
          font-weight: 600;
        }
        .alarm-item {
          color: #000;
        }
        .cal-standard {
          margin-top: 6px;
        }
        .cal-standard-title {
          font-weight: 700;
          font-size: 9.5pt;
          margin-bottom: 3px;
        }
        .standard-table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
          font-size: 8.5pt;
          margin-bottom: 6px;
          border: 1px solid #000;
        }
        .standard-table th, .standard-table td {
          border: 1px solid #000;
          padding: 3px;
        }
        .standard-table th {
          font-weight: 600;
        }
        .text-italic {
          font-style: italic;
        }
        .method-desc {
          display: flex;
          gap: 8px;
          font-size: 8.5pt;
          line-height: 1.3;
        }
        .bold-th {
          font-weight: 700;
          white-space: nowrap;
        }
        .cer-bottom {
          margin-top: auto;
        }
        .cal-signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 25px;
          margin-bottom: 12px;
          padding: 0 40px;
        }
        .signature-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 9.5pt;
          gap: 5px;
        }
        .sig-label {
          align-self: flex-start;
          margin-bottom: 6px;
        }
        .signature-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          width: 100%;
        }
        .signature-img {
          height: 40px;
          margin-bottom: -12px;
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }
        .signature-img img {
          max-height: 100%;
          object-fit: contain;
        }
        .signature-placeholder {
          height: 25px;
          visibility: hidden;
        }
        .dots-line {
          font-size: 9.5pt;
          position: relative;
          z-index: 2;
          color: #000;
        }
        .sig-title {
          margin-top: 2px;
          font-weight: 600;
        }
        .claim-note {
          font-size: 7.8pt;
          margin-bottom: 6px;
        }
        .claim-note .underline {
          text-decoration: underline;
          font-weight: 600;
        }
        .cer-footer {
          border-top: 2px solid #000;
          padding-top: 5px;
          font-size: 9.5pt;
          text-align: center;
          font-style: italic;
        }
        .cer-specs-grid {
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        .spec-box {
          border: 1px solid #eee;
          padding: 6px;
          border-radius: 4px;
          background: #fcfcfc;
        }
        .spec-label {
          font-size: 8pt;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .spec-value {
          font-size: 10pt;
          font-weight: 700;
          color: #000;
        }
        .spec-unit {
          font-size: 8pt;
          font-weight: 400;
          color: #888;
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
        <div className="header-cert-no">
          <span className="cert-no-label">Cert. No. :</span>
          <span className="cert-no-value">{data.certNo}</span>
        </div>

        {/* ===== TITLE ===== */}
        <div className="cer-title-row">
          <div className="cer-title">Certificate of Testing</div>
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
              <span className="info-label text-left">ID No. :</span>
              <span className="info-value">{data.idNo}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="info-divider"></div>

          {/* Right Column */}
          <div className="info-col right-col text-left">
            <div className="info-row">
              <span className="info-label text-left">Departments :</span>
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
            <div className="info-row env-row">
              <div className="env-item">
                <span className="info-label text-left">Temperature :</span>
                <span className="info-value">{data.temperature} &plusmn; 2&deg;C</span>
              </div>
              <div className="env-item">
                <span className="info-label text-left">Humidity :</span>
                <span className="info-value">{data.humidity} &plusmn; 5% R.H.</span>
              </div>
            </div>
            <div className="info-row date-row">
              <div className="date-item">
                <span className="info-label text-left">Cal. Date:</span>
                <span className="info-value info-value--bold">{data.calDate}</span>
              </div>
              <div className="date-item">
                <span className="info-label text-left">Appr. Date:</span>
                <span className="info-value info-value--bold">{data.apprDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SPECIFICATIONS ===== */}
        <div className="cal-standard-title text-left">Calibration Results</div>

        {specificParameters && specificParameters.length > 0 && (
          <div className="cer-specs-grid mb-4">
            <div className="grid grid-cols-4 gap-3">
              {specificParameters.map((param, idx) => (
                <div key={idx} className="spec-box text-center">
                  <div className="spec-label">{param.name}</div>
                  <div className="spec-value">
                    {param.value || "-"} <span className="spec-unit">{param.unit || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <div className="cer-body">
          {/* Reading Table */}
          <table className="reading-table">
            <tbody>
              {groupedMeasurements.length > 0 ? (
                groupedMeasurements.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    {/* Mode 4 Template (3 UUC : 3 STD) */}
                    {isMode4(group) ? (
                      <>
                        {/* Parameter Header Row 1 */}
                        <tr className="param-header-row">
                          <td className="text-left label-col param-title" rowSpan={2}>
                            <u>{group.parameter_name}</u>
                          </td>
                          <td className="font-semibold" colSpan={4}>Standard Readings (STD)</td>
                          <td className="font-semibold" colSpan={4}>UUC Readings</td>
                          <td className="font-semibold" rowSpan={2}>Error ({group.unit})</td>
                          <td className="font-semibold" rowSpan={2}>Uncertainty (± {group.unit})</td>
                          <td className="font-semibold" rowSpan={2}>MPE (± {group.unit})</td>
                        </tr>
                        {/* Parameter Header Row 2 */}
                        <tr className="param-header-row font-semibold">
                          <td>STD-1</td>
                          <td>STD-2</td>
                          <td>STD-3</td>
                          <td className="italic">Mean-S</td>
                          <td>UUC-1</td>
                          <td>UUC-2</td>
                          <td>UUC-3</td>
                          <td className="italic">Mean-U</td>
                        </tr>
                        {/* Parameter Data Rows */}
                        {group.rows.map((m, mIdx) => (
                          <tr key={`m4-${mIdx}`} className="param-data-row">
                            <td className="text-left"></td>
                            <td>{formatValue(m.std_reading_1)}</td>
                            <td>{formatValue(m.std_reading_2)}</td>
                            <td>{formatValue(m.std_reading_3)}</td>
                            <td className="font-semibold italic">
                              {formatValue(m.average_standard)}
                            </td>
                            <td>{formatValue(m.reading_1)}</td>
                            <td>{formatValue(m.reading_2)}</td>
                            <td>{formatValue(m.reading_3)}</td>
                            <td className="font-semibold italic">{formatValue(m.average_value)}</td>
                            <td>{formatValue(m.error_value)}</td>
                            <td>{formatValue(group.uncertainty)}</td>
                            <td>{formatValue(group.mpe)}</td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <>
                        {/* Standard Calibration Modes Template */}
                        <tr className="param-header-row font-semibold">
                          <td className="text-left label-col param-title">
                            <u>{group.parameter_name}</u>
                          </td>
                          <td>{getCol2Header(group)}</td>
                          <td>{getCol3Header(group)}</td>
                          <td>Error ({group.unit})</td>
                          <td>Uncertainty (± {group.unit})</td>
                          <td>MPE (± {group.unit})</td>
                        </tr>
                        {/* Parameter Data Rows */}
                        {group.rows.map((m, mIdx) => (
                          <tr key={mIdx} className="param-data-row">
                            <td className="text-left"></td>
                            <td>{formatValue(m.standard_value)}</td>
                            <td className="font-semibold">{formatValue(m.average_value)}</td>
                            <td>{formatValue(m.error_value)}</td>
                            <td>{formatValue(group.uncertainty)}</td>
                            <td>{formatValue(group.mpe)}</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-4">ไม่มีข้อมูลการสอบเทียบ</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Alarms Row (Only for ECG/Patient Monitor items) */}
          {alarms && (
            <div className="alarms-row">
              <div className="alarm-item">I : {alarms.I}</div>
              <div className="alarm-item">II : {alarms.II}</div>
              <div className="alarm-item">III : {alarms.III}</div>
              <div className="alarm-item">AVR : {alarms.AVR}</div>
              <div className="alarm-item">AVL : {alarms.AVL}</div>
              <div className="alarm-item">AVF : {alarms.AVF}</div>
              <div className="alarm-item">Alarm : {alarms.Alarm}</div>
              <div className="alarm-item">1mV : {alarms.oneMV}</div>
            </div>
          )}

          {/* Calibration Standard Used */}
          <div className="cal-standard text-left">
            <div className="cal-standard-title">Calibration Standard Used</div>
            <table className="standard-table">
              <thead>
                <tr className="bg-slate-50 font-semibold">
                  <th>Equipment</th>
                  <th>Manufacture</th>
                  <th>Model</th>
                  <th>Serial No.</th>
                  <th>Certification No.</th>
                  <th>Cal date</th>
                </tr>
              </thead>
              <tbody>
                {standards && standards.length > 0 ? (
                  standards.map((std, idx) => (
                    <tr key={idx}>
                      <td>{std.name}</td>
                      <td className="italic">{std.manufacture}</td>
                      <td className="italic">{std.model}</td>
                      <td>{std.sn}</td>
                      <td className="italic">{std.certNo}</td>
                      <td>{std.calDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-400 py-4">
                      ไม่มีข้อมูลเครื่องมือมาตรฐานที่ใช้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <div className="method-desc text-left mt-2">
              <span className="bold-th">วิธีทดสอบ :</span>
              <div className="desc-content space-y-1">
                <div>
                  โดยการวัดเทียบกับเครื่องสร้างสัญญาณมาตรฐาน โดยการกำหนดค่าแรงดัน,
                  อัตราการเต้นของหัวใจ อ่านค่าและจดบันทึก
                </div>
                <div>
                  โดยการนำเครื่องมือที่ต้องการทดสอบต่อเข้ากับเครื่องสร้างสัญญาณแล้วกำหนดค่า % และ ECG
                  อ่านผลและจดบันทึก
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== FOOTER & SIGNATURE ===== */}
        <div className="cer-bottom">
          <div className="cal-signatures">
            {/* Calibration by (Technician) */}
            <div className="signature-box">
              <div className="sig-label font-semibold">Calibration by :</div>
              <div className="signature-wrapper">
                {technician?.signatureUrl ? (
                  <div className="signature-img">
                    <img src={getImageUrl(technician.signatureUrl)} alt="Technician Signature" />
                  </div>
                ) : (
                  <div className="signature-placeholder"></div>
                )}
                <div className="dots-line">....................................................</div>
              </div>
              <div className="sig-name mt-1">
                ( {technician?.name || ".............................."} )
              </div>
              <div className="sig-title text-slate-500 text-[9pt]">{technician?.position || ""}</div>
            </div>

            {/* Approved by (Approver) */}
            <div className="signature-box">
              <div className="sig-label font-semibold">Approved by :</div>
              <div className="signature-wrapper">
                {approver?.signatureUrl ? (
                  <div className="signature-img">
                    <img src={getImageUrl(approver.signatureUrl)} alt="Approver Signature" />
                  </div>
                ) : (
                  <div className="signature-placeholder"></div>
                )}
                <div className="dots-line">....................................................</div>
              </div>
              <div className="sig-name mt-1">
                ( {approver?.name || ".............................."} )
              </div>
              <div className="sig-title text-slate-500 text-[9pt]">{approver?.position || ""}</div>
            </div>
          </div>

          <div className="claim-note text-left text-slate-500 mt-4">
            <span className="underline font-semibold">Comment:</span> This report certifies the testing results as of
            the date, the location and the conditions of testing only.
          </div>

          <div className="cer-footer mt-2">
            {data.hospital?.name || ""}{" "}
            {data.hospital?.address || ""}{" "}
            {data.hospital?.district || ""} {data.hospital?.province || ""}{" "}
            {data.hospital?.zipCode || ""}
          </div>
        </div>
      </div>
    </div>
  )
}

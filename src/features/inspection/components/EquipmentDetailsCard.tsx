interface EquipmentDetails {
  tool_name: string
  company: string
  model: string
  serialNumber: string
  assetCode: string
  riskLevel: string
  type: string
  calibrationInterval: string
  lastCalibrationDate: string
  dueDate: string
}

interface Props {
  details: EquipmentDetails
}

function getRiskLabel(level: string): string {
  const l = level?.toLowerCase()
  if (l === "high") return "สูง"
  if (l === "medium") return "กลาง"
  if (l === "low") return "ต่ำ"
  return level || "-"
}

export default function EquipmentDetailsCard({ details }: Props) {
  return (
    <div className="mb-4">
      {/* Section Title */}
      <div
        className="text-base font-bold text-slate-900 mb-3 pl-3"
        style={{ borderLeft: "4px solid var(--primary)" }}
      >
        ข้อมูลเครื่องมือแพทย์
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card */}
        <div className="border border-slate-300 rounded-xl p-4 bg-white">
          <div className="flex flex-col gap-3">
            <InfoRow label="เครื่องมือ" value={details.tool_name} />
            <InfoRow label="บริษัท" value={details.company} />
            <InfoRow label="รุ่น" value={details.model} />
            <InfoRow label="หมายเลขเครื่อง" value={details.serialNumber} />
            <InfoRow label="รหัสครุภัณฑ์" value={details.assetCode} />
          </div>
        </div>

        {/* Right Card */}
        <div className="border border-slate-300 rounded-xl p-4 bg-white">
          <div className="flex flex-col gap-3">
            <InfoRow label="ความเสี่ยง" value={getRiskLabel(details.riskLevel)} />
            <InfoRow label="ประเภท" value={details.type} />
            <InfoRow label="รอบสอบเทียบ" value={details.calibrationInterval} />
            <InfoRow label="วันที่สอบเทียบล่าสุด" value={details.lastCalibrationDate} />
            <InfoRow label="วันกำหนดสอบเทียบ" value={details.dueDate} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-900 font-semibold text-right">{value || "-"}</span>
    </div>
  )
}

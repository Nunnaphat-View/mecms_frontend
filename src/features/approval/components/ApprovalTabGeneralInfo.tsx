import { useMemo } from "react"
import type { TaskApi } from "@/services/pmService"
import EquipmentDetailsCard from "@/components/inspection/EquipmentDetailsCard"
import LocationDetailsCard from "../calibration/record/LocationDetailsCard"

interface Props {
  task: TaskApi | null
}

export default function ApprovalTabGeneralInfo({ task }: Props) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const equipmentInfo = useMemo(() => {
    const eq = task?.equipment
    return {
      tool_name: eq?.tool_name || "-",
      company: eq?.manufacturer || "-",
      model: eq?.model || "-",
      serialNumber: eq?.serial_number || "-",
      assetCode: eq?.asset_code || "-",
      riskLevel: eq?.risk_level || "-",
      type: eq?.equipmentType?.name || "-",
      calibrationInterval: eq?.interval ? `${eq.interval} วัน` : "-",
      lastCalibrationDate: eq?.calibration_date_last || "-",
      dueDate: eq?.calibration_due_date || "-",
    }
  }, [task])

  const locationInfo = useMemo(() => {
    const eq = task?.equipment
    return {
      department: eq?.section?.name || eq?.department || "-",
      hospital: eq?.section?.hospital?.name || eq?.location || "-",
      district: eq?.section?.hospital?.district || "-",
      province: eq?.section?.hospital?.province || "-",
    }
  }, [task])

  return (
    <div className="flex flex-col gap-6">
      {/* Equipment Details */}
      <EquipmentDetailsCard details={equipmentInfo} />

      {/* Inspector Section */}
      <div>
        <div
          className="text-base font-bold text-slate-900 mb-3 pl-3"
          style={{ borderLeft: "4px solid #088395" }}
        >
          ข้อมูลผู้สอบเทียบ
        </div>
        <div className="border border-slate-300 rounded-xl p-4 bg-white">
          <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
            <span className="text-slate-600 font-medium">ชื่อ</span>
            <span className="text-slate-900 font-semibold text-right">
              {task?.technician?.name || "-"}
            </span>

            <span className="text-slate-600 font-medium">ตำแหน่ง</span>
            <span className="text-slate-900 font-semibold text-right">
              {task?.technician?.role?.description || task?.technician?.role?.name || "-"}
            </span>

            <span className="text-slate-600 font-medium">วันที่สอบเทียบ</span>
            <span className="text-slate-900 font-semibold text-right">
              {formatDate(task?.createdAt)}
            </span>

            <span className="text-slate-600 font-medium">สถานะการสอบ</span>
            <span className="text-emerald-600 font-bold text-right">ผ่าน</span>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <LocationDetailsCard details={locationInfo} />
    </div>
  )
}

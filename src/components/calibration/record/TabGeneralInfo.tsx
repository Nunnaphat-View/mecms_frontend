import { useInspectionStore } from "@/stores/inspectionStore"
import { useCalibrationRecordStore } from "@/stores/calibrationRecordStore"
import EquipmentDetailsCard from "@/components/inspection/EquipmentDetailsCard"
import LocationDetailsCard from "./LocationDetailsCard"

export default function TabGeneralInfo() {
  const inspection = useInspectionStore()
  const calRecord = useCalibrationRecordStore()

  const equipmentInfo = {
    deviceName: inspection.deviceInfo.deviceName,
    company: inspection.deviceInfo.company,
    model: inspection.deviceInfo.model,
    serialNumber: inspection.deviceInfo.serialNumber,
    assetCode: inspection.deviceInfo.assetCode,
    riskLevel: calRecord.equipmentDetails.riskLevel,
    type: calRecord.equipmentDetails.type,
    calibrationInterval: inspection.deviceInfo.calibrationInterval,
    lastCalibrationDate: inspection.deviceInfo.lastCalibrationDate,
    dueDate: inspection.deviceInfo.dueDate,
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <EquipmentDetailsCard details={equipmentInfo} />
      <LocationDetailsCard details={calRecord.locationDetails} />
    </div>
  )
}

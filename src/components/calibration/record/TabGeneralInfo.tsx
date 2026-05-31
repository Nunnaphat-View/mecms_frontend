import { useCalibrationRecordStore } from "@/stores/calibrationRecordStore"
import EquipmentDetailsCard from "@/components/inspection/EquipmentDetailsCard"
import LocationDetailsCard from "./LocationDetailsCard"

export default function TabGeneralInfo() {
  const calRecord = useCalibrationRecordStore()

  const equipmentInfo = {
    deviceName: calRecord.equipmentDetails.name,
    company: calRecord.equipmentDetails.company,
    model: calRecord.equipmentDetails.model,
    serialNumber: calRecord.equipmentDetails.serialNumber,
    assetCode: calRecord.equipmentDetails.code,
    riskLevel: calRecord.equipmentDetails.riskLevel,
    type: calRecord.equipmentDetails.type,
    calibrationInterval: calRecord.equipmentDetails.calibrationCycle,
    lastCalibrationDate: calRecord.equipmentDetails.lastCalibrationDate,
    dueDate: calRecord.equipmentDetails.nextCalibrationDate,
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <EquipmentDetailsCard details={equipmentInfo} />
      <LocationDetailsCard details={calRecord.locationDetails} />
    </div>
  )
}

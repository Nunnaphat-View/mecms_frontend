import { useCalibrationRecordStore } from "@/stores/calibrationRecordStore"
import { useCalibrationSettingStore } from "@/stores/calibrationSettingStore"
import EnvironmentCard from "./EnvironmentCard"
import StandardEquipmentSelector from "./StandardEquipmentSelector"
import TestUnknown from "./TestUnknown"
import TestDynamic from "./TestDynamic"

interface Props {
  onSave: () => void
}

export default function TabTestResults({ onSave }: Props) {
  const store = useCalibrationRecordStore()
  const settingStore = useCalibrationSettingStore()

  const hasSettings = settingStore.settings.length > 0

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Environment and Standard Equipment Cards placed horizontally on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-4">
          <EnvironmentCard />
        </div>
        <div className="md:col-span-8">
          <StandardEquipmentSelector />
        </div>
      </div>

      {hasSettings ? (
        <TestDynamic onSave={onSave} />
      ) : (
        <TestUnknown equipmentType={store.equipmentDetails.name} />
      )}
    </div>
  )
}

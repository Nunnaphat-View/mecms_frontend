import { useCalibrationRecordStore } from "@/stores/calibrationRecordStore"
import { Thermometer, Droplets } from "lucide-react"

interface EnvData {
  temperature?: number
  humidity?: number
}

interface Props {
  readonly?: boolean
  envData?: EnvData
}

export default function EnvironmentCard({ readonly = false, envData }: Props) {
  const store = useCalibrationRecordStore()

  const sanitizeTemperature = (val: string) => {
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) {
      const rounded = Math.round(parsed * 10) / 10
      store.setEnvironment({ temperature: rounded })
    } else {
      store.setEnvironment({ temperature: null })
    }
  }

  const sanitizeHumidity = (val: string) => {
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) {
      const rounded = Math.round(parsed * 10) / 10
      store.setEnvironment({ humidity: rounded })
    } else {
      store.setEnvironment({ humidity: null })
    }
  }

  // Use prop data if provided (Approval mode), otherwise use store (Recording mode)
  const tempVal = envData?.temperature ?? store.environment.temperature
  const displayTemp =
    tempVal === null || tempVal === undefined || (tempVal as unknown) === ""
      ? "-"
      : Number(tempVal).toFixed(1)

  const humVal = envData?.humidity ?? store.environment.humidity
  const displayHumidity =
    humVal === null || humVal === undefined || (humVal as unknown) === ""
      ? "-"
      : Number(humVal).toFixed(1)

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white h-full shadow-xs">
      {/* Header bar */}
      <div className="bg-primary text-white font-bold text-sm text-center py-2.5 uppercase tracking-wide">
        ข้อมูลสภาวะแวดล้อม
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1 justify-center">
        {readonly ? (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Temperature Card */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <Thermometer className="size-5.5 text-blue-500" />
                <span className="text-xs font-bold text-primary">ปกติ</span>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800">{displayTemp}°C</div>
                <div className="text-[11px] text-slate-400 mt-0.5">อุณหภูมิ</div>
              </div>
            </div>

            {/* Humidity Card */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <Droplets className="size-5.5 text-blue-500" />
                <span className="text-xs font-bold text-primary">ปกติ</span>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800">{displayHumidity} %Rh</div>
                <div className="text-[11px] text-slate-400 mt-0.5">ความชื้น</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Editable Fields */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                อุณหภูมิ <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.1"
                  value={store.environment.temperature ?? ""}
                  onChange={(e) => store.setEnvironment({ temperature: e.target.value !== "" ? parseFloat(e.target.value) : null })}
                  onBlur={(e) => sanitizeTemperature(e.target.value)}
                  placeholder="เช่น 25.0"
                  className="w-full h-10 pl-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-800"
                />
                <span className="absolute right-3.5 text-xs text-slate-400 font-semibold">°C</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                ความชื้น <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.1"
                  value={store.environment.humidity ?? ""}
                  onChange={(e) => store.setEnvironment({ humidity: e.target.value !== "" ? parseFloat(e.target.value) : null })}
                  onBlur={(e) => sanitizeHumidity(e.target.value)}
                  placeholder="เช่น 50.0"
                  className="w-full h-10 pl-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-800"
                />
                <span className="absolute right-3.5 text-xs text-slate-400 font-semibold">%Rh</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

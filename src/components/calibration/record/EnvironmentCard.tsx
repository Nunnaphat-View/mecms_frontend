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
      store.setEnvironment({ temperature: Math.round(parsed * 10) / 10 })
    } else {
      store.setEnvironment({ temperature: null })
    }
  }

  const sanitizeHumidity = (val: string) => {
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) {
      store.setEnvironment({ humidity: Math.round(parsed * 10) / 10 })
    } else {
      store.setEnvironment({ humidity: null })
    }
  }

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
    <div className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white shadow-xs">
      {/* Header */}
      <div className="bg-primary text-white font-bold text-sm text-center py-2.5 uppercase tracking-wide">
        ข้อมูลสภาวะแวดล้อม
      </div>

      <div className="flex flex-col p-5 gap-5">
        {readonly ? (
          /* ── Readonly: two metric tiles ── */
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 border border-slate-100 rounded-xl p-3 bg-slate-50">
              <div className="flex items-center gap-1.5">
                <Thermometer className="size-3.5 text-blue-500" />
                <span className="text-[11px] font-semibold text-slate-500">อุณหภูมิ</span>
              </div>
              <div className="text-xl font-bold text-slate-800">
                {displayTemp}
                <span className="text-sm font-medium text-slate-400 ml-1">°C</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 border border-slate-100 rounded-xl p-3 bg-slate-50">
              <div className="flex items-center gap-1.5">
                <Droplets className="size-3.5 text-sky-500" />
                <span className="text-[11px] font-semibold text-slate-500">ความชื้น</span>
              </div>
              <div className="text-xl font-bold text-slate-800">
                {displayHumidity}
                <span className="text-sm font-medium text-slate-400 ml-1">%Rh</span>
              </div>
            </div>
          </div>
        ) : (
          /* ── Editable: label + large input, exactly like the reference ── */
          <>
            {/* Temperature */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                อุณหภูมิ <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.1"
                  value={store.environment.temperature ?? ""}
                  onChange={(e) =>
                    store.setEnvironment({
                      temperature: e.target.value !== "" ? parseFloat(e.target.value) : null,
                    })
                  }
                  onBlur={(e) => sanitizeTemperature(e.target.value)}
                  placeholder="เช่น 25.0"
                  className="w-full h-14 pl-4 pr-14 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-primary transition-colors"
                />
                <span className="absolute right-4 text-sm font-semibold text-slate-400">°C</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                ความชื้น <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.1"
                  value={store.environment.humidity ?? ""}
                  onChange={(e) =>
                    store.setEnvironment({
                      humidity: e.target.value !== "" ? parseFloat(e.target.value) : null,
                    })
                  }
                  onBlur={(e) => sanitizeHumidity(e.target.value)}
                  placeholder="เช่น 50.0"
                  className="w-full h-14 pl-4 pr-14 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-primary transition-colors"
                />
                <span className="absolute right-4 text-sm font-semibold text-slate-400">%Rh</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

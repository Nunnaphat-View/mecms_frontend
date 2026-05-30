import { Button } from "@/components/ui/button"
import { ClipboardCheck, Play } from "lucide-react"

export default function CalibrationPage() {
  const calibrationTasks = [
    { id: "CAL-2026-081", name: "Defibrillator", ward: "Emergency Room", dueDate: "2026-06-05", priority: "High" },
    { id: "CAL-2026-083", name: "Infusion Pump", ward: "Pediatrics Ward", dueDate: "2026-06-12", priority: "Medium" },
    { id: "CAL-2026-084", name: "Surgical Diathermy", ward: "OR Room 1", dueDate: "2026-06-15", priority: "High" },
    { id: "CAL-2026-085", name: "Oxymeter Sensor", ward: "ICU Ward", dueDate: "2026-06-20", priority: "Low" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardCheck className="size-6 text-primary" />
          Active Calibration Tasks
        </h1>
        <p className="text-slate-500 text-sm mt-1">Pending PM/Calibration checks to perform on hospital equipment.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary text-white text-sm">
                <th className="px-6 py-3 font-semibold">Task ID</th>
                <th className="px-6 py-3 font-semibold">Equipment Type</th>
                <th className="px-6 py-3 font-semibold">Ward Location</th>
                <th className="px-6 py-3 font-semibold">Due Date</th>
                <th className="px-6 py-3 font-semibold">Priority</th>
                <th className="px-6 py-3 font-semibold text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {calibrationTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-primary">{task.id}</td>
                  <td className="px-6 py-4 font-medium">{task.name}</td>
                  <td className="px-6 py-4">{task.ward}</td>
                  <td className="px-6 py-4">{task.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                      task.priority === "High" ? "bg-rose-50 text-rose-700" :
                      task.priority === "Medium" ? "bg-amber-50 text-amber-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="default" size="sm" className="gap-1.5 h-8">
                      <Play className="size-3 fill-current" /> Perform Check
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { 
  Wrench, 
  ClipboardCheck, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  Users 
} from "lucide-react"

export default function HomePage() {
  const stats = [
    { label: "Active Equipment", count: "1,248", icon: Wrench, color: "text-primary" },
    { label: "Pending Calibrations", count: "14", icon: Clock, color: "text-amber-500" },
    { label: "Checklists Completed", count: "389", icon: ClipboardCheck, color: "text-emerald-500" },
    { label: "Critical Alerts", count: "3", icon: ShieldAlert, color: "text-rose-500" },
  ]

  const mockTasks = [
    { id: "CAL-2026-081", name: "Defibrillator Calibration", ward: "Emergency Room", status: "Pending", type: "P1" },
    { id: "CAL-2026-082", name: "ECG Monitor Annual Inspection", ward: "Cardiology Dept", status: "Completed", type: "P2" },
    { id: "CAL-2026-083", name: "Infusion Pump PM Check", ward: "Pediatrics Ward", status: "Pending", type: "P3" },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Banner Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hospital Calibration Portal</h1>
          <p className="text-slate-500 mt-1">
            Welcome back. You have <span className="font-semibold text-primary">14 calibration tasks</span> pending for this week.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">View Schedule</Button>
          <Button variant="default">New Calibration Record</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{stat.count}</h3>
              </div>
              <div className={`p-3 rounded-lg bg-slate-50 ${stat.color}`}>
                <Icon className="size-6" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Tasks Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <ClipboardCheck className="size-5 text-secondary" />
              Recent Calibration Tasks
            </h2>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground">
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary text-white text-sm">
                  <th className="px-6 py-3 font-semibold">Task ID</th>
                  <th className="px-6 py-3 font-semibold">Equipment Name</th>
                  <th className="px-6 py-3 font-semibold">Ward/Dept</th>
                  <th className="px-6 py-3 font-semibold">Priority</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors text-sm text-slate-700">
                    <td className="px-6 py-4 font-mono font-medium text-primary">{task.id}</td>
                    <td className="px-6 py-4 font-medium">{task.name}</td>
                    <td className="px-6 py-4">{task.ward}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        task.type === "P1" ? "bg-rose-50 text-rose-700" :
                        task.type === "P2" ? "bg-amber-50 text-amber-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        {task.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {task.status === "Completed" && <CheckCircle2 className="size-3" />}
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 flex flex-col gap-5">
          <h2 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="size-5 text-secondary" />
            Quick Operations
          </h2>
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-11 border-slate-250 hover:bg-slate-50">
              <Wrench className="size-4 text-slate-500" />
              Manage Equipment Inventory
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-11 border-slate-250 hover:bg-slate-50">
              <Building2 className="size-4 text-slate-500" />
              Wards & Departments Setup
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-11 border-slate-250 hover:bg-slate-50">
              <Users className="size-4 text-slate-500" />
              Users & Technician Roles
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

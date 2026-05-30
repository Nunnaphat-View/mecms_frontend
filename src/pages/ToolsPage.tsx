import { Button } from "@/components/ui/button"
import { Plus, Search, Wrench } from "lucide-react"

export default function ToolsPage() {
  const mockTools = [
    { code: "EQ-00921", name: "Defibrillator", brand: "Zoll", model: "R Series", ward: "Emergency Room", status: "Active" },
    { code: "EQ-00922", name: "Patient Monitor", brand: "Mindray", model: "ePM 10", ward: "Cardiology Dept", status: "Active" },
    { code: "EQ-00923", name: "Infusion Pump", brand: "Alaris", model: "GP Volumetric", ward: "Pediatrics Ward", status: "Active" },
    { code: "EQ-00924", name: "Anesthesia Machine", brand: "Dräger", model: "Fabius Plus", ward: "OR Room 2", status: "Maintenance" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="size-6 text-primary" />
            Equipment & Tools Inventory
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track active hospital medical devices and instruments.</p>
        </div>
        <Button variant="default" className="gap-2">
          <Plus className="size-4" /> Add Equipment
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, name, or ward..."
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">Filter</Button>
          <Button variant="outline" className="w-full sm:w-auto">Export PDF</Button>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary text-white text-sm">
                <th className="px-6 py-3 font-semibold">Equipment Code</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Manufacturer / Model</th>
                <th className="px-6 py-3 font-semibold">Ward Location</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {mockTools.map((tool) => (
                <tr key={tool.code} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-primary">{tool.code}</td>
                  <td className="px-6 py-4 font-medium">{tool.name}</td>
                  <td className="px-6 py-4">{tool.brand} {tool.model}</td>
                  <td className="px-6 py-4">{tool.ward}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tool.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {tool.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground mr-1">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50">
                      Delete
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

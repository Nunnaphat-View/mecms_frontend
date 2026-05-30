import { Button } from "@/components/ui/button"
import { History, Eye } from "lucide-react"

export default function HistoryPage() {
  const historyRecords = [
    { id: "REC-2026-004", eqCode: "EQ-00922", eqName: "Patient Monitor", date: "2026-05-28", technician: "Amelia Watson", result: "Pass" },
    { id: "REC-2026-003", eqCode: "EQ-00918", eqName: "Syringe Pump", date: "2026-05-25", technician: "John Doe", result: "Pass" },
    { id: "REC-2026-002", eqCode: "EQ-00905", eqName: "Ventilator", date: "2026-05-20", technician: "Amelia Watson", result: "Fail" },
    { id: "REC-2026-001", eqCode: "EQ-00899", eqName: "Defibrillator", date: "2026-05-15", technician: "John Doe", result: "Pass" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <History className="size-6 text-primary" />
          Calibration Records & Logs
        </h1>
        <p className="text-slate-500 text-sm mt-1">Review historical calibration logs and view certificate reports.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary text-white text-sm">
                <th className="px-6 py-3 font-semibold">Record ID</th>
                <th className="px-6 py-3 font-semibold">Equipment</th>
                <th className="px-6 py-3 font-semibold">Inspection Date</th>
                <th className="px-6 py-3 font-semibold">Technician</th>
                <th className="px-6 py-3 font-semibold">Result</th>
                <th className="px-6 py-3 font-semibold text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {historyRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-500">{record.id}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold block text-slate-800">{record.eqName}</span>
                    <span className="text-xs text-slate-400 font-mono">{record.eqCode}</span>
                  </td>
                  <td className="px-6 py-4">{record.date}</td>
                  <td className="px-6 py-4">{record.technician}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      record.result === "Pass" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {record.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="outline" size="sm" className="gap-1.5 h-8">
                      <Eye className="size-3.5" /> View Report
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

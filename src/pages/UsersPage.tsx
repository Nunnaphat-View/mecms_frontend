import { Button } from "@/components/ui/button"
import { Users, Plus, ShieldCheck } from "lucide-react"

export default function UsersPage() {
  const mockUsers = [
    { name: "John Doe", email: "john@hospital.com", role: "Technician", status: "Active" },
    { name: "Amelia Watson", email: "amelia@hospital.com", role: "Technician", status: "Active" },
    { name: "Winston Smith", email: "winston@hospital.com", role: "Approver", status: "Active" },
    { name: "Sarah Connor", email: "sarah@hospital.com", role: "Admin", status: "Active" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Users & Role-Based Access Control
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage personnel, technicians, and system administrators.</p>
        </div>
        <Button variant="default" className="gap-2">
          <Plus className="size-4" /> Add User
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary text-white text-sm">
                <th className="px-6 py-3 font-semibold">User Name</th>
                <th className="px-6 py-3 font-semibold">Email Address</th>
                <th className="px-6 py-3 font-semibold">Role Authority</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {mockUsers.map((user) => (
                <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      user.role === "Admin" ? "bg-red-50 text-red-700" :
                      user.role === "Approver" ? "bg-amber-50 text-amber-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>
                      <ShieldCheck className="size-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground">
                      Edit
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

import { useNavigate } from "react-router-dom"
import { AlertTriangle } from "lucide-react"

interface Props {
  equipmentType?: string
}

export default function TestUnknown({ equipmentType = "ไม่ทราบประเภท" }: Props) {
  const navigate = useNavigate()

  return (
    <div className="py-16 flex justify-center">
      <div className="border border-slate-200 rounded-2xl p-8 text-center bg-white shadow-xs max-w-md w-full flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
          <AlertTriangle className="size-8 text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-800">
            แผงแบบฟอร์มการสอบเทียบยังไม่ได้รับการรองรับ
          </h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            ยังไม่มีแบบฟอร์มบันทึกผลการสอบเทียบสำหรับเครื่องมือประเภท{" "}
            <strong className="text-slate-700">{equipmentType}</strong>{" "}
            กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มโครงสร้างฟอร์มสำหรับอุปกรณ์นี้
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/tools/manage")}
          className="mt-2 w-full py-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
        >
          กลับไปหน้าจัดการเครื่องมือ
        </button>
      </div>
    </div>
  )
}

import type { LocationDetails } from "../../../stores/calibrationRecordStore"

interface Props {
  details?: LocationDetails
}

export default function LocationDetailsCard({ details }: Props) {
  return (
    <div className="mb-4">
      {/* Title outside the card */}
      <div
        className="text-base font-bold text-slate-900 mb-3 pl-3"
        style={{ borderLeft: "4px solid #f59e0b" }}
      >
        ข้อมูลสถานที่
      </div>

      <div className="border border-slate-300 rounded-xl p-4 bg-white">
        <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
          <span className="text-slate-600 font-medium">หน่วยงาน</span>
          <span className="text-slate-900 font-semibold text-right">
            {details?.department || "-"}
          </span>

          <span className="text-slate-600 font-medium">โรงพยาบาล</span>
          <span className="text-slate-900 font-semibold text-right">
            {details?.hospital || "-"}
          </span>

          <span className="text-slate-600 font-medium">อำเภอ</span>
          <span className="text-slate-900 font-semibold text-right">
            {details?.district || "-"}
          </span>

          <span className="text-slate-600 font-medium">จังหวัด</span>
          <span className="text-slate-900 font-semibold text-right">
            {details?.province || "-"}
          </span>
        </div>
      </div>
    </div>
  )
}

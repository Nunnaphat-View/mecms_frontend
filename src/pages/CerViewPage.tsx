import { useState, useEffect, useRef, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { ArrowLeft, FileText, Download, Printer, Check, Clipboard } from "lucide-react"
import html2pdf from "html2pdf.js/dist/html2pdf.min.js"
import { jsPDF } from "jspdf"
import { pmService, type TaskApi } from "../services/pmService"
import CerCertificate, { type CerData } from "../components/history/CerCertificate"
import CerCalibration, { type CerCalibrationData } from "../components/history/CerCalibration"
import { useCalibrationSettingStore } from "../stores/calibrationSettingStore"

interface Html2PdfWorker {
  set: (options: unknown) => Html2PdfWorker
  from: (element: HTMLElement | null) => Html2PdfWorker
  toPdf: () => Html2PdfWorker
  get: (type: "pdf") => Promise<jsPDF> & Html2PdfWorker
  output: (type: "blob") => Promise<Blob>
  then: <T>(onfulfilled?: (value: jsPDF) => T | PromiseLike<T>) => Promise<T>
}

interface CertificateDataExt {
  pmChecklist?: {
    description?: string
    status: string
    category_id?: number
    display_order?: number
  }[]
}

const html2pdfCall = (...args: unknown[]) => {
  const lib = (html2pdf as unknown as { default?: unknown }).default || html2pdf
  const callable = typeof lib === "function" ? lib : (window as unknown as { html2pdf?: unknown }).html2pdf
  if (typeof callable !== "function") {
    throw new Error("html2pdf library is not loaded or is not a function")
  }
  return (callable as (...args: unknown[]) => Html2PdfWorker)(...args)
}

export default function CerViewPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const taskIdParam = searchParams.get("taskId")
  const taskId = taskIdParam ? parseInt(taskIdParam) : null

  const [selectedCert, setSelectedCert] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [task, setTask] = useState<TaskApi | null>(null)

  const settingStore = useCalibrationSettingStore()
  const cerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!taskId) return

    async function loadTaskData() {
      setLoading(true)
      try {
        const data = await pmService.getTask(taskId!)
        setTask(data)
        if (data.equipment?.name) {
          await settingStore.fetchSettings(data.equipment.name.trim())
        }
      } catch (error) {
        console.error("Failed to fetch task for CER:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTaskData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])



  const activeCerData = useMemo((): CerData => {
    if (!task) {
      return {
        pmNo: "-",
        pmId: "-",
        detail: "-",
        manufacture: "-",
        model: "-",
        serialNo: "-",
        idNo: "-",
        department: "-",
        address: "-",
        section: "-",
        pmDate: "-",
        remark1: "",
        remark2: "",
        remark3: "",
        overallResult: "pass",
        specificParameters: [],
      }
    }

    const t = task
    return {
      pmNo: t.pm_no || `CAL-${t.id}`,
      pmId: t.pm_no?.substring(0, 8) || "PM-1-69-",
      detail: t.equipment?.name || "-",
      manufacture: t.equipment?.manufacturer || "-",
      model: t.equipment?.model || "-",
      serialNo: t.equipment?.serial_number || "-",
      idNo: t.equipment?.asset_code || "-",
      department:
        t.certificate_data?.hospital?.name ||
        t.equipment?.section?.hospital?.name ||
        t.equipment?.location ||
        "Hospital",
      address: t.certificate_data?.hospital?.district
        ? [t.certificate_data.hospital.district, t.certificate_data.hospital.province]
            .filter(Boolean)
            .join(" ")
        : [t.equipment?.section?.hospital?.district, t.equipment?.section?.hospital?.province]
            .filter(Boolean)
            .join(" ") || "-",
      section: t.certificate_data?.department?.name
        ? `${t.certificate_data.department.name} - ${t.equipment?.section?.description || ""}`
        : t.equipment?.section
        ? `${t.equipment.section.name} - ${t.equipment.section.description}`
        : t.equipment?.department || "-",
      pmDate: t.createdAt
        ? new Date(t.createdAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "-",
      remark1: t.checklistRemarks?.find((r) => r.category?.name?.includes("สภาพทั่วไป"))?.text || "",
      remark2: t.checklistRemarks?.find((r) => r.category?.name?.includes("ปลอดภัย"))?.text || "",
      remark3: t.checklistRemarks?.find((r) => r.category?.name?.includes("บำรุงรักษา"))?.text || "",
      overallResult: t.overall_result?.toLowerCase() === "pass" ? "pass" : "fail",
      qualitatives: (t.certificate_data as CertificateDataExt)?.pmChecklist
        ? (t.certificate_data as CertificateDataExt).pmChecklist!.map((r) => ({
            item_name: r.description || "-",
            result: r.status,
            category_id: r.category_id,
            display_order: r.display_order,
          }))
        : t.checklistResults?.map((r) => ({
            item_name: r.item?.description || "-",
            result: r.status,
            category_id: r.item?.category_id,
            display_order: r.item?.display_order,
          })) || [],
      technician: t
        ? {
            name: t.certificate_data?.technician?.name || t.technician?.name || "-",
            signatureUrl:
              t.certificate_data?.technician?.signatureUrl || t.technician?.signatureUrl || null,
            role: {
              description: t.technician?.role?.description || "-",
            },
          }
        : null,
      specificParameters: (t.specificParameters || []).map(p => ({
        id: Number(p.id),
        name: p.name,
        value: p.value || null,
        unit: p.unit || null,
        task_id: t.id,
      })),
      hospital: t.certificate_data?.hospital?.name
        ? {
            name: t.certificate_data.hospital.name,
            logoUrl: t.certificate_data.hospital.logoUrl,
            address: t.certificate_data.hospital.address,
            district: t.certificate_data.hospital.district,
            province: t.certificate_data.hospital.province,
            zipCode: t.certificate_data.hospital.zipCode,
          }
        : t.technician?.hospital
        ? {
            name: t.technician.hospital.name,
            logoUrl: t.technician.hospital.logoUrl,
            address: t.technician.hospital.address,
            district: t.technician.hospital.district,
            province: t.technician.hospital.province,
            zipCode: t.technician.hospital.zipCode,
          }
        : t.equipment?.section?.hospital
        ? {
            name: t.equipment.section.hospital.name,
            logoUrl: t.equipment.section.hospital.logoUrl,
            address: t.equipment.section.hospital.address,
            district: t.equipment.section.hospital.district,
            province: t.equipment.section.hospital.province,
            zipCode: t.equipment.section.hospital.zipCode,
          }
        : null,
    }
  }, [task])

  const calibrationCertData = useMemo((): CerCalibrationData => {
    const t = task
    return {
      certNo: t?.pm_no || (t ? `CAL-${t.id}` : "-"),
      detail: t?.equipment?.name || "-",
      manufacture: t?.equipment?.manufacturer || "-",
      model: t?.equipment?.model || "-",
      serialNo: t?.equipment?.serial_number || "-",
      idNo: t?.equipment?.asset_code || "-",
      department:
        t?.certificate_data?.hospital?.name ||
        t?.equipment?.section?.hospital?.name ||
        t?.equipment?.location ||
        "Hospital",
      address: t?.certificate_data?.hospital?.district
        ? [t.certificate_data.hospital.district, t.certificate_data.hospital.province]
            .filter(Boolean)
            .join(" ")
        : [t?.equipment?.section?.hospital?.district, t?.equipment?.section?.hospital?.province]
            .filter(Boolean)
            .join(" ") || "-",
      section: t?.certificate_data?.department?.name
        ? `${t.certificate_data.department.name} - ${t?.equipment?.section?.description || ""}`
        : t?.equipment?.section
        ? `${t.equipment.section.name} - ${t.equipment.section.description}`
        : t?.equipment?.department || "-",
      temperature:
        t?.environments?.[0]?.ambient_temp !== undefined &&
        t?.environments?.[0]?.ambient_temp !== null
          ? Number(t.environments[0].ambient_temp).toFixed(1)
          : "25.0",
      humidity:
        t?.environments?.[0]?.ambient_humidity !== undefined &&
        t?.environments?.[0]?.ambient_humidity !== null
          ? Number(t.environments[0].ambient_humidity).toFixed(1)
          : "45.0",
      calDate: t?.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB") : "-",
      apprDate: t?.approvedAt ? new Date(t.approvedAt).toLocaleDateString("en-GB") : "-",
      hospital: t?.certificate_data?.hospital?.name
        ? {
            name: t.certificate_data.hospital.name,
            logoUrl: t.certificate_data.hospital.logoUrl,
            address: t.certificate_data.hospital.address,
            district: t.certificate_data.hospital.district,
            province: t.certificate_data.hospital.province,
            zipCode: t.certificate_data.hospital.zipCode,
          }
        : t?.technician?.hospital
        ? {
            name: t.technician.hospital.name,
            logoUrl: t.technician.hospital.logoUrl,
            address: t.technician.hospital.address,
            district: t.technician.hospital.district,
            province: t.technician.hospital.province,
            zipCode: t.technician.hospital.zipCode,
          }
        : t?.equipment?.section?.hospital
        ? {
            name: t.equipment.section.hospital.name,
            logoUrl: t.equipment.section.hospital.logoUrl,
            address: t.equipment.section.hospital.address,
            district: t.equipment.section.hospital.district,
            province: t.equipment.section.hospital.province,
            zipCode: t.equipment.section.hospital.zipCode,
          }
        : null,
    }
  }, [task])

  const alarmsData = useMemo(() => {
    const t = task
    if (!t) return undefined

    const findResult = (key: string) => {
      // 1. Check Qualitatives (Cal)
      const q = t.qualitatives?.find((item) => item.item_name === key)
      if (q) {
        return q.result
      }

      // 2. Check Checklist Results (PM)
      const cr = t.checklistResults?.find((item) => item.item?.description === key)
      if (cr) {
        return cr.status.toUpperCase()
      }

      // 3. Partial match (case-insensitive) fallback
      const cr2 = t.checklistResults?.find((item) =>
        item.item?.description.toLowerCase().includes(key.toLowerCase())
      )
      if (cr2) {
        return cr2.status.toUpperCase()
      }

      return null
    }

    const res = {
      I: findResult("I"),
      II: findResult("II"),
      III: findResult("III"),
      AVR: findResult("AVR"),
      AVL: findResult("AVL"),
      AVF: findResult("AVF"),
      Alarm: findResult("Alarm"),
      oneMV: findResult("1mV"),
    }

    const hasAny = Object.values(res).some((val) => val !== null)
    if (!hasAny) return undefined

    return {
      I: res.I || "PASS",
      II: res.II || "PASS",
      III: res.III || "PASS",
      AVR: res.AVR || "PASS",
      AVL: res.AVL || "PASS",
      AVF: res.AVF || "PASS",
      Alarm: res.Alarm || "PASS",
      oneMV: res.oneMV || "PASS",
    }
  }, [task])

  const standardsData = useMemo(() => {
    return task?.standardTools?.map((std) => ({
      name: std.name,
      manufacture: std.manufacturer || "-",
      model: std.model || "-",
      sn: std.serial_number || "-",
      calDate: std.calibration_date_last
        ? new Date(std.calibration_date_last).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
      certNo: std.certificate_number || "-",
    }))
  }, [task])

  function getPdfOptions() {
    return {
      margin: 0,
      filename: `certificate-${activeCerData.pmNo}.pdf`,
      image: {
        type: "jpeg" as const,
        quality: 1,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
    }
  }

  async function autoUploadPdf() {
    if (!cerRef.current || !task?.id || task.path_pdf_cer) return
    console.log("Triggering auto-upload PDF...")
    const opt = getPdfOptions()
    try {
      const blob = await html2pdfCall().set(opt).from(cerRef.current).output("blob")
      await pmService.uploadCerPdf(task.id, blob)
      // Update local state to prevent loop
      setTask(prev => prev ? { ...prev, path_pdf_cer: "uploaded-auto" } : null)
      console.log("Auto-upload PDF success")
    } catch (e) {
      console.error("Auto-upload PDF failed:", e)
    }
  }

  // Auto-upload in background after rendering
  useEffect(() => {
    if (task && task.status === "Approved" && !task.path_pdf_cer) {
      const timer = setTimeout(() => {
        autoUploadPdf()
      }, 3000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task])

  async function printCer() {
    if (!cerRef.current) return

    setIsPrinting(true)
    // Wait briefly for style rendering
    await new Promise(r => setTimeout(r, 100))

    const opt = getPdfOptions()

    try {
      await html2pdfCall()
        .set(opt)
        .from(cerRef.current)
        .toPdf()
        .get("pdf")
        .then((pdf: jsPDF) => {
          const blobUrl = pdf.output("bloburl")
          
          // Use hidden iframe to bypass popup blocker and print cleanly
          const iframe = document.createElement("iframe")
          iframe.style.display = "none"
          iframe.src = blobUrl.toString()
          document.body.appendChild(iframe)
          
          iframe.onload = () => {
            iframe.contentWindow?.focus()
            iframe.contentWindow?.print()
            // Clean up
            setTimeout(() => {
              document.body.removeChild(iframe)
            }, 1000)
          }
        })
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error("Printing PDF Error:", err)
      alert("เกิดข้อผิดพลาดในการพิมพ์: " + errorMsg)
    } finally {
      setIsPrinting(false)
    }
  }

  async function downloadPdf() {
    if (!cerRef.current) return

    setIsPrinting(true)
    await new Promise(r => setTimeout(r, 100))

    const opt = getPdfOptions()

    try {
      const pdf = await html2pdfCall()
        .set(opt)
        .from(cerRef.current)
        .toPdf()
        .get("pdf")

      const blob = pdf.output("blob")
      pdf.save(`certificate-${activeCerData.pmNo}.pdf`)

      // Upload to backend
      if (task?.id) {
        await pmService.uploadCerPdf(task.id, blob)
        alert("บันทึกใบ CER ลงระบบเรียบร้อยแล้ว")
        setTask(prev => prev ? { ...prev, path_pdf_cer: "uploaded" } : null)
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error("PDF Generation/Upload Error:", error)
      alert("เกิดข้อผิดพลาดในการบันทึก PDF: " + errorMsg)
    } finally {
      setIsPrinting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 gap-3">
        <div className="size-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <span className="text-xs text-slate-500 font-sans">กำลังโหลดข้อมูลใบรับรอง...</span>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6 text-center">
        <FileText className="size-12 text-slate-400 mb-3" />
        <h2 className="text-base font-bold text-slate-800 font-sans">ไม่พบข้อมูลใบรับรอง</h2>
        <button
          onClick={() => navigate("/history")}
          className="mt-4 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-semibold cursor-pointer"
        >
          กลับหน้าประวัติ
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans print:p-0 print:bg-white">
      {/* Premium Header */}
      <div className="max-w-[210mm] mx-auto bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 print:hidden">
        
        {/* Left Side: Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/history")}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="text-left">
            <h1 className="font-bold text-sm text-slate-800 leading-tight">
              {selectedCert === 1
                ? "ใบรับรองผลการตรวจสภาพ (Maintenance)"
                : "ใบรับรองผลการสอบเทียบเครื่องมือ (Calibration)"}
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              ID: {activeCerData.pmNo} | อัปเดตล่าสุด: {activeCerData.pmDate}
            </p>
          </div>
        </div>

        {/* Center: Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-center gap-1">
          <button
            onClick={() => setSelectedCert(1)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCert === 1
                ? "bg-white text-primary shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {selectedCert === 1 ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
            ใบตรวจสภาพ (PM)
          </button>
          <button
            onClick={() => setSelectedCert(2)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCert === 2
                ? "bg-white text-primary shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {selectedCert === 2 ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
            ใบสอบเทียบ (Cal)
          </button>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={printCer}
            disabled={isPrinting}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 h-9 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="size-4" />
            พิมพ์
          </button>
          <button
            onClick={downloadPdf}
            disabled={isPrinting}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 h-9 bg-primary hover:bg-[#07536a] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="size-4" />
            ดาวน์โหลด PDF
          </button>
        </div>
      </div>

      {/* Capture Area */}
      <div className="w-full overflow-x-auto pb-10">
        <div className="mx-auto" ref={cerRef}>
          {selectedCert === 1 && (
            <CerCertificate data={activeCerData} />
          )}
          {selectedCert === 2 && (
            <CerCalibration
              data={calibrationCertData}
              measurements={task.measurements || []}
              settings={settingStore.settings}
              specificParameters={task.specificParameters || []}
              technician={
                task
                  ? {
                      name: task.certificate_data?.technician?.name || task.technician?.name || "-",
                      position: task.technician?.role?.description || "นายช่างไฟฟ้า",
                      signatureUrl:
                        task.certificate_data?.technician?.signatureUrl ||
                        task.technician?.signatureUrl ||
                        null,
                    }
                  : null
              }
              approver={
                task
                  ? {
                      name: task.certificate_data?.approver?.name || task.approver?.name || "-",
                      position: task.approver?.role?.description || "หัวหน้างาน",
                      signatureUrl:
                        task.certificate_data?.approver?.signatureUrl ||
                        task.approver?.signatureUrl ||
                        null,
                    }
                  : null
              }
              alarms={alarmsData}
              standards={standardsData}
            />
          )}
        </div>
      </div>

    </div>
  )
}

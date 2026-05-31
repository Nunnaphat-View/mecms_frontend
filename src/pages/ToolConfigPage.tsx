import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Plus, ChevronRight } from "lucide-react"

import ConfigStandardToolCard from "../components/tools/config/ConfigStandardToolCard"
import ConfigQualitativeBlock from "../components/tools/config/ConfigQualitativeBlock"
import ConfigQuantitativeBlock from "../components/tools/config/ConfigQuantitativeBlock"
import type { QuantData } from "../components/tools/config/ConfigQuantitativeBlock"
import { useToast } from "@/hooks/useToast"

import { standardToolService } from "../services/standardToolService"
import { calibrationSettingService } from "../services/calibrationMgmtService"
import type { StandardToolCategory, CalibrationSetting } from "../types/tool"

interface TestItem {
  name: string
  result: "pass" | "fail" | null
}

interface QualData {
  name: string
  testItems: TestItem[]
}

function isInfusionPump(name: string | null | undefined) {
  if (!name) return false
  const normalized = name.trim().toLowerCase()
  return (
    normalized.includes("infusion") ||
    normalized.includes("syringe") ||
    normalized.includes("pump") ||
    normalized.includes("เครื่องให้สารน้ำ") ||
    normalized.includes("เครื่องควบคุมการให้สาร") ||
    normalized.includes("สารละลาย") ||
    normalized.includes("เครื่องควบคุมการให้ยา") ||
    normalized.includes("เครื่องให้ยา") ||
    normalized.includes("เครื่องฉีดยา") ||
    normalized.includes("เครื่องฉีดให้ยา") ||
    normalized.includes("pca") ||
    normalized.includes("tci")
  )
}

const getDefaultSettings = (equipmentName: string): CalibrationSetting[] => {
  if (!isInfusionPump(equipmentName)) return []

  return [
    {
      equipment_name: equipmentName,
      type: "qualitative",
      parameter_name: "Occlusion",
      test_values: [{ label: "Occlusion Alarm", value: 0 }],
    },
    {
      equipment_name: equipmentName,
      type: "quantitative",
      parameter_name: "Flow Rate",
      unit: "mL/hr",
      tolerance: "2.2",
      display_type: "Digital",
      resolution: "0.1",
      test_values: [
        { label: "10 mL/hr", value: 10 },
        { label: "50 mL/hr", value: 50 },
        { label: "100 mL/hr", value: 100 },
      ],
    },
    {
      equipment_name: equipmentName,
      type: "quantitative",
      parameter_name: "Volume",
      unit: "mL",
      tolerance: "2.2",
      display_type: "Digital",
      resolution: "0.1",
      test_values: [
        { label: "50 mL", value: 50 },
        { label: "100 mL", value: 100 },
        { label: "200 mL", value: 200 },
      ],
    },
  ]
}

export default function ToolConfigPage() {
  const { name: rawName } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const toolName = decodeURIComponent(rawName || "")
  const toast = useToast()

  const [allCategories, setAllCategories] = useState<StandardToolCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<StandardToolCategory[]>([])
  const [qualitativeParams, setQualitativeParams] = useState<QualData[]>([])
  const [quantitativeParams, setQuantitativeParams] = useState<QuantData[]>([])

  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [selectedCategoryToAdd, setSelectedCategoryToAdd] = useState<StandardToolCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        // 1. Fetch categories
        const cats = await standardToolService.getCategories()
        setAllCategories(cats)

        // 2. Fetch settings
        if (toolName) {
          const existing = await calibrationSettingService.getByEquipment(toolName)
          if (existing && existing.length > 0) {
            // Map qualitative
            const qual = existing
              .filter((s) => s.type === "qualitative")
              .map((s) => ({
                name: s.parameter_name,
                testItems: s.test_values
                  ? s.test_values.map((v) => ({
                      name: v.label,
                      result: null as "pass" | "fail" | null,
                    }))
                  : [],
              }))
            setQualitativeParams(qual)

            // Map quantitative
            const quant = existing
              .filter((s) => s.type === "quantitative")
              .map((s) => ({
                parameter: s.parameter_name,
                unit: s.unit || "",
                tolerance: s.tolerance || "1.0",
                stdType: s.std_type || "1 - แบบอ้างอิงเครื่องมือมาตรฐาน",
                display: s.display_type || "",
                uncertainty: s.resolution || "",
                testValues: s.test_values || [],
              }))
            setQuantitativeParams(quant)

            // Map unique categories
            const allCats = new Map<number, StandardToolCategory>()
            existing.forEach((s) => {
              if (s.categories) {
                s.categories.forEach((c) => {
                  if (c.id) allCats.set(c.id, c)
                })
              }
            })
            setSelectedCategories(Array.from(allCats.values()))
          } else if (toolName.toLowerCase().includes("ultrasound")) {
            // Pre-populate with Ultrasound template
            setQuantitativeParams([
              {
                parameter: "Vertical (Axial) Distance (1)",
                unit: "mm",
                tolerance: "2.0",
                stdType: "6 - แบบวัดครั้งเดียว (1 STD : 1 UUC)",
                display: "Digital",
                uncertainty: "0.01",
                testValues: [{ label: "ค่าทดสอบที่ 1", value: 0 }],
              },
              {
                parameter: "Horizontal (Lateral) Distance (2)",
                unit: "mm",
                tolerance: "2.0",
                stdType: "6 - แบบวัดครั้งเดียว (1 STD : 1 UUC)",
                display: "Digital",
                uncertainty: "0.01",
                testValues: [{ label: "ค่าทดสอบที่ 1", value: 0 }],
              },
              {
                parameter: "Horizontal (Lateral) Distance (3)",
                unit: "mm",
                tolerance: "2.0",
                stdType: "6 - แบบวัดครั้งเดียว (1 STD : 1 UUC)",
                display: "Digital",
                uncertainty: "0.01",
                testValues: [{ label: "ค่าทดสอบที่ 1", value: 0 }],
              },
              {
                parameter: "Uniformity Distance (4)",
                unit: "mm",
                tolerance: "2.0",
                stdType: "6 - แบบวัดครั้งเดียว (1 STD : 1 UUC)",
                display: "Digital",
                uncertainty: "0.01",
                testValues: [{ label: "ค่าทดสอบที่ 1", value: 0 }],
              },
              {
                parameter: "Depth of Field Maximum Distance",
                unit: "mm",
                tolerance: "2.0",
                stdType: "6 - แบบวัดครั้งเดียว (1 STD : 1 UUC)",
                display: "Digital",
                uncertainty: "0.1",
                testValues: [{ label: "ค่าทดสอบที่ 1", value: 0 }],
              },
            ])

            const targetCat = cats.find(
              (c) =>
                c.name.toLowerCase().includes("ultrasound") ||
                c.name.toLowerCase().includes("phantom")
            )
            if (targetCat) {
              setSelectedCategories([targetCat])
            }
          } else {
            // Check default settings for infusion pump
            const fallback = getDefaultSettings(toolName)
            if (fallback.length > 0) {
              const qual = fallback
                .filter((s) => s.type === "qualitative")
                .map((s) => ({
                  name: s.parameter_name,
                  testItems: s.test_values
                    ? s.test_values.map((v) => ({
                        name: v.label,
                        result: null as "pass" | "fail" | null,
                      }))
                    : [],
                }))
              setQualitativeParams(qual)

              const quant = fallback
                .filter((s) => s.type === "quantitative")
                .map((s) => ({
                  parameter: s.parameter_name,
                  unit: s.unit || "",
                  tolerance: s.tolerance || "1.0",
                  stdType: s.std_type || "1 - แบบอ้างอิงเครื่องมือมาตรฐาน",
                  display: s.display_type || "",
                  uncertainty: s.resolution || "",
                  testValues: s.test_values || [],
                }))
              setQuantitativeParams(quant)
            }
          }
        }
      } catch (e) {
        console.error("Failed to load calibration settings details:", e)
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [toolName])

  const confirmAddCategory = () => {
    if (selectedCategoryToAdd) {
      if (!selectedCategories.some((c) => c.id === selectedCategoryToAdd.id)) {
        setSelectedCategories([...selectedCategories, selectedCategoryToAdd])
      }
      setSelectedCategoryToAdd(null)
      setShowAddCategoryDialog(false)
    }
  }

  const removeCategory = (idx: number) => {
    setSelectedCategories(selectedCategories.filter((_, i) => i !== idx))
  }

  const addQuantitative = () => {
    setQuantitativeParams([
      ...quantitativeParams,
      {
        parameter: "",
        unit: "",
        tolerance: "1.0",
        stdType: "1 - แบบอ้างอิงเครื่องมือมาตรฐาน",
        display: "",
        uncertainty: "",
        testValues: [
          { label: "ค่าทดสอบที่ 1", value: 0 },
          { label: "ค่าทดสอบที่ 2", value: 0 },
          { label: "ค่าทดสอบที่ 3", value: 0 },
        ],
      },
    ])
  }

  const addQualitative = () => {
    setQualitativeParams([
      ...qualitativeParams,
      {
        name: "",
        testItems: [
          { name: "", result: null },
          { name: "", result: null },
          { name: "", result: null },
        ],
      },
    ])
  }

  const removeQualitative = (idx: number) => {
    setQualitativeParams(qualitativeParams.filter((_, i) => i !== idx))
  }

  const removeQuantitative = (idx: number) => {
    setQuantitativeParams(quantitativeParams.filter((_, i) => i !== idx))
  }

  const saveConfig = async () => {
    if (!toolName) return

    setIsSaving(true)
    try {
      const payload: CalibrationSetting[] = []
      const globalCategoryIds = selectedCategories
        .map((c) => c.id)
        .filter((id): id is number => id !== undefined)

      // Map quantitative
      quantitativeParams.forEach((qp) => {
        payload.push({
          equipment_name: toolName,
          type: "quantitative",
          parameter_name: qp.parameter,
          unit: qp.unit,
          tolerance: qp.tolerance,
          std_type: qp.stdType,
          display_type: qp.display,
          resolution: qp.uncertainty,
          test_values: qp.testValues.map((v, idx) => ({
            ...v,
            label: `ค่าทดสอบที่ ${idx + 1}`,
          })),
          category_ids: globalCategoryIds,
        })
      })

      // Map qualitative
      qualitativeParams.forEach((qp) => {
        payload.push({
          equipment_name: toolName,
          type: "qualitative",
          parameter_name: qp.name,
          test_values: qp.testItems.map((item, idx) => ({
            label: item.name || `รายการที่ ${idx + 1}`,
            value: 0,
          })),
          category_ids: globalCategoryIds,
        })
      })

      await calibrationSettingService.saveBatch(toolName, payload)
      toast.success("บันทึกการตั้งค่าสำเร็จ")
      navigate("/tools/manage?tab=settings")
    } catch (error) {
      console.error("Save error:", error)
      toast.error("ไม่สามารถบันทึกการตั้งค่าได้")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 font-sans">
        <span className="inline-block w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-2" />
        กำลังโหลดข้อมูล...
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans select-none pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          <span>ตั้งค่าเครื่องมือแพทย์</span>
          <ChevronRight className="size-3 text-slate-400" />
          <span className="text-secondary">{toolName}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800">{toolName}</h1>
        <p className="text-slate-500 text-xs mt-1">ประเภท : Medical</p>
      </div>

      {/* ── Section: เครื่องมือมาตรฐาน ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-secondary text-white text-xs font-bold px-5 py-3.5 flex items-center justify-between">
          ประเภทเครื่องมือมาตรฐานที่ต้องใช้
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {[0, 1, 2].map((slot) => {
            const hasCategory = !!selectedCategories[slot]
            const isNextAddSlot = slot === selectedCategories.length

            if (hasCategory) {
              return (
                <div key={slot} className="h-full">
                  <ConfigStandardToolCard
                    name={selectedCategories[slot].name}
                    onRemove={() => removeCategory(slot)}
                  />
                </div>
              )
            } else if (isNextAddSlot) {
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setShowAddCategoryDialog(true)}
                  className="w-full min-h-[200px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:border-secondary hover:bg-cyan-50/20 transition-all flex flex-col items-center justify-center p-6 cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center mb-3">
                      <Plus className="size-8" />
                    </div>
                    <span className="text-xs font-bold text-slate-500">เพิ่มประเภทเครื่องมือ</span>
                  </div>
                </button>
              )
            } else {
              return (
                <div
                  key={slot}
                  className="w-full min-h-[200px] border border-slate-100 rounded-xl bg-slate-50/20"
                />
              )
            }
          })}
        </div>
      </div>

      {/* ── Section: พารามิเตอร์การสอบเทียบเชิงคุณภาพ ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-secondary text-white text-xs font-bold px-5 py-3.5 flex items-center justify-between">
          <span>พารามิเตอร์การสอบเทียบเชิงคุณภาพ</span>
          <button
            type="button"
            onClick={addQualitative}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-900 hover:bg-cyan-950 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border-none"
          >
            <Plus className="size-3.5" /> เพิ่มพารามิเตอร์
          </button>
        </div>
        <div className="p-5 space-y-4">
          {qualitativeParams.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">ไม่มีข้อมูลพารามิเตอร์เชิงคุณภาพ</p>
          ) : (
            qualitativeParams.map((param, i) => (
              <ConfigQualitativeBlock
                key={i}
                index={i + 1}
                parameterName={param.name}
                testItems={param.testItems}
                onChangeParameterName={(name) => {
                  const updated = [...qualitativeParams]
                  updated[i].name = name
                  setQualitativeParams(updated)
                }}
                onChangeTestItems={(items) => {
                  const updated = [...qualitativeParams]
                  updated[i].testItems = items
                  setQualitativeParams(updated)
                }}
                onRemove={() => removeQualitative(i)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Section: พารามิเตอร์การสอบเทียบเชิงปริมาณ ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-secondary text-white text-xs font-bold px-5 py-3.5 flex items-center justify-between">
          <span>พารามิเตอร์การสอบเทียบเชิงปริมาณ</span>
          <button
            type="button"
            onClick={addQuantitative}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-900 hover:bg-cyan-950 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border-none"
          >
            <Plus className="size-3.5" /> เพิ่มพารามิเตอร์
          </button>
        </div>
        <div className="p-5 space-y-4">
          {quantitativeParams.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">ไม่มีข้อมูลพารามิเตอร์เชิงปริมาณ</p>
          ) : (
            quantitativeParams.map((param, i) => (
              <ConfigQuantitativeBlock
                key={i}
                index={i + 1}
                data={param}
                onChangeData={(newData) => {
                  const updated = [...quantitativeParams]
                  updated[i] = newData
                  setQuantitativeParams(updated)
                }}
                onRemove={() => removeQuantitative(i)}
              />
            ))
          )}
        </div>
      </div>

      {/* Page Footer Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate("/tools/manage?tab=settings")}
          className="px-8 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors text-xs font-bold cursor-pointer"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={saveConfig}
          className="flex items-center gap-1.5 px-8 py-2.5 bg-secondary hover:bg-secondary/95 disabled:opacity-50 text-white rounded-lg transition-colors text-xs font-bold cursor-pointer"
        >
          {isSaving && (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
          )}
          บันทึก
        </button>
      </div>

      {/* ── Dialog: Add Standard Tool Category ── */}
      {showAddCategoryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4">เลือกประเภทเครื่องมือมาตรฐาน</h3>
              <select
                value={selectedCategoryToAdd?.id || ""}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  const cat = allCategories.find((c) => c.id === id)
                  setSelectedCategoryToAdd(cat || null)
                }}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-secondary focus:bg-white transition-all outline-none"
              >
                <option value="">เลือกประเภทเครื่องมือมาตรฐาน</option>
                {allCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryToAdd(null)
                  setShowAddCategoryDialog(false)
                }}
                className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-xs font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={!selectedCategoryToAdd}
                onClick={confirmAddCategory}
                className="px-5 py-2 bg-secondary disabled:opacity-50 hover:bg-secondary/95 text-white rounded-lg transition-colors text-xs font-bold cursor-pointer"
              >
                เพิ่ม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

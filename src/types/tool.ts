export type ToolStatus =
  | 'พร้อมใช้งาน'
  | 'กำลังสอบเทียบ'
  | 'รอดำเนินการ'
  | 'จำหน่ายแล้ว'
  | 'กำลังใช้งาน'
  | 'ส่งซ่อม'
  | 'ปิดใช้งาน'
  | 'ready'
  | 'calibrating'
  | 'repair'
  | 'disabled';

export interface Hospital {
  id: number;
  name: string;
  code?: string;
  logoUrl?: string;
  zipCode?: string;
  address?: string;
  district?: string;
  province?: string;
  description?: string;
}

export interface Section {
  id: number;
  name: string;
  code?: string;
  description?: string;
  hospitalId: number;
  hospital?: Hospital;
}

export interface EquipmentType {
  id: number;
  name: string;
}

export interface MedicalTool {
  id: string; // asset_code
  name: string;
  company: string; // manufacturer
  model: string;
  type: string; // equipmentType.name
  serialNumber: string;
  calibrationCycle: string; // interval formatted (e.g. "365 วัน")
  dueDate: string;
  lastCalibrationDate: string;
  location: string; // hospital/section location
  department: string; // section name
  status: ToolStatus;
  riskLevel?: string;
  equipmentType?: EquipmentType;
  equipment_type_id?: number | null;
  sectionId?: number | null;
  hospitalId?: number | null;
  backendId?: number;
}

export interface StandardToolCategory {
  id: number
  name: string
}

export interface BackendStandardTool {
  id: number
  name: string
  asset_code: string | null
  serial_number: string | null
  manufacturer: string | null
  model: string | null
  path_pdf: string | null
  path_image: string | null
  certificate_number: string | null
  calibration_date_last: string | null
  unit: string | null
  category_id: number | null
  category?: StandardToolCategory | null
}

export interface BackendEquipment {
  id: number;
  name: string;
  asset_code: string | null;
  serial_number: string | null;
  manufacturer: string | null;
  model: string | null;
  status: string;
  risk_level: string | null;
  equipment_type_id: number | null;
  equipmentType: EquipmentType | null;
  path_pdf: string | null;
  interval: number | null;
  calibration_due_date: string | null;
  calibration_date_last: string | null;
  department: string | null;
  location: string | null;
  sectionId: number | null;
  section: {
    id: number;
    name: string;
    hospital: Hospital;
  } | null;
}

export interface CalibrationProcess {
  id: number;
  parameter_name: string;
  procedure: string;
  unit: string;
  standard_tool_id?: number | null;
  standardTool?: { name: string; manufacturer?: string; asset_code?: string };
}

export interface CalibrationCost {
  id: number;
  tool_name: string;
  description: string;
  price: number;
}

export interface ICalibrationTestValue {
  label: string;
  value: number;
}

export interface CalibrationSetting {
  id?: number;
  equipment_name: string;
  type: "quantitative" | "qualitative";
  parameter_name: string;
  unit?: string;
  tolerance?: string;
  std_type?: string;
  display_type?: string;
  resolution?: string;
  uncertainty?: string;
  test_values?: ICalibrationTestValue[];
  standard_tool_id?: number | null;
  standardTool?: BackendStandardTool;
  categories?: StandardToolCategory[];
}

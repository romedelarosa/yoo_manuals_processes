import type { LucideIcon } from "lucide-react";

export type BusinessId = "yoo-clinic" | "ori-wellness";

export type EmployeeRoleId =
  | "front-desk"
  | "nurse"
  | "therapist"
  | "doctor"
  | "sales"
  | "manager"
  | "general-staff";

export type SystemRoleId =
  | "super-admin"
  | "business-admin"
  | "content-admin"
  | "employee";

export type ModuleStatus = "pending" | "in-progress" | "completed";

export type ModuleCategory =
  | "Company-wide"
  | "Conduct"
  | "Privacy"
  | "Operations"
  | "Safety"
  | "Role SOP"
  | "Blueprint"
  | "Acknowledgment";

export type Business = {
  id: BusinessId;
  name: string;
  shortName: string;
};

export type RoleDefinition<T extends string> = {
  id: T;
  name: string;
  description: string;
};

export type EmployeeProfile = {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  businessIds: BusinessId[];
  employeeRoleIds: EmployeeRoleId[];
  systemRoleIds: SystemRoleId[];
  status: "active" | "inactive";
};

export type ModuleSection = {
  id: string;
  title: string;
  body: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  topicTag?: string;
  relatedSectionId?: string;
  active?: boolean;
  source?: "manual" | "ai_draft" | "ai_approved";
};

export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  ownerRoleId: EmployeeRoleId;
  escalation?: string;
};

export type ProcessConnection = {
  from: string;
  to: string;
  label?: string;
};

export type ProcessBlueprint = {
  title: string;
  description: string;
  steps: ProcessStep[];
  connections: ProcessConnection[];
};

export type ModuleAttachment = {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: "image" | "pdf" | "document" | "spreadsheet";
  mimeType: string;
  storagePath: string;
  sizeLabel: string;
  downloadable: boolean;
  visibleToEmployees: boolean;
};

export type ManualModule = {
  id: string;
  title: string;
  description: string;
  category: ModuleCategory;
  businessIds: BusinessId[];
  employeeRoleIds: EmployeeRoleId[];
  required: boolean;
  acknowledgmentRequired: boolean;
  active: boolean;
  version: string;
  estimatedMinutes: number;
  sections: ModuleSection[];
  quiz?: {
    passingScore: number;
    accessEnabled?: boolean;
    assessmentMode?: "closed_reference" | "open_reference";
    timeLimitMinutes?: number;
    randomizeQuestions?: boolean;
    maxAttempts?: number;
    unlockRequiresSectionsRead?: boolean;
    questions: QuizQuestion[];
  };
  blueprint?: ProcessBlueprint;
  attachments?: ModuleAttachment[];
};

export type ProgressRecord = {
  userId: string;
  moduleId: string;
  status: ModuleStatus;
  quizPassed: boolean;
  acknowledged: boolean;
  completedAt?: string;
};

export type StatCard = {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
};

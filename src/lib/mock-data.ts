import {
  AlertTriangle,
  ClipboardCheck,
  FileCheck2,
  Layers3,
  ShieldCheck,
  Users,
} from "lucide-react";
import type {
  Business,
  EmployeeProfile,
  EmployeeRoleId,
  ManualModule,
  ProgressRecord,
  RoleDefinition,
  StatCard,
  SystemRoleId,
} from "./types";

export const businesses: Business[] = [
  { id: "yoo-clinic", name: "YOO Clinic", shortName: "YOO" },
  {
    id: "ori-wellness",
    name: "ORI Wellness Center",
    shortName: "ORI",
  },
];

export const employeeRoles: RoleDefinition<EmployeeRoleId>[] = [
  {
    id: "front-desk",
    name: "Front Desk / Admin Coordinator",
    description: "Bookings, reception, client check-in, and coordination.",
  },
  {
    id: "nurse",
    name: "Nurse",
    description: "Clinical preparation, patient safety, and treatment support.",
  },
  {
    id: "therapist",
    name: "Therapist",
    description: "Service execution, room readiness, and client care.",
  },
  {
    id: "doctor",
    name: "Doctor / Medical Director",
    description: "Clinical governance, treatment decisions, and escalation.",
  },
  {
    id: "sales",
    name: "Sales / Client Relations",
    description: "Inquiries, client education, conversion, and follow-up.",
  },
  {
    id: "manager",
    name: "Manager / Supervisor",
    description: "Approvals, issue handling, coaching, and compliance review.",
  },
  {
    id: "general-staff",
    name: "General Staff",
    description: "Shared workplace rules and general operational standards.",
  },
];

export const systemRoles: RoleDefinition<SystemRoleId>[] = [
  {
    id: "super-admin",
    name: "Super Admin / Owner",
    description: "Full access across both businesses and system settings.",
  },
  {
    id: "business-admin",
    name: "Business Admin / Manager",
    description: "Manage assigned business users, modules, and reports.",
  },
  {
    id: "content-admin",
    name: "Content Admin",
    description: "Create, edit, publish, and version onboarding content.",
  },
  {
    id: "employee",
    name: "Employee",
    description: "Complete assigned modules, quizzes, and acknowledgments.",
  },
];

export const employees: EmployeeProfile[] = [
  {
    id: "employee-mika",
    fullName: "Mika Santos",
    email: "mika.santos@example.com",
    jobTitle: "Nurse",
    businessIds: ["yoo-clinic"],
    employeeRoleIds: ["nurse", "general-staff"],
    systemRoleIds: ["employee"],
    status: "active",
  },
  {
    id: "employee-ara",
    fullName: "Ara Lim",
    email: "ara.lim@example.com",
    jobTitle: "Front Desk Coordinator",
    businessIds: ["yoo-clinic", "ori-wellness"],
    employeeRoleIds: ["front-desk", "sales", "general-staff"],
    systemRoleIds: ["employee"],
    status: "active",
  },
  {
    id: "owner",
    fullName: "Owner Demo",
    email: "owner@example.com",
    jobTitle: "Owner",
    businessIds: ["yoo-clinic", "ori-wellness"],
    employeeRoleIds: ["manager", "general-staff"],
    systemRoleIds: ["super-admin", "content-admin"],
    status: "active",
  },
];

export const modules: ManualModule[] = [
  {
    id: "common-code-of-conduct",
    title: "Company Code of Conduct",
    description:
      "Shared expectations for professionalism, accountability, communication, and conduct.",
    category: "Conduct",
    businessIds: ["yoo-clinic", "ori-wellness"],
    employeeRoleIds: [
      "front-desk",
      "nurse",
      "therapist",
      "doctor",
      "sales",
      "manager",
      "general-staff",
    ],
    required: true,
    acknowledgmentRequired: true,
    active: true,
    version: "1.0.0",
    estimatedMinutes: 12,
    sections: [
      {
        id: "conduct-1",
        title: "Professional standard",
        body: "Employees are expected to act with courtesy, accuracy, and respect in all client, patient, and teammate interactions. When unsure, ask a manager before acting outside policy.",
      },
      {
        id: "conduct-2",
        title: "Accountability",
        body: "Employees must complete assigned onboarding modules, follow published procedures, and acknowledge updates when policies change.",
      },
      {
        id: "conduct-3",
        title: "Escalation",
        body: "Conflicts, complaints, safety issues, and unusual requests must be escalated to the assigned supervisor or owner based on the published escalation protocol.",
      },
    ],
    attachments: [
      {
        id: "contract-template",
        title: "Employee contract template",
        description:
          "Downloadable reference document for employment paperwork handled by authorized admins.",
        fileName: "employee-contract-template.txt",
        fileType: "document",
        mimeType: "text/plain",
        storagePath: "/documents/employee-contract-template.txt",
        sizeLabel: "1 KB",
        downloadable: true,
        visibleToEmployees: true,
      },
    ],
    quiz: {
      passingScore: 80,
      accessEnabled: true,
      assessmentMode: "closed_reference",
      timeLimitMinutes: 8,
      randomizeQuestions: true,
      maxAttempts: 2,
      unlockRequiresSectionsRead: true,
      questions: [
        {
          id: "conduct-q1",
          question: "What should an employee do when a situation is not covered by policy?",
          options: [
            "Decide alone to keep the process moving",
            "Ask a manager before acting outside policy",
            "Ignore the request",
          ],
          answer: "Ask a manager before acting outside policy",
          explanation:
            "Uncovered situations should be escalated before an employee acts outside policy.",
          difficulty: "easy",
          topicTag: "Escalation",
          relatedSectionId: "conduct-1",
          active: true,
          source: "manual",
        },
        {
          id: "conduct-q2",
          question: "When should policy updates be acknowledged?",
          options: [
            "Only during annual review",
            "When assigned and when important policies change",
            "Only for new hires",
          ],
          answer: "When assigned and when important policies change",
          explanation:
            "Acknowledgment records should match the current assigned policy version.",
          difficulty: "medium",
          topicTag: "Acknowledgment",
          relatedSectionId: "conduct-2",
          active: true,
          source: "manual",
        },
      ],
    },
  },
  {
    id: "privacy-confidentiality",
    title: "Confidentiality and Data Privacy",
    description:
      "Handling client and patient information with appropriate privacy, access, and disclosure limits.",
    category: "Privacy",
    businessIds: ["yoo-clinic", "ori-wellness"],
    employeeRoleIds: [
      "front-desk",
      "nurse",
      "therapist",
      "doctor",
      "sales",
      "manager",
      "general-staff",
    ],
    required: true,
    acknowledgmentRequired: true,
    active: true,
    version: "1.0.0",
    estimatedMinutes: 15,
    sections: [
      {
        id: "privacy-1",
        title: "Minimum necessary access",
        body: "Only access client or patient information needed for your assigned task. Do not browse records out of curiosity or share information outside approved channels.",
      },
      {
        id: "privacy-2",
        title: "Secure conversations",
        body: "Avoid discussing sensitive cases in public areas, chat groups, or with unauthorized employees. Verify identity before discussing bookings, treatment records, or payment concerns.",
      },
    ],
    quiz: {
      passingScore: 80,
      accessEnabled: false,
      assessmentMode: "closed_reference",
      timeLimitMinutes: 8,
      randomizeQuestions: true,
      maxAttempts: 2,
      unlockRequiresSectionsRead: true,
      questions: [
        {
          id: "privacy-q1",
          question: "Which privacy rule is correct?",
          options: [
            "Access only information needed for your task",
            "Share records with any teammate",
            "Discuss cases anywhere inside the business",
          ],
          answer: "Access only information needed for your task",
          explanation:
            "Minimum necessary access reduces privacy risk and protects sensitive client or patient information.",
          difficulty: "easy",
          topicTag: "Data privacy",
          relatedSectionId: "privacy-1",
          active: true,
          source: "manual",
        },
      ],
    },
  },
  {
    id: "appointment-blueprint",
    title: "Appointment Handling Service Blueprint",
    description:
      "Standard flow from inquiry to completed visit, including role ownership and escalation points.",
    category: "Blueprint",
    businessIds: ["yoo-clinic", "ori-wellness"],
    employeeRoleIds: ["front-desk", "sales", "nurse", "therapist", "manager"],
    required: true,
    acknowledgmentRequired: true,
    active: true,
    version: "1.0.0",
    estimatedMinutes: 18,
    sections: [
      {
        id: "appointment-1",
        title: "Purpose",
        body: "The blueprint keeps inquiry handling, booking, service preparation, payment, and follow-up consistent across YOO Clinic and ORI Wellness Center.",
      },
      {
        id: "appointment-2",
        title: "Control point",
        body: "The front desk owns appointment accuracy. Clinical or service staff own readiness and safe delivery. Managers handle exceptions and unresolved client concerns.",
      },
    ],
    blueprint: {
      title: "Inquiry to Completed Visit",
      description:
        "A lightweight service blueprint that identifies handoffs, responsible roles, and escalation points.",
      steps: [
        {
          id: "inquiry",
          title: "Inquiry received",
          description:
            "Capture client name, contact details, concern, preferred schedule, and source channel.",
          ownerRoleId: "front-desk",
        },
        {
          id: "qualify",
          title: "Qualify and advise",
          description:
            "Confirm service fit, explain preparation reminders, and flag medical or service questions.",
          ownerRoleId: "sales",
          escalation: "Escalate clinical concerns to doctor or manager.",
        },
        {
          id: "book",
          title: "Book appointment",
          description:
            "Record schedule, assigned service, staff, deposit or payment note, and confirmation message.",
          ownerRoleId: "front-desk",
        },
        {
          id: "prepare",
          title: "Prepare room or station",
          description:
            "Check room readiness, supplies, sanitation, client record, consent, and service notes.",
          ownerRoleId: "nurse",
        },
        {
          id: "serve",
          title: "Deliver service",
          description:
            "Follow the assigned SOP, document exceptions, and communicate aftercare clearly.",
          ownerRoleId: "therapist",
          escalation: "Escalate adverse reactions or complaints immediately.",
        },
        {
          id: "close",
          title: "Payment and follow-up",
          description:
            "Confirm payment, update records, send aftercare reminders, and schedule follow-up if needed.",
          ownerRoleId: "front-desk",
        },
      ],
      connections: [
        { from: "inquiry", to: "qualify" },
        { from: "qualify", to: "book" },
        { from: "book", to: "prepare" },
        { from: "prepare", to: "serve" },
        { from: "serve", to: "close" },
      ],
    },
    quiz: {
      passingScore: 80,
      accessEnabled: true,
      assessmentMode: "closed_reference",
      timeLimitMinutes: 10,
      randomizeQuestions: true,
      maxAttempts: 2,
      unlockRequiresSectionsRead: true,
      questions: [
        {
          id: "appointment-q1",
          question: "Who owns appointment accuracy in the blueprint?",
          options: ["Front desk", "Therapist", "Client"],
          answer: "Front desk",
          explanation:
            "The blueprint assigns appointment accuracy to the front desk role.",
          difficulty: "easy",
          topicTag: "Role ownership",
          relatedSectionId: "appointment-2",
          active: true,
          source: "manual",
        },
        {
          id: "appointment-q2",
          question: "What should happen when an adverse reaction is reported?",
          options: [
            "Wait until end of day",
            "Escalate immediately",
            "Only write a private note",
          ],
          answer: "Escalate immediately",
          explanation:
            "Adverse reactions are urgent exceptions and must be escalated immediately.",
          difficulty: "medium",
          topicTag: "Escalation",
          relatedSectionId: "appointment-2",
          active: true,
          source: "manual",
        },
      ],
    },
  },
  {
    id: "cash-handling",
    title: "Cash and Payment Handling",
    description:
      "Payment receipt, recording, reconciliation, and exceptions for employees handling transactions.",
    category: "Operations",
    businessIds: ["yoo-clinic", "ori-wellness"],
    employeeRoleIds: ["front-desk", "sales", "manager"],
    required: true,
    acknowledgmentRequired: true,
    active: true,
    version: "1.0.0",
    estimatedMinutes: 10,
    sections: [
      {
        id: "cash-1",
        title: "Receipt and record",
        body: "Every payment must be recorded in the approved tracker or POS, matched to a client, and supported by a receipt or transaction proof.",
      },
      {
        id: "cash-2",
        title: "Exceptions",
        body: "Payment discrepancies, refunds, discounts, and manual adjustments require manager approval before completion.",
      },
    ],
    attachments: [
      {
        id: "invoice-request",
        title: "Invoice request form",
        description:
          "Downloadable form for manager-approved invoice or payment documentation requests.",
        fileName: "invoice-request-form.txt",
        fileType: "document",
        mimeType: "text/plain",
        storagePath: "/documents/invoice-request-form.txt",
        sizeLabel: "1 KB",
        downloadable: true,
        visibleToEmployees: true,
      },
    ],
  },
  {
    id: "safety-sanitation",
    title: "Safety and Sanitation Standards",
    description:
      "Shared hygiene, equipment handling, and incident prevention standards for treatment and service areas.",
    category: "Safety",
    businessIds: ["yoo-clinic", "ori-wellness"],
    employeeRoleIds: ["nurse", "therapist", "doctor", "manager"],
    required: true,
    acknowledgmentRequired: true,
    active: true,
    version: "1.0.0",
    estimatedMinutes: 14,
    sections: [
      {
        id: "safety-1",
        title: "Room readiness",
        body: "Treatment and service areas must be prepared, sanitized, and checked before each client or patient. Missing supplies or unsafe conditions must be reported before service starts.",
      },
      {
        id: "safety-2",
        title: "Incident response",
        body: "Stop the activity, protect the client or patient, notify the supervisor, and document what happened using the incident procedure.",
      },
    ],
    attachments: [
      {
        id: "room-setup-guide",
        title: "Treatment room setup visual guide",
        description:
          "Visual reference for room readiness, sanitation zones, and before-service checks.",
        fileName: "room-setup.svg",
        fileType: "image",
        mimeType: "image/svg+xml",
        storagePath: "/visual-guides/room-setup.svg",
        sizeLabel: "18 KB",
        downloadable: false,
        visibleToEmployees: true,
      },
    ],
    quiz: {
      passingScore: 80,
      accessEnabled: true,
      assessmentMode: "closed_reference",
      timeLimitMinutes: 8,
      randomizeQuestions: true,
      maxAttempts: 2,
      unlockRequiresSectionsRead: true,
      questions: [
        {
          id: "safety-q1",
          question: "What is the first priority during an incident?",
          options: [
            "Finish the service",
            "Protect the client or patient",
            "Delete the booking",
          ],
          answer: "Protect the client or patient",
          explanation:
            "The first incident priority is protecting the client or patient before documentation or continuation.",
          difficulty: "easy",
          topicTag: "Incident response",
          relatedSectionId: "safety-2",
          active: true,
          source: "manual",
        },
      ],
    },
  },
  {
    id: "uniform-appearance",
    title: "Personal Appearance and Uniform",
    description:
      "Role-appropriate grooming, uniform, and presentation standards for client-facing work.",
    category: "Company-wide",
    businessIds: ["yoo-clinic", "ori-wellness"],
    employeeRoleIds: [
      "front-desk",
      "nurse",
      "therapist",
      "doctor",
      "sales",
      "manager",
      "general-staff",
    ],
    required: false,
    acknowledgmentRequired: false,
    active: true,
    version: "1.0.0",
    estimatedMinutes: 6,
    sections: [
      {
        id: "uniform-1",
        title: "Presentation",
        body: "Employees must report to work in role-appropriate attire, maintain clean grooming, and present the business in a calm, professional manner.",
      },
    ],
  },
];

export const progressRecords: ProgressRecord[] = [
  {
    userId: "employee-mika",
    moduleId: "common-code-of-conduct",
    status: "completed",
    quizPassed: true,
    acknowledged: true,
    completedAt: "2026-05-18",
  },
  {
    userId: "employee-mika",
    moduleId: "privacy-confidentiality",
    status: "in-progress",
    quizPassed: false,
    acknowledged: false,
  },
  {
    userId: "employee-mika",
    moduleId: "appointment-blueprint",
    status: "pending",
    quizPassed: false,
    acknowledged: false,
  },
  {
    userId: "employee-mika",
    moduleId: "safety-sanitation",
    status: "pending",
    quizPassed: false,
    acknowledged: false,
  },
];

export const adminStats: StatCard[] = [
  {
    label: "Active employees",
    value: "24",
    caption: "Across YOO and ORI",
    icon: Users,
  },
  {
    label: "Published modules",
    value: "18",
    caption: "12 required, 6 optional",
    icon: Layers3,
  },
  {
    label: "Acknowledgment rate",
    value: "83%",
    caption: "Current policy versions",
    icon: FileCheck2,
  },
  {
    label: "Overdue items",
    value: "7",
    caption: "Needs manager follow-up",
    icon: AlertTriangle,
  },
];

export const employeeStats: StatCard[] = [
  {
    label: "Assigned",
    value: "4",
    caption: "Required modules",
    icon: ClipboardCheck,
  },
  {
    label: "Completed",
    value: "1",
    caption: "Acknowledged and recorded",
    icon: FileCheck2,
  },
  {
    label: "In progress",
    value: "1",
    caption: "Continue next session",
    icon: Layers3,
  },
  {
    label: "Access",
    value: "RLS",
    caption: "Role-scoped content",
    icon: ShieldCheck,
  },
];

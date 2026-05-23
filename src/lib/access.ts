import {
  businesses,
  employeeRoles,
  employees,
  modules,
  progressRecords,
} from "./mock-data";
import type {
  BusinessId,
  EmployeeProfile,
  EmployeeRoleId,
  ManualModule,
  ProgressRecord,
} from "./types";

export const demoEmployee = employees[0];
export const demoOwner = employees[2];

export function getBusinessName(id: BusinessId) {
  return businesses.find((business) => business.id === id)?.name ?? id;
}

export function getRoleName(id: EmployeeRoleId) {
  return employeeRoles.find((role) => role.id === id)?.name ?? id;
}

export function moduleMatchesUser(module: ManualModule, user: EmployeeProfile) {
  const businessMatch = module.businessIds.some((businessId) =>
    user.businessIds.includes(businessId),
  );
  const roleMatch = module.employeeRoleIds.some((roleId) =>
    user.employeeRoleIds.includes(roleId),
  );

  return module.active && businessMatch && roleMatch;
}

export function getAssignedModules(user: EmployeeProfile = demoEmployee) {
  return modules.filter((module) => moduleMatchesUser(module, user));
}

export function getModuleById(moduleId: string) {
  return modules.find((module) => module.id === moduleId);
}

export function getProgressForUser(userId = demoEmployee.id) {
  return progressRecords.filter((record) => record.userId === userId);
}

export function getProgressForModule(
  moduleId: string,
  userId = demoEmployee.id,
): ProgressRecord | undefined {
  return progressRecords.find(
    (record) => record.moduleId === moduleId && record.userId === userId,
  );
}

export function getModuleStatus(moduleId: string, userId = demoEmployee.id) {
  return getProgressForModule(moduleId, userId)?.status ?? "pending";
}

export function getCompletionSummary(user: EmployeeProfile = demoEmployee) {
  const assignedModules = getAssignedModules(user);
  const records = getProgressForUser(user.id);
  const completed = records.filter((record) => record.status === "completed");
  const inProgress = records.filter((record) => record.status === "in-progress");

  return {
    assigned: assignedModules.length,
    completed: completed.length,
    inProgress: inProgress.length,
    pending: Math.max(assignedModules.length - completed.length - inProgress.length, 0),
  };
}

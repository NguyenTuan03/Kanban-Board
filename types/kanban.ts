export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum WorkspaceRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface Column {
  id: string;
  title: string;
  position: number;
  workspace_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  column_id: string;
  workspace_id: string;
  title: string;
  description: string;
  position: number;
  assignee_id: string | null;
  created_by: string;
  priority: TaskPriority;
  created_at: string;
}

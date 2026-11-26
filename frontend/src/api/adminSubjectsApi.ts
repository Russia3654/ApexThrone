import {
  AdminSubject,
  AdminSubjectResponse,
  AdminSubjectsResponse,
  SubjectInput,
} from '../types/api';
import { apiGet, apiPost } from './client';

export async function listSubjects(): Promise<AdminSubject[]> {
  const { subjects } = await apiGet<AdminSubjectsResponse>('/admin/subjects');
  return subjects;
}

export async function getAdminSubject(id: number): Promise<AdminSubject> {
  const { subject } = await apiGet<AdminSubjectResponse>(`/admin/subject?id=${id}`);
  return subject;
}

export async function createSubject(input: SubjectInput): Promise<AdminSubject> {
  const { subject } = await apiPost<AdminSubjectResponse>('/admin/subjects', input);
  return subject;
}

export async function updateSubject(id: number, input: SubjectInput): Promise<AdminSubject> {
  const { subject } = await apiPost<AdminSubjectResponse>(`/admin/subject/update?id=${id}`, input);
  return subject;
}

export async function deleteSubject(id: number): Promise<void> {
  await apiPost(`/admin/subject/delete?id=${id}`);
}

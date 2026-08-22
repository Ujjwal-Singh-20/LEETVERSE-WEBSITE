import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { ERROR_CODES } from '../constants/errorCodes';
import { AppError } from '../middlewares/error.middleware';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';
import { serializeProject } from '../serializers/project.serializer';
import { ProjectDoc, ProjectResponse } from '../types';
import { FieldValue } from 'firebase-admin/firestore';

export class ProjectService {
  async getProjects(): Promise<ProjectResponse[]> {
    const snap = await db
      .collection(COLLECTIONS.PROJECTS)
      .orderBy('createdAt', 'desc')
      .get();

    return snap.docs.map((doc) => serializeProject(doc.data() as ProjectDoc));
  }

  async getProjectBySlug(slug: string): Promise<ProjectResponse> {
    const doc = await db.collection(COLLECTIONS.PROJECTS).doc(slug).get();

    if (!doc.exists) {
      throw new AppError(404, ERROR_CODES.PROJECT_NOT_FOUND, `Project '${slug}' not found.`);
    }

    return serializeProject(doc.data() as ProjectDoc);
  }

  async createProject(data: CreateProjectInput): Promise<ProjectResponse> {
    const existing = await db.collection(COLLECTIONS.PROJECTS).doc(data.slug).get();
    if (existing.exists) {
      throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, `Project slug '${data.slug}' is already taken.`);
    }

    const now = FieldValue.serverTimestamp();
    const projectData: Record<string, any> = {
      slug: data.slug,
      title: data.title,
      description: data.description,
      images: data.images || [],
      members: data.members || [],
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(COLLECTIONS.PROJECTS).doc(data.slug).set(projectData);

    return serializeProject({
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ProjectDoc);
  }

  async updateProject(slug: string, data: UpdateProjectInput): Promise<ProjectResponse> {
    const docRef = db.collection(COLLECTIONS.PROJECTS).doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new AppError(404, ERROR_CODES.PROJECT_NOT_FOUND, `Project '${slug}' not found.`);
    }

    const updates: Record<string, any> = { ...data, updatedAt: FieldValue.serverTimestamp() };
    await docRef.update(updates);

    const updatedSnap = await docRef.get();
    return serializeProject(updatedSnap.data() as ProjectDoc);
  }

  async deleteProject(slug: string): Promise<{ success: boolean; slug: string }> {
    const docRef = db.collection(COLLECTIONS.PROJECTS).doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new AppError(404, ERROR_CODES.PROJECT_NOT_FOUND, `Project '${slug}' not found.`);
    }

    await docRef.delete();
    return { success: true, slug };
  }
}

export const projectService = new ProjectService();

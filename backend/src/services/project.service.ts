import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';
import { ProjectResponse } from '../types';

export class ProjectService {
  /**
   * Get all projects (public fallback / admin listing)
   */
  async getProjects(): Promise<ProjectResponse[]> {
    // TODO: Query projects collection ordered by createdAt desc
    // TODO: Serialize with ISO 8601 timestamps and return ProjectResponse[]
    throw new Error('[TODO] getProjects not implemented');
  }

  /**
   * Get single project by slug
   */
  async getProjectBySlug(slug: string): Promise<ProjectResponse> {
    // TODO: Read projects/{slug} from Firestore
    // TODO: Throw 404 AppError(PROJECT_NOT_FOUND) if not found
    // TODO: Serialize and return ProjectResponse
    throw new Error(`[TODO] getProjectBySlug not implemented for slug: ${slug}`);
  }

  /**
   * Create new project in projects/{slug}
   */
  async createProject(data: CreateProjectInput): Promise<ProjectResponse> {
    // TODO: Check if projects/{data.slug} already exists
    // TODO: Write project doc with images[] and members[] snapshot
    // TODO: Return serializeProject
    throw new Error(`[TODO] createProject not implemented for slug: ${data.slug}`);
  }

  /**
   * Update existing project
   */
  async updateProject(slug: string, data: UpdateProjectInput): Promise<ProjectResponse> {
    // TODO: Update fields in projects/{slug} and bump updatedAt timestamp
    // TODO: Return updated project
    throw new Error(`[TODO] updateProject not implemented for slug: ${slug}`);
  }

  /**
   * Hard delete project
   */
  async deleteProject(slug: string): Promise<{ success: boolean; slug: string }> {
    // TODO: Hard delete projects/{slug} doc from Firestore
    // TODO: Note per docs: Cloudinary images left orphaned (no cleanup needed)
    throw new Error(`[TODO] deleteProject not implemented for slug: ${slug}`);
  }
}

export const projectService = new ProjectService();

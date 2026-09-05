import { Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { AuthenticatedRequest } from '../types';

export class AdminProjectController {
  /**
   * GET /api/admin/projects — Get all projects for admin
   */
  async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await projectService.getProjects();
      res.status(200).json({ projects });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/projects/:slug — Get single project
   */
  async getProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const project = await projectService.getProjectBySlug(slug);
      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/projects — Create project
   */
  async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await projectService.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/projects/:slug — Update project
   */
  async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const project = await projectService.updateProject(slug, req.body);
      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/projects/:slug — Delete project
   */
  async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const result = await projectService.deleteProject(slug);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const adminProjectController = new AdminProjectController();

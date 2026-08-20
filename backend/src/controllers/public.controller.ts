import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services/member.service';
import { galleryService } from '../services/gallery.service';
import { projectService } from '../services/project.service';

export class PublicController {
  /**
   * GET /u/:username — Live public business card
   */
  async getBusinessCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = String(req.params.username);
      const member = await memberService.getPublicMemberByUsername(username);
      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/gallery/:slug/images — Live fetch of full images[] for event popup
   */
  async getGalleryImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const result = await galleryService.getGalleryImages(slug);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/projects — Direct fallback listing
   */
  async getProjectsListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await projectService.getProjects();
      res.status(200).json({
        generatedAt: new Date().toISOString(),
        projects,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/gallery — Direct fallback listing
   */
  async getGalleryListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await galleryService.getGalleryListings();
      res.status(200).json({
        generatedAt: new Date().toISOString(),
        events,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/members — Direct fallback members listing by domain
   */
  async getMembersListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Fetch active members grouped by domain for fallback listing
      res.status(200).json({
        generatedAt: new Date().toISOString(),
        domains: [],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/og/:username — Server-rendered minimal HTML meta tags for social crawlers
   */
  async getMemberOG(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = String(req.params.username);
      // TODO: Fetch member details and return server-rendered HTML with <meta property="og:title">, og:description, og:image
      const title = `@${username} | LeetVerse`;
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:type" content="profile">
</head>
<body>
  <h1>${username}</h1>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/og/projects/:slug — Server-rendered meta tags for projects
   */
  async getProjectOG(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      // TODO: Fetch project details and return server-rendered HTML with OpenGraph tags
      const title = `${slug} | LeetVerse Projects`;
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:type" content="website">
</head>
<body>
  <h1>${slug}</h1>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    } catch (error) {
      next(error);
    }
  }
}

export const publicController = new PublicController();

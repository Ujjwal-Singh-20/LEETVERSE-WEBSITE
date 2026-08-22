import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services/member.service';
import { galleryService } from '../services/gallery.service';
import { projectService } from '../services/project.service';

export class PublicController {
  async getBusinessCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = String(req.params.username);
      const member = await memberService.getPublicMemberByUsername(username);
      res.status(200).json(member);
    } catch (error) {
      next(error);
    }
  }

  async getGalleryImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const result = await galleryService.getGalleryImages(slug);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

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

  async getMembersListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const domains = await memberService.getActiveMembersByDomain();
      res.status(200).json({
        generatedAt: new Date().toISOString(),
        domains,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMemberOG(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = String(req.params.username);
      const member = await memberService.getPublicMemberByUsername(username);

      const title = `${member.name} (@${member.username}) | LeetVerse`;
      const description = member.bio || `${member.position} at LeetVerse`;
      const image = member.photoUrl || '';
      const profileUrl = `/u/${member.username}`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${escapeHtml(profileUrl)}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : ''}
  <meta http-equiv="refresh" content="0;url=${escapeHtml(profileUrl)}">
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(profileUrl)}">${escapeHtml(member.name)}</a>...</p>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    } catch (error) {
      next(error);
    }
  }

  async getProjectOG(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const project = await projectService.getProjectBySlug(slug);

      const title = `${project.title} | LeetVerse Projects`;
      const description = project.description;
      const image = project.images[0] || '';
      const projectUrl = `/projects/${project.slug}`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(projectUrl)}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : ''}
  <meta http-equiv="refresh" content="0;url=${escapeHtml(projectUrl)}">
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(projectUrl)}">${escapeHtml(project.title)}</a>...</p>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    } catch (error) {
      next(error);
    }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const publicController = new PublicController();

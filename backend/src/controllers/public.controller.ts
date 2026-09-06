import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services/member.service';
import { galleryService } from '../services/gallery.service';
import { projectService } from '../services/project.service';
import { blobCacheService } from '../services/blobCache.service';
import { MembersListingBlob, ProjectsListingBlob, GalleryListingBlob } from '../types';
import { ENV } from '../config/env';

export class PublicController {
  async getBusinessCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = String(req.params.username);
      const member = await memberService.getPublicMemberByUsername(username);

      // If a browser manually navigated to /u/:username directly on the backend server, redirect to frontend SPA
      if (req.path === `/u/${username}` && req.accepts('html') && !req.accepts('json') && !req.xhr) {
        const primaryFrontend = (ENV.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();
        return res.redirect(`${primaryFrontend}/u/${username}`);
      }

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
      // 1. Priority: Attempt to read static cache from Vercel Blob
      const cached = await blobCacheService.getBlobData<ProjectsListingBlob>('projects-listing.json');
      if (cached) {
        res.status(200).json(cached);
        return;
      }

      // 2. Fallback: Direct Firestore DB read
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
      // 1. Priority: Attempt to read static cache from Vercel Blob
      const cached = await blobCacheService.getBlobData<GalleryListingBlob>('gallery-listing.json');
      if (cached) {
        res.status(200).json(cached);
        return;
      }

      // 2. Fallback: Direct Firestore DB read
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
      // 1. Priority: Attempt to read static cache from Vercel Blob
      const cached = await blobCacheService.getBlobData<MembersListingBlob>('members-listing.json');
      if (cached) {
        res.status(200).json(cached);
        return;
      }

      // 2. Fallback: Direct Firestore DB read
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

      const defaultBanner = 'https://res.cloudinary.com/da5j1pl8g/image/upload/v1788718876/new_logo.jpg_hm8chu.jpg';
      const image = member.photoUrl?.trim() || defaultBanner;

      const baseUrl = getFrontendBaseUrl();
      const profileUrl = `${baseUrl}/u/${member.username}`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:site_name" content="LeetVerse">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${escapeHtml(profileUrl)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
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
      // Always use the official LeetVerse logo banner for projects and other non-member routes
      const image = 'https://res.cloudinary.com/da5j1pl8g/image/upload/v1788718876/new_logo.jpg_hm8chu.jpg';

      const baseUrl = getFrontendBaseUrl();
      const projectUrl = `${baseUrl}/projects/${project.slug}`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:site_name" content="LeetVerse">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(projectUrl)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
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

function getFrontendBaseUrl(): string {
  const allowed = (ENV.FRONTEND_URL || 'https://leetverse-website.vercel.app').split(',');
  const vercelUrl = allowed.find((u) => u.includes('vercel.app')) || allowed[0] || 'http://localhost:5173';
  const trimmed = vercelUrl.trim();
  const valid = trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
  return valid.replace(/\/+$/, '');
}

export const publicController = new PublicController();

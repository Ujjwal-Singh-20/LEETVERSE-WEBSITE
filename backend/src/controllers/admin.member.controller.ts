import { Response, NextFunction } from 'express';
import { memberService } from '../services/member.service';
import { AuthenticatedRequest } from '../types';

export class AdminMemberController {
  /**
   * GET /api/admin/members/tree — Tree view of all domains and members
   */
  async getMemberTree(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tree = await memberService.getMemberTree();
      res.status(200).json(tree);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/members — Add member under a domain
   */
  async createMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { domain, ...memberData } = req.body;
      const createdMember = await memberService.createMember(domain, memberData);
      res.status(201).json(createdMember);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/members/:domain/:docId — Single-field autosave update on blur
   */
  async updateMemberField(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const domain = String(req.params.domain);
      const docId = String(req.params.docId);
      const { field, value } = req.body;
      const result = await memberService.updateMemberField(domain, docId, field, value);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/members/:domain/:docId — Hard delete of member + username lookup
   */
  async deleteMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const domain = String(req.params.domain);
      const docId = String(req.params.docId);
      const result = await memberService.deleteMember(domain, docId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/usernames/check?username=xyz — Live username uniqueness check
   */
  async checkUsername(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = String(req.query.username || '');
      const result = await memberService.checkUsernameAvailable(username);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const adminMemberController = new AdminMemberController();

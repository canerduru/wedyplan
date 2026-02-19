import { Request, Response } from 'express';
import { marketplaceService } from '../services/marketplace.service';

export class MarketplaceController {
  // Vendor
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const result = await marketplaceService.updateVendorProfile(userId, req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async searchVendors(req: Request, res: Response) {
    try {
      const result = await marketplaceService.searchVendors(req.query);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getVendor(req: Request, res: Response) {
    try {
      const result = await marketplaceService.getVendorProfile(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Request
  static async createRequest(req: Request, res: Response) {
    try {
      // Using user ID from auth token to find their wedding
      // In a real scenario, we'd look up the wedding associated with this user
      const userId = (req as any).user.userId;
      // TODO: Proper wedding lookup from user
      const weddingId = userId;
      const result = await marketplaceService.createRequest(weddingId, req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getRequest(req: Request, res: Response) {
    try {
      const result = await marketplaceService.getRequest(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getFeed(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      // TODO: Lookup vendor profile by userId
      const vendorId = userId;
      const result = await marketplaceService.getVendorFeed(vendorId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Bid
  static async submitBid(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      // TODO: Lookup vendor profile ID from userId
      const vendorId = userId;
      const result = await marketplaceService.submitBid(vendorId, req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async acceptBid(req: Request, res: Response) {
    try {
      const result = await marketplaceService.acceptBid(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // Message
  static async sendMessage(req: Request, res: Response) {
    try {
      const senderId = (req as any).user.userId;
      const result = await marketplaceService.sendMessage(senderId, req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getMessages(req: Request, res: Response) {
    try {
      const result = await marketplaceService.getMessages(req.query.requestId as string);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

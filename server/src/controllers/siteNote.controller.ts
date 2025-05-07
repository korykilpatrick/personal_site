import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import SiteNoteService from '../services/SiteNoteService';

export const SiteNoteController = {
  /**
   * GET /site_notes
   * Return all site notes or optionally filter by active, but for public usage
   * if we only want active, can do /site_notes/active or /site_notes?active=true
   */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.active === 'true') {
        // only return the active one if it exists
        const activeNote = await SiteNoteService.getActive();
        if (!activeNote) {
          return res.status(StatusCodes.NOT_FOUND).json({ message: 'No active site note found' });
        }
        return res.status(StatusCodes.OK).json([activeNote]);
      }
      // else return all
      const notes = await SiteNoteService.getAll();
      res.status(StatusCodes.OK).json(notes);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /site_notes/active
   * Return only the active note (single item)
   */
  getActive: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await SiteNoteService.getActive();
      if (!note) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'No active site note found' });
      }
      res.status(StatusCodes.OK).json(note);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /site_notes/summary/count
   * Return the total count of site notes, or count of active site notes if active=true.
   */
  getCounts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isActiveQuery = req.query.active === 'true';
      let count: number;

      if (isActiveQuery) {
        count = await SiteNoteService.getActiveCount();
      } else {
        count = await SiteNoteService.getTotalCount();
      }
      res.status(StatusCodes.OK).json({ count });
    } catch (error) {
      next(error);
    }
  },
};

export default SiteNoteController;
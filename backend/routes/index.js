import { Router } from 'express';
import { validateData } from '../middlewares/validateData.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import {
  createMeetingSchema,
  submitVoteSchema,
  confirmMeetingSchema,
} from '../schemas/zodSchema.js';
import * as meetingController from '../controllers/meetingController.js';

const router = Router();

//HOST ROUTES (PROTECTED)
router.post('/meetings', requireAuth, validateData(createMeetingSchema), meetingController.createMeeting);
router.get('/meetings/mine', requireAuth, meetingController.getAllHostMeetings);
router.get('/meetings/attending', requireAuth, meetingController.getAttendingMeetings);
router.get('/meetings/admin/:meetingId', requireAuth, meetingController.getDashboardData);
router.post('/meetings/:meetingId/confirm', requireAuth, validateData(confirmMeetingSchema), meetingController.confirmMeeting);
router.post('/meetings/admin/:meetingId/confirm', requireAuth, validateData(confirmMeetingSchema), meetingController.confirmMeeting);
router.get('/meetings/:meetingId/smart-arbitrator', requireAuth, meetingController.getSmartArbitrator);

//GUEST ROUTES (PUBLIC / OPTIONAL AUTH)
router.get('/meetings/guest/:guestSlug', meetingController.getMeetingForGuest);
router.post('/meetings/guest/:guestSlug/vote', requireAuth, validateData(submitVoteSchema), meetingController.submitGuestVote);

export default router;
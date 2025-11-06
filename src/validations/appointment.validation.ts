import { body } from 'express-validator';
import { ServiceMode } from '../models/enums/ServiceMode';

export const validateCreateAppointment = [
  body('customerId').optional().isString(),
  body('customerFullName').isString().trim().notEmpty(),
  body('customerPhoneNumber').isString().trim().notEmpty(),
  body('customerEmail').isEmail().normalizeEmail(),
  body('vehicleTypeId').isMongoId(),
  body('vehicleNumberPlate').isString().trim().notEmpty(),
  body('vehicleKmDistances').isString().trim().notEmpty(),
  body('userAddress').isString().trim().notEmpty(),
  body('serviceMode').isIn(Object.values(ServiceMode)),
  body('scheduledAt').isISO8601(),
  body('notes').optional().isString(),
  body('serviceTypeIds').isArray().custom((arr) => arr.every((id: any) => typeof id === 'string')),
  body('others').optional().isString().trim(),
];


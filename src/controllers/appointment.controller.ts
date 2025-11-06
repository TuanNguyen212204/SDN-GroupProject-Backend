import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppointmentModel } from '../models/mongoose';
import { success, error } from '../utils/response.util';
import { Types } from 'mongoose';

export async function createAppointment(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 400, 'Validation error', 'VALIDATION_ERROR');
  }

  const {
    customerFullName,
    customerPhoneNumber,
    customerEmail,
    vehicleTypeId,
    vehicleNumberPlate,
    vehicleKmDistances,
    userAddress,
    serviceMode,
    scheduledAt,
    notes,
    serviceTypeIds,
    others,
  } = req.body;

  const created = await AppointmentModel.create({
    customerFullName,
    customerPhoneNumber,
    customerEmail,
    vehicleTypeId,
    vehicleNumberPlate,
    vehicleKmDistances,
    userAddress,
    serviceMode,
    scheduledAt,
    notes,
    status: 'PENDING',
    customerId: req.user?.sub,
    serviceTypeIds: Array.isArray(serviceTypeIds) ? serviceTypeIds : [],
    others: others || undefined,
  });

  return success(res, String((created as any)._id), 'Appointment created');
}

export async function getMyAppointmentHistory(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    return error(res, 401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const page = Number(req.query.page ?? 0) || 0;
  const pageSize = Number(req.query.pageSize ?? 10) || 10;

  const filter: any = { customerId: userId };

  const [items, total] = await Promise.all([
    AppointmentModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .populate('vehicleTypeId', 'vehicleTypeName')
      .lean(),
    AppointmentModel.countDocuments(filter),
  ]);

  // Map minimal fields for FE history list
  const data = items.map((a: any) => ({
    appointmentId: String(a._id),
    customerFullName: a.customerFullName,
    customerPhoneNumber: a.customerPhoneNumber,
    customerEmail: a.customerEmail,
    vehicleTypeId: String(a.vehicleTypeId?._id || a.vehicleTypeId),
    vehicleTypeName: a.vehicleTypeId?.vehicleTypeName,
    vehicleNumberPlate: a.vehicleNumberPlate,
    serviceMode: a.serviceMode,
    scheduledAt: a.scheduledAt,
    status: a.status,
    others: a.others || undefined,
  }));

  return success(res, { items: data, page, pageSize, total }, 'Appointment history');
}

export async function getAppointmentDetail(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    return error(res, 401, 'Unauthorized', 'UNAUTHORIZED');
  }
  const { id } = req.params as { id: string };
  if (!id) {
    return error(res, 400, 'Invalid appointment id', 'VALIDATION_ERROR');
  }

  const found = await AppointmentModel.findOne({ _id: id, customerId: userId })
    .populate('vehicleTypeId', 'vehicleTypeName')
    .lean();

  if (!found) {
    return error(res, 404, 'Appointment not found', 'NOT_FOUND');
  }

  const data = {
    appointmentId: String(found._id),
    customerFullName: found.customerFullName,
    customerPhoneNumber: found.customerPhoneNumber,
    customerEmail: found.customerEmail,
    vehicleTypeId: String((found as any).vehicleTypeId?._id || found.vehicleTypeId),
    vehicleTypeName: (found as any).vehicleTypeId?.vehicleTypeName,
    vehicleNumberPlate: found.vehicleNumberPlate,
    userAddress: found.userAddress,
    serviceMode: found.serviceMode,
    scheduledAt: found.scheduledAt,
    status: found.status,
    notes: found.notes,
    serviceTypeIds: (found as any).serviceTypeIds || [],
    others: (found as any).others || undefined,
  };

  return success(res, data, 'Appointment detail');
}


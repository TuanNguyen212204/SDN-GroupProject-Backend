import mongoose, { Schema, model } from 'mongoose';
import { ServiceMode } from '../enums/ServiceMode';

// VehicleType
const VehicleTypeSchema = new Schema(
  {
    vehicleTypeName: { type: String, required: true },
    manufacturer: String,
    modelYear: Number,
    batteryCapacity: Number,
    maintenanceIntervalKm: Number,
    maintenanceIntervalMonths: Number,
    description: String,
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true }
);

export const VehicleTypeModel = model('VehicleType', VehicleTypeSchema);

// ServiceType
const ServiceTypeSchema = new Schema(
  {
    serviceName: { type: String, required: true },
    description: String,
    estimatedDurationMinutes: Number,
    parentId: { type: Schema.Types.ObjectId, ref: 'ServiceType', default: null },
    vehicleTypeId: { type: Schema.Types.ObjectId, ref: 'VehicleType', required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ServiceTypeModel = model('ServiceType', ServiceTypeSchema);

// Appointment
const AppointmentSchema = new Schema(
  {
    customerFullName: { type: String, required: true },
    customerPhoneNumber: { type: String, required: true },
    customerEmail: { type: String, required: true },
    vehicleTypeId: { type: Schema.Types.ObjectId, ref: 'VehicleType', required: true },
    vehicleNumberPlate: { type: String, required: true },
    vehicleKmDistances: { type: String, required: true },
    userAddress: { type: String, required: true },
    serviceMode: { type: String, enum: Object.values(ServiceMode), required: true },
    scheduledAt: { type: Date, required: true },
    notes: String,
    status: { type: String, default: 'PENDING' },
    customerId: { type: String, required: false },
    serviceTypeIds: { type: [Schema.Types.ObjectId], ref: 'ServiceType', default: [] },
    others: { type: String }, // Dịch vụ khác mà người dùng tự điền
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AppointmentModel = model('Appointment', AppointmentSchema);

// User
const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true },
    numberPhone: { type: String },
    address: { type: String },
    avatarUrl: { type: String },
    provider: { type: String, default: 'local' },
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

export const UserModel = model('User', UserSchema);

// SePay Payment Transaction (Webhook)
const PaymentTransactionSchema = new Schema(
  {
    sepayId: { type: Number, required: true, unique: true },
    gateway: { type: String },
    transactionDate: { type: Date },
    accountNumber: { type: String },
    code: { type: String, default: null },
    content: { type: String },
    transferType: { type: String, enum: ['in', 'out'] },
    transferAmount: { type: Number },
    accumulated: { type: Number },
    subAccount: { type: String, default: null },
    referenceCode: { type: String },
    description: { type: String },
    raw: { type: Object },
    processed: { type: Boolean, default: false },
    relatedAppointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', default: null },
  },
  { timestamps: true }
);

PaymentTransactionSchema.index({ sepayId: 1 }, { unique: true });

export const PaymentTransactionModel = model('PaymentTransaction', PaymentTransactionSchema);


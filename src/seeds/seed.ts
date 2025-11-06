import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectMongo } from '../config/database';
import { 
  VehicleTypeModel, 
  ServiceTypeModel, 
  AppointmentModel, 
  UserModel,
  PaymentTransactionModel 
} from '../models/mongoose';
import { ServiceMode } from '../models/enums/ServiceMode';

async function run() {
  try {
    console.log('🌱 Starting seeder...');
    await connectMongo();
    console.log('✅ Connected to MongoDB');

    // 1. Clear existing data (optional - comment out if you want to keep data)
    // await UserModel.deleteMany({});
    // await VehicleTypeModel.deleteMany({});
    // await ServiceTypeModel.deleteMany({});
    // await AppointmentModel.deleteMany({});
    // await PaymentTransactionModel.deleteMany({});

    // 2. Create Users
    console.log('📝 Creating users...');
    const passwordHash = await bcrypt.hash('123456', 10); // Default password for all users

    const adminUser = await UserModel.findOneAndUpdate(
      { email: 'admin@mma.com' },
      {
        username: 'admin',
        passwordHash,
        email: 'admin@mma.com',
        fullName: 'Admin User',
        numberPhone: '0901234567',
        isActive: true,
        isAdmin: true,
      },
      { upsert: true, new: true }
    );

    const staffUser = await UserModel.findOneAndUpdate(
      { email: 'staff@mma.com' },
      {
        username: 'staff',
        passwordHash,
        email: 'staff@mma.com',
        fullName: 'Nhân Viên Bảo Dưỡng',
        numberPhone: '0907654321',
        isActive: true,
        isAdmin: false,
      },
      { upsert: true, new: true }
    );

    const customer1 = await UserModel.findOneAndUpdate(
      { email: 'customer1@mma.com' },
      {
        username: 'customer1',
        passwordHash,
        email: 'customer1@mma.com',
        fullName: 'Nguyễn Văn A',
        numberPhone: '0911111111',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        isActive: true,
        isAdmin: false,
      },
      { upsert: true, new: true }
    );

    const customer2 = await UserModel.findOneAndUpdate(
      { email: 'customer2@mma.com' },
      {
        username: 'customer2',
        passwordHash,
        email: 'customer2@mma.com',
        fullName: 'Trần Thị B',
        numberPhone: '0922222222',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        isActive: true,
        isAdmin: false,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Users created');

    // 3. Create Vehicle Types
    console.log('🚗 Creating vehicle types...');
    
    const vt1 = await VehicleTypeModel.findOneAndUpdate(
      { vehicleTypeName: 'Tesla Model 3' },
      {
        vehicleTypeName: 'Tesla Model 3',
        manufacturer: 'Tesla',
        modelYear: 2024,
        batteryCapacity: 82,
        maintenanceIntervalKm: 15000,
        maintenanceIntervalMonths: 12,
        description: 'Xe điện sedan phổ biến, hiệu suất cao',
        isActive: true,
        isDeleted: false,
      },
      { upsert: true, new: true }
    );

    const vt2 = await VehicleTypeModel.findOneAndUpdate(
      { vehicleTypeName: 'VinFast VF 8' },
      {
        vehicleTypeName: 'VinFast VF 8',
        manufacturer: 'VinFast',
        modelYear: 2024,
        batteryCapacity: 90,
        maintenanceIntervalKm: 12000,
        maintenanceIntervalMonths: 12,
        description: 'SUV điện Việt Nam, công nghệ cao',
        isActive: true,
        isDeleted: false,
      },
      { upsert: true, new: true }
    );

<<<<<<< HEAD
    const vt3 = await VehicleTypeModel.findOneAndUpdate(
      { vehicleTypeName: 'VinFast VF 9' },
=======
    // Service types for vt1 (Tesla Model 3)
    const inspection =
      (await ServiceTypeModel.findOne({ serviceName: 'Kiểm tra tổng quát', vehicleTypeId: vt1._id, parentId: null })) ||
      (await ServiceTypeModel.create({ serviceName: 'Kiểm tra tổng quát', vehicleTypeId: vt1._id, parentId: null, isActive: true, isDeleted: false }));

    const battery =
      (await ServiceTypeModel.findOne({ serviceName: 'Bảo dưỡng pin', vehicleTypeId: vt1._id, parentId: null })) ||
      (await ServiceTypeModel.create({ serviceName: 'Bảo dưỡng pin', vehicleTypeId: vt1._id, parentId: null, isActive: true, isDeleted: false }));

    await ServiceTypeModel.updateOne(
      { serviceName: 'Kiểm tra hệ thống làm mát', vehicleTypeId: vt1._id, parentId: inspection._id },
>>>>>>> c82b7a59271e18946480614983fa6d792351b5af
      {
        vehicleTypeName: 'VinFast VF 9',
        manufacturer: 'VinFast',
        modelYear: 2024,
        batteryCapacity: 123,
        maintenanceIntervalKm: 12000,
        maintenanceIntervalMonths: 12,
        description: 'SUV 7 chỗ cao cấp',
        isActive: true,
        isDeleted: false,
      },
      { upsert: true, new: true }
    );

    const vt4 = await VehicleTypeModel.findOneAndUpdate(
      { vehicleTypeName: 'BYD Atto 3' },
      {
        vehicleTypeName: 'BYD Atto 3',
        manufacturer: 'BYD',
        modelYear: 2024,
        batteryCapacity: 60,
        maintenanceIntervalKm: 10000,
        maintenanceIntervalMonths: 12,
        description: 'SUV điện Trung Quốc, giá hợp lý',
        isActive: true,
        isDeleted: false,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Vehicle types created');

    // 4. Create Service Types (Tree structure)
    console.log('🔧 Creating service types...');

    // Service types for Tesla Model 3
    const inspection1 = await ServiceTypeModel.findOneAndUpdate(
      { serviceName: 'Kiểm tra tổng quát', vehicleTypeId: vt1._id },
      { 
        serviceName: 'Kiểm tra tổng quát', 
        vehicleTypeId: vt1._id, 
        description: 'Kiểm tra toàn bộ hệ thống xe',
        estimatedDurationMinutes: 60,
        isActive: true, 
        isDeleted: false 
      },
      { upsert: true, new: true }
    );

    const battery1 = await ServiceTypeModel.findOneAndUpdate(
      { serviceName: 'Bảo dưỡng pin', vehicleTypeId: vt1._id },
      { 
        serviceName: 'Bảo dưỡng pin', 
        vehicleTypeId: vt1._id,
        description: 'Kiểm tra và bảo dưỡng hệ thống pin',
        estimatedDurationMinutes: 90,
        isActive: true, 
        isDeleted: false 
      },
      { upsert: true, new: true }
    );

    await ServiceTypeModel.findOneAndUpdate(
      { serviceName: 'Kiểm tra hệ thống làm mát', vehicleTypeId: vt1._id, parentId: inspection1._id },
      {
        serviceName: 'Kiểm tra hệ thống làm mát',
        vehicleTypeId: vt1._id,
        parentId: inspection1._id,
        estimatedDurationMinutes: 30,
        isActive: true,
        isDeleted: false,
      },
      { upsert: true }
    );

    await ServiceTypeModel.findOneAndUpdate(
      { serviceName: 'Kiểm tra điện áp cao', vehicleTypeId: vt1._id, parentId: inspection1._id },
      {
        serviceName: 'Kiểm tra điện áp cao',
        vehicleTypeId: vt1._id,
        parentId: inspection1._id,
        estimatedDurationMinutes: 45,
        isActive: true,
        isDeleted: false,
      },
      { upsert: true }
    );

    await ServiceTypeModel.findOneAndUpdate(
      { serviceName: 'Kiểm tra tình trạng pin', vehicleTypeId: vt1._id, parentId: battery1._id },
      {
        serviceName: 'Kiểm tra tình trạng pin',
        vehicleTypeId: vt1._id,
        parentId: battery1._id,
        estimatedDurationMinutes: 40,
        isActive: true,
        isDeleted: false,
      },
      { upsert: true }
    );

<<<<<<< HEAD
    // Service types for VinFast VF 8
    const inspection2 = await ServiceTypeModel.findOneAndUpdate(
      { serviceName: 'Kiểm tra tổng quát', vehicleTypeId: vt2._id },
      { 
        serviceName: 'Kiểm tra tổng quát', 
        vehicleTypeId: vt2._id,
        description: 'Kiểm tra toàn bộ hệ thống xe',
        estimatedDurationMinutes: 60,
        isActive: true, 
        isDeleted: false 
      },
      { upsert: true, new: true }
    );

    await ServiceTypeModel.findOneAndUpdate(
      { serviceName: 'Bảo dưỡng pin', vehicleTypeId: vt2._id },
      { 
        serviceName: 'Bảo dưỡng pin', 
        vehicleTypeId: vt2._id,
        description: 'Kiểm tra và bảo dưỡng hệ thống pin',
        estimatedDurationMinutes: 90,
        isActive: true, 
        isDeleted: false 
=======
    // Service types for vt2 (VinFast VF 8) - với children đầy đủ
    const inspection2 =
      (await ServiceTypeModel.findOne({ serviceName: 'Kiểm tra tổng quát', vehicleTypeId: vt2._id, parentId: null })) ||
      (await ServiceTypeModel.create({ serviceName: 'Kiểm tra tổng quát', vehicleTypeId: vt2._id, parentId: null, isActive: true, isDeleted: false }));

    const battery2 =
      (await ServiceTypeModel.findOne({ serviceName: 'Bảo dưỡng pin', vehicleTypeId: vt2._id, parentId: null })) ||
      (await ServiceTypeModel.create({ serviceName: 'Bảo dưỡng pin', vehicleTypeId: vt2._id, parentId: null, isActive: true, isDeleted: false }));

    await ServiceTypeModel.updateOne(
      { serviceName: 'Kiểm tra hệ thống làm mát', vehicleTypeId: vt2._id, parentId: inspection2._id },
      {
        $setOnInsert: {
          serviceName: 'Kiểm tra hệ thống làm mát',
          vehicleTypeId: vt2._id,
          parentId: inspection2._id,
          estimatedDurationMinutes: 30,
          isActive: true,
          isDeleted: false,
        },
      },
      { upsert: true }
    );

    await ServiceTypeModel.updateOne(
      { serviceName: 'Kiểm tra điện áp cao', vehicleTypeId: vt2._id, parentId: inspection2._id },
      {
        $setOnInsert: {
          serviceName: 'Kiểm tra điện áp cao',
          vehicleTypeId: vt2._id,
          parentId: inspection2._id,
          estimatedDurationMinutes: 45,
          isActive: true,
          isDeleted: false,
        },
      },
      { upsert: true }
    );

    await ServiceTypeModel.updateOne(
      { serviceName: 'Kiểm tra tình trạng pin', vehicleTypeId: vt2._id, parentId: battery2._id },
      {
        $setOnInsert: {
          serviceName: 'Kiểm tra tình trạng pin',
          vehicleTypeId: vt2._id,
          parentId: battery2._id,
          estimatedDurationMinutes: 40,
          isActive: true,
          isDeleted: false,
        },
>>>>>>> c82b7a59271e18946480614983fa6d792351b5af
      },
      { upsert: true }
    );

    // Service types for VinFast VF 9
    const inspection3 = await ServiceTypeModel.findOneAndUpdate(
      { serviceName: 'Kiểm tra tổng quát', vehicleTypeId: vt3._id },
      { 
        serviceName: 'Kiểm tra tổng quát', 
        vehicleTypeId: vt3._id,
        estimatedDurationMinutes: 60,
        isActive: true, 
        isDeleted: false 
      },
      { upsert: true, new: true }
    );

    // Service types for BYD Atto 3
    const inspection4 = await ServiceTypeModel.findOneAndUpdate(
      { serviceName: 'Kiểm tra tổng quát', vehicleTypeId: vt4._id },
      { 
        serviceName: 'Kiểm tra tổng quát', 
        vehicleTypeId: vt4._id,
        estimatedDurationMinutes: 60,
        isActive: true, 
        isDeleted: false 
      },
      { upsert: true, new: true }
    );

    console.log('✅ Service types created');

    // 5. Create Appointments
    console.log('📅 Creating appointments...');

    const appointment1 = await AppointmentModel.findOneAndUpdate(
      { customerEmail: 'customer1@mma.com', scheduledAt: new Date('2025-11-10T09:00:00') },
      {
        customerFullName: 'Nguyễn Văn A',
        customerPhoneNumber: '0911111111',
        customerEmail: 'customer1@mma.com',
        vehicleTypeId: vt1._id,
        vehicleNumberPlate: '30A-123.45',
        vehicleKmDistances: '15000',
        userAddress: '123 Đường ABC, Quận 1, TP.HCM',
        serviceMode: ServiceMode.AT_CENTER,
        scheduledAt: new Date('2025-11-10T09:00:00'),
        status: 'PENDING',
        notes: 'Cần kiểm tra pin và hệ thống làm mát',
        customerId: String(customer1._id),
        serviceTypeIds: [inspection1._id, battery1._id],
      },
      { upsert: true, new: true }
    );

    const appointment2 = await AppointmentModel.findOneAndUpdate(
      { customerEmail: 'customer2@mma.com', scheduledAt: new Date('2025-11-15T14:00:00') },
      {
        customerFullName: 'Trần Thị B',
        customerPhoneNumber: '0922222222',
        customerEmail: 'customer2@mma.com',
        vehicleTypeId: vt2._id,
        vehicleNumberPlate: '88A-888.88',
        vehicleKmDistances: '12000',
        userAddress: '456 Đường XYZ, Quận 2, TP.HCM',
        serviceMode: ServiceMode.MOBILE,
        scheduledAt: new Date('2025-11-15T14:00:00'),
        status: 'CONFIRMED',
        notes: 'Bảo dưỡng định kỳ',
        customerId: String(customer2._id),
        serviceTypeIds: [inspection2._id],
      },
      { upsert: true, new: true }
    );

    const appointment3 = await AppointmentModel.findOneAndUpdate(
      { customerEmail: 'customer1@mma.com', scheduledAt: new Date('2025-10-28T14:00:00') },
      {
        customerFullName: 'Nguyễn Văn A',
        customerPhoneNumber: '0911111111',
        customerEmail: 'customer1@mma.com',
        vehicleTypeId: vt1._id,
        vehicleNumberPlate: '30A-123.45',
        vehicleKmDistances: '10000',
        userAddress: '123 Đường ABC, Quận 1, TP.HCM',
        serviceMode: ServiceMode.AT_CENTER,
        scheduledAt: new Date('2025-10-28T14:00:00'),
        status: 'COMPLETED',
        notes: 'Đã hoàn thành kiểm tra pin',
        customerId: String(customer1._id),
        serviceTypeIds: [battery1._id],
      },
      { upsert: true, new: true }
    );

    console.log('✅ Appointments created');

    // 6. Create Sample Payment Transactions (optional)
    console.log('💳 Creating payment transactions...');

    await PaymentTransactionModel.findOneAndUpdate(
      { sepayId: 92704 },
      {
        sepayId: 92704,
        gateway: 'Vietcombank',
        transactionDate: new Date('2025-10-28T14:02:37'),
        accountNumber: '0010000000355',
        code: 'CODE123456',
        content: 'Thanh toan don #123 CODE:CODE123456',
        transferType: 'in',
        transferAmount: 2277000,
        accumulated: 19077000,
        subAccount: null,
        referenceCode: 'MBVCB.3278907687',
        description: 'Chuyen khoan thanh toan don hang',
        processed: true,
        relatedAppointmentId: appointment3._id,
      },
      { upsert: true }
    );

    console.log('✅ Payment transactions created');

    console.log('\n🎉 Seeder completed successfully!');
    console.log('\n📋 Test accounts:');
    console.log('Admin:');
    console.log('  Email: admin@mma.com');
    console.log('  Password: 123456');
    console.log('\nStaff:');
    console.log('  Email: staff@mma.com');
    console.log('  Password: 123456');
    console.log('\nCustomer 1:');
    console.log('  Email: customer1@mma.com');
    console.log('  Password: 123456');
    console.log('\nCustomer 2:');
    console.log('  Email: customer2@mma.com');
    console.log('  Password: 123456');
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Seeder error:', e);
    process.exit(1);
  }
}

run();

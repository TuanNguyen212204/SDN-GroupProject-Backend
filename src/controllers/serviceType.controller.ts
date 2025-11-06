import { Request, Response } from 'express';
import { ServiceTypeModel, VehicleTypeModel } from '../models/mongoose';
import { success } from '../utils/response.util';

type PlainServiceType = any;

function buildTree(items: PlainServiceType[], parentId: string | null = null): PlainServiceType[] {
  const parentKey = parentId === null ? null : String(parentId);
  const nodes = items.filter((it) => {
    const itParentId = it.parentId ?? null;
    const itParentKey = itParentId === null ? null : String(itParentId);
    return itParentKey === parentKey;
  });
  return nodes.map((n) => ({
    ...n,
    children: buildTree(items, n.serviceTypeId),
  }));
}

export async function getServiceTypesTreeByVehicleType(req: Request, res: Response) {
  const vehicleTypeId = req.params.vehicleTypeId;
  const page = Math.max(0, parseInt((req.query.page as string) || '0', 10));
  const pageSize = Math.max(1, parseInt((req.query.pageSize as string) || '10', 10));
  const keyword = (req.query.keyword as string) || '';
  const isActiveParam = (req.query.isActive as string) ?? 'true';

  const filter: any = { vehicleTypeId, isDeleted: false, isActive: String(isActiveParam).toLowerCase() === 'true' };
  if (keyword) {
    filter.$or = [
      { serviceName: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ];
  }

  // Lấy toàn bộ service types theo vehicleType để không làm mất children khi phân trang
  const rowsAll = await ServiceTypeModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  const vehicleType = await VehicleTypeModel.findById(vehicleTypeId).lean();
  const vehicleTypeResponse = vehicleType
    ? (({ _id, ...other }: any) => ({ vehicleTypeId: _id, ...other }))(vehicleType)
    : null;

  const plain = rowsAll.map(({ _id, parentId, ...rest }: any) => ({
    serviceTypeId: String(_id),
    parentId: parentId ? String(parentId) : null,
    ...rest,
    vehicleTypeResponse,
    serviceTypeVehiclePartResponses: [],
  }));

  const fullTree = buildTree(plain);
  const roots = fullTree; // buildTree với parentId=null trả về danh sách gốc
  const totalElements = roots.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const start = page * pageSize;
  const pagedRoots = roots.slice(start, start + pageSize);

  return success(res, {
    data: pagedRoots,
    page,
    size: pageSize,
    totalElements,
    totalPages,
    last: start + pagedRoots.length >= totalElements,
  }, 'Service types retrieved successfully');
}


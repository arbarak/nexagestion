export interface Vendor {
  id: string;
  companyId: string;
  vendorCode: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

export interface VendorPerformance {
  id: string;
  vendorId: string;
  deliveryScore: number;
  qualityScore: number;
  priceScore: number;
  communicationScore: number;
  overallScore: number;
  lastReviewDate: Date;
  createdAt: Date;
}

export interface ProcurementRequest {
  id: string;
  companyId: string;
  requestCode: string;
  description: string;
  quantity: number;
  estimatedBudget: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';
  requestDate: Date;
  createdAt: Date;
}

export interface VendorMetrics {
  totalVendors: number;
  activeVendors: number;
  topRatedVendors: number;
  averageRating: number;
  totalProcurementRequests: number;
  approvedRequests: number;
  totalBudgetAllocated: number;
}

export class VendorManagementService {
  private vendors: Map<string, Vendor> = new Map();
  private performances: Map<string, VendorPerformance> = new Map();
  private requests: Map<string, ProcurementRequest> = new Map();

  async createVendor(
    companyId: string,
    vendorCode: string,
    vendorName: string,
    contactPerson: string,
    email: string,
    phone: string,
    address: string,
    category: string
  ): Promise<Vendor> {
    const vendor: Vendor = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      vendorCode,
      vendorName,
      contactPerson,
      email,
      phone,
      address,
      category,
      rating: 0,
      status: 'active',
      createdAt: new Date(),
    };

    this.vendors.set(vendor.id, vendor);
    console.log(`Vendor created: ${vendorName}`);
    return vendor;
  }

  async rateVendor(
    vendorId: string,
    deliveryScore: number,
    qualityScore: number,
    priceScore: number,
    communicationScore: number
  ): Promise<VendorPerformance> {
    const overallScore = (deliveryScore + qualityScore + priceScore + communicationScore) / 4;

    const performance: VendorPerformance = {
      id: Math.random().toString(36).substr(2, 9),
      vendorId,
      deliveryScore,
      qualityScore,
      priceScore,
      communicationScore,
      overallScore,
      lastReviewDate: new Date(),
      createdAt: new Date(),
    };

    this.performances.set(performance.id, performance);

    const vendor = this.vendors.get(vendorId);
    if (vendor) {
      vendor.rating = overallScore;
      this.vendors.set(vendorId, vendor);
    }

    console.log(`Vendor rated: ${vendorId}`);
    return performance;
  }

  async createProcurementRequest(
    companyId: string,
    requestCode: string,
    description: string,
    quantity: number,
    estimatedBudget: number
  ): Promise<ProcurementRequest> {
    const request: ProcurementRequest = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      requestCode,
      description,
      quantity,
      estimatedBudget,
      status: 'draft',
      requestDate: new Date(),
      createdAt: new Date(),
    };

    this.requests.set(request.id, request);
    console.log(`Procurement request created: ${requestCode}`);
    return request;
  }

  async approveProcurementRequest(requestId: string): Promise<ProcurementRequest | null> {
    const request = this.requests.get(requestId);
    if (!request) return null;

    request.status = 'approved';
    this.requests.set(requestId, request);
    console.log(`Procurement request approved: ${requestId}`);
    return request;
  }

  async getVendors(companyId: string, status?: string): Promise<Vendor[]> {
    let vendors = Array.from(this.vendors.values()).filter((v) => v.companyId === companyId);

    if (status) {
      vendors = vendors.filter((v) => v.status === status);
    }

    return vendors;
  }

  async getVendorPerformances(vendorId?: string): Promise<VendorPerformance[]> {
    let performances = Array.from(this.performances.values());

    if (vendorId) {
      performances = performances.filter((p) => p.vendorId === vendorId);
    }

    return performances;
  }

  async getProcurementRequests(companyId: string, status?: string): Promise<ProcurementRequest[]> {
    let requests = Array.from(this.requests.values()).filter((r) => r.companyId === companyId);

    if (status) {
      requests = requests.filter((r) => r.status === status);
    }

    return requests;
  }

  async getVendorMetrics(companyId: string): Promise<VendorMetrics> {
    const vendors = Array.from(this.vendors.values()).filter((v) => v.companyId === companyId);
    const activeVendors = vendors.filter((v) => v.status === 'active').length;
    const topRatedVendors = vendors.filter((v) => v.rating >= 4).length;
    const averageRating = vendors.length > 0 ? vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length : 0;

    const requests = Array.from(this.requests.values()).filter((r) => r.companyId === companyId);
    const approvedRequests = requests.filter((r) => r.status === 'approved').length;
    const totalBudgetAllocated = requests.reduce((sum, r) => sum + r.estimatedBudget, 0);

    return {
      totalVendors: vendors.length,
      activeVendors,
      topRatedVendors,
      averageRating,
      totalProcurementRequests: requests.length,
      approvedRequests,
      totalBudgetAllocated,
    };
  }
}

export const vendorManagementService = new VendorManagementService();


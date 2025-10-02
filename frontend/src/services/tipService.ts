// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5074/api'

export interface Tip {
  tipId: number;
  title: string;
  content: string;
  createdAt: string;
  mentorId?: number;
  mentorFullName?: string;
}

export interface CreateTipRequest {
  title: string;
  content: string;
}

export interface UpdateTipRequest {
  title: string;
  content: string;
}

export interface TipFilter {
  searchTerm?: string;
  mentorId?: number;
  page?: number;
  pageSize?: number;
}

export class TipService {
  // Get all tips with optional filtering
  static async getTips(filter: TipFilter = {}): Promise<Tip[]> {
    const params = new URLSearchParams();
    
    if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
    if (filter.mentorId) params.append('mentorId', filter.mentorId.toString());
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.pageSize) params.append('pageSize', filter.pageSize.toString());

    const response = await fetch(`${API_BASE_URL}/tip?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tips: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get tip by ID
  static async getTipById(id: number): Promise<Tip> {
    const response = await fetch(`${API_BASE_URL}/tip/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tip: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get tips by mentor ID
  static async getTipsByMentor(mentorId: number): Promise<Tip[]> {
    const response = await fetch(`${API_BASE_URL}/tip/mentor/${mentorId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch mentor tips: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Create new tip (requires authentication)
  static async createTip(tip: CreateTipRequest, accessToken: string): Promise<Tip> {
    const response = await fetch(`${API_BASE_URL}/tip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(tip),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create tip: ${errorText}`);
    }
    
    return response.json();
  }

  // Update tip (requires authentication and ownership)
  static async updateTip(id: number, tip: UpdateTipRequest, accessToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tip/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(tip),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update tip: ${errorText}`);
    }
  }

  // Delete tip (requires authentication and ownership)
  static async deleteTip(id: number, accessToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tip/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete tip: ${errorText}`);
    }
  }
}


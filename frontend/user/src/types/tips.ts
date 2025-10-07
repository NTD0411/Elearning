export interface Tips {
  tipId: number;
  title: string;
  content: string;
  createdAt: string;
  mentor?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface CreateTipDto {
  title: string;
  content: string;
}

export interface UpdateTipDto {
  title?: string;
  content?: string;
}
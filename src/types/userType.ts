export interface UserReturnType {
  user: {
    id: number;
    name: string;
    email: string;
    createdAt?: Date;
  };
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
}

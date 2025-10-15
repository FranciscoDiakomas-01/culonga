export interface JwtPayload {
  userid: string;
  role: string;
  createdAt: Date;
  expireAt: Date;
}

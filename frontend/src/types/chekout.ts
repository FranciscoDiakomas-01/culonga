export default interface Checkout {
  id: number | string;
  amount: number;
  replayedAt?: Date;
  createdAt: string;
  status: "rejected" | "payed" | "peending";
}

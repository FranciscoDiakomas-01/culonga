export default interface Payments {
  id: number | string;
  amount: number;
  status: "completed" | "peending" | "canceled";
  date: Date;
  method: "Express" | "Reference";
  product: {
    title: string;
    image: string;
    id: number | string;
  };
  user: {
    name: string;
    lasname: string;
    email: string;
    tel: string;
  };
}

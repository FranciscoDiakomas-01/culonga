export default interface Intgrations {
  id: number | string;
  title: string;
  imageURL: string;
  createdAT: Date;
  link?: string;
}

export interface MyIntegrations {
  id: number | string;
  title: string;
  imageURL: string;
  total: number;
}

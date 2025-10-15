export default interface Notification {
  id: number | string;
  title: string;
  deepLink?: string;
  message: string,
  timestemp: Date,
  read : boolean
}

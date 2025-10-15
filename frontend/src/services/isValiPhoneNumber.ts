export default function isValidAngolaPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
  const regex = /^(?:\+244)?(9(1|2|3|4|5|9)[0-9]{7})$/;

  return regex.test(cleaned);
}

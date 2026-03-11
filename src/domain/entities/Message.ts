export interface Message {
  id: string;
  title: string;
  body: string;
  date: string;
  sender: string;
  raw: string;
  hasAttachments: boolean;
  class: string;
}

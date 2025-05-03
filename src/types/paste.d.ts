export interface PasteResponse {
  success: boolean;
  message: string;
  pasteUrl: string;
  rawUrl: string;
  deletionUrl: string;
}

export interface CreatePasteRequest {
  text: string;
  title: string;
  description: string;
  language: string;
}

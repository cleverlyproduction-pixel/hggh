export type MessageRole = 'user' | 'assistant';

export interface UploadedFile {
  name: string;
  size: string;
  type: string;
  content?: string;
}

export interface VoiceNote {
  duration: number; // in seconds
  audioUrl?: string;
  transcript?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  file?: UploadedFile;
  voiceNote?: VoiceNote;
  imageUrl?: string;
  isGenerating?: boolean;
}

export type GameChoice = 'shooter';

export interface ContactFormData {
  name: string;
  email: string;
  projectType: 'chatbot' | 'website' | 'game' | 'other';
  message: string;
}

export interface WebProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  demoUrl?: string;
}

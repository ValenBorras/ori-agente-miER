export interface ScriptMessage {
  id: string;
  speaker: 'Jujo' | 'Rogelio';
  content: string;
  estimatedDuration?: number; // en segundos para mensajes de Rogelio
}

export interface Script {
  id: string;
  title: string;
  messages: ScriptMessage[];
}

export interface ScriptPlayerState {
  isPlaying: boolean;
  currentMessageIndex: number;
  isPaused: boolean;
  progress: number; // 0-100
} 
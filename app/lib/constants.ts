export const AVATARS = [
  {
    avatar_id: "Ann_Therapist_public",
    name: "Ann Therapist",
  },
  {
    avatar_id: "Shawn_Therapist_public",
    name: "Shawn Therapist",
  },
  {
    avatar_id: "Bryan_FitnessCoach_public",
    name: "Bryan Fitness Coach",
  },
  {
    avatar_id: "Dexter_Doctor_Standing2_public",
    name: "Dexter Doctor Standing",
  },
  {
    avatar_id: "Elenora_IT_Sitting_public",
    name: "Elenora Tech Expert",
  },
];

export const STT_LANGUAGE_LIST = [
  { label: "Bulgarian", value: "bg", key: "bg" },
  { label: "Chinese", value: "zh", key: "zh" },
  { label: "Czech", value: "cs", key: "cs" },
  { label: "Danish", value: "da", key: "da" },
  { label: "Dutch", value: "nl", key: "nl" },
  { label: "English", value: "en", key: "en" },
  { label: "Finnish", value: "fi", key: "fi" },
  { label: "French", value: "fr", key: "fr" },
  { label: "German", value: "de", key: "de" },
  { label: "Greek", value: "el", key: "el" },
  { label: "Hindi", value: "hi", key: "hi" },
  { label: "Hungarian", value: "hu", key: "hu" },
  { label: "Indonesian", value: "id", key: "id" },
  { label: "Italian", value: "it", key: "it" },
  { label: "Japanese", value: "ja", key: "ja" },
  { label: "Korean", value: "ko", key: "ko" },
  { label: "Malay", value: "ms", key: "ms" },
  { label: "Norwegian", value: "no", key: "no" },
  { label: "Polish", value: "pl", key: "pl" },
  { label: "Portuguese", value: "pt", key: "pt" },
  { label: "Romanian", value: "ro", key: "ro" },
  { label: "Russian", value: "ru", key: "ru" },
  { label: "Slovak", value: "sk", key: "sk" },
  { label: "Spanish", value: "es", key: "es" },
  { label: "Swedish", value: "sv", key: "sv" },
  { label: "Turkish", value: "tr", key: "tr" },
  { label: "Ukrainian", value: "uk", key: "uk" },
  { label: "Vietnamese", value: "vi", key: "vi" },
];

export const ENV_IDS = {
  KNOWLEDGE_ID:
    process.env.NEXT_PUBLIC_KNOWLEDGE || "90c73013b52542299a8c08bf723ff707",
  AVATAR_ID:
    process.env.NEXT_PUBLIC_AVATAR || "8f059ad755ff4e62b103f2e3b2f127af",
  VOICE_ID:
    process.env.NEXT_PUBLIC_VOICE || "cddb6172a34a4f83ae225892c4219d31",
  INTRODUCTION:
    process.env.NEXT_PUBLIC_INTRODUCTION || "Hola! soy JUJO, asistente virtual del gobierno de Entre Rios, en que te puedo ayudar?",
};

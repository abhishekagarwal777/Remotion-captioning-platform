// src/lib/constants.ts

/**
 * Application-wide constants
 */

// ==================== FILE UPLOAD CONSTANTS ====================

export const FILE_UPLOAD = {
  MAX_SIZE: {
    VIDEO: 500 * 1024 * 1024, // 500MB
    AUDIO: 100 * 1024 * 1024, // 100MB
    CAPTION: 10 * 1024 * 1024, // 10MB
    IMAGE: 10 * 1024 * 1024, // 10MB
  },
  ALLOWED_VIDEO_TYPES: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/mpeg',
    'video/x-matroska',
  ],
  ALLOWED_AUDIO_TYPES: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/flac',
  ],
  ALLOWED_CAPTION_EXTENSIONS: ['.srt', '.vtt', '.json'],
} as const;

// ==================== CAPTION CONSTANTS ====================

export const CAPTION = {
  STYLES: {
    BOTTOM_CENTERED: 'bottom-centered',
    TOP_BAR: 'top-bar',
    KARAOKE: 'karaoke',
  },
  DEFAULT_STYLE: 'bottom-centered',
  MAX_DURATION: 10, // Maximum duration for a single caption in seconds
  MAX_WORDS_PER_CAPTION: 15,
  MIN_DURATION: 0.5, // Minimum duration for a single caption in seconds
  DEFAULT_GAP: 0.2, // Default gap between captions in seconds
} as const;

// ==================== VIDEO CONSTANTS ====================

export const VIDEO = {
  RESOLUTIONS: {
    '4K': { width: 3840, height: 2160 },
    '2K': { width: 2560, height: 1440 },
    '1080p': { width: 1920, height: 1080 },
    '720p': { width: 1280, height: 720 },
    '480p': { width: 854, height: 480 },
    '360p': { width: 640, height: 360 },
  },
  ASPECT_RATIOS: {
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '1:1': 1,
    '9:16': 9 / 16, // Vertical/Portrait
  },
  CODECS: {
    H264: 'libx264',
    H265: 'libx265',
    VP8: 'libvpx',
    VP9: 'libvpx-vp9',
  },
  DEFAULT_FPS: 30,
  RECOMMENDED_BITRATES: {
    '4K': '20000k',
    '2K': '10000k',
    '1080p': '5000k',
    '720p': '2500k',
    '480p': '1000k',
  },
} as const;

// ==================== AUDIO CONSTANTS ====================

export const AUDIO = {
  SAMPLE_RATES: {
    CD_QUALITY: 44100,
    SPEECH: 16000,
    HIGH_QUALITY: 48000,
  },
  BITRATES: {
    LOW: '96k',
    MEDIUM: '128k',
    HIGH: '192k',
    VERY_HIGH: '256k',
  },
  CHANNELS: {
    MONO: 1,
    STEREO: 2,
    SURROUND_5_1: 6,
  },
} as const;

// ==================== TRANSCRIPTION CONSTANTS ====================

export const TRANSCRIPTION = {
  PROVIDERS: {
    OPENAI: 'openai',
    ASSEMBLYAI: 'assemblyai',
  },
  DEFAULT_PROVIDER: 'openai',
  LANGUAGES: {
    AUTO: 'auto',
    ENGLISH: 'en',
    SPANISH: 'es',
    FRENCH: 'fr',
    GERMAN: 'de',
    ITALIAN: 'it',
    PORTUGUESE: 'pt',
    RUSSIAN: 'ru',
    JAPANESE: 'ja',
    KOREAN: 'ko',
    CHINESE: 'zh',
    ARABIC: 'ar',
    HINDI: 'hi',
    DUTCH: 'nl',
    POLISH: 'pl',
    TURKISH: 'tr',
    VIETNAMESE: 'vi',
    THAI: 'th',
    SWEDISH: 'sv',
    DANISH: 'da',
    FINNISH: 'fi',
    NORWEGIAN: 'no',
    CZECH: 'cs',
    ROMANIAN: 'ro',
    UKRAINIAN: 'uk',
    GREEK: 'el',
    HEBREW: 'he',
    INDONESIAN: 'id',
    MALAY: 'ms',
  },
  DEFAULT_LANGUAGE: 'auto',
} as const;

// ==================== REMOTION CONSTANTS ====================

export const REMOTION = {
  DEFAULT_FPS: 30,
  DEFAULT_DURATION_IN_FRAMES: 300, // 10 seconds at 30fps
  COMPOSITION_ID: 'CaptionedVideo',
  VIDEO_CODEC: 'h264',
  AUDIO_CODEC: 'aac',
  VIDEO_BITRATE: '5M',
  AUDIO_BITRATE: '192k',
  CONCURRENCY: 2,
  TIMEOUT: 120000, // 2 minutes in milliseconds
} as const;

// ==================== FONT CONSTANTS ====================

export const FONTS = {
  PRIMARY: 'Noto Sans',
  SECONDARY: 'Noto Sans Devanagari',
  FALLBACK: 'sans-serif',
  WEIGHTS: {
    REGULAR: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
  },
  SIZES: {
    SMALL: '14px',
    MEDIUM: '16px',
    LARGE: '20px',
    XLARGE: '24px',
    XXLARGE: '32px',
  },
} as const;

// ==================== COLOR CONSTANTS ====================

export const COLORS = {
  CAPTION_BACKGROUND: 'rgba(0, 0, 0, 0.7)',
  CAPTION_TEXT: '#FFFFFF',
  KARAOKE_ACTIVE: '#FFD700', // Gold
  KARAOKE_UPCOMING: '#999999',
  KARAOKE_PAST: '#FFFFFF',
  PRIMARY: '#0ea5e9',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
} as const;

// ==================== API CONSTANTS ====================

export const API = {
  ENDPOINTS: {
    UPLOAD: '/api/upload',
    TRANSCRIBE: '/api/transcribe',
    RENDER: '/api/render',
    DOWNLOAD: '/api/download',
  },
  TIMEOUT: 300000, // 5 minutes
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// ==================== STORAGE CONSTANTS ====================

export const STORAGE = {
  DIRECTORIES: {
    UPLOADS: 'uploads',
    OUTPUT: 'output',
    TEMP: 'uploads/temp',
  },
  CLEANUP: {
    TEMP_FILE_MAX_AGE: 60 * 60 * 1000, // 1 hour
    OLD_FILE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
} as const;

// ==================== UI CONSTANTS ====================

export const UI = {
  TOAST_DURATION: {
    SUCCESS: 5000,
    ERROR: 7000,
    WARNING: 6000,
    INFO: 5000,
  },
  ANIMATION_DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const;

// ==================== VALIDATION CONSTANTS ====================

export const VALIDATION = {
  FILENAME: {
    MAX_LENGTH: 255,
    INVALID_CHARS: /[<>:"|?*\x00-\x1f]/g,
    INVALID_PATTERNS: ['..', '/', '\\', '\0'],
  },
  CAPTION: {
    MIN_TEXT_LENGTH: 1,
    MAX_TEXT_LENGTH: 500,
    MIN_START_TIME: 0,
    MIN_DURATION: 0.1,
  },
} as const;

// ==================== ERROR MESSAGES ====================

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File is too large. Maximum size is',
  INVALID_FILE_TYPE: 'Invalid file type. Allowed types:',
  VIDEO_NOT_FOUND: 'Video file not found',
  CAPTIONS_NOT_FOUND: 'No captions available',
  TRANSCRIPTION_FAILED: 'Failed to transcribe video',
  RENDER_FAILED: 'Failed to render video',
  UPLOAD_FAILED: 'Failed to upload file',
  INVALID_VIDEO_FORMAT: 'Invalid or corrupted video file',
  NO_AUDIO_TRACK: 'Video has no audio track',
  API_KEY_MISSING: 'API key not configured',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT_ERROR: 'Request timed out',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

// ==================== SUCCESS MESSAGES ====================

export const SUCCESS_MESSAGES = {
  VIDEO_UPLOADED: 'Video uploaded successfully',
  CAPTIONS_GENERATED: 'Captions generated successfully',
  VIDEO_RENDERED: 'Video rendered successfully',
  CAPTIONS_EXPORTED: 'Captions exported successfully',
  FILE_DELETED: 'File deleted successfully',
} as const;

// ==================== APP METADATA ====================

export const APP = {
  NAME: 'Remotion Captioning Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Automatically generate and render captions on videos using Remotion',
  AUTHOR: 'Your Name',
  REPOSITORY: 'https://github.com/yourusername/remotion-captioning-platform',
} as const;

// ==================== FEATURE FLAGS ====================

export const FEATURES = {
  ENABLE_SPEAKER_DIARIZATION: false,
  ENABLE_TRANSLATION: false,
  ENABLE_SUMMARY: false,
  ENABLE_WORD_TIMESTAMPS: false,
  ENABLE_ADVANCED_EDITING: false,
} as const;

// ==================== EXPORT ALL CONSTANTS ====================

export const CONSTANTS = {
  FILE_UPLOAD,
  CAPTION,
  VIDEO,
  AUDIO,
  TRANSCRIPTION,
  REMOTION,
  FONTS,
  COLORS,
  API,
  STORAGE,
  UI,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APP,
  FEATURES,
} as const;

export default CONSTANTS;
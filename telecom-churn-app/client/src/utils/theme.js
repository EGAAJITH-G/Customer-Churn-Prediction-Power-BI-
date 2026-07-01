// Custom Themes and Avatar Style Manager for ChurnPredict AI

export const THEMES = {
  default: {
    name: 'Corporate Blue (Light)',
    colors: {
      '--bg-primary': '#F4F8FC',
      '--bg-secondary': '#FFFFFF',
      '--bg-tertiary': '#EEF4FA',
      '--card-bg': 'rgba(255, 255, 255, 0.85)',
      '--card-border': 'rgba(255, 255, 255, 0.55)',
      '--primary': '#2563EB',
      '--primary-light': '#60A5FA',
      '--primary-glow': 'rgba(37, 99, 235, 0.12)',
      '--secondary': '#7C3AED',
      '--secondary-light': '#A78BFA',
      '--accent': '#06B6D4',
      '--success': '#10B981',
      '--warning': '#F59E0B',
      '--danger': '#EF4444',
      '--heading': '#0F172A',
      '--text': '#334155',
      '--text-light': '#64748B',
      '--border': '#E2E8F0',
      '--shadow': '0 12px 35px rgba(15, 23, 42, 0.06)',
      '--shadow-sm': '0 4px 12px rgba(15, 23, 42, 0.02)',
      '--shadow-lg': '0 20px 50px rgba(15, 23, 42, 0.1)'
    }
  },
  dark: {
    name: 'Obsidian Midnight (Dark)',
    colors: {
      '--bg-primary': '#0B0F19',
      '--bg-secondary': '#111827',
      '--bg-tertiary': '#1F2937',
      '--card-bg': 'rgba(17, 24, 39, 0.75)',
      '--card-border': 'rgba(255, 255, 255, 0.08)',
      '--primary': '#3B82F6',
      '--primary-light': '#60A5FA',
      '--primary-glow': 'rgba(59, 130, 246, 0.18)',
      '--secondary': '#8B5CF6',
      '--secondary-light': '#C084FC',
      '--accent': '#22D3EE',
      '--success': '#10B981',
      '--warning': '#F59E0B',
      '--danger': '#EF4444',
      '--heading': '#F8FAFC',
      '--text': '#CBD5E1',
      '--text-light': '#94A3B8',
      '--border': '#1F2937',
      '--shadow': '0 12px 35px rgba(0, 0, 0, 0.3)',
      '--shadow-sm': '0 4px 12px rgba(0, 0, 0, 0.15)',
      '--shadow-lg': '0 20px 50px rgba(0, 0, 0, 0.4)'
    }
  },
  teal: {
    name: 'Emerald Forest (Teal)',
    colors: {
      '--bg-primary': '#F0FDF4',
      '--bg-secondary': '#FFFFFF',
      '--bg-tertiary': '#DCFCE7',
      '--card-bg': 'rgba(255, 255, 255, 0.85)',
      '--card-border': 'rgba(220, 252, 231, 0.5)',
      '--primary': '#0D9488',
      '--primary-light': '#2DD4BF',
      '--primary-glow': 'rgba(13, 148, 136, 0.12)',
      '--secondary': '#059669',
      '--secondary-light': '#34D399',
      '--accent': '#10B981',
      '--success': '#10B981',
      '--warning': '#F59E0B',
      '--danger': '#EF4444',
      '--heading': '#064E3B',
      '--text': '#14532D',
      '--text-light': '#047857',
      '--border': '#D1FAE5',
      '--shadow': '0 12px 35px rgba(6, 78, 59, 0.05)',
      '--shadow-sm': '0 4px 12px rgba(6, 78, 59, 0.02)',
      '--shadow-lg': '0 20px 50px rgba(6, 78, 59, 0.08)'
    }
  },
  purple: {
    name: 'Amethyst Sunset (Purple)',
    colors: {
      '--bg-primary': '#FAF5FF',
      '--bg-secondary': '#FFFFFF',
      '--bg-tertiary': '#F3E8FF',
      '--card-bg': 'rgba(255, 255, 255, 0.85)',
      '--card-border': 'rgba(243, 232, 255, 0.5)',
      '--primary': '#8B5CF6',
      '--primary-light': '#C084FC',
      '--primary-glow': 'rgba(139, 92, 246, 0.12)',
      '--secondary': '#EC4899',
      '--secondary-light': '#F472B6',
      '--accent': '#F43F5E',
      '--success': '#10B981',
      '--warning': '#F59E0B',
      '--danger': '#EF4444',
      '--heading': '#4C1D95',
      '--text': '#5B21B6',
      '--text-light': '#7C3AED',
      '--border': '#E9D5FF',
      '--shadow': '0 12px 35px rgba(76, 29, 149, 0.05)',
      '--shadow-sm': '0 4px 12px rgba(76, 29, 149, 0.02)',
      '--shadow-lg': '0 20px 50px rgba(76, 29, 149, 0.08)'
    }
  }
};

export const AVATAR_STYLES = {
  sunset: {
    name: 'Sunset Violet',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    shadow: '0 8px 24px rgba(236, 72, 153, 0.25)'
  },
  ocean: {
    name: 'Ocean Wave',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
    shadow: '0 8px 24px rgba(37, 99, 235, 0.25)'
  },
  fire: {
    name: 'Forest Fire',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    shadow: '0 8px 24px rgba(239, 68, 68, 0.25)'
  },
  emerald: {
    name: 'Midnight Emerald',
    gradient: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
    shadow: '0 8px 24px rgba(16, 185, 129, 0.25)'
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    gradient: 'linear-gradient(135deg, #FF007F 0%, #7C3AED 100%)',
    shadow: '0 8px 24px rgba(255, 0, 127, 0.25)'
  }
};

// Apply theme dynamically to document root
export const applyTheme = (themeKey) => {
  const root = document.documentElement;
  const theme = THEMES[themeKey] || THEMES.default;
  
  Object.keys(theme.colors).forEach((property) => {
    root.style.setProperty(property, theme.colors[property]);
  });
  
  localStorage.setItem('churnpredict_theme', themeKey);
};

// Apply avatar style dynamically to document root
export const applyAvatarStyle = (avatarKey) => {
  const root = document.documentElement;
  const style = AVATAR_STYLES[avatarKey] || AVATAR_STYLES.sunset;
  
  root.style.setProperty('--user-avatar-gradient', style.gradient);
  root.style.setProperty('--user-avatar-shadow', style.shadow);
  
  localStorage.setItem('churnpredict_avatar_style', avatarKey);
};

// Initialize both settings on startup
export const initializePreferences = () => {
  const savedTheme = localStorage.getItem('churnpredict_theme') || 'default';
  const savedAvatar = localStorage.getItem('churnpredict_avatar_style') || 'sunset';
  
  applyTheme(savedTheme);
  applyAvatarStyle(savedAvatar);
};

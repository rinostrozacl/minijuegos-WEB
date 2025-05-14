/**
 * Composable for standardizing icon naming across the application.
 * Helps migrate from the old i-heroicons-* format to the new heroicons:* format.
 */
export function useIcons() {
  /**
   * Converts old icon name format to the new format
   * Example: i-heroicons-home -> heroicons:home
   * Example: i-simple-icons-github -> simple-icons:github
   */
  const getIconName = (iconName: string): string => {
    // If already in the correct format, return as is
    if (iconName.includes(":")) {
      return iconName;
    }

    // Convert from i-heroicons-* to heroicons:*
    if (iconName.startsWith("i-heroicons-")) {
      return "heroicons:" + iconName.replace("i-heroicons-", "");
    }
    // Convert from i-simple-icons-* to simple-icons:*
    else if (iconName.startsWith("i-simple-icons-")) {
      return "simple-icons:" + iconName.replace("i-simple-icons-", "");
    }

    // Return as is if no conversion needed
    return iconName;
  };

  /**
   * Maps common icon names to their full path for simplicity
   */
  const icons = {
    home: "heroicons:home",
    play: "heroicons:play",
    user: "heroicons:user",
    settings: "heroicons:cog-6-tooth",
    info: "heroicons:information-circle",
    document: "heroicons:document-text",
    warning: "heroicons:exclamation-triangle",
    error: "heroicons:exclamation-circle",
    success: "heroicons:check-circle",
    plus: "heroicons:plus",
    minus: "heroicons:minus",
    menu: "heroicons:bars-3",
    close: "heroicons:x-mark",
    chevronDown: "heroicons:chevron-down",
    chevronUp: "heroicons:chevron-up",
    chevronLeft: "heroicons:chevron-left",
    chevronRight: "heroicons:chevron-right",
    arrowLeft: "heroicons:arrow-left",
    arrowRight: "heroicons:arrow-right",
    github: "simple-icons:github",
    twitter: "simple-icons:twitter",
    instagram: "simple-icons:instagram",
    moon: "heroicons:moon",
    sun: "heroicons:sun",
    logout: "heroicons:arrow-right-on-rectangle",
    login: "heroicons:arrow-left-on-rectangle",
    email: "heroicons:envelope",
    location: "heroicons:map-pin",
    academic: "heroicons:academic-cap",
  };

  return {
    getIconName,
    icons,
  };
}

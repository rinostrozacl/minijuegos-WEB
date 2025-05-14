export default defineAppConfig({
  icon: {
    // Set the default size for all icons
    size: "24px",
    // Default class applied to all icons
    class: "icon",
    // Set the default mode to use
    mode: "svg",
    // Define common aliases for frequently used icons
    aliases: {
      // Example: <Icon name="github" /> instead of <Icon name="simple-icons:github" />
      github: "simple-icons:github",
      twitter: "simple-icons:twitter",
      instagram: "simple-icons:instagram",
      menu: "heroicons:bars-3",
      home: "heroicons:home",
      play: "heroicons:play",
      moon: "heroicons:moon",
      user: "heroicons:user",
      settings: "heroicons:cog-6-tooth",
      logout: "heroicons:arrow-right-on-rectangle",
      email: "heroicons:envelope",
      location: "heroicons:map-pin",
      academic: "heroicons:academic-cap",
    },
  },
});

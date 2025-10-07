import { getRequestConfig } from "next-intl/server";
import { logger } from "@/lib/logger";

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid, default to 'en' if undefined
  const validLocale = locale && ["en", "es"].includes(locale) ? locale : "en";

  logger.info("getRequestConfig called", {
    locale,
    validLocale,
  });

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
    timeZone: "UTC",
  };
});

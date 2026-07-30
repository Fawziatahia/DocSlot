import { isAuthenticated } from "../lib/api.js";
import { guestLayout } from "./guest.js";
import { dashboardLayout } from "./dashboard.js";

export function adaptiveLayout(content, opts) {
  return isAuthenticated() ? dashboardLayout(content, opts) : guestLayout(content);
}

import { createTaxonomyPages } from "./taxonomy.js";

export const {
  renderList: renderSpecializationsList,
  afterList: afterSpecializationsList,
  renderForm: renderSpecializationForm,
  afterForm: afterSpecializationForm,
} = createTaxonomyPages({ resource: "specializations", label: "Specializations" });

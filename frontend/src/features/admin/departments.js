import { createTaxonomyPages } from "./taxonomy.js";

export const {
  renderList: renderDepartmentsList,
  afterList: afterDepartmentsList,
  renderForm: renderDepartmentForm,
  afterForm: afterDepartmentForm,
} = createTaxonomyPages({ resource: "departments", label: "Departments" });

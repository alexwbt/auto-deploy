import handlebars from "handlebars";

handlebars.registerHelper('helperMissing', context => {
  console.warn(`"${context?.name}" is undefined`);
});

export default handlebars;

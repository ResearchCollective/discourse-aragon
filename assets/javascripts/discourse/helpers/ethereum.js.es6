import { registerHelper } from 'discourse-common/lib/helpers';

export default registerHelper("eq", function(params) {
  return params[0] == params[1];
});

// export default registerHelper("eq2", function(param1, param2) {
//   return param1 == param2;
// });

// // TODO: doesn't work
// Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
//   return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
// });

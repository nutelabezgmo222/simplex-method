export const products = {
  attributes: [
    {
      id: 0,
      title: "Прибуток",
      restriction: 0,
      meassurement: "",
    },
  ],
  values: [
    {
      id: 0,
      title: "",
      prodValues: [{ id: 0, value: "" }],
    },
  ],
};

export const inputTypes = {
  ATTRIBUTE: "attributes",
  TITLE: "title",
  VALUE: "value",
  ATTR_REST: "attribute_restriction",
  PROD_REST: "production_restriction",
};

export const signs = [
  {
    value: -1,
    sign: "<=",
    LESS_EQUALS: "less_equals",
  },
];

// const signs = [
//   {
//     value: 1,
//     sign: ">=",
//     MORE_EQUALS: "more_equals",
//   },
//   {
//     value: 0,
//     sign: "=",
//     EQUALS: "equals",
//   },
//   {
//     value: -1,
//     sign: "<=",
//     LESS_EQUALS: "less_equals",
//   },
// ];

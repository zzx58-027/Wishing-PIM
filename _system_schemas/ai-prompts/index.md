# Product Spec Data Extract
```ts

// JSON Schema 不存在于 strictObject, object 才行.
const response_schema_zod4 = zod4.strictObject({
  productDataInfoVersion: zod4
    .string()
    .describe(
      "Product Spec Version. Format: ${year}-${month}-${day}, like: 2025-08-27."
    ),
  pooleRef: zod4.string(),
  commonRef: zod4.string(),
  proteusRef: zod4.string(),
  brand: zod4
    .string()
    .describe("Product Brand. It's alias in product spec is Customer."),
  suiteName: zod4
    .array(zod4.string())
    .describe("Product Suite Name. Could follow with sub suite name."),
  productzod4one: zod4
    .string()
    .describe(
      "The first member of product spec category column, described where area the product will be used, like: Indoor | Outdoor, etc.."
    ),
  productCategory: zod4
    .string()
    .describe(
      "The second member of product spec category column, described the product category, like: Table | Flush | Ceiling | Floor | Pendant, etc... "
    ),
  productType: zod4
    .string()
    .describe(
      "The third member of product spec category column, described the product type, like: Base & Shade | Shade Only | Base Only | Mother&Child, etc..."
    ),
  productMaterials: zod4.string(),
  productFinishes: zod4
    .array(zod4.tuple([zod4.number(), zod4.string()]))
    .describe(
      "The Finishes array member should consist of a pair: a reference number and corresponding finish name."
    ),
  productBarcode: zod4.string(),
  productEAN128: zod4.string(),
  productBulbType: zod4
    .string()
    .describe(
      "Format: ${number of bulb}*${bulb description}, like: 5*E27 10W LED."
    ),
  productIPRatring: zod4
    .string()
    .describe("Format: IP${number}, like: IP67, IP20, etc.."),
  productSafetyClass: zod4
    .string()
    .describe("Format: Class ${number}, like: Class 2."),
  productPackaging: zod4.object({
    retailCarton: zod4.object({
      quantity: zod4.number(),
      dimensions: zod4
        .string()
        .describe("Format: W100xD100xH100mm, should convert cm to mm."),
      grossWeight: zod4.string(),
      cartonType: zod4
        .string()
        .describe(
          "Format: ${Carton Colour Type: Brown | Colour} Box - ${Carton Type: Crash Lock Carton | Brown Flap Carton} like: Colour Box - Crash Lock Carton"
        ),
      packageWay: zod4
        .string()
        .describe(
          "like: Retail carton is Brown carton - B&W print - B&W ean label with Endon - Full Unbranded customer brand artwork, Flap carton"
        ),
    }),
    shipmentCarton: zod4.object({
      quantity: zod4.number(),
      dimensions: zod4
        .string()
        .describe("Format: W100xD100xH100mm, should convert cm to mm."),
      grossWeight: zod4.string(),
      cartonType: zod4
        .string()
        .describe(
          "Format: ${Carton Colour Type: for shipment carton, usually it's brown box} Box - ${Carton Type: Crash Lock Carton | Brown Flap Carton} like: Brown Box - Flap Carton"
        )
        .default("Brown box."),
      packageWay: zod4
        .string()
        .describe(
          "like: Retail carton is Brown carton - B&W print - B&W ean label with Endon - Full Unbranded customer brand artwork, Flap carton"
        ),
    }),
  }),
  other: zod4.object({
    productBulbIncluded: zod4.boolean(),
    productDimmable: zod4.boolean(),
    productLampholder: zod4
      .string()
      .describe(
        "Format: ${lampholder color} ${lampholder type}, like: white E27 threaded"
      ),
    productCable: zod4
      .string()
      .describe(
        "Cable Description of the product. Like: ${cable material, like: Natural linen} ${core description, like: 2 core 0.75} ${cable total length: 1600+400=2m}m white ${Insulation description} cable."
      ),
    productPlug: zod4
      .string()
      .describe(
        "Plug Description of the product. If the product is Table or Floor, it should have this description. Like: UK3pin"
      ),
    productLabelsDescription: zod4.array(
      zod4.object({
        labelName: zod4
          .string()
          .describe("Like: Wattage, Product Rating Label(PRL), SM3, SM4"),
        labelDimension: zod4.string().describe("Format: W100xD100mm"),
        labelPosition: zod4
          .string()
          .describe("Like: Wrap neatly around cable near plug"),
        labelMaterial: zod4
          .string()
          .describe(
            "Like: Print black on clear | Print black text on white, etc..."
          ),
      })
    ),
  }),
});
```






















<!--  -->
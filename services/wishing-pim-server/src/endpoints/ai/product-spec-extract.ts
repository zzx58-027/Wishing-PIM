import { OpenAPIRoute, ApiException, StringParameterType, Str } from "chanfana";
import { Context } from "hono";
import { z as zod4 } from "zod4";

type AppContext = Context<{ Bindings: Env }>;

const spec_raw = `
以下是从产品规格PDF中提取的关键数据整理：

  Confirmed Product Specification for Poole ref 110633 -
  Version 8 (Issued: 15/07/2024)

    Poole Ref      110633              Common Ref          70610422              Proteus No  JLP01-70610422

    Customer       JLP                       70610422      Category    Indoor    Table       Base & shade
    Suite Name     Sabzi                     Ochre           Barcode     5063036756087
    Material                       PSI Test  C + Shade       EAN 128     0105063036756087
    Ceramic & Steel

   Finish
   1304     Ochre glaze
   712      Brushed warm brass effect plate
   1123     Vintage white faux linen

    Dimensions (mm)
    Dimension 1             420        Height
    Dimension 2             220        Diameter
    Dimension 3
    Weight (kg)                    2.3

   Primary Lamp
   Bulb no.                  1              Bulb Included  No
   Bulb no. (source 2)
   Description              10W LED E27

   Prod Kelvin                              Prod Lumens      02/04/2024  nataliya korzhuk
                                                                       shade sent in cream/vintage white - accepted.


  Tilt test requirements C
                             (table & floor) - Minimum 6 degrees

  Switching, plug, dimming & fire etc     Control Gear
  Dimmable             Non-dimmable       Used
  Switched             Inline switch      Required
POOL
  Plug spec            UK 3 pin           Included              E
  IP rating            20                 Control Gear
  Fire (Part B)
  Acoustic (Part E)                      Light Source

  LIGHTING LIMITED

saxbu ENDON Interiors
               lighting                  LIGHTING               1900  Page 1

---

  Confirmed Product Specification for Poole ref 110633 -
  Version 8 (Issued: 15/07/2024)

  Poole Ref    110633            Common Ref 70610422                     Proteus No  JLP01-70610422

  Shade Specification -          Soft
  Frame and Gimbal
  Frame        3mm dia top & bottom ring                Gimbal           Fixed 3 leg
  Material     Metal                                    Gimbal size      42 (incl converter)
  Finish       Steel                                    Gmbl dstnc       37
  Colour       Gloss white                              mm from          Bottom
  Outer Fabric
  Material     Fabric                                   Seam             Glued
  Type         Faux linen                               Pleat            Gathered
  Finish       Polyester 100%                           Pleat spec       n/a
  Colour       Vintage White                            Surface app      n/a

  Inner Fabric
  Material     Fabric                                   Seam             Glued
  Type         TC cotton                                Strut cover      n/a
  Finish       n/a                                      Strut detail     n/a
  Colour       Vintage White                            Surface app      n/a

  Liner
  Material     n/a                                      Finish           n/a
  Type         n/a                                      Colour           n/a
  Edging
  Material     Fabric                                   Colour           Ivory
  Type         Faux Linen                               Edging           Rolled edge
  Finish       Polyester 100%                           Fixing           n/a

  Shade Notes
  Vintage white shade


  Component Specification
  Description                                     Colour           Core    Insulation          Length (mm)
POOL
   Plug: UK 3 pin with 3 amp fuse                   White            n/a    E
                                                                                    n/a
   Cable: UK 3 pin to inline switch             Natural linen    2 core 0.75    Braided PVC    1600
   Switch: Inline switch                            White            n/a            n/a
   Cable: Inline switch to cable entry point    Natural linen    2 core 0.75    Braided PVC    400
   Lampholder: E27 threaded & shade ring            White            n/a            n/a
  LIGHTING LIMITED
  Test Class     Class 2               Procedure  Test for Double Insulated Product with Switch
 saxbu
                 23351                 Factory GS Date 05/07/2024          Interiors
  QC Code        QC                    ENDON                               Self inspection                1

                       lighting                   LIGHTING                 1900                Page 2

---

   Confirmed Product Specification for Poole ref 110633 - Version 8 (Issued: 15/07/2024)
   φ 170
   110633,110634,110637-0050382TL update 20240227.pdf


   φ52
 0    Z

      13020  7 φ25*1.OT  φ 220


   0210

   M

   303
   400  2000


*AW*.           A0 132:
: mm            20     Whaliting Wishing Lighting Manufacturing Co.,Ltd.
[1~10 ± 0. 1    0050382TL    #
10~20 ±0. 15    0050382TL−110634  E{5 1 : 2. 5 B$
   Printed : 15/07/2024           110633    Page:  3
20~30 ±0.2                 J¥  R L. J. X
30~40±0. 3                     0050382TL    #      3 2024. 01. 04

---

Confirmed Product Specification for Poole ref 110633 - Version 8 (Issued: 15/07/2024)

 ~~Notes for Supplier~~  
10/07/2024 : nataliya korzhuk : Gold seal notes
1. Must avoid sharp edges that can be accessed by the customer
2. Avoid glue marks on shade
3. Base finish can’t be darker than GS sample.
4. All barcodes grade C - must improve in production

 ~~Specification Change History~~  

07/05/2024 : Marsha Thomas : Specification change
IM updated to correct product name.

20/03/2024 : Marsha Thomas : Specification change
IM added

29/02/2024 : vanessa saxby : Specification change
Approved artwork added.

21/02/2024 : Marsha Thomas : Specification change
PRL added


Printed : 15/07/2024    110633    Page:  4

---

    Confirmed Product Specification for Poole ref 110633 - Version 8 (Issued: 15/07/2024)

     ~~Fixing Pack~~  
    Place in white paper envelope. Print in black
    water based ink 'Fixings Enclosed' on the
    envelope. Place in retail carton with the product


     ~~Product Labels~~  
    Product Rating Label                    Print black text on white. Replace DD and MM with day and month
    Wrap neatly around cable near plug.     of production. Replace Y with last digit of year.
    115 x 46mm


    Wattage                                      Shade Convertor
    Print black on clear. Place neatly around the
    lampholder cup.


    Mounting Position    IP Replace Shade


 If the external flexible cable  JOHN LEWIS PLC
                                SW1V 2QQ
              I0W MAX
   becomes damaged, it           Sabzi Table Lamp Ochre
should only be replaced by       706 10422
              ED E27 GLS
   the manufacturer or          1 x Max. 10W LED E27 GLS
              240V               220-240V ~ 50Hz
suitably qualified person
    Printed : 15/07/2024                                110633    Page:  5
    to avoid a hazard.           RL7 DDMMY    K
                                 Made in China

---

Confirmed Product Specification for Poole ref 110633 - Version 8 (Issued: 15/07/2024)

Termination    Cable Warning


Hot Parts Label    Misc. Label


Label Position


Printed : 15/07/2024    110633    Page:  6

---

Confirmed Product Specification for Poole ref 110633 - Version 8 (Issued: 15/07/2024)

Pack Dimensions
               Qty  Description    Height (cm) Width (cm) Depth (cm)                 Weight (Kg)

Retail Pack     1  Retail carton       43.5    28                                    28     2.917
Inner Pack
Shipment Qty    2  Shipment carton     45.5    58                                    29.5    6.96
Retail Pack

Retail carton is Colour carton with JLP - Standard customer brand artwork, Crash lock carton


17-0949 TPG          110633
Spec Packaging Notes:
Carton Colours: 2 spot colour: Warm grey 1C, Process Black c. Carton Finish: Matt Machine
Varnish. Carton Quality: 350gsm CCNB + 'E' Flute min 170gsm inner & outer liner. We request
to use a board with high recycled content or one from a sustainable source (FSC or equivalent).
Polystyrene and LDPE foam must not be used in the packaging of this product. Coloured
roundel to be applied to front face of packaging only 12.5mm dia and must follow the colour
specified above if applicable. Any plastic used MUST contain a minimum 30% recycled content.


Printed : 15/07/2024    110633    Page:    7

---

  Confirmed Product Specification for Poole ref 110633 - Version 8 (Issued: 15/07/2024)

  Barcode Label
                Instructions


  Swing tag    .

                UK    EU


BATCH DATE LABEL
Place in space provided on colour box
or label.
 RL7 DDMMY                Year         Print details:
                          Alter as     25mm x 6mm
              NNecessary               Gill Sans, 10pt
  Printed : 15/07/2024                                110633    Page:    8
 Factory Day &
 Code Month

---

   Confirmed Product Specification for Poole ref 110633 - Version 8 (Issued: 15/07/2024)

   Pack Labels
              SPI 4 LDPE REMOVE COVER


   Suffocation warning incl SPI 04
   All plastic bags with opening of more than 190mm
   when flat must have black printed suffocation warning
   on them. Min text height must be 5mm.

   All plastic bags must show the correct spi code
   regarless of size normally SPI 4


REMOVE COVER
         USE
   BEFORE
       SAFETY FIRST  LDPE
 TO AVOID DANGER OF SUFFOCATION,
  PLEASE KEEP THIS WRAPPER AWAY
Label    15 x50mm
   size
   FROM BABIES AND CHILDREN.    LDPE
Text 12pt
25mm Height x 95mm Width
   Printed : 15/07/2024             110633    Page:    9
Arial Regular 12pt
SPI code must be 12mm height
SPI Code must be min 12mm height

---

JOHN                               SABZI TABLE LAMP
LEWIS                               INFORMATION LEAFLET
& PARTNERS

Warnings                           Please read these instructions carefully before commencing any work
                                   This product is only suitable for connection to a 240V~50Hz supply in accordance with current
                                   IEE Wiring Regulations. It is for indoor use only, and not suitable for a Bathroom location.
                                   This is a Class Il product and must NOT be earthed.
                                   Do not plug into the mains until your lamp is fully assembled. It must be used on a stable,
                                   flat surface.
                                   Under no circumstances must this table lamp be covered with any material as this could
                                   pose a safety hazard.
                                   When manoeuvring or assembling this product, it must be lifted from the bottom section.
                                   The lamp must be protected by a 3 amp fuse in the mains plug
                                   If you are in any doubt, please consult a qualified electrician.
                                   For your safety, always switch off the power supply before cleaning or changing the bulb.
                                   If the mains cable becomes damaged it must only be replaced by a technically competent
PRODUCT SPECIFICATION FOR POOLE NO              110633                                   15/07/2024
                                    qualified person to avoid a hazard
                                                                                         ISSUE DATE
Instruction Leaflet(s)              Ensure cables do not present a trip hazard or strangulation hazard.
Instruction Ref No        70610422_70610423_70610424_sabzi  Version Date                 07/05/2024
                          Tl V2     Always use correct type and wattage bulb. Never exceed the wattage stated.
Print Im On 1/2 A4 Single Sided And Fold In Half. Place Inside Retail Carton / Packaging.
                                   Wait 10 minutes for the product to coal down before replacing or adjusting the shade.
                                   If any modification is made, it will invalidate the warranty and may render the product unsafe.
Product                             Non-dimmable
information                               Replacement bulbs should be the same type and rating, available from John Lewis Partners
                                     or other established brands
                                     Cean thef w    o.Doot i heil cr as thiil
                                     damage the finish
                                     No The petal leavs on the base are plac n by hand.This may create sube vrations
                                     from item to item, making each piece unique.
Aftercare and                       You've switched on the light, but it's not working
Troubleshooting                    Check your power supply is switched on
                                   Turn off the light and check that the bulb is inserted correctly
                                    3.Check the bulb is still in working order
                                   If there are technical issues with this product that you can't solve, please contact your
                                   nearest John Lewis & Partners shop or call Technical Support on 03301 230106.
Supplimentary Instruction Leaflet(s)
5-year guarantee                    At John Lewis & Partners we test every light to high quality standards.
                                    That means we can offer you a 5-year guarantee.
Recycling                           waste and it should be recycled. John Lewis & Partners do not operate instore take back
                                   but as members of the Distributor Take Back scheme have funded the development and
                                   y
                                    or for further details contact your local council or visit www.recycle-more.co.uk.
                                    Please recycle the packaging where facilities are available.

John Lewis plc
SWIV 2QQ                                                                                           UK  5
johnlewis.com                                                                                      CE  YEARS    07/05/2024
Made in China                                                                                      Please retain these instructions for future reference.
Printed : 15/07/2024                                                                     110633    Page:  10

---

Confirmed Product Specification for Poole ref 110633 - Version 8 (Issued: 15/07/2024)

 ~~Shipping Carton Dimensions~~  
               Qty   Description    Height (cm)  Width (cm)                          Depth (cm) Weight (Kg)
Retail Pack     1    Retail carton       43.5    28                                  28         2.917
Inner Pack
Shipment Qty    2    Shipment carton     45.5    58                                  29.5       6.96

 ~~Shipping Marks~~  

Shipping Mark Layout


SM4
Shipping Mark 1 (SM1)                              Shipping Mark 2 (SM2)
Print or stick shipping marks centrally on both     Print or stick shipping marks centrally on both
long faces                                          short faces  SM1
FRAGILE HANDLE WITH CARE
ITEM NO : 70610422
              SM3 SM3
POOLE LIGHTING LTD
NET WEIGHT : 5.8kg
 SM2 _of_
CARTON No: (
 GROSS WEIGHT : 7kg                    )

BATCH CODE: (RL7) "DDMMY"
 CARTON DIMS : 45.5cm X 58cm X 29.5cm

QTY/PC PER CARTON : 2
              Vary size to fit carton
              FRAGILE - HANDLE WITH CARE
Poole Ref:110633 Layout: SL_PooleSTDSM1
              SHIPMENT CARTONS MUST NOT USE STAPLES SEAMS MUST BE GLUED
                         Vary size to fit carton
          ALL PO NUMBER AND DESCRIPTION DETAILS MUST MATCH ORDER PAPERWORK
Poole Ref:110633 Layout: SL_PooleSTDSM2
Printed : 15/07/2024                                             110633    Page:  11

---

Confirmed Product Specification for Poole ref 110633 - Version 8 (Issued: 15/07/2024)

Shipping Mark 3 (SM3)    Shipping Mark 4 (SM4)

Stick 2 labels on adjacent corners


706 10422


Inner Carton Mark    Inner Carton Mark


 Drop Test         5 "063036"756087">

 Drop Carton                               Drop Height              Drop Test
Lower Standard     Sabzi Table Lamp, Ochre
                                           Lower Standard                     Lower Standard
Drop on shipment carton or Retail          < 9Kg - 76.2cm                     Drop 1 - Carton base
                   John Lewis PLC
carton if no Shipment                      9.1 to 18Kg - 61cm                 Drop 2 - Carton end
                   SW1V 2QQ                                         Made in China
                                           18.1 to 27Kg - 45.7cm              Drop 3 - Corner
Higher Standard                                                               Drop 4 - Edge
FRAGILE HANDLE WITH CARE
If retail carton description is any        Higher Standard
 ITEM NO : 70610422
Poole Lighting Ltd
form of carton or, Blister,                < 10Kg – 100cm                     Higher Standard
Sandwich or Clam pack then drop            10 to 15Kg – 85cm                  Drop 1 – Corner
 70610422 Sabzi Table Lamp, Ochre
POOLE LIGHTING LTD
on that pack                               15.1 to 25Kg – 75cm                Drop 2 – Short edge
 NET WEIGHT : 5.8kg
If retail carton description is Retail     >25Kg – 65cm           x2          Drop 3 – Long edge
                                                                              Drop 4 – Small face
unit, shrink or bandage wrap or           _of_                          0     Drop 5 – Large face
CARTON No: (
 GROSS WEIGHT : 7kg                               )
poly pack then drop on shipment
carton

BATCH CODE: (RL7) "DDMMY"
 CARTON DIMS : 45.5cm X 58cm X 29.5cm

 QTY/PC PER CARTON : 2
                   0105063036756087
                         Vary size to fit carton
                   FRAGILE - HANDLE WITH CARE
                               110 mm
Poole Ref:110633 Layout: SL_PooleSTDSM1
Verification scan should read: 0105063036756087
Poole Ref:110633 Layout: SL_PooleStdEAN2Vary size to fit carton
Poole Ref:110633 Layout: SL_PooleSTDSM2
Printed : 15/07/2024                                                         110633          Page:  12

---

Confirmed Product Specification for Poole ref 110633 - Version 8 (Issued: 15/07/2024)

Notes For Inspectors
QC Classification Code    23351

Date  10/07/2024     Originator nataliya korzhuk
GS     ~~14:46:41~~  
    05/07/2024 Jackson Sun
QC 23351


Printed : 15/07/2024    110633    Page:  13
`;

const extracted_data_en = {
  data: {
    productDataInfoVersion: "2024-07-15",
    pooleRef: "110633",
    commonRef: "70610422",
    proteusRef: "JLP01-70610422",
    brand: "JLP",
    suiteName: ["Sabzi", "Ochre"],
    productzod4one: "Indoor",
    productCategory: "Table",
    productType: "Base & shade",
    productMaterials: "Ceramic & Steel",
    productFinishes: [
      [1304, "Ochre glaze"],
      [712, "Brushed warm brass effect plate"],
      [1123, "Vintage white faux linen"],
    ],
    productBarcode: "5063036756087",
    productEAN128: "0105063036756087",
    productBulbType: "1*10W LED E27",
    productIPRatring: "IP20",
    productSafetyClass: "Class 2",
    productPackaging: {
      retailCarton: {
        quantity: 1,
        dimensions: "W280xD280xH435mm",
        grossWeight: "2.917Kg",
        cartonType: "Colour Box - Crash Lock Carton",
        packageWay:
          "Retail carton is Colour carton with JLP - Standard customer brand artwork, Crash lock carton",
      },
      shipmentCarton: {
        quantity: 2,
        dimensions: "W580xD295xH455mm",
        grossWeight: "6.96Kg",
        cartonType: "Colour Crash Lock Carton",
        packageWay: "SHIPMENT CARTONS MUST NOT USE STAPLES SEAMS MUST BE GLUED",
      },
    },
    other: {
      productBulbIncluded: false,
      productDimmable: false,
      productLampholder: "White E27 threaded & shade ring",
      productCable: "Natural linen 2 core 0.75 Braided PVC 2m cable",
      productPlug: "UK 3 pin",
      productLabelsDescription: [
        {
          labelName: "Product Rating Label",
          labelDimension: "W115xD46mm",
          labelPosition: "Wrap neatly around cable near plug",
          labelMaterial: "Print black text on white",
        },
        {
          labelName: "Wattage",
          labelDimension: "",
          labelPosition: "Place neatly around the lampholder cup",
          labelMaterial: "Print black on clear",
        },
      ],
    },
  },
};

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

interface OpenAIChatChoice {
  index: number;
  message: {
    role: string;
    content: string | null;
  };
  finish_reason: string;
}

interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface OpenAIChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChatChoice[];
  usage?: OpenAIUsage;
}

export class ExtractProductSpecData extends OpenAPIRoute {
  schema = {
    tags: ["AI"],
    summary: "Extract product data info from Spec PDF.",
    request: {
      body: {
        content: {
          "multipart/form-data": {
            schema: z.object({
              userInput: z.string(),
              // files: z.array(Str({ format: "binary" } as StringParameterType)),
              //   files: z.array(z.file()), //zod4
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Successfully get extracted product data.",
        content: {},
      },
    },
  };

  async handle(c: AppContext) {
    const apiResponse = await fetch(
      c.env.VOLCENGINE_AI_BASE_URL + "/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${c.env.VOLCENGINE_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "doubao-seed-1-6-250615",
          messages: [
            {
              role: "user",
              content: "帮我提取出所需的信息",
              //   content:
              // "请将你觉得能转为中文的英文描述进行转换, 不要改变 json 的结构.",
            },
            {
              role: "user",
              content: spec_raw,
              //   content: JSON.stringify(extracted_data_en),
            },
          ],
          thinking: {
            type: "disabled",
          },
          //   stream: true,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "Product Spec Description",
              schema: zod4.toJSONSchema(response_schema_zod4),
            },
          },
        }),
      }
    );

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error("API Error:", apiResponse.status, errorBody);
      throw new ApiException(`Failed to fetch from AI service: ${errorBody}`);
    }

    const response = (await apiResponse.json()) as OpenAIChatCompletion;
    console.log("Full API Response:", response);

    const content = response?.choices?.[0]?.message?.content;

    if (!content) {
      throw new ApiException("AI response content is empty or missing.");
    }

    try {
      const data = JSON.parse(content);
      const result = {
        usage: response.usage,
        data: data,
      };
      return c.json(result);
    } catch (e) {
      console.error("Failed to parse AI response content:", content);
      throw new ApiException("Failed to parse AI response content as JSON.");
    }
  }
}

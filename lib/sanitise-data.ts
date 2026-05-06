import { EbirdDataRow } from "@/models/core-types";

export const taxonomyMappingDefinitions = [
  {
    "taxonomicOrder": 24439,
    "name": "Common Chiffchaff (Siberian)",
    "mapToTaxon": 24439,
    "mapToName": "Siberian Chiffchaff",
    "isCountableTaxon": true
  },
  {
    "taxonomicOrder": 31170,
    "name": "Western Yellow Wagtail (Channel Wagtail intergrade)",
    "mapToTaxon": 31170,
    "mapToName": "Channel Wagtail",
    "isCountableTaxon": true
  },
  {
    "taxonomicOrder": 31203,
    "name": "White Wagtail (alba)",
    "mapToTaxon": 31203,
    "mapToName": "White Wagtail",
    "isCountableTaxon": true
  },
  {
    "taxonomicOrder": 264,
    "name": "Greylag Goose (European)",
    "mapToTaxon": 263,
    "mapToName": "Greylag Goose",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 265,
    "name": "Greylag Goose",
    "mapToTaxon": 263,
    "mapToName": "Greylag Goose",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 302,
    "name": "Brent Goose (Pale-bellied)",
    "mapToTaxon": 304,
    "mapToName": "Brent Goose",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 488,
    "name": "Gadwall (Common)",
    "mapToTaxon": 487,
    "mapToName": "Gadwall",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 6750,
    "name": "Little Grebe (Little)",
    "mapToTaxon": 6749,
    "mapToName": "Little Grebe",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 5974,
    "name": "Bar-tailed Godwit (European)",
    "mapToTaxon": 5973,
    "mapToName": "Bar-tailed Godwit",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 6448,
    "name": "Common Gull (canus)",
    "mapToTaxon": 6447,
    "mapToName": "Common Gull",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 6500,
    "name": "Herring Gull (European)",
    "mapToTaxon": 6496,
    "mapToName": "Herring Gull",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 6487,
    "name": "Yellow-legged Gull (michahellis)",
    "mapToTaxon": 6485,
    "mapToName": "Yellow-legged Gull",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 7317,
    "name": "Great Cormorant (Continental)",
    "mapToTaxon": 7313,
    "mapToName": "Great Cormorant",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 11243,
    "name": "Great Spotted Woodpecker (Great Spotted)",
    "mapToTaxon": 11236,
    "mapToName": "Great Spotted Woodpecker",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 27015,
    "name": "Eurasian Wren (British)",
    "mapToTaxon": 27008,
    "mapToName": "Eurasian Wren",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 28213,
    "name": "Redwing (Eurasian)",
    "mapToTaxon": 28211,
    "mapToName": "Redwing",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 588,
    "name": "Eurasian/Green-winged Teal",
    "mapToTaxon": 589,
    "mapToName": "Eurasian Teal",
    "isCountableTaxon": true
  },
  {
    "taxonomicOrder": 1317,
    "name": "Red Grouse/Willow Grouse",
    "mapToTaxon": 1318,
    "mapToName": "Red Grouse",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 31202,
    "name": "Pied Wagtail/White Wagtail",
    "mapToTaxon": 31206,
    "mapToName": "Pied Wagtail",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 743,
    "name": "Maccoa Duck",
    "mapToTaxon": 0,
    "mapToName": "-",
    "isCountableTaxon": false
  },
  {
    "taxonomicOrder": 7121,
    "name": "Cory's/Scopoli's Shearwater",
    "mapToTaxon": 7121,
    "mapToName": "Cory's Shearwater",
    "isCountableTaxon": false
  }
]

const taxonomyMappings = taxonomyMappingDefinitions.map(({taxonomicOrder, ...rest}) => [taxonomicOrder, rest])

export function sanitiseData(data: EbirdDataRow[]): EbirdDataRow[] {
  return data
    .filter(row => {
      if (row.commonName === '-' || row.commonName.includes('/') || row.commonName.endsWith('sp.') || row.commonName.endsWith('(hybrid)')) {
        return false;
      }
      const taxonomyMapping = taxonomyMappings[row.taxonomicOrder];
      return taxonomyMapping?.isCountableTaxon ?? true;
    })
    // TODO: mapping is tricky because we don't have the complete details for the destination bird yet
  // mapping is tricky because we don't have the complete details fro the destination bird  yet
  // .map(row => {
  //   const taxonomyMapping = taxonomyMappings[row.taxonomicOrder];
  //   return {
  //     ...row,
  //     taxonomicOrder: taxonomyMapping?.mapToTaxon ?? row.taxonomicOrder
  //   }
  // })
}

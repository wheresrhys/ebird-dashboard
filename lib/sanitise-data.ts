import { EbirdDataRow, TaxonomicOrder, Species, ScientificName } from "@/models/core-types";
/*



Greylag Goose (European) (276) -> Greylag Goose (275) ??
Greater White-fronted Goose (Eurasian) (289) -> Greater White-fronted Goose (287)
Brent Goose (Pale-bellied) (316) -> Brent Goose (314)
Gadwall (Common) (506) -> Gadwall (505)
Maccoa Duck (785)  -> null
Bar-tailed Godwit (European) (6034) -> Bar-tailed Godwit (6033)
Common Gull (canus) (6514) -> Common Gull (6513)
Yellow-legged Gull (michahellis) (6554) -> Yellow-legged Gull (6552)
Lesser Black-backed Gull (intermedius) (6578) -> Lesser Black-backed Gull (6576)
Little Grebe (Little) (6828) -> Little Grebe (6827)
Great Cormorant (Continental) (7401) -> Great Cormorant (7397)
Great Spotted Woodpecker (Great Spotted) (11356) -> Great Spotted Woodpecker (11349)
Eurasian Wren (British) (27265) -> Eurasian Wren (27258)
Redwing (Eurasian) (28499) -> Redwing (28497)
Cory's/Scopoli's Shearwater (7202) -> ....?


Common Chiffchaff (Siberian) (24860) -> Siberian Chiffchaff
Western Yellow Wagtail (flava) (31687) -> Blue-headed Wagtail
Western Yellow Wagtail (Channel Wagtail intergrade) (31688) -> Channel Wagtail
*/


type BasicSpecies = Omit<Species, 'records'>;
type AwkwardSpecies = BasicSpecies & {
  rootSpeciesName: ScientificName | undefined;
  isKeeper: boolean;
}


const subspeciesKeepers: ScientificName[] = [
  'Anas crecca carolinensis',
  'Columba livia (Feral Pigeon)',
  'Phylloscopus collybita tristis',
  'Motacilla flava flava',
  'Motacilla flava flavissima x flava',
  // woudl also be good to map alba to alba yarrellii
  'Motacilla alba alba/dukhunensis',
  'Acanthis flammea cabaret',
  'Calonectris borealis/diomedea',
]

const speciesDitchers: ScientificName[] = [
  'Oxyura maccoa',
]

const preferredCommonNames: Record<ScientificName, string> = {
  'Anas crecca': 'Eurasian Teal',
  'Larus argentatus': 'Herring Gull',
  'Calonectris borealis/diomedea': 'Cory\'s Shearwater',
  'Phylloscopus collybita tristis': 'Siberian Chiffchaff',
  'Motacilla flava flava': 'Blue-headed Wagtail',
  'Motacilla flava flavissima x flava': 'Channel Wagtail',
  'Motacilla alba alba/dukhunensis': 'White Wagtail',
  'Motacilla alba': 'White Wagtail',
}

function overrideCommonName(row: EbirdDataRow): EbirdDataRow {
  const preferredCommonName = preferredCommonNames[row.scientificName];
  if (preferredCommonName) {
    return {
      ...row,
      commonName: preferredCommonName,
    };
  }
  return row;
}

export function sanitiseData(data: EbirdDataRow[]): EbirdDataRow[] {
  const encounteredSpeciesMap: Record<ScientificName, BasicSpecies> = {};
  const awkwardSpeciesMap: Record<ScientificName, AwkwardSpecies> = {};

  data.forEach(row => {
    if (!encounteredSpeciesMap[row.scientificName]) {
      const basicSpecies = {
        taxonomicOrder: row.taxonomicOrder,
        commonName: row.commonName,
        scientificName: row.scientificName,
      };
      encounteredSpeciesMap[row.scientificName] = basicSpecies
      if (!/^\w+\s\w+$/i.test(row.scientificName)) {
        const speciesScientificName = /^(\w+\s\w+)\s(?!x\s)/.exec(row.scientificName)?.[1] as ScientificName | undefined;
        awkwardSpeciesMap[row.scientificName] = {
          ...basicSpecies,
          rootSpeciesName: speciesScientificName,
          isKeeper: subspeciesKeepers.includes(row.scientificName)
        };
      }
    }
  });

  return data.map(row => {

    if (speciesDitchers.includes(row.scientificName)) {
      return null;
    }
    if (awkwardSpeciesMap[row.scientificName] && !subspeciesKeepers.includes(row.scientificName)) {
      const rootSpeciesName = awkwardSpeciesMap[row.scientificName].rootSpeciesName;
      if (rootSpeciesName) {
        return overrideCommonName({
          ...row,
          ...encounteredSpeciesMap[rootSpeciesName],
        });
      } else {
        return null
      }
    }

    return overrideCommonName(row)
  }).filter(row => row !== null)



  // // console.log(awkwardSpeciesMap);
  // //  x sp.
  // // To keep it sustainable map on taxonomic order * but * alert if any rules are not used and / or a rule is hit but the name doesn't match expected name for the source bird

  // // Here's a better name - we go by latin name (genus + species) and map to the one with the
  // // lowest taxonomicOrder. It's then a matter of adding a handful of exceptions (sibe chiff etc). Also discard any with / in the taxonomic nameTricky ones are cory/scopoli and channel wagtail and Pied Wagtail/White Wagtail, which should be allowed).

  // // Also review all my custom rules e.g.sp.and(hybrid) to see how that is reflected
  // //     in the scientific name column.
  // // return data
  // //   .filter(row => {
  // //     if (!encounteredSpeciesMap[row.scientificName]) {
  // //       encounteredSpeciesMap[row.scientificName] = {
  // //         taxonomicOrder: row.taxonomicOrder,
  // //         commonName: row.commonName,
  // //         scientificName: row.scientificName,
  // //       }
  // //     }
  // //     if (row.commonName.includes('Cory\'s/Scopoli\'s')) {
  // //       return true
  // //     }
  // //     if (row.commonName === '-' || row.commonName.includes('/') || row.commonName.endsWith('sp.') || row.commonName.endsWith('(hybrid)')) {
  // //       return false;
  // //     }
  // //     const taxonomyMapping = taxonomyMappings[row.taxonomicOrder];
  // //     if (!taxonomyMapping) {
  // //       return true;
  // //     } else {
  // //       return taxonomyMapping.isCountableTaxon;
  // //     }
  // //   })

  // // .map(row => {
  // //   const taxonomyMapping = taxonomyMappings[row.taxonomicOrder];

  // //   if (!taxonomyMapping) {
  // //     return row;
  // //   } else {
  // //     const mappedTaxon = encounteredSpeciesMap[taxonomyMapping.mapToTaxon];
  // //     return {...row, ...mappedTaxon}
  // //   }
  // // })

  // return data
}





// export const taxonomyMappingDefinitions: TaxonomyMapping[] = [

// {
//   "taxonomicOrder": 24439,
//   "name": "Common Chiffchaff (Siberian)",
//   "mapToTaxon": 24439,
//   "mapToName": "Siberian Chiffchaff",
//   "isCountableTaxon": true
// },
// {
//   "taxonomicOrder": 31688,
//   "name": "Western Yellow Wagtail (Channel Wagtail intergrade)",
//   "mapToTaxon": 31688,
//   "mapToName": "Channel Wagtail",
//   "isCountableTaxon": true
// },
// {
//   "taxonomicOrder": 31687,
//   "name": "Western Yellow Wagtail (flava)",
//   "mapToTaxon": 31687,
//   "mapToName": "Blue-headed Wagtail",
//   "isCountableTaxon": true
// },
// {
//   "taxonomicOrder": 31203,
//   "name": "White Wagtail (alba)",
//   "mapToTaxon": 31203,
//   "mapToName": "White Wagtail",
//   "isCountableTaxon": true
// },
// {
//   "taxonomicOrder": 264,
//   "name": "Greylag Goose (European)",
//   "mapToTaxon": 263,
//   "mapToName": "Greylag Goose",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 265,
//   "name": "Greylag Goose",
//   "mapToTaxon": 263,
//   "mapToName": "Greylag Goose",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 316,
//   "name": "Brent Goose (Pale-bellied)",
//   "mapToTaxon": 304,
//   "mapToName": "Brent Goose",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 488,
//   "name": "Gadwall (Common)",
//   "mapToTaxon": 487,
//   "mapToName": "Gadwall",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 6750,
//   "name": "Little Grebe (Little)",
//   "mapToTaxon": 6749,
//   "mapToName": "Little Grebe",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 6034,
//   "name": "Bar-tailed Godwit (European)",
//   "mapToTaxon": 5973,
//   "mapToName": "Bar-tailed Godwit",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 6514,
//   "name": "Common Gull (canus)",
//   "mapToTaxon": 6447,
//   "mapToName": "Common Gull",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 6500,
//   "name": "Herring Gull (European)",
//   "mapToTaxon": 6496,
//   "mapToName": "Herring Gull",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 6487,
//   "name": "Yellow-legged Gull (michahellis)",
//   "mapToTaxon": 6485,
//   "mapToName": "Yellow-legged Gull",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 7317,
//   "name": "Great Cormorant (Continental)",
//   "mapToTaxon": 7313,
//   "mapToName": "Great Cormorant",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 11243,
//   "name": "Great Spotted Woodpecker (Great Spotted)",
//   "mapToTaxon": 11236,
//   "mapToName": "Great Spotted Woodpecker",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 27015,
//   "name": "Eurasian Wren (British)",
//   "mapToTaxon": 27008,
//   "mapToName": "Eurasian Wren",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 28213,
//   "name": "Redwing (Eurasian)",
//   "mapToTaxon": 28211,
//   "mapToName": "Redwing",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 588,
//   "name": "Eurasian/Green-winged Teal",
//   "mapToTaxon": 589,
//   "mapToName": "Eurasian Teal",
//   "isCountableTaxon": true
// },
// {
//   "taxonomicOrder": 1317,
//   "name": "Red Grouse/Willow Grouse",
//   "mapToTaxon": 1318,
//   "mapToName": "Red Grouse",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 31202,
//   "name": "Pied Wagtail/White Wagtail",
//   "mapToTaxon": 31206,
//   "mapToName": "Pied Wagtail",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 785,
//   "name": "Maccoa Duck",
//   "mapToTaxon": 0,
//   "mapToName": "-",
//   "isCountableTaxon": false
// },
// {
//   "taxonomicOrder": 7121,
//   "name": "Cory's/Scopoli's Shearwater",
//   "mapToTaxon": 7121,
//   "mapToName": "Cory's Shearwater",
//   "isCountableTaxon": false
// }
// ]

// const taxonomyMappings = Object.fromEntries(taxonomyMappingDefinitions.map(({taxonomicOrder, ...rest}) => [taxonomicOrder, rest]))

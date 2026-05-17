import { EbirdDataServerRow, Species, ScientificName } from "@/app/models/types";
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


type BasicSpecies = Omit<Species, 'records' | 'isSubspecies'>;
type AwkwardSpecies = BasicSpecies & {
  rootSpeciesName: ScientificName | undefined;
  isKeeper: boolean;
}


export const tickableSubspecies: ScientificName[] = [
  'Anas crecca carolinensis',
  'Columba livia (Feral Pigeon)',
  'Phylloscopus collybita tristis',
  'Motacilla flava flava',
  'Motacilla flava flavissima x flava',
  // woudl also be good to map alba to alba yarrellii
  'Motacilla alba alba/dukhunensis',
  // TODO: these last two should not end up with isSubspecies: true
  // isSubspecies shodul take account of there being multiple subspecies
  // under the same scientific name
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
  'Motacilla alba': 'Pied Wagtail',
}

function overrideCommonName(row: EbirdDataServerRow): EbirdDataServerRow {
  const preferredCommonName = preferredCommonNames[row.scientificName];
  if (preferredCommonName) {
    return {
      ...row,
      commonName: preferredCommonName,
    };
  }
  return row;
}

export function sanitiseData(data: EbirdDataServerRow[]): EbirdDataServerRow[] {
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
          isKeeper: tickableSubspecies.includes(row.scientificName)
        };
      }
    }
  });

  return data.map(row => {

    if (speciesDitchers.includes(row.scientificName)) {
      return null;
    }
    if (awkwardSpeciesMap[row.scientificName] && !tickableSubspecies.includes(row.scientificName)) {
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
}

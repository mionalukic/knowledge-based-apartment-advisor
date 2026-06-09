export enum RoomType {
  LIVING_ROOM = 'LIVING_ROOM',
  BEDROOM = 'BEDROOM',
  KITCHEN = 'KITCHEN',
  BATHROOM = 'BATHROOM',
  TOILET = 'TOILET',
  HALLWAY = 'HALLWAY',
  STORAGE = 'STORAGE',
  ENTRANCE_LOBBY = 'ENTRANCE_LOBBY',
  BALCONY = 'BALCONY',
  LOGGIA = 'LOGGIA',
}

export enum BuildingType {
  STANDARD = 'STANDARD',
  SOCIAL = 'SOCIAL',
  MIXED = 'MIXED',
  LUXURY = 'LUXURY',
}

export enum BuyerProfileType {
  SINGLE = 'SINGLE',
  COUPLE = 'COUPLE',
  YOUNG_FAMILY = 'YOUNG_FAMILY',
  FAMILY = 'FAMILY',
  LARGE_FAMILY = 'LARGE_FAMILY',
  RETIREE = 'RETIREE',
  INVESTOR = 'INVESTOR',
}

export enum ComfortClass {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export enum ApartmentStructure {
  STUDIO = 'STUDIO',
  ONE_ROOM = 'ONE_ROOM',
  ONE_AND_A_HALF_ROOM = 'ONE_AND_A_HALF_ROOM',
  TWO_ROOM = 'TWO_ROOM',
  TWO_AND_A_HALF_ROOM = 'TWO_AND_A_HALF_ROOM',
  THREE_ROOM = 'THREE_ROOM',
  THREE_AND_A_HALF_ROOM = 'THREE_AND_A_HALF_ROOM',
  FOUR_ROOM = 'FOUR_ROOM',
  FOUR_AND_A_HALF_ROOM = 'FOUR_AND_A_HALF_ROOM',
}

export enum Orientation {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
  NORTHEAST = 'NORTHEAST',
  NORTHWEST = 'NORTHWEST',
  SOUTHEAST = 'SOUTHEAST',
  SOUTHWEST = 'SOUTHWEST',
}

export interface Room {
  id: string;
  type: RoomType;
  length: number;
  width: number;
  clearHeight: number;
  area: number;
  totalGlazedArea: number;
  bedroomCapacity: number;
  walkThrough: boolean;
  hasMechanicalVentilation: boolean;
  facesNoisyStreet: boolean;
}

export interface ApartmentWindow {
  roomId: string;
  width: number;
  height: number;
  parapetHeight: number;
  orientation: Orientation;
  glazedArea: number;
}

export interface KitchenWall {
  id: string;
  roomId: string;
  lengthCm: number;
  modular30: boolean;
  modular60: boolean;
  nonModular: boolean;
}

export interface DeadArea {
  roomId: string;
  areaM2: number;
  reason: string;
}

export interface Apartment {
  id: string;
  rooms: Room[];
  windows: ApartmentWindow[];
  kitchenWalls: KitchenWall[];
  deadAreas: DeadArea[];
  totalNetUsableArea: number;
  crossVentilation: boolean;
  structure: ApartmentStructure;
  floor: number;
  terraceRailingHeightCm: number;
  cornerApartment: boolean;
  topFloor: boolean;
  roofInsulated: boolean;
  comfortClass?: ComfortClass;
  hasElectricalInstallation: boolean;
  hasWaterInstallation: boolean;
  heatingType: string;
  openConceptLivingKitchen: boolean;
}

export interface Building {
  id: string;
  aboveGroundFloors: number;
  hasElevator: boolean;
  elevatorCabinLengthCm: number;
  elevatorCabinWidthCm: number;
  elevatorDoorWidthCm: number;
  totalApartments: number;
  windbreakWidthCm: number;
  corridorWidthCm: number;
  staircaseWidthCm: number;
  stairTreadCm: number;
  stairRiserCm: number;
  buildingType: BuildingType;
  hasUsagePermit: boolean;
  energyClass: string;
  hasParking: boolean;
  parkingWidthCm: number;
  parkingLengthCm: number;
  parkingType: string;
  garageHeightCm: number;
  hasRamp: boolean;
  rampSlopePercent: number;
  rampWidthCm: number;
  hasRampRestingPlatforms: boolean;
  accessible: boolean;
  stepsAtEntrance: number;
  hasHandrailsOnStairs: boolean;
  entryDoorWidthCm: number;
}

export interface BuyerProfile {
  id: string;
  type: BuyerProfileType;
  numberOfOccupants: number;
  hasChildren: boolean;
  hasElderlyOrDisabled: boolean;
  maxBudgetEur: number;
  needsParking: boolean;
  prioritizesNaturalLight: boolean;
  prioritizesQuiet: boolean;
  acceptsRenovation: boolean;
  numberOfChildren: number;
  hasMixedGenderChildren: boolean;
  youngestChildAge: number;
}

export interface Violation {
  articleReference: string;
  roomId: string;
  description: string;
  deficitValue: number;
  deficitUnit: string;
  estimatedRepairCost: number;
  critical: boolean;
}

export interface Warning {
  code: string;
  roomId: string;
  description: string;
  estimatedExtraCost: number;
}

export interface Recommendation {
  code: string;
  description: string;
  estimatedSavingEur: number;
}

export interface EvaluationRequest {
  apartment: Apartment;
  building: Building;
  buyerProfile: BuyerProfile;
}

export interface EvaluationResponse {
  apartmentId: string;
  totalNetUsableArea: number;
  crossVentilation: boolean;
  rooms: Room[];
  kitchenWalls: KitchenWall[];
  deadAreas: DeadArea[];
  violations: Violation[];
  warnings: Warning[];
  firedRules: number;
  structure: ApartmentStructure;
  comfortClass: ComfortClass;
  recommendations: Recommendation[];
}

export interface SubGoalResult {
  goalName: string;
  satisfied: boolean;
  description: string;
}

export interface BackwardQueryRequest {
  apartment: Apartment;
  building: Building;
  buyerProfile: BuyerProfile;
  queryName: string;
}

export interface BackwardQueryResponse {
  queryName: string;
  satisfied: boolean;
  explanation: string;
  subGoals: SubGoalResult[];
}

export function createDefaultApartment(): Apartment {
  return {
    id: 'APT-' + Date.now(),
    rooms: [],
    windows: [],
    kitchenWalls: [],
    deadAreas: [],
    totalNetUsableArea: 65,
    crossVentilation: false,
    structure: ApartmentStructure.TWO_ROOM,
    floor: 2,
    terraceRailingHeightCm: 110,
    cornerApartment: false,
    topFloor: false,
    roofInsulated: true,
    hasElectricalInstallation: true,
    hasWaterInstallation: true,
    heatingType: 'CENTRAL',
    openConceptLivingKitchen: false,
  };
}

export function createDefaultBuilding(): Building {
  return {
    id: 'BLD-' + Date.now(),
    aboveGroundFloors: 5,
    hasElevator: false,
    elevatorCabinLengthCm: 0,
    elevatorCabinWidthCm: 0,
    elevatorDoorWidthCm: 0,
    totalApartments: 20,
    windbreakWidthCm: 130,
    corridorWidthCm: 140,
    staircaseWidthCm: 120,
    stairTreadCm: 28,
    stairRiserCm: 17,
    buildingType: BuildingType.STANDARD,
    hasUsagePermit: true,
    energyClass: 'B',
    hasParking: false,
    parkingWidthCm: 0,
    parkingLengthCm: 0,
    parkingType: 'OPEN',
    garageHeightCm: 0,
    hasRamp: false,
    rampSlopePercent: 0,
    rampWidthCm: 0,
    hasRampRestingPlatforms: false,
    accessible: false,
    stepsAtEntrance: 2,
    hasHandrailsOnStairs: false,
    entryDoorWidthCm: 90,
  };
}

export function createDefaultBuyerProfile(): BuyerProfile {
  return {
    id: 'BYR-' + Date.now(),
    type: BuyerProfileType.COUPLE,
    numberOfOccupants: 2,
    hasChildren: false,
    hasElderlyOrDisabled: false,
    maxBudgetEur: 120000,
    needsParking: false,
    prioritizesNaturalLight: true,
    prioritizesQuiet: false,
    acceptsRenovation: false,
    numberOfChildren: 0,
    hasMixedGenderChildren: false,
    youngestChildAge: 99,
  };
}

export function createDefaultRoom(): Room {
  return {
    id: 'RM-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    type: RoomType.LIVING_ROOM,
    length: 5.0,
    width: 4.0,
    clearHeight: 2.6,
    area: 20.0,
    totalGlazedArea: 3.5,
    bedroomCapacity: 0,
    walkThrough: false,
    hasMechanicalVentilation: false,
    facesNoisyStreet: false,
  };
}

export function createDefaultWindow(roomId = ''): ApartmentWindow {
  return {
    roomId,
    width: 1.2,
    height: 1.4,
    parapetHeight: 0.9,
    orientation: Orientation.SOUTH,
    glazedArea: 1.68,
  };
}

export function createDefaultKitchenWall(roomId = ''): KitchenWall {
  return {
    id: 'KW-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    roomId,
    lengthCm: 240,
    modular30: true,
    modular60: true,
    nonModular: false,
  };
}

export function createDefaultDeadArea(roomId = ''): DeadArea {
  return {
    roomId,
    areaM2: 0,
    reason: '',
  };
}

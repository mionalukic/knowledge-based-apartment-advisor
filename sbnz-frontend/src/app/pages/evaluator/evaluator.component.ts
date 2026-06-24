import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Apartment,
  ApartmentStructure,
  Building,
  BuildingType,
  BuyerProfile,
  BuyerProfileType,
  NoiseSource,
  Orientation,
  Room,
  RoomConnection,
  RoomType,
  createDefaultApartment,
  createDefaultBuilding,
  createDefaultBuyerProfile,
  createDefaultDeadArea,
  createDefaultKitchenWall,
  createDefaultRoom,
  createDefaultRoomConnection,
  createDefaultWindow,
} from '../../models/apartment.models';
import { ApartmentService } from '../../services/apartment.service';
import { ResultsService } from '../../services/results.service';

@Component({
  selector: 'app-evaluator',
  imports: [FormsModule],
  templateUrl: './evaluator.component.html',
  styleUrl: './evaluator.component.css',
})
export class EvaluatorComponent {
  currentStep = 1;
  readonly totalSteps = 7;
  isLoading = false;
  error: string | null = null;
  noiseSourceEnabled = false;

  apartment: Apartment = createDefaultApartment();
  building: Building = createDefaultBuilding();
  buyerProfile: BuyerProfile = createDefaultBuyerProfile();
  selectedQuery = 'potencijalZaVisokKomfor';

  readonly roomTypes = Object.values(RoomType);
  readonly orientations = Object.values(Orientation);
  readonly apartmentStructures = Object.values(ApartmentStructure);
  readonly buildingTypes = Object.values(BuildingType);
  readonly buyerProfileTypes = Object.values(BuyerProfileType);
  readonly heatingTypes = ['CENTRAL', 'HEAT_PUMP', 'TA_FURNACE', 'INDIVIDUAL', 'NONE'];
  readonly energyClasses = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
  readonly parkingTypes = ['OPEN', 'COVERED', 'GARAGE'];

  readonly steps = [
    { label: 'Zgrada' },
    { label: 'Stan' },
    { label: 'Sobe' },
    { label: 'Prozori' },
    { label: 'Kuhinja' },
    { label: 'Površine' },
    { label: 'Kupac' },
  ];

  constructor(
    private apartmentService: ApartmentService,
    private resultsService: ResultsService,
    private router: Router
  ) {}

  get kitchenRooms(): Room[] {
    return this.apartment.rooms.filter((r) => r.type === RoomType.KITCHEN);
  }

  addRoom() {
    this.apartment.rooms.push(createDefaultRoom());
  }

  removeRoom(index: number) {
    const roomId = this.apartment.rooms[index].id;
    this.apartment.rooms.splice(index, 1);
    this.apartment.windows = this.apartment.windows.filter((w) => w.roomId !== roomId);
    this.apartment.kitchenWalls = this.apartment.kitchenWalls.filter((k) => k.roomId !== roomId);
    this.apartment.deadAreas = this.apartment.deadAreas.filter((d) => d.roomId !== roomId);
  }

  addWindow() {
    const firstRoomId = this.apartment.rooms[0]?.id ?? '';
    this.apartment.windows.push(createDefaultWindow(firstRoomId));
  }

  removeWindow(index: number) {
    this.apartment.windows.splice(index, 1);
  }

  addKitchenWall() {
    const kitchenRoom = this.apartment.rooms.find((r) => r.type === RoomType.KITCHEN);
    const roomId = kitchenRoom?.id ?? this.apartment.rooms[0]?.id ?? '';
    this.apartment.kitchenWalls.push(createDefaultKitchenWall(roomId));
  }

  removeKitchenWall(index: number) {
    this.apartment.kitchenWalls.splice(index, 1);
  }

  updateKitchenWallModularity(i: number) {
    const kw = this.apartment.kitchenWalls[i];
    const len = kw.lengthCm;
    kw.modular60 = len > 0 && len % 60 === 0;
    kw.modular30 = len > 0 && len % 30 === 0 && !kw.modular60;
    kw.nonModular = len <= 0 || len % 30 !== 0;
  }

  kitchenWallModularityLabel(i: number): { text: string; type: 'mod60' | 'mod30' | 'nonmod' } {
    const kw = this.apartment.kitchenWalls[i];
    if (kw.modular60) return { text: 'Modularni 60 cm', type: 'mod60' };
    if (kw.modular30) return { text: 'Modularni 30 cm', type: 'mod30' };
    return { text: 'Nemodularni', type: 'nonmod' };
  }

  addDeadArea() {
    const firstRoomId = this.apartment.rooms[0]?.id ?? '';
    this.apartment.deadAreas.push(createDefaultDeadArea(firstRoomId));
  }

  removeDeadArea(index: number) {
    this.apartment.deadAreas.splice(index, 1);
  }

  addRoomConnection() {
    if (!this.apartment.roomConnections) this.apartment.roomConnections = [];
    const idA = this.apartment.rooms[0]?.id ?? '';
    const idB = this.apartment.rooms[1]?.id ?? '';
    this.apartment.roomConnections.push(createDefaultRoomConnection(idA, idB));
  }

  removeRoomConnection(index: number) {
    this.apartment.roomConnections?.splice(index, 1);
  }

  onNoiseSourceToggle(enabled: boolean) {
    if (enabled) {
      this.apartment.noiseSource = this.apartment.noiseSource ?? { name: 'Prometna ulica', noiseLevelDB: 70 };
    } else {
      delete this.apartment.noiseSource;
    }
  }

  updateRoomArea(i: number) {
    const room = this.apartment.rooms[i];
    room.area = +(room.length * room.width).toFixed(2);
  }

  updateWindowGlazedArea(i: number) {
    const win = this.apartment.windows[i];
    win.glazedArea = +(win.width * win.height).toFixed(2);
  }

  selectedTestIndex = 0;

  readonly testCases: Array<{ label: string; queryName?: string; apartment: Apartment; building: Building; buyerProfile: BuyerProfile }> = [
    {
      label: 'Test 1 — Trosoban, par',
      apartment: {
        id: 'APT-001', floor: 3, terraceRailingHeightCm: 110, cornerApartment: false, topFloor: false,
        roofInsulated: true, crossVentilation: false, structure: ApartmentStructure.THREE_ROOM,
        totalNetUsableArea: 67.0, hasElectricalInstallation: true, hasWaterInstallation: true,
        heatingType: 'CENTRAL', openConceptLivingKitchen: false,
        rooms: [
          { id: 'R1', type: RoomType.LIVING_ROOM, length: 5.0, width: 4.5, clearHeight: 2.70, area: 22.5, totalGlazedArea: 4.62, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R2', type: RoomType.BEDROOM,      length: 4.0, width: 3.5, clearHeight: 2.70, area: 14.0, totalGlazedArea: 2.10, bedroomCapacity: 2, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R3', type: RoomType.BEDROOM,      length: 3.5, width: 3.0, clearHeight: 2.70, area: 10.5, totalGlazedArea: 2.10, bedroomCapacity: 2, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R4', type: RoomType.KITCHEN,      length: 3.5, width: 3.0, clearHeight: 2.70, area: 10.5, totalGlazedArea: 1.80, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R5', type: RoomType.BATHROOM,     length: 2.5, width: 2.0, clearHeight: 2.70, area:  5.0, totalGlazedArea: 0.48, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R6', type: RoomType.HALLWAY,      length: 3.0, width: 1.5, clearHeight: 2.70, area:  4.5, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
        ],
        windows: [
          { roomId: 'R1', width: 1.8, height: 1.4, parapetHeight: 0.85, orientation: Orientation.SOUTH, glazedArea: 2.52 },
          { roomId: 'R1', width: 1.5, height: 1.4, parapetHeight: 0.85, orientation: Orientation.WEST,  glazedArea: 2.10 },
          { roomId: 'R2', width: 1.5, height: 1.4, parapetHeight: 0.90, orientation: Orientation.EAST,  glazedArea: 2.10 },
          { roomId: 'R3', width: 1.5, height: 1.4, parapetHeight: 0.90, orientation: Orientation.EAST,  glazedArea: 2.10 },
          { roomId: 'R4', width: 1.5, height: 1.2, parapetHeight: 0.90, orientation: Orientation.NORTH, glazedArea: 1.80 },
          { roomId: 'R5', width: 0.8, height: 0.6, parapetHeight: 1.50, orientation: Orientation.NORTH, glazedArea: 0.48 },
        ],
        kitchenWalls: [
          { id: 'KW1', roomId: 'R4', lengthCm: 180.0, modular60: true,  modular30: false, nonModular: false },
          { id: 'KW2', roomId: 'R4', lengthCm: 120.0, modular60: true,  modular30: false, nonModular: false },
        ],
        deadAreas: [],
      },
      building: {
        id: 'BLD-001', aboveGroundFloors: 5, hasElevator: true, elevatorCabinLengthCm: 140,
        elevatorCabinWidthCm: 110, elevatorDoorWidthCm: 90, totalApartments: 12,
        windbreakWidthCm: 140, corridorWidthCm: 150, staircaseWidthCm: 130, stairTreadCm: 28,
        stairRiserCm: 17, buildingType: BuildingType.STANDARD, hasUsagePermit: true, energyClass: 'B',
        hasParking: true, parkingWidthCm: 250, parkingLengthCm: 500, parkingType: 'OPEN', garageHeightCm: 0,
        hasRamp: true, rampSlopePercent: 5.0, rampWidthCm: 150, hasRampRestingPlatforms: true,
        accessible: true, stepsAtEntrance: 0, hasHandrailsOnStairs: false, entryDoorWidthCm: 90,
      },
      buyerProfile: {
        id: 'BP-001', type: BuyerProfileType.COUPLE, numberOfOccupants: 2, hasChildren: false,
        hasElderlyOrDisabled: false, maxBudgetEur: 150000, needsParking: false,
        prioritizesNaturalLight: true, prioritizesQuiet: false, acceptsRenovation: false,
        numberOfChildren: 0, hasMixedGenderChildren: false, youngestChildAge: 99,
      },
    },
    {
      label: 'Test 2 — Jednoiposoban, mlada porodica',
      apartment: {
        id: 'APT-002', floor: 2, terraceRailingHeightCm: 110, cornerApartment: false, topFloor: false,
        roofInsulated: true, crossVentilation: false, structure: ApartmentStructure.ONE_AND_A_HALF_ROOM,
        totalNetUsableArea: 36.7, hasElectricalInstallation: true, hasWaterInstallation: true,
        heatingType: 'CENTRAL', openConceptLivingKitchen: false,
        rooms: [
          { id: 'R1', type: RoomType.LIVING_ROOM, length: 4.0, width: 3.0, clearHeight: 2.70, area: 12.0, totalGlazedArea: 1.80, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R2', type: RoomType.BEDROOM,     length: 3.5, width: 3.2, clearHeight: 2.70, area: 11.2, totalGlazedArea: 2.52, bedroomCapacity: 2, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R3', type: RoomType.KITCHEN,     length: 3.0, width: 2.5, clearHeight: 2.70, area:  7.5, totalGlazedArea: 1.20, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R4', type: RoomType.BATHROOM,    length: 2.0, width: 1.5, clearHeight: 2.70, area:  3.0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R5', type: RoomType.HALLWAY,     length: 2.5, width: 1.2, clearHeight: 2.70, area:  3.0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
        ],
        windows: [
          { roomId: 'R1', width: 1.5, height: 1.2, parapetHeight: 0.85, orientation: Orientation.SOUTH, glazedArea: 1.80 },
          { roomId: 'R2', width: 1.8, height: 1.4, parapetHeight: 0.90, orientation: Orientation.EAST,  glazedArea: 2.52 },
          { roomId: 'R3', width: 1.2, height: 1.0, parapetHeight: 0.90, orientation: Orientation.NORTH, glazedArea: 1.20 },
        ],
        kitchenWalls: [
          { id: 'KW1', roomId: 'R3', lengthCm: 150.0, modular60: false, modular30: true, nonModular: false },
        ],
        deadAreas: [],
      },
      building: {
        id: 'BLD-002', aboveGroundFloors: 4, hasElevator: true, elevatorCabinLengthCm: 140,
        elevatorCabinWidthCm: 110, elevatorDoorWidthCm: 90, totalApartments: 8,
        windbreakWidthCm: 135, corridorWidthCm: 145, staircaseWidthCm: 130, stairTreadCm: 28,
        stairRiserCm: 17, buildingType: BuildingType.STANDARD, hasUsagePermit: true, energyClass: 'C',
        hasParking: false, parkingWidthCm: 0, parkingLengthCm: 0, parkingType: 'OPEN', garageHeightCm: 0,
        hasRamp: false, rampSlopePercent: 0, rampWidthCm: 0, hasRampRestingPlatforms: false,
        accessible: false, stepsAtEntrance: 3, hasHandrailsOnStairs: false, entryDoorWidthCm: 90,
      },
      buyerProfile: {
        id: 'BP-002', type: BuyerProfileType.YOUNG_FAMILY, numberOfOccupants: 3, hasChildren: true,
        hasElderlyOrDisabled: false, maxBudgetEur: 90000, needsParking: false,
        prioritizesNaturalLight: true, prioritizesQuiet: true, acceptsRenovation: false,
        numberOfChildren: 1, hasMixedGenderChildren: false, youngestChildAge: 3,
      },
    },
    {
      label: 'Test 3 — Jednoiposoban, samac',
      apartment: {
        id: 'APT-003', floor: 6, terraceRailingHeightCm: 110, cornerApartment: true, topFloor: true,
        roofInsulated: false, crossVentilation: false, structure: ApartmentStructure.ONE_AND_A_HALF_ROOM,
        totalNetUsableArea: 38.0, hasElectricalInstallation: true, hasWaterInstallation: true,
        heatingType: 'CENTRAL', openConceptLivingKitchen: false,
        rooms: [
          { id: 'R1', type: RoomType.LIVING_ROOM, length: 4.0, width: 3.5, clearHeight: 2.70, area: 14.0, totalGlazedArea: 2.52, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R2', type: RoomType.BEDROOM,     length: 3.5, width: 3.0, clearHeight: 2.70, area: 10.5, totalGlazedArea: 2.10, bedroomCapacity: 1, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: true  },
          { id: 'R3', type: RoomType.KITCHEN,     length: 3.0, width: 2.5, clearHeight: 2.70, area:  7.5, totalGlazedArea: 1.44, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'R4', type: RoomType.BATHROOM,    length: 2.0, width: 1.5, clearHeight: 2.70, area:  3.0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: true,  facesNoisyStreet: false },
          { id: 'R5', type: RoomType.HALLWAY,     length: 2.5, width: 1.2, clearHeight: 2.70, area:  3.0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
        ],
        windows: [
          { roomId: 'R1', width: 1.8, height: 1.4, parapetHeight: 0.85, orientation: Orientation.NORTH, glazedArea: 2.52 },
          { roomId: 'R2', width: 1.5, height: 1.4, parapetHeight: 0.90, orientation: Orientation.NORTH, glazedArea: 2.10 },
          { roomId: 'R3', width: 1.2, height: 1.2, parapetHeight: 0.90, orientation: Orientation.NORTH, glazedArea: 1.44 },
        ],
        kitchenWalls: [
          { id: 'KW1', roomId: 'R3', lengthCm: 120.0, modular60: true, modular30: false, nonModular: false },
        ],
        deadAreas: [],
      },
      building: {
        id: 'BLD-003', aboveGroundFloors: 6, hasElevator: true, elevatorCabinLengthCm: 140,
        elevatorCabinWidthCm: 110, elevatorDoorWidthCm: 90, totalApartments: 12,
        windbreakWidthCm: 140, corridorWidthCm: 145, staircaseWidthCm: 130, stairTreadCm: 28,
        stairRiserCm: 17, buildingType: BuildingType.STANDARD, hasUsagePermit: true, energyClass: 'C',
        hasParking: false, parkingWidthCm: 0, parkingLengthCm: 0, parkingType: 'OPEN', garageHeightCm: 0,
        hasRamp: false, rampSlopePercent: 0, rampWidthCm: 0, hasRampRestingPlatforms: false,
        accessible: false, stepsAtEntrance: 3, hasHandrailsOnStairs: false, entryDoorWidthCm: 90,
      },
      buyerProfile: {
        id: 'BP-003', type: BuyerProfileType.SINGLE, numberOfOccupants: 1, hasChildren: false,
        hasElderlyOrDisabled: false, maxBudgetEur: 70000, needsParking: false,
        prioritizesNaturalLight: false, prioritizesQuiet: false, acceptsRenovation: true,
        numberOfChildren: 0, hasMixedGenderChildren: false, youngestChildAge: 99,
      },
    },
    {
      label: 'Test 4 — Backward: potencijal za visok komfor',
      queryName: 'potencijalZaVisokKomfor',
      apartment: {
        id: 'apt-pk1', floor: 3, terraceRailingHeightCm: 100, cornerApartment: false, topFloor: false,
        roofInsulated: false, crossVentilation: false, structure: ApartmentStructure.ONE_AND_A_HALF_ROOM,
        totalNetUsableArea: 54.5, hasElectricalInstallation: true, hasWaterInstallation: true,
        heatingType: 'CENTRAL', openConceptLivingKitchen: false,
        rooms: [
          { id: 'r1', type: RoomType.LIVING_ROOM, length: 5.5, width: 4.0, clearHeight: 2.7, area: 0, totalGlazedArea: 2.10, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r2', type: RoomType.BEDROOM,     length: 4.0, width: 3.5, clearHeight: 2.7, area: 0, totalGlazedArea: 0,    bedroomCapacity: 2, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r3', type: RoomType.KITCHEN,     length: 3.5, width: 3.0, clearHeight: 2.7, area: 0, totalGlazedArea: 1.44, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r4', type: RoomType.BATHROOM,    length: 2.5, width: 2.0, clearHeight: 2.7, area: 0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r5', type: RoomType.HALLWAY,     length: 2.0, width: 1.5, clearHeight: 2.7, area: 0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
        ],
        windows: [
          { roomId: 'r1', width: 1.5, height: 1.4, parapetHeight: 0.9, orientation: Orientation.SOUTH, glazedArea: 2.10 },
          { roomId: 'r3', width: 1.2, height: 1.2, parapetHeight: 0.9, orientation: Orientation.EAST,  glazedArea: 1.44 },
        ],
        kitchenWalls: [
          { id: 'kw1', roomId: 'r3', lengthCm: 240, modular60: false, modular30: false, nonModular: false },
        ],
        deadAreas: [],
      },
      building: {
        id: 'bld-pk1', aboveGroundFloors: 5, hasElevator: true, elevatorCabinLengthCm: 140,
        elevatorCabinWidthCm: 110, elevatorDoorWidthCm: 90, totalApartments: 20,
        windbreakWidthCm: 150, corridorWidthCm: 160, staircaseWidthCm: 130, stairTreadCm: 28,
        stairRiserCm: 17, buildingType: BuildingType.STANDARD, hasUsagePermit: true, energyClass: 'B',
        hasParking: false, parkingWidthCm: 0, parkingLengthCm: 0, parkingType: 'OPEN', garageHeightCm: 0,
        hasRamp: false, rampSlopePercent: 0, rampWidthCm: 0, hasRampRestingPlatforms: false,
        accessible: false, stepsAtEntrance: 0, hasHandrailsOnStairs: true, entryDoorWidthCm: 100,
      },
      buyerProfile: {
        id: 'BP-PKQ1', type: BuyerProfileType.COUPLE, numberOfOccupants: 2, hasChildren: false,
        hasElderlyOrDisabled: false, maxBudgetEur: 100000, needsParking: false,
        prioritizesNaturalLight: false, prioritizesQuiet: false, acceptsRenovation: false,
        numberOfChildren: 0, hasMixedGenderChildren: false, youngestChildAge: 99,
      },
    },
    {
      label: 'Test 5 — Backward: garsonjera, socijalna zgrada',
      queryName: 'potencijalZaVisokKomfor',
      apartment: {
        id: 'apt-pk2', floor: 1, terraceRailingHeightCm: 0, cornerApartment: false, topFloor: false,
        roofInsulated: false, crossVentilation: false, structure: ApartmentStructure.STUDIO,
        totalNetUsableArea: 24.5, hasElectricalInstallation: true, hasWaterInstallation: true,
        heatingType: 'NONE', openConceptLivingKitchen: false,
        rooms: [
          { id: 'r1', type: RoomType.LIVING_ROOM, length: 4.0, width: 3.5, clearHeight: 2.6, area: 0, totalGlazedArea: 1.44, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r2', type: RoomType.KITCHEN,     length: 3.0, width: 2.5, clearHeight: 2.6, area: 0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r3', type: RoomType.BATHROOM,    length: 2.0, width: 1.5, clearHeight: 2.6, area: 0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
        ],
        windows: [
          { roomId: 'r1', width: 1.2, height: 1.2, parapetHeight: 0.9, orientation: Orientation.NORTH, glazedArea: 1.44 },
        ],
        kitchenWalls: [],
        deadAreas: [],
      },
      building: {
        id: 'bld-pk2', aboveGroundFloors: 3, hasElevator: false, elevatorCabinLengthCm: 0,
        elevatorCabinWidthCm: 0, elevatorDoorWidthCm: 0, totalApartments: 6,
        windbreakWidthCm: 120, corridorWidthCm: 130, staircaseWidthCm: 120, stairTreadCm: 26,
        stairRiserCm: 18, buildingType: BuildingType.SOCIAL, hasUsagePermit: true, energyClass: 'E',
        hasParking: false, parkingWidthCm: 0, parkingLengthCm: 0, parkingType: 'OPEN', garageHeightCm: 0,
        hasRamp: false, rampSlopePercent: 0, rampWidthCm: 0, hasRampRestingPlatforms: false,
        accessible: false, stepsAtEntrance: 2, hasHandrailsOnStairs: false, entryDoorWidthCm: 85,
      },
      buyerProfile: {
        id: 'BP-PKQ2', type: BuyerProfileType.COUPLE, numberOfOccupants: 2, hasChildren: false,
        hasElderlyOrDisabled: false, maxBudgetEur: 100000, needsParking: false,
        prioritizesNaturalLight: false, prioritizesQuiet: false, acceptsRenovation: false,
        numberOfChildren: 0, hasMixedGenderChildren: false, youngestChildAge: 99,
      },
    },
    {
      label: 'Test 6 — Backward: bez el. instalacije, toplotna pumpa',
      queryName: 'potencijalZaVisokKomfor',
      apartment: {
        id: 'apt-pk3', floor: 4, terraceRailingHeightCm: 110, cornerApartment: false, topFloor: false,
        roofInsulated: false, crossVentilation: false, structure: ApartmentStructure.THREE_ROOM,
        totalNetUsableArea: 68.75, hasElectricalInstallation: false, hasWaterInstallation: true,
        heatingType: 'HEAT_PUMP', openConceptLivingKitchen: false,
        rooms: [
          { id: 'r1', type: RoomType.LIVING_ROOM, length: 5.0, width: 5.0, clearHeight: 2.8, area: 0, totalGlazedArea: 3.0,  bedroomCapacity: 0, walkThrough: true,  hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r2', type: RoomType.BEDROOM,     length: 4.0, width: 4.0, clearHeight: 2.8, area: 0, totalGlazedArea: 0,    bedroomCapacity: 2, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r3', type: RoomType.BEDROOM,     length: 3.5, width: 3.5, clearHeight: 2.8, area: 0, totalGlazedArea: 0,    bedroomCapacity: 1, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r4', type: RoomType.KITCHEN,     length: 3.5, width: 3.0, clearHeight: 2.8, area: 0, totalGlazedArea: 1.44, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r5', type: RoomType.BATHROOM,    length: 2.5, width: 2.0, clearHeight: 2.8, area: 0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
        ],
        windows: [
          { roomId: 'r1', width: 2.0, height: 1.5, parapetHeight: 0.9, orientation: Orientation.SOUTH, glazedArea: 3.0  },
          { roomId: 'r4', width: 1.2, height: 1.2, parapetHeight: 0.9, orientation: Orientation.EAST,  glazedArea: 1.44 },
        ],
        kitchenWalls: [
          { id: 'kw1', roomId: 'r4', lengthCm: 300, modular60: false, modular30: false, nonModular: false },
        ],
        deadAreas: [],
      },
      building: {
        id: 'bld-pk3', aboveGroundFloors: 6, hasElevator: true, elevatorCabinLengthCm: 140,
        elevatorCabinWidthCm: 110, elevatorDoorWidthCm: 90, totalApartments: 24,
        windbreakWidthCm: 160, corridorWidthCm: 170, staircaseWidthCm: 140, stairTreadCm: 29,
        stairRiserCm: 16, buildingType: BuildingType.STANDARD, hasUsagePermit: true, energyClass: 'C',
        hasParking: false, parkingWidthCm: 0, parkingLengthCm: 0, parkingType: 'OPEN', garageHeightCm: 0,
        hasRamp: false, rampSlopePercent: 0, rampWidthCm: 0, hasRampRestingPlatforms: false,
        accessible: false, stepsAtEntrance: 0, hasHandrailsOnStairs: true, entryDoorWidthCm: 100,
      },
      buyerProfile: {
        id: 'BP-PKQ3', type: BuyerProfileType.COUPLE, numberOfOccupants: 2, hasChildren: false,
        hasElderlyOrDisabled: false, maxBudgetEur: 100000, needsParking: false,
        prioritizesNaturalLight: false, prioritizesQuiet: false, acceptsRenovation: false,
        numberOfChildren: 0, hasMixedGenderChildren: false, youngestChildAge: 99,
      },
    },
    {
      label: 'Test 7 — Backward: stan pogodan za porodicu',
      queryName: 'stanPogodanZaPorodicu',
      apartment: {
        id: 'apt-sp1', floor: 2, terraceRailingHeightCm: 110, cornerApartment: false, topFloor: false,
        roofInsulated: false, crossVentilation: false, structure: ApartmentStructure.THREE_ROOM,
        totalNetUsableArea: 64.75, hasElectricalInstallation: true, hasWaterInstallation: true,
        heatingType: 'CENTRAL', openConceptLivingKitchen: true,
        rooms: [
          { id: 'r1', type: RoomType.LIVING_ROOM, length: 5.5, width: 4.5, clearHeight: 2.7, area: 0, totalGlazedArea: 3.0,  bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r2', type: RoomType.BEDROOM,     length: 4.0, width: 3.5, clearHeight: 2.7, area: 0, totalGlazedArea: 0,    bedroomCapacity: 2, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r3', type: RoomType.BEDROOM,     length: 3.5, width: 3.0, clearHeight: 2.7, area: 0, totalGlazedArea: 0,    bedroomCapacity: 1, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r4', type: RoomType.KITCHEN,     length: 3.5, width: 3.0, clearHeight: 2.7, area: 0, totalGlazedArea: 1.44, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r5', type: RoomType.BATHROOM,    length: 2.5, width: 2.0, clearHeight: 2.7, area: 0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
        ],
        windows: [
          { roomId: 'r1', width: 2.0, height: 1.5, parapetHeight: 0.9, orientation: Orientation.SOUTH, glazedArea: 3.0  },
          { roomId: 'r4', width: 1.2, height: 1.2, parapetHeight: 0.9, orientation: Orientation.WEST,  glazedArea: 1.44 },
        ],
        kitchenWalls: [
          { id: 'kw1', roomId: 'r4', lengthCm: 240, modular60: false, modular30: false, nonModular: false },
        ],
        deadAreas: [],
      },
      building: {
        id: 'bld-sp1', aboveGroundFloors: 4, hasElevator: true, elevatorCabinLengthCm: 140,
        elevatorCabinWidthCm: 110, elevatorDoorWidthCm: 95, totalApartments: 16,
        windbreakWidthCm: 150, corridorWidthCm: 160, staircaseWidthCm: 130, stairTreadCm: 28,
        stairRiserCm: 17, buildingType: BuildingType.STANDARD, hasUsagePermit: true, energyClass: 'B',
        hasParking: true, parkingWidthCm: 250, parkingLengthCm: 510, parkingType: 'OPEN', garageHeightCm: 0,
        hasRamp: false, rampSlopePercent: 0, rampWidthCm: 0, hasRampRestingPlatforms: false,
        accessible: false, stepsAtEntrance: 0, hasHandrailsOnStairs: true, entryDoorWidthCm: 100,
      },
      buyerProfile: {
        id: 'bp-sp1', type: BuyerProfileType.YOUNG_FAMILY, numberOfOccupants: 4, hasChildren: true,
        hasElderlyOrDisabled: false, maxBudgetEur: 120000, needsParking: true,
        prioritizesNaturalLight: true, prioritizesQuiet: false, acceptsRenovation: false,
        numberOfChildren: 2, hasMixedGenderChildren: false, youngestChildAge: 3,
      },
    },
    {
      label: 'Test 8 — Backward: stan pogodan za porodicu (loš)',
      queryName: 'stanPogodanZaPorodicu',
      apartment: {
        id: 'apt-sp2', floor: 8, terraceRailingHeightCm: 100, cornerApartment: false, topFloor: false,
        roofInsulated: false, crossVentilation: false, structure: ApartmentStructure.THREE_ROOM,
        totalNetUsableArea: 39.6, hasElectricalInstallation: true, hasWaterInstallation: true,
        heatingType: 'INDIVIDUAL', openConceptLivingKitchen: false,
        rooms: [
          { id: 'r1', type: RoomType.LIVING_ROOM, length: 3.5, width: 3.0, clearHeight: 2.6, area: 0, totalGlazedArea: 1.44, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r2', type: RoomType.BEDROOM,     length: 3.5, width: 3.0, clearHeight: 2.6, area: 0, totalGlazedArea: 0,    bedroomCapacity: 2, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r3', type: RoomType.BEDROOM,     length: 3.0, width: 2.8, clearHeight: 2.6, area: 0, totalGlazedArea: 0,    bedroomCapacity: 1, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r4', type: RoomType.KITCHEN,     length: 3.0, width: 2.5, clearHeight: 2.6, area: 0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
          { id: 'r5', type: RoomType.BATHROOM,    length: 1.8, width: 1.5, clearHeight: 2.6, area: 0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false },
        ],
        windows: [
          { roomId: 'r1', width: 1.2, height: 1.2, parapetHeight: 0.9, orientation: Orientation.NORTH, glazedArea: 1.44 },
        ],
        kitchenWalls: [],
        deadAreas: [],
      },
      building: {
        id: 'bld-sp2', aboveGroundFloors: 10, hasElevator: false, elevatorCabinLengthCm: 0,
        elevatorCabinWidthCm: 0, elevatorDoorWidthCm: 0, totalApartments: 40,
        windbreakWidthCm: 120, corridorWidthCm: 130, staircaseWidthCm: 120,
        stairTreadCm: 25, stairRiserCm: 20, buildingType: BuildingType.SOCIAL,
        hasUsagePermit: true, energyClass: 'F',
        hasParking: false, parkingWidthCm: 0, parkingLengthCm: 0, parkingType: 'NONE', garageHeightCm: 0,
        hasRamp: false, rampSlopePercent: 0, rampWidthCm: 0, hasRampRestingPlatforms: false,
        accessible: false, stepsAtEntrance: 4, hasHandrailsOnStairs: false, entryDoorWidthCm: 80,
      },
      buyerProfile: {
        id: 'bp-sp2', type: BuyerProfileType.FAMILY, numberOfOccupants: 5, hasChildren: true,
        hasElderlyOrDisabled: false, maxBudgetEur: 80000, needsParking: false,
        prioritizesNaturalLight: false, prioritizesQuiet: false, acceptsRenovation: true,
        numberOfChildren: 3, hasMixedGenderChildren: true, youngestChildAge: 12,
      },
    },
    // ── TEST 9 — Rekurzivni backward: buka ────────────────────────────────────
    // Dnevna soba gleda na bulevar (72 dB), izolacija zida 30 dB → 42 dB u sobi.
    // Spavaća soba: 42 - 15 (hodnik) - 20 (soba vrata) = 7 dB ≤ 35 dB → OK
    // Dnevna soba: 42 dB > 40 dB → PROBLEM (rekurzija ne pronalazi put)
    // Kuhinja: 42 - 15 (hodnik) = 27 dB ≤ 45 dB → OK
    {
      label: 'Test 9 — Backward: buka uz prometnu ulicu',
      queryName: 'bukaProhvatljiva',
      apartment: {
        id: 'apt-buka1', floor: 3, terraceRailingHeightCm: 110, cornerApartment: false,
        topFloor: false, roofInsulated: true, crossVentilation: false,
        structure: ApartmentStructure.TWO_ROOM,
        totalNetUsableArea: 55.0, hasElectricalInstallation: true, hasWaterInstallation: true,
        heatingType: 'CENTRAL', openConceptLivingKitchen: false,
        noiseSource: { name: 'Bulevar Despota Stefana', noiseLevelDB: 72 },
        rooms: [
          { id: 'r-dnevna',  type: RoomType.LIVING_ROOM, length: 5.0, width: 4.0, clearHeight: 2.7, area: 20.0, totalGlazedArea: 2.52, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: true,  wallInsulationDB: 30, hasDirectExit: false, doorWidthCm: 90 },
          { id: 'r-hodnik',  type: RoomType.HALLWAY,     length: 3.0, width: 1.3, clearHeight: 2.7, area:  3.9, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false, wallInsulationDB: 0,  hasDirectExit: false, doorWidthCm: 90 },
          { id: 'r-spavaca', type: RoomType.BEDROOM,     length: 4.0, width: 3.5, clearHeight: 2.7, area: 14.0, totalGlazedArea: 2.10, bedroomCapacity: 2, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false, wallInsulationDB: 0,  hasDirectExit: false, doorWidthCm: 90 },
          { id: 'r-kuhinja', type: RoomType.KITCHEN,     length: 3.5, width: 3.0, clearHeight: 2.7, area: 10.5, totalGlazedArea: 1.44, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false, wallInsulationDB: 0,  hasDirectExit: false, doorWidthCm: 90 },
          { id: 'r-kupatilo',type: RoomType.BATHROOM,    length: 2.5, width: 2.0, clearHeight: 2.7, area:  5.0, totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: true,  facesNoisyStreet: false, wallInsulationDB: 0,  hasDirectExit: false, doorWidthCm: 90 },
        ],
        windows: [
          { roomId: 'r-dnevna',  width: 1.8, height: 1.4, parapetHeight: 0.85, orientation: Orientation.NORTH, glazedArea: 2.52 },
          { roomId: 'r-spavaca', width: 1.5, height: 1.4, parapetHeight: 0.90, orientation: Orientation.SOUTH, glazedArea: 2.10 },
          { roomId: 'r-kuhinja', width: 1.2, height: 1.2, parapetHeight: 0.90, orientation: Orientation.SOUTH, glazedArea: 1.44 },
        ],
        kitchenWalls: [
          { id: 'kw1', roomId: 'r-kuhinja', lengthCm: 240, modular60: true, modular30: false, nonModular: false },
        ],
        deadAreas: [],
        // Veze za backward chaining buke (smer: od izolovane sobe ka bučnoj)
        // spavaća→hodnik→dnevna i kuhinja→hodnik→dnevna
        roomConnections: [
          { roomIdA: 'r-spavaca', roomIdB: 'r-hodnik',  doorWidthCm: 95, lockedDoors: false, doorInsulationDB: 20 },
          { roomIdA: 'r-hodnik',  roomIdB: 'r-dnevna',  doorWidthCm: 90, lockedDoors: false, doorInsulationDB: 15 },
          { roomIdA: 'r-kuhinja', roomIdB: 'r-hodnik',  doorWidthCm: 90, lockedDoors: false, doorInsulationDB: 15 },
        ],
      },
      building: {
        id: 'bld-buka1', aboveGroundFloors: 5, hasElevator: true, elevatorCabinLengthCm: 140,
        elevatorCabinWidthCm: 110, elevatorDoorWidthCm: 90, totalApartments: 20,
        windbreakWidthCm: 140, corridorWidthCm: 150, staircaseWidthCm: 130, stairTreadCm: 28,
        stairRiserCm: 17, buildingType: BuildingType.STANDARD, hasUsagePermit: true, energyClass: 'B',
        hasParking: false, parkingWidthCm: 0, parkingLengthCm: 0, parkingType: 'OPEN', garageHeightCm: 0,
        hasRamp: false, rampSlopePercent: 0, rampWidthCm: 0, hasRampRestingPlatforms: false,
        accessible: false, stepsAtEntrance: 0, hasHandrailsOnStairs: true, entryDoorWidthCm: 100,
      },
      buyerProfile: {
        id: 'bp-buka1', type: BuyerProfileType.COUPLE, numberOfOccupants: 2, hasChildren: false,
        hasElderlyOrDisabled: false, maxBudgetEur: 120000, needsParking: false,
        prioritizesNaturalLight: true, prioritizesQuiet: true, acceptsRenovation: false,
        numberOfChildren: 0, hasMixedGenderChildren: false, youngestChildAge: 99,
      },
    },
    // ── TEST 10 — Rekurzivni backward: evakuacioni put ────────────────────────
    // Predsoblje ima direktan izlaz. Sve sobe vode kroz hodnik do predsoblja.
    // Izuzetak: spavaća2 ima BLOKIRAN prolaz prema hodniku → nema bezbedan izlaz.
    {
      label: 'Test 10 — Backward: evakuacioni put (jedna soba blokirana)',
      queryName: 'imaBezbedanIzlaz',
      apartment: {
        id: 'apt-evak1', floor: 4, terraceRailingHeightCm: 110, cornerApartment: false,
        topFloor: false, roofInsulated: true, crossVentilation: false,
        structure: ApartmentStructure.THREE_ROOM,
        totalNetUsableArea: 72.0, hasElectricalInstallation: true, hasWaterInstallation: true,
        heatingType: 'CENTRAL', openConceptLivingKitchen: false,
        rooms: [
          { id: 'r-predsoblje', type: RoomType.ENTRANCE_LOBBY, length: 2.0, width: 2.0, clearHeight: 2.7, area: 4.0,  totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false, hasDirectExit: true,  doorWidthCm: 100, wallInsulationDB: 0 },
          { id: 'r-hodnik',     type: RoomType.HALLWAY,        length: 4.0, width: 1.3, clearHeight: 2.7, area: 5.2,  totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false, hasDirectExit: false, doorWidthCm: 90,  wallInsulationDB: 0 },
          { id: 'r-dnevna',    type: RoomType.LIVING_ROOM,     length: 5.5, width: 4.5, clearHeight: 2.7, area: 24.75,totalGlazedArea: 3.5,  bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false, hasDirectExit: false, doorWidthCm: 90,  wallInsulationDB: 0 },
          { id: 'r-spavaca1',  type: RoomType.BEDROOM,         length: 4.0, width: 3.5, clearHeight: 2.7, area: 14.0, totalGlazedArea: 2.10, bedroomCapacity: 2, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false, hasDirectExit: false, doorWidthCm: 90,  wallInsulationDB: 0 },
          { id: 'r-spavaca2',  type: RoomType.BEDROOM,         length: 3.5, width: 3.0, clearHeight: 2.7, area: 10.5, totalGlazedArea: 2.10, bedroomCapacity: 1, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false, hasDirectExit: false, doorWidthCm: 90,  wallInsulationDB: 0 },
          { id: 'r-kuhinja',   type: RoomType.KITCHEN,         length: 3.5, width: 3.0, clearHeight: 2.7, area: 10.5, totalGlazedArea: 1.44, bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: false, facesNoisyStreet: false, hasDirectExit: false, doorWidthCm: 90,  wallInsulationDB: 0 },
          { id: 'r-kupatilo',  type: RoomType.BATHROOM,        length: 2.5, width: 2.0, clearHeight: 2.7, area: 5.0,  totalGlazedArea: 0,    bedroomCapacity: 0, walkThrough: false, hasMechanicalVentilation: true,  facesNoisyStreet: false, hasDirectExit: false, doorWidthCm: 90,  wallInsulationDB: 0 },
        ],
        windows: [
          { roomId: 'r-dnevna',   width: 2.0, height: 1.5, parapetHeight: 0.9, orientation: Orientation.SOUTH, glazedArea: 3.0  },
          { roomId: 'r-spavaca1', width: 1.5, height: 1.4, parapetHeight: 0.9, orientation: Orientation.EAST,  glazedArea: 2.10 },
          { roomId: 'r-spavaca2', width: 1.5, height: 1.4, parapetHeight: 0.9, orientation: Orientation.EAST,  glazedArea: 2.10 },
          { roomId: 'r-kuhinja',  width: 1.2, height: 1.2, parapetHeight: 0.9, orientation: Orientation.WEST,  glazedArea: 1.44 },
        ],
        kitchenWalls: [
          { id: 'kw1', roomId: 'r-kuhinja', lengthCm: 240, modular60: true, modular30: false, nonModular: false },
        ],
        deadAreas: [],
        // Veze za evakuaciju (smer: od sobe prema izlazu)
        // spavaća2 ima BLOKIRAN prolaz → neće imati bezbedan izlaz
        roomConnections: [
          { roomIdA: 'r-hodnik',    roomIdB: 'r-predsoblje', doorWidthCm: 100, lockedDoors: false, doorInsulationDB: 10 },
          { roomIdA: 'r-dnevna',    roomIdB: 'r-hodnik',     doorWidthCm: 100, lockedDoors: false, doorInsulationDB: 15 },
          { roomIdA: 'r-spavaca1',  roomIdB: 'r-hodnik',     doorWidthCm: 95,  lockedDoors: false, doorInsulationDB: 20 },
          { roomIdA: 'r-spavaca2',  roomIdB: 'r-hodnik',     doorWidthCm: 90,  lockedDoors: true,  doorInsulationDB: 20 },
          { roomIdA: 'r-kuhinja',   roomIdB: 'r-hodnik',     doorWidthCm: 90,  lockedDoors: false, doorInsulationDB: 15 },
          { roomIdA: 'r-kupatilo',  roomIdB: 'r-hodnik',     doorWidthCm: 90,  lockedDoors: false, doorInsulationDB: 20 },
        ],
      },
      building: {
        id: 'bld-evak1', aboveGroundFloors: 6, hasElevator: true, elevatorCabinLengthCm: 140,
        elevatorCabinWidthCm: 110, elevatorDoorWidthCm: 90, totalApartments: 24,
        windbreakWidthCm: 150, corridorWidthCm: 160, staircaseWidthCm: 130, stairTreadCm: 28,
        stairRiserCm: 17, buildingType: BuildingType.STANDARD, hasUsagePermit: true, energyClass: 'B',
        hasParking: false, parkingWidthCm: 0, parkingLengthCm: 0, parkingType: 'OPEN', garageHeightCm: 0,
        hasRamp: false, rampSlopePercent: 0, rampWidthCm: 0, hasRampRestingPlatforms: false,
        accessible: false, stepsAtEntrance: 0, hasHandrailsOnStairs: true, entryDoorWidthCm: 100,
      },
      buyerProfile: {
        id: 'bp-evak1', type: BuyerProfileType.FAMILY, numberOfOccupants: 4, hasChildren: true,
        hasElderlyOrDisabled: false, maxBudgetEur: 140000, needsParking: false,
        prioritizesNaturalLight: true, prioritizesQuiet: false, acceptsRenovation: false,
        numberOfChildren: 2, hasMixedGenderChildren: false, youngestChildAge: 7,
      },
    },
  ];

  loadTestData() {
    const tc = this.testCases[this.selectedTestIndex];
    this.apartment    = JSON.parse(JSON.stringify(tc.apartment));
    this.building     = JSON.parse(JSON.stringify(tc.building));
    this.buyerProfile = JSON.parse(JSON.stringify(tc.buyerProfile));
    if (!this.apartment.roomConnections) this.apartment.roomConnections = [];
    this.noiseSourceEnabled = !!this.apartment.noiseSource;
    if (tc.queryName) {
      this.selectedQuery = tc.queryName;
    }
    this.currentStep = 1;
    this.error = null;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  evaluate() {
    this.isLoading = true;
    this.error = null;
    this.apartmentService
      .evaluate({ apartment: this.apartment, building: this.building, buyerProfile: this.buyerProfile })
      .subscribe({
        next: (result) => {
          this.resultsService.setEvaluationResult(result);
          this.router.navigate(['/rezultati']);
        },
        error: (err) => {
          this.error = err.message ?? 'Greška pri komunikaciji sa serverom.';
          this.isLoading = false;
        },
        complete: () => (this.isLoading = false),
      });
  }

  runBackwardQuery() {
    this.isLoading = true;
    this.error = null;
    this.apartmentService
      .backwardQuery({
        apartment: this.apartment,
        building: this.building,
        buyerProfile: this.buyerProfile,
        queryName: this.selectedQuery,
      })
      .subscribe({
        next: (result) => {
          this.resultsService.setBackwardResult(result);
          this.router.navigate(['/rezultati']);
        },
        error: (err) => {
          this.error = err.message ?? 'Greška pri komunikaciji sa serverom.';
          this.isLoading = false;
        },
        complete: () => (this.isLoading = false),
      });
  }

  labelForRoomType(type: RoomType): string {
    const labels: Record<RoomType, string> = {
      LIVING_ROOM: 'Dnevna soba',
      BEDROOM: 'Spavaća soba',
      KITCHEN: 'Kuhinja',
      BATHROOM: 'Kupatilo',
      TOILET: 'WC',
      HALLWAY: 'Hodnik',
      STORAGE: 'Ostava',
      ENTRANCE_LOBBY: 'Predsoblje',
      BALCONY: 'Balkon',
      LOGGIA: 'Loggia',
    };
    return labels[type] ?? type;
  }

  labelForStructure(s: ApartmentStructure): string {
    const labels: Record<ApartmentStructure, string> = {
      STUDIO: 'Garsonjera',
      ONE_ROOM: 'Jednosoban',
      ONE_AND_A_HALF_ROOM: 'Jednoiposoban',
      TWO_ROOM: 'Dvosoban',
      TWO_AND_A_HALF_ROOM: 'Dvoiposoban',
      THREE_ROOM: 'Trosoban',
      THREE_AND_A_HALF_ROOM: 'Troiposoban',
      FOUR_ROOM: 'Četvorosoban',
      FOUR_AND_A_HALF_ROOM: 'Četvoroiposoban',
    };
    return labels[s] ?? s;
  }

  labelForBuildingType(t: BuildingType): string {
    const labels: Record<BuildingType, string> = {
      STANDARD: 'Standardna stambena',
      SOCIAL: 'Socijalno stanovanje',
      MIXED: 'Mešovita',
      LUXURY: 'Luksuzna',
    };
    return labels[t] ?? t;
  }

  labelForBuyerType(t: BuyerProfileType): string {
    const labels: Record<BuyerProfileType, string> = {
      SINGLE: 'Samac',
      COUPLE: 'Par',
      YOUNG_FAMILY: 'Mlada porodica',
      FAMILY: 'Porodica',
      LARGE_FAMILY: 'Velika porodica',
      RETIREE: 'Penzioner',
      INVESTOR: 'Investitor',
    };
    return labels[t] ?? t;
  }

  labelForOrientation(o: Orientation): string {
    const labels: Record<Orientation, string> = {
      NORTH: 'Sever',
      SOUTH: 'Jug',
      EAST: 'Istok',
      WEST: 'Zapad',
      NORTHEAST: 'Severoistok',
      NORTHWEST: 'Severozapad',
      SOUTHEAST: 'Jugoistok',
      SOUTHWEST: 'Jugozapad',
    };
    return labels[o] ?? o;
  }

  labelForHeating(h: string): string {
    const labels: Record<string, string> = {
      CENTRAL: 'Centralno grejanje',
      HEAT_PUMP: 'Toplotna pumpa',
      TA_FURNACE: 'TA peć',
      INDIVIDUAL: 'Individualno',
      NONE: 'Bez grejanja',
    };
    return labels[h] ?? h;
  }

  labelForParkingType(p: string): string {
    const labels: Record<string, string> = {
      OPEN: 'Otvoreni parking',
      COVERED: 'Natkriveni parking',
      GARAGE: 'Garaža',
    };
    return labels[p] ?? p;
  }

  trackByIndex(index: number): number {
    return index;
  }
}

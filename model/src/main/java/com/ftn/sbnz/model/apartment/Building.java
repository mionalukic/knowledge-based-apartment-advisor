package com.ftn.sbnz.model.apartment;

import lombok.Data;

@Data
public class Building {

    private String id;

    private int aboveGroundFloors;
    private boolean hasElevator;
    private int elevatorCabinLengthCm;
    private int elevatorCabinWidthCm;
    private int elevatorDoorWidthCm;

    private int totalApartments;
    private int windbreakWidthCm;

    private int corridorWidthCm;

    private int staircaseWidthCm;
    private int stairTreadCm;
    private int stairRiserCm;

    private BuildingType buildingType;

    private boolean hasUsagePermit;
    private String energyClass;

    private boolean hasParking;
    private int parkingWidthCm;
    private int parkingLengthCm;
    private String parkingType;
    private int garageHeightCm;

    private boolean hasRamp;
    private double rampSlopePercent;
    private int rampWidthCm;
    private boolean hasRampRestingPlatforms;
    private boolean accessible;
}
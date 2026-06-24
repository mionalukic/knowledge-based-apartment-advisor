package com.ftn.sbnz.model.apartment;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class Apartment {

    private String id;

    private List<Room> rooms = new ArrayList<>();
    private List<Window> windows = new ArrayList<>();
    private List<KitchenWall> kitchenWalls = new ArrayList<>();
    private List<DeadArea> deadAreas = new ArrayList<>();
    private List<RoomConnection> roomConnections = new ArrayList<>();

    // Izvor buke u okruzenju stana (null = nema poznatog izvora buke)
    private NoiseSource noiseSource;

    private double totalNetUsableArea;
    private boolean crossVentilation;
    private ApartmentStructure structure;

    private int floor;
    private int terraceRailingHeightCm;
    private boolean cornerApartment;
    private boolean topFloor;
    private boolean roofInsulated;

    private ComfortClass comfortClass;

    // Instalacije i grejanje (za backward chaining)
    private boolean hasElectricalInstallation = true;
    private boolean hasWaterInstallation = true;
    // Vrednosti: CENTRAL, HEAT_PUMP, TA_FURNACE, INDIVIDUAL, NONE
    private String heatingType = "NONE";
    private boolean openConceptLivingKitchen = false;
}
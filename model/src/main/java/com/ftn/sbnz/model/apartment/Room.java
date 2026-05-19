package com.ftn.sbnz.model.apartment;

import lombok.Data;

@Data
public class Room {

    private String id;
    private RoomType type;
    private double length;
    private double width;
    private double clearHeight;
    private double area;
    private double totalGlazedArea;
    private int bedroomCapacity;
    private boolean walkThrough;
    private boolean hasMechanicalVentilation;
    private boolean facesNoisyStreet;
}
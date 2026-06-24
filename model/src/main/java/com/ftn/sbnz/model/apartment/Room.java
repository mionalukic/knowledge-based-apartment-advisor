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

    // Za rekurzivni upit buke
    private double wallInsulationDB;     // koliko dB spoljni zid redukuje (0 ako nema spoljnog zida)

    // Za rekurzivni upit evakuacije
    private boolean hasDirectExit;       // direktan izlaz na stepeniste/spolja
    private double doorWidthCm;          // sirina izlaznih vrata (relevantno kad hasDirectExit == true)
}
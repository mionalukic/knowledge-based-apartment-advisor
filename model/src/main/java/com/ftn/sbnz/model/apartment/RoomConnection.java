package com.ftn.sbnz.model.apartment;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// Veza izmedju dve prostorije — unesena kao dvosmerna (dodati A→B i B→A)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomConnection {

    private String roomIdA;
    private String roomIdB;

    // Za evakuacioni upit: sirina prolaza izmedju soba
    private double doorWidthCm;

    // Da li je prolaz blokiran/zakljucan
    private boolean lockedDoors;

    // Za upit buke: zvucna izolacija vrata izmedju soba (dB)
    private double doorInsulationDB;
}
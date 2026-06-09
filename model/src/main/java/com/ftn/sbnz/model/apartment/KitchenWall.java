package com.ftn.sbnz.model.apartment;

import lombok.Data;

@Data
public class KitchenWall {

    private String id;
    private String roomId;
    private double lengthCm;
    private boolean modular30;
    private boolean modular60;
    private boolean nonModular;
}
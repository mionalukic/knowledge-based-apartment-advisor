package com.ftn.sbnz.model.apartment;

import lombok.Data;

@Data
public class BuyerProfile {

    private String id;
    private BuyerProfileType type;
    private int numberOfOccupants;
    private boolean hasChildren;
    private boolean hasElderlyOrDisabled;
    private double maxBudgetEur;
    private boolean needsParking;
    private boolean prioritizesNaturalLight;
    private boolean prioritizesQuiet;
    private boolean acceptsRenovation;

    private int numberOfChildren;
    private boolean hasMixedGenderChildren;
    private int youngestChildAge = 99;
}
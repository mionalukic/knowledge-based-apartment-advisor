package com.ftn.sbnz.model.apartment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Violation {

    private String articleReference;
    private String roomId;
    private String description;
    private double deficitValue;
    private String deficitUnit;
    private double estimatedRepairCost;
    private boolean critical;
}
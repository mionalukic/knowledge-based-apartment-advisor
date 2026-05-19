package com.ftn.sbnz.model.apartment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Warning {

    private String code;
    private String roomId;
    private String description;
    private double estimatedExtraCost;
}
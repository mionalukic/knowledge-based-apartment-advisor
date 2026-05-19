package com.ftn.sbnz.model.apartment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {

    private String code;
    private String description;
    private double estimatedSavingEur;
}
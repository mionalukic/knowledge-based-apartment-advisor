package com.ftn.sbnz.model.apartment;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoiseSource {

    private String name;
    private double noiseLevelDB;
}
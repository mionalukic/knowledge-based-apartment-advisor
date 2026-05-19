package com.ftn.sbnz.service.config;

import org.drools.template.ObjectDataCompiler;
import org.kie.api.KieServices;
import org.kie.api.builder.KieBuilder;
import org.kie.api.builder.KieFileSystem;
import org.kie.api.builder.Message;
import org.kie.api.builder.model.KieBaseModel;
import org.kie.api.builder.model.KieModuleModel;
import org.kie.api.builder.model.KieSessionModel;
import org.kie.api.io.KieResources;
import org.kie.api.runtime.KieContainer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class DroolsConfig {

    private static final String[] DRL_RESOURCES = {
        "rules/forward/level1-basic-quantities.drl",
        "rules/forward/level2-room-violations.drl",
        "rules/forward/level3-apartment-classification.drl",
        "rules/forward/level4-building-checks.drl",
        "rules/forward/level5-comfort-class.drl",
        "rules/forward/level6-buyer-recommendation.drl",
        "rules/forward/heuristic-rules.drl",
        "rules/forward/profile-criteria.drl"
    };

    @Bean
    public KieContainer kieContainer() throws IOException {
        KieServices ks = KieServices.Factory.get();
        KieResources res = ks.getResources();
        KieFileSystem kfs = ks.newKieFileSystem();

        // Define KieBase and KieSession programmatically
        KieModuleModel kieModuleModel = ks.newKieModuleModel();
        KieBaseModel kieBaseModel = kieModuleModel.newKieBaseModel("apartmentKBase");
        kieBaseModel.setDefault(true);
        kieBaseModel.addPackage("rules.forward");
        kieBaseModel.addPackage("rules.template");
        KieSessionModel kieSessionModel = kieBaseModel.newKieSessionModel("apartmentKSession");
        kieSessionModel.setDefault(true);
        kfs.writeKModuleXML(kieModuleModel.toXML());

        // Load DRL rules from classpath (kjar resources are available since kjar is a dependency)
        for (String drlPath : DRL_RESOURCES) {
            kfs.write(
                "src/main/resources/" + drlPath,
                res.newClassPathResource(drlPath)
            );
        }

        kfs.write("src/main/resources/rules/template/template1-minArea.drl",
            res.newByteArrayResource(compileTemplateOrThrow("T1", "/templates/Template1-MinAreaByStructure.drt", buildTemplate1Data()).getBytes("UTF-8")));
        kfs.write("src/main/resources/rules/template/template2-minLivingRoomWidth.drl",
            res.newByteArrayResource(compileTemplateOrThrow("T2a", "/templates/Template2-MinLivingRoomWidthByStructure.drt", buildTemplate2Data()).getBytes("UTF-8")));
        kfs.write("src/main/resources/rules/template/template2b-maxViolationsByProfile.drl",
            res.newByteArrayResource(compileTemplateOrThrow("T2b", "/templates/Template2-MaxViolationsByProfile.drt", buildTemplate2bData()).getBytes("UTF-8")));
        kfs.write("src/main/resources/rules/template/template4-buildingTypeNorms.drl",
            res.newByteArrayResource(compileTemplateOrThrow("T4", "/templates/Template4-BuildingTypeNorms.drt", buildTemplate4Data()).getBytes("UTF-8")));

        // Build and verify
        KieBuilder kieBuilder = ks.newKieBuilder(kfs);
        kieBuilder.buildAll();
        if (kieBuilder.getResults().hasMessages(Message.Level.ERROR)) {
            throw new IllegalStateException(
                "Drools build errors: " + kieBuilder.getResults()
            );
        }

        return ks.newKieContainer(ks.getRepository().getDefaultReleaseId());
    }

    private String compileTemplate(String drtClasspathPath,
                                   List<Map<String, Object>> data) throws IOException {
        try (InputStream drtStream = getClass().getResourceAsStream(drtClasspathPath)) {
            if (drtStream == null) {
                throw new IllegalStateException(
                    "DRT template not found on classpath: " + drtClasspathPath);
            }
            return new ObjectDataCompiler().compile(data, drtStream);
        }
    }

    private String compileTemplateOrThrow(String label, String drtClasspathPath,
                                          List<Map<String, Object>> data) throws IOException {
        try {
            System.out.println("[DroolsConfig] Compiling " + label + " from " + drtClasspathPath);
            String result = compileTemplate(drtClasspathPath, data);
            System.out.println("[DroolsConfig] " + label + " OK");
            return result;
        } catch (Exception e) {
            throw new IllegalStateException(
                "[DroolsConfig] FAILED to compile " + label + " (" + drtClasspathPath + "): " + e.getMessage(), e);
        }
    }

    // Article 20: minimum total net usable area (m²) by structure
    private List<Map<String, Object>> buildTemplate1Data() {
        return Arrays.asList(
            row("structure", "STUDIO",               "minArea", "26.0"),
            row("structure", "ONE_ROOM",              "minArea", "30.0"),
            row("structure", "ONE_AND_A_HALF_ROOM",   "minArea", "40.0"),
            row("structure", "TWO_ROOM",              "minArea", "48.0"),
            row("structure", "TWO_AND_A_HALF_ROOM",   "minArea", "56.0"),
            row("structure", "THREE_ROOM",            "minArea", "64.0"),
            row("structure", "THREE_AND_A_HALF_ROOM", "minArea", "77.0"),
            row("structure", "FOUR_ROOM",             "minArea", "86.0"),
            row("structure", "FOUR_AND_A_HALF_ROOM",  "minArea", "97.0")
        );
    }

    // Article 17: minimum living room width (meters) by structure
    private List<Map<String, Object>> buildTemplate2Data() {
        return Arrays.asList(
            row("structure", "STUDIO",               "minWidth", "3.20", "minWidthCm", "320"),
            row("structure", "ONE_ROOM",              "minWidth", "3.20", "minWidthCm", "320"),
            row("structure", "ONE_AND_A_HALF_ROOM",   "minWidth", "3.20", "minWidthCm", "320"),
            row("structure", "TWO_ROOM",              "minWidth", "3.40", "minWidthCm", "340"),
            row("structure", "TWO_AND_A_HALF_ROOM",   "minWidth", "3.40", "minWidthCm", "340"),
            row("structure", "THREE_ROOM",            "minWidth", "3.60", "minWidthCm", "360"),
            row("structure", "THREE_AND_A_HALF_ROOM", "minWidth", "3.60", "minWidthCm", "360"),
            row("structure", "FOUR_ROOM",             "minWidth", "3.80", "minWidthCm", "380"),
            row("structure", "FOUR_AND_A_HALF_ROOM",  "minWidth", "3.80", "minWidthCm", "380")
        );
    }

    // Template 2b: max tolerated violation count per buyer profile
    private List<Map<String, Object>> buildTemplate2bData() {
        return Arrays.asList(
            row("profileType", "SINGLE",       "maxViolations", "3", "recommendationCode", "NEGOTIATE", "recommendationDesc", "Too many violations for a single buyer - negotiate price reduction"),
            row("profileType", "COUPLE",        "maxViolations", "2", "recommendationCode", "NEGOTIATE", "recommendationDesc", "Violation count exceeds couple profile tolerance - negotiate or reconsider"),
            row("profileType", "YOUNG_FAMILY",  "maxViolations", "1", "recommendationCode", "AVOID",     "recommendationDesc", "Young family should avoid apartments with multiple violations"),
            row("profileType", "FAMILY",        "maxViolations", "2", "recommendationCode", "NEGOTIATE", "recommendationDesc", "Violation count exceeds family profile tolerance - negotiate or reconsider"),
            row("profileType", "LARGE_FAMILY",  "maxViolations", "1", "recommendationCode", "AVOID",     "recommendationDesc", "Large family needs a sound apartment - too many violations"),
            row("profileType", "RETIREE",       "maxViolations", "0", "recommendationCode", "AVOID",     "recommendationDesc", "Retiree profile requires a violation-free apartment"),
            row("profileType", "INVESTOR",      "maxViolations", "4", "recommendationCode", "NEGOTIATE", "recommendationDesc", "High violation count even for investment - negotiate price")
        );
    }

    // Template 4: building-type-specific norms (Article 6 corridor, Article 13 height & window)
    private List<Map<String, Object>> buildTemplate4Data() {
        return Arrays.asList(
            row("buildingType", "STANDARD", "minCorridorCm", "140", "minHeightM", "2.60", "minWindowRatio", "0.15"),
            row("buildingType", "SOCIAL",   "minCorridorCm", "130", "minHeightM", "2.50", "minWindowRatio", "0.15"),
            row("buildingType", "MIXED",    "minCorridorCm", "150", "minHeightM", "2.70", "minWindowRatio", "0.18"),
            row("buildingType", "LUXURY",   "minCorridorCm", "160", "minHeightM", "2.80", "minWindowRatio", "0.20")
        );
    }

    private Map<String, Object> row(String... keyValues) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            m.put(keyValues[i], keyValues[i + 1]);
        }
        return m;
    }
}
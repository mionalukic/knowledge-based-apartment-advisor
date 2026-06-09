package com.ftn.sbnz.service.service;

import com.ftn.sbnz.model.apartment.*;
import com.ftn.sbnz.service.dto.BackwardQueryResponse;
import com.ftn.sbnz.service.dto.EvaluationResponse;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.rule.QueryResults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class ApartmentService {

    private final KieContainer kieContainer;

    @Autowired
    public ApartmentService(KieContainer kieContainer) {
        this.kieContainer = kieContainer;
    }

    public EvaluationResponse evaluate(Apartment apartment, Building building, BuyerProfile buyerProfile) {
        KieSession kSession = kieContainer.newKieSession("apartmentKSession");


        try {
            kSession.insert(apartment);

            if (building != null) {
                kSession.insert(building);
            }
            if (buyerProfile != null) {
                kSession.insert(buyerProfile);
            }
            if (apartment.getRooms() != null) {
                for (Room room : apartment.getRooms()) {
                    kSession.insert(room);
                }
            }
            if (apartment.getWindows() != null) {
                for (Window window : apartment.getWindows()) {
                    kSession.insert(window);
                }
            }
            if (apartment.getKitchenWalls() != null) {
                for (KitchenWall wall : apartment.getKitchenWalls()) {
                    kSession.insert(wall);
                }
            }
            if (apartment.getDeadAreas() != null) {
                for (DeadArea da : apartment.getDeadAreas()) {
                    kSession.insert(da);
                }
            }

            int firedRules = kSession.fireAllRules();
            System.out.println("=== Evaluation complete: " + firedRules + " rules fired ===");

            // Extract violations and warnings inserted by rules
            List<Violation> violations = extractFacts(kSession, Violation.class);
            List<Warning> warnings = extractFacts(kSession, Warning.class);
            List<DeadArea> deadAreas = extractFacts(kSession, DeadArea.class);
            List<Recommendation> recommendations = extractFacts(kSession, Recommendation.class);

            return new EvaluationResponse(apartment, firedRules, violations, warnings, deadAreas, recommendations);

        } finally {
            kSession.dispose();
        }
    }

    public BackwardQueryResponse runBackwardQuery(Apartment apartment, Building building,
                                                   BuyerProfile buyerProfile, String queryName) {
        KieSession kSession = kieContainer.newKieSession("apartmentKSession");
        try {
            kSession.insert(apartment);
            if (building != null) kSession.insert(building);
            if (buyerProfile != null) kSession.insert(buyerProfile);
            if (apartment.getRooms() != null)
                apartment.getRooms().forEach(kSession::insert);
            if (apartment.getWindows() != null)
                apartment.getWindows().forEach(kSession::insert);
            if (apartment.getKitchenWalls() != null)
                apartment.getKitchenWalls().forEach(kSession::insert);
            if (apartment.getDeadAreas() != null)
                apartment.getDeadAreas().forEach(kSession::insert);

            kSession.fireAllRules();

            if ("potencijalZaVisokKomfor".equals(queryName)) {
                return runKomforQuery(kSession, apartment);
            } else if ("stanPogodanZaPorodicu".equals(queryName)) {
                return runPorodicaQuery(kSession, apartment, building, buyerProfile);
            } else {
                BackwardQueryResponse resp = new BackwardQueryResponse(queryName, false,
                    "Nepoznat naziv upita: " + queryName +
                    ". Dostupni upiti: potencijalZaVisokKomfor, stanPogodanZaPorodicu");
                return resp;
            }
        } finally {
            kSession.dispose();
        }
    }

    private BackwardQueryResponse runKomforQuery(KieSession kSession, Apartment apartment) {
        // Nivo 1 — tri grane AND stabla
        boolean prostorni = queryHasResult(kSession, "dobarProstorniPotencijal", apartment);
        boolean opremanje = queryHasResult(kSession, "mogucnostKvalitetnogOpremanja", apartment);
        boolean tehnicki  = queryHasResult(kSession, "tehnickiPotencijal", apartment);
        boolean main      = prostorni && opremanje && tehnicki;

        // Nivo 2 — detalji po grani
        boolean kvadratura       = queryHasResult(kSession, "dovoljnaKvadratura", apartment);
        boolean raspored         = queryHasResult(kSession, "dobarRaspored");
        boolean kuhinjaFunk      = queryHasResult(kSession, "kuhinjaMozeBitiFunkcionalna");
        boolean kupatilo         = queryHasResult(kSession, "kupatileMozeBitiModerno", apartment);
        boolean instalacije      = queryHasResult(kSession, "instalacijePostoje", apartment);
        boolean grejanje         = queryHasResult(kSession, "grejanjeMoguce", apartment);

        BackwardQueryResponse resp = new BackwardQueryResponse(
            "potencijalZaVisokKomfor", main,
            main
                ? "Stan IMA potencijal za visok komfor — sve tri dimenzije su zadovoljene."
                : "Stan NEMA potencijal za visok komfor — jedna ili više dimenzija nisu zadovoljene."
        );

        resp.addSubGoal("dobarProstorniPotencijal", prostorni,
            (kvadratura ? "[OK] Kvadratura >= 50 m²" : "[FAIL] Kvadratura < 50 m²") +
            " | " +
            (raspored ? "[OK] Nema prolaznih soba" : "[FAIL] Postoji prolazna soba"));

        resp.addSubGoal("mogucnostKvalitetnogOpremanja", opremanje,
            (kuhinjaFunk ? "[OK] Kuhinja funkcionalna" : "[FAIL] Kuhinja ne zadovoljava") +
            " | " +
            (kupatilo ? "[OK] Kupatilo može biti moderno" : "[FAIL] Kupatilo ne zadovoljava"));

        resp.addSubGoal("tehnickiPotencijal", tehnicki,
            (instalacije ? "[OK] Instalacije (struja+voda) ispravne" : "[FAIL] Nedostaju instalacije") +
            " | " +
            (grejanje ? "[OK] Grejanje moguće" : "[FAIL] Nema mogućnosti grejanja"));

        return resp;
    }

    private BackwardQueryResponse runPorodicaQuery(KieSession kSession, Apartment apartment,
                                                    Building building, BuyerProfile buyerProfile) {
        // Nivo 1 — tri grane AND stabla
        boolean sobe    = buyerProfile != null && queryHasResult(kSession, "dovoljnoSobaZaDecu", buyerProfile);
        boolean pristup = apartment != null && building != null
                          && queryHasResult(kSession, "bezbedenPristupZgradi", apartment, building);
        boolean prostor = apartment != null && queryHasResult(kSession, "adekvatanZivotniProstor", apartment);
        boolean main    = sobe && pristup && prostor;

        // Nivo 2 — detalji po grani
        boolean svakaSvoju     = buyerProfile != null && queryHasResult(kSession, "svakoDeteImaSvojuSobu", buyerProfile);
        boolean moguDijele     = buyerProfile != null && queryHasResult(kSession, "decaMoguDelitiSobu", buyerProfile);
        boolean ulaz           = building != null && queryHasResult(kSession, "pristupacanUlaz", building);
        boolean vertikalna     = apartment != null && building != null
                                 && queryHasResult(kSession, "vertikalnaKomunikacija", apartment, building);
        boolean dnevna         = queryHasResult(kSession, "dnevnaDovoljnoVelika");
        boolean zajednicki     = apartment != null && queryHasResult(kSession, "imaZajednickiProstor", apartment);

        BackwardQueryResponse resp = new BackwardQueryResponse(
            "stanPogodanZaPorodicu", main,
            main
                ? "Stan JE pogodan za porodicu sa decom — sva tri uslova su ispunjena."
                : "Stan NIJE pogodan za porodicu sa decom — jedan ili više uslova nisu ispunjeni."
        );

        resp.addSubGoal("dovoljnoSobaZaDecu", sobe,
            (svakaSvoju ? "[OK] Svako dete dobija svoju sobu" : "[--] Nije svako") +
            " | " +
            (moguDijele ? "[OK] Mogu deliti (isti pol ili najmlađe <= 6 god)" : "[--] Ne mogu deliti"));

        resp.addSubGoal("bezbedenPristupZgradi", pristup,
            (ulaz ? "[OK] Ulaz pristupačan" : "[FAIL] Ulaz nije pristupačan") +
            " | " +
            (vertikalna ? "[OK] Vertikalna komunikacija OK" : "[FAIL] Vertikalna komunikacija nije OK"));

        resp.addSubGoal("adekvatanZivotniProstor", prostor,
            (dnevna ? "[OK] Dnevna >= 16 m²" : "[FAIL] Dnevna premala") +
            " | " +
            (zajednicki ? "[OK] Postoji zajednički prostor (trpezarija / otvoreni koncept)" : "[FAIL] Nema zajedničkog prostora"));

        return resp;
    }

    private boolean queryHasResult(KieSession kSession, String queryName, Object... args) {
        System.out.println("[QUERY] Pozivam: " + queryName);
        QueryResults results = args.length == 0
                ? kSession.getQueryResults(queryName)
                : kSession.getQueryResults(queryName, args);
        boolean result = results.iterator().hasNext();
        System.out.println("[QUERY] " + queryName + " → " + result);
        return result;
    }

    @SuppressWarnings("unchecked")
    private <T> List<T> extractFacts(KieSession kSession, Class<T> clazz) {
        Collection<?> facts = kSession.getObjects(o -> clazz.isInstance(o));
        List<T> result = new ArrayList<>();
        for (Object f : facts) {
            result.add((T) f);
        }
        return result;
    }
}
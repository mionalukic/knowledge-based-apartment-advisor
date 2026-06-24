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
import java.util.stream.Collectors;

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
            if (apartment.getRoomConnections() != null) {
                for (RoomConnection rc : apartment.getRoomConnections()) {
                    kSession.insert(rc);
                }
            }
            if (apartment.getNoiseSource() != null) {
                kSession.insert(apartment.getNoiseSource());
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
            if (apartment.getRoomConnections() != null)
                apartment.getRoomConnections().forEach(kSession::insert);
            if (apartment.getNoiseSource() != null)
                kSession.insert(apartment.getNoiseSource());

            kSession.fireAllRules();

            if ("potencijalZaVisokKomfor".equals(queryName)) {
                return runKomforQuery(kSession, apartment);
            } else if ("stanPogodanZaPorodicu".equals(queryName)) {
                return runPorodicaQuery(kSession, apartment, building, buyerProfile);
            } else if ("bukaProhvatljiva".equals(queryName)) {
                return runBukaQuery(kSession, apartment);
            } else if ("imaBezbedanIzlaz".equals(queryName)) {
                return runEvakuacijaQuery(kSession, apartment);
            } else {
                return new BackwardQueryResponse(queryName, false,
                    "Nepoznat naziv upita: " + queryName +
                    ". Dostupni upiti: potencijalZaVisokKomfor, stanPogodanZaPorodicu, " +
                    "bukaProhvatljiva, imaBezbedanIzlaz");
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

    // ── UPIT R1: Rekurzivna transmisija buke ─────────────────────────────────────
    // Spavaca soba: prag 35 dB | Dnevna soba: prag 40 dB | Ostale: 45 dB
    // Max dubina rekurzije: 5 soba u lancu
    private BackwardQueryResponse runBukaQuery(KieSession kSession, Apartment apartment) {
        if (apartment.getNoiseSource() == null) {
            return new BackwardQueryResponse("bukaProhvatljiva", true,
                "Nema definisanog izvora buke — buka nije problem.");
        }

        List<String> okSobe = new ArrayList<>();
        List<String> problemSobe = new ArrayList<>();

        for (Room room : apartment.getRooms()) {
            RoomType tip = room.getType();
            if (tip != RoomType.BEDROOM && tip != RoomType.LIVING_ROOM && tip != RoomType.KITCHEN) {
                continue;
            }
            double maxDB = tip == RoomType.BEDROOM ? 35.0 : (tip == RoomType.LIVING_ROOM ? 40.0 : 45.0);
            boolean prihvatljiva = queryHasResult(kSession, "bukaProhvatljiva", room, maxDB, 5);
            String opis = room.getId() + " [" + tip + ", max=" + (int) maxDB + "dB]";
            if (prihvatljiva) okSobe.add(opis); else problemSobe.add(opis);
        }

        boolean sve = problemSobe.isEmpty();
        BackwardQueryResponse resp = new BackwardQueryResponse(
            "bukaProhvatljiva", sve,
            "Izvor buke: " + apartment.getNoiseSource().getName() +
            " (" + apartment.getNoiseSource().getNoiseLevelDB() + " dB). " +
            (sve
                ? "Sve prostorije imaju prihvatljiv nivo buke."
                : "Problem buke u: " + String.join(", ", problemSobe) + ".")
        );

        for (String opis : okSobe) {
            resp.addSubGoal("bukaProhvatljiva", true, "[OK] " + opis);
        }
        for (String opis : problemSobe) {
            resp.addSubGoal("bukaProhvatljiva", false,
                "[FAIL] " + opis + " — buka prodire iznad dozvoljenog praga");
        }
        return resp;
    }

    // ── UPIT R2: Rekurzivni evakuacioni put ──────────────────────────────────────
    // Za svaku spavacu sobu, dnevnu sobu i kuhinju proverava
    // da li postoji bezbedan put do izlaza (max 5 soba u lancu,
    // svaki prolaz >= 90 cm, hodnici >= 120 cm)
    private BackwardQueryResponse runEvakuacijaQuery(KieSession kSession, Apartment apartment) {
        List<String> okSobe = new ArrayList<>();
        List<String> problemSobe = new ArrayList<>();

        for (Room room : apartment.getRooms()) {
            RoomType tip = room.getType();
            if (tip == RoomType.HALLWAY || tip == RoomType.ENTRANCE_LOBBY
                    || tip == RoomType.BALCONY || tip == RoomType.LOGGIA) {
                continue;
            }
            boolean izlaz = queryHasResult(kSession, "imaBezbedanIzlaz", room, 5);
            String opis = room.getId() + " [" + tip + "]";
            if (izlaz) okSobe.add(opis); else problemSobe.add(opis);
        }

        boolean sve = problemSobe.isEmpty();
        BackwardQueryResponse resp = new BackwardQueryResponse(
            "imaBezbedanIzlaz", sve,
            sve
                ? "Sve prostorije imaju bezbedan evakuacioni put."
                : "Prostorije bez bezbednog izlaza: " + String.join(", ", problemSobe) + "."
        );

        for (String opis : okSobe) {
            resp.addSubGoal("imaBezbedanIzlaz", true, "[OK] " + opis + " — put do izlaza postoji");
        }
        for (String opis : problemSobe) {
            resp.addSubGoal("imaBezbedanIzlaz", false,
                "[FAIL] " + opis + " — nije pronadjen bezbedan evakuacioni put");
        }
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
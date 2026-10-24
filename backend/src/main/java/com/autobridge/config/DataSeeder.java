package com.autobridge.config;

import com.autobridge.model.*;
import com.autobridge.repo.EnquiryRepository;
import com.autobridge.repo.InventoryRepository;
import com.autobridge.repo.UserRepository;
import com.autobridge.repo.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/** Loads demo accounts, vehicles, stock and enquiries on the first launch (empty database only). */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static final String[] SHOWROOMS = {
            "Thane Central Showroom", "Navi Mumbai Hub", "Pune Premium Motors"
    };

    private final UserRepository users;
    private final VehicleRepository vehicles;
    private final InventoryRepository inventory;
    private final EnquiryRepository enquiries;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, VehicleRepository vehicles, InventoryRepository inventory,
                      EnquiryRepository enquiries, PasswordEncoder encoder) {
        this.users = users;
        this.vehicles = vehicles;
        this.inventory = inventory;
        this.enquiries = enquiries;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) {
            return;
        }
        log.info("Empty database detected - loading demo data");

        users.save(new User("Meera Kulkarni", "manufacturer@autobridge.com",
                encoder.encode("Maker@123"), Role.MANUFACTURER));
        users.save(new User("Rohan Deshmukh", "bhavesh341377@gmail.com",
                encoder.encode("Show@123"), Role.SHOWROOM));
        User customer = users.save(new User("Aarav Mehta", "customer@autobridge.com",
                encoder.encode("Buyer@123"), Role.CUSTOMER));
        User priya = users.save(new User("Priya Nair", "priya.nair@example.com",
                encoder.encode("Buyer@123"), Role.CUSTOMER));
        User kabir = users.save(new User("Kabir Shah", "kabir.shah@example.com",
                encoder.encode("Buyer@123"), Role.CUSTOMER));

        List<Vehicle> cars = new ArrayList<>();
        cars.add(vehicle("Tata", "Nexon EV", "SUV", "Electric", "Automatic", 1749000,
                "45 kWh battery - single motor",
                "A compact electric SUV built for city commutes, with quick acceleration, connected-car features and low running costs.",
                "tata,nexon", true));
        cars.add(vehicle("Mahindra", "XUV700 AX7", "SUV", "Diesel", "Automatic", 2399000,
                "2.2L mHawk diesel",
                "A feature-rich three-row SUV with a panoramic roof, driver-assist systems and strong highway manners.",
                "mahindra,xuv700", true));
        cars.add(vehicle("Maruti Suzuki", "Swift ZXi", "Hatchback", "Petrol", "Manual", 899000,
                "1.2L Z-Series petrol",
                "The easygoing, efficient hatchback with light controls and a fun-to-drive character.",
                "maruti,swift", true));
        cars.add(vehicle("Hyundai", "Creta SX(O)", "SUV", "Petrol", "Automatic", 1999000,
                "1.5L turbo petrol",
                "A refined family SUV with a premium cabin, strong equipment list and a comfortable ride.",
                "hyundai,creta", true));
        cars.add(vehicle("Honda", "City e:HEV", "Sedan", "Hybrid", "Automatic", 2099000,
                "1.5L Atkinson-cycle hybrid",
                "A smooth strong-hybrid sedan that blends spacious comfort with excellent fuel economy.",
                "honda,city", true));
        cars.add(vehicle("Toyota", "Innova Hycross", "MUV", "Hybrid", "Automatic", 2599000,
                "2.0L strong hybrid",
                "A spacious, quiet people-mover with a hybrid powertrain and captain-seat comfort.",
                "toyota,innova", true));
        cars.add(vehicle("Skoda", "Slavia Prestige", "Sedan", "Petrol", "Automatic", 1799000,
                "1.5L TSI petrol",
                "A European-feel sedan with a roomy rear bench, confident handling and a well-finished interior.",
                "skoda,slavia", true));
        cars.add(vehicle("BMW", "3 Series 330Li", "Luxury", "Petrol", "Automatic", 6290000,
                "2.0L TwinPower Turbo petrol",
                "A long-wheelbase executive sedan that pairs sharp driving dynamics with a rear-seat focus.",
                "bmw,sedan", true));
        cars.add(vehicle("Mercedes-Benz", "EQB 350", "Luxury", "Electric", "Automatic", 7490000,
                "Dual-motor all-wheel drive",
                "A seven-seat electric luxury SUV with a calm cabin and a high-tech interior.",
                "mercedes,suv", true));
        cars.add(vehicle("Porsche", "911 Carrera", "Sports", "Petrol", "Automatic", 19900000,
                "3.0L twin-turbo flat-six",
                "The sports-car benchmark: rear-engined, precise and usable every day.",
                "porsche,911", true));
        cars.add(vehicle("Tata", "Punch", "Hatchback", "Petrol", "Manual", 799000,
                "1.2L Revotron petrol",
                "A tough little micro-SUV with a high seating position and an easy-to-drive nature.",
                "tata,punch", true));
        cars.add(vehicle("Mahindra", "Scorpio-N Z8", "SUV", "Diesel", "Manual", 2149000,
                "2.2L mHawk diesel",
                "A rugged body-on-frame SUV with a commanding stance and strong road presence.",
                "mahindra,scorpio", true));
        cars.add(vehicle("BYD", "Atto 3", "SUV", "Electric", "Automatic", 2499000,
                "60.5 kWh Blade battery",
                "A modern electric crossover with a spacious interior and a rotating touchscreen.",
                "byd,electric", true));
        cars.add(vehicle("Isuzu", "D-Max V-Cross", "Pickup", "Diesel", "Manual", 2399000,
                "1.9L turbo diesel",
                "A lifestyle pickup with serious load-carrying ability and go-anywhere capability. Currently not open for new orders.",
                "isuzu,pickup", false));
        vehicles.saveAll(cars);

        // Stock: every vehicle in every showroom, with deliberately varied quantities.
        int[][] pattern = {{9, 4, 12}, {3, 7, 2}, {14, 11, 6}, {5, 0, 8}, {2, 6, 4}, {1, 3, 0},
                {7, 5, 9}, {2, 1, 3}, {0, 2, 1}, {1, 0, 1}, {13, 10, 15}, {4, 6, 5}, {8, 3, 7}, {0, 0, 2}};
        for (int v = 0; v < cars.size(); v++) {
            for (int s = 0; s < SHOWROOMS.length; s++) {
                int qty = pattern[v][s];
                int sold = (v * 3 + s * 2) % 9 + 1;
                inventory.save(new Inventory(cars.get(v), SHOWROOMS[s], qty, sold));
            }
        }

        Instant now = Instant.now();
        enquiries.save(new Enquiry(customer, cars.get(0), EnquiryType.TEST_DRIVE, EnquiryStatus.NEW,
                "Would like a test drive this weekend if possible.", now.minus(2, ChronoUnit.HOURS)));
        enquiries.save(new Enquiry(customer, cars.get(3), EnquiryType.PURCHASE, EnquiryStatus.IN_PROGRESS,
                "Interested in the automatic variant. Please share finance options.", now.minus(1, ChronoUnit.DAYS)));
        enquiries.save(new Enquiry(priya, cars.get(4), EnquiryType.PURCHASE, EnquiryStatus.NEW,
                "Is the hybrid available in white?", now.minus(5, ChronoUnit.HOURS)));
        enquiries.save(new Enquiry(priya, cars.get(12), EnquiryType.TEST_DRIVE, EnquiryStatus.COMPLETED,
                "Test drive completed, thank you.", now.minus(4, ChronoUnit.DAYS)));
        enquiries.save(new Enquiry(kabir, cars.get(9), EnquiryType.TEST_DRIVE, EnquiryStatus.IN_PROGRESS,
                "Looking for a weekday slot.", now.minus(2, ChronoUnit.DAYS)));
        enquiries.save(new Enquiry(kabir, cars.get(1), EnquiryType.PURCHASE, EnquiryStatus.CANCELLED,
                "Decided to wait for the next model year.", now.minus(6, ChronoUnit.DAYS)));

        log.info("Demo data loaded: {} users, {} vehicles", users.count(), vehicles.count());
    }

    private static Vehicle vehicle(String brand, String model, String category, String fuel, String transmission,
                                   long price, String engine, String description, String imageKeywords,
                                   boolean available) {
        // Placeholder photo by keyword; the UI falls back to a drawn illustration if it cannot load.
        String image = "https://loremflickr.com/900/600/" + imageKeywords + "?lock=" + Math.abs(brand.hashCode() % 97 + model.hashCode() % 89);
        return new Vehicle(brand, model, 2025, category, fuel, transmission, price, engine, description,
                image, available);
    }
}

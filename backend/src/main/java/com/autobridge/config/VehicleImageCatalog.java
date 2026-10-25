
package com.autobridge.config;

import java.util.Map;

public final class VehicleImageCatalog {

    private VehicleImageCatalog() {}

    private static final Map<String, String> IMAGES = Map.ofEntries(
        Map.entry("Tata Nexon EV", "https://loremflickr.com/900/600/tata,nexon,electric,car?lock=101"),
        Map.entry("Mahindra XUV700 AX7", "https://loremflickr.com/900/600/mahindra,xuv700,suv?lock=102"),
        Map.entry("Maruti Suzuki Swift ZXi", "https://loremflickr.com/900/600/maruti,swift,hatchback?lock=103"),
        Map.entry("Hyundai Creta SX(O)", "https://loremflickr.com/900/600/hyundai,creta,suv?lock=104"),
        Map.entry("Honda City e:HEV", "https://loremflickr.com/900/600/honda,city,sedan?lock=105"),
        Map.entry("Toyota Innova Hycross", "https://loremflickr.com/900/600/toyota,innova,mpv?lock=106"),
        Map.entry("Skoda Slavia Prestige", "https://loremflickr.com/900/600/skoda,slavia,sedan?lock=107"),
        Map.entry("BMW 3 Series 330Li", "https://loremflickr.com/900/600/bmw,3series,luxury,sedan?lock=108"),
        Map.entry("Mercedes-Benz EQB 350", "https://loremflickr.com/900/600/mercedes,eqb,electric,suv?lock=109"),
        Map.entry("Porsche 911 Carrera", "https://loremflickr.com/900/600/porsche,911,carrera?lock=110"),
        Map.entry("Tata Punch", "https://loremflickr.com/900/600/tata,punch,suv?lock=111"),
        Map.entry("Mahindra Scorpio-N Z8", "https://loremflickr.com/900/600/mahindra,scorpio,suv?lock=112"),
        Map.entry("BYD Atto 3", "https://loremflickr.com/900/600/byd,atto3,electric?lock=113"),
        Map.entry("Isuzu D-Max V-Cross", "https://loremflickr.com/900/600/isuzu,dmax,pickup?lock=114")
    );

    public static String getImage(String brand, String model) {
        return IMAGES.getOrDefault(brand + " " + model, "");
    }
}


package com.autobridge.config;

import java.util.Map;

public final class VehicleImageCatalog {

    private VehicleImageCatalog() {}

    private static final Map<String, String> IMAGES = Map.ofEntries(
        Map.entry("Tata Nexon EV", "https://www.tatamotors.com/wp-content/uploads/2024/03/NexonDark-Ex-Front-3-4th-lowres.jpg"),
        Map.entry("Mahindra XUV700 AX7", "https://www.evoindia.com/evoindia/2024-01/9f46cb05-a9f7-4bf1-9f59-203a3ac2e23a/2024_XUV700_Image_1.jpg"),
        Map.entry("Maruti Suzuki Swift ZXi", "https://img.magnific.com/premium-photo/2024-maruti-suzuki-swift-car_1080029-739.jpg?semt=ais_hybrid&w=740&q=80"),
        Map.entry("Hyundai Creta SX(O)", "https://etimg.etb2bimg.com/thumb/msid-91285519,width-1600,height-900,resizemode-4/.jpg"),
        Map.entry("Honda City e:HEV", "https://imgd.aeplcdn.com/664x374/n/hh9pv8b_1943706.jpg?q=80"),
        Map.entry("Toyota Innova Hycross", "https://wallpaperaccess.com/full/29435280.jpg"),
        Map.entry("Skoda Slavia Prestige", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOP284232nMbEFxoo54axt37dE8rGbebz_UVr_J1TFTBYb7_buiPP-wog&s=10"),
        Map.entry("BMW 3 Series 330Li", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNyPVpI9Hnflq4tnRg3osBGPA6BQNv1mSHG7a6AHE1Di1h0uRzDz0Opko&s=10"),
        Map.entry("Mercedes-Benz EQB 350", "https://imgcdn.zigwheels.co.th/large/gallery/exterior/18/3519/mercedes-benz-eqb-front-angle-low-view-959780.jpg"),
        Map.entry("Porsche 911 Carrera", "https://i.pinimg.com/736x/66/98/d4/6698d43f1b309b21a10d63b0d82eeeb6.jpg"),
        Map.entry("Tata Punch", "https://www.carblogindia.com/wp-content/uploads/2021/08/Tata-Punch-Dark-Edition.jpeg"),
        Map.entry("Mahindra Scorpio-N Z8", "https://carindia.in/wp-content/uploads/2024/02/MahindraScorpioNZ8Select-640x480.jpg"),
        Map.entry("BYD Atto 3", "https://content.carlelo.com/media/models/Atto3/base/atto-3-1.webp"),
        Map.entry("Isuzu D-Max V-Cross", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzxcRroc615pSWVSPko_j-Y1YCOHShB6qOu-RB6jFA2rbe74pGVQ74Rki0&s=10")
    );

    public static String getImage(String brand, String model) {
        return IMAGES.getOrDefault(brand + " " + model, "");
    }
}
